import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import Database from 'better-sqlite3';

// GitHub URL for the latest events.db
const EVENTS_DB_URL = 'https://github.com/blr-today/dataset/releases/latest/download/events.db';
const CACHE_DIR = path.join(process.cwd(), '.cache');
const CACHE_FILE = path.join(CACHE_DIR, 'events.db');
const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

async function ensureCacheDir() {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating cache directory:', error);
  }
}

async function isCacheValid() {
  try {
    const stats = await fs.stat(CACHE_FILE);
    const now = Date.now();
    const fileAge = now - stats.mtime.getTime();
    return fileAge < CACHE_DURATION;
  } catch (error) {
    return false;
  }
}

async function downloadDatabase() {
  try {
    console.log('Downloading latest events database from blr.today...');
    await ensureCacheDir();

    const response = await fetch(EVENTS_DB_URL);
    if (!response.ok) {
      throw new Error(`Failed to download database: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await fs.writeFile(CACHE_FILE, buffer);
    console.log('Database downloaded and cached successfully');
    return CACHE_FILE;
  } catch (error) {
    console.error('Error downloading database:', error);

    // Try to use local fallback if download fails
    const localDbPath = path.join(process.cwd(), 'src', 'data', 'events.db');
    try {
      await fs.access(localDbPath);
      console.log('Using local fallback database');
      return localDbPath;
    } catch {
      throw new Error('Failed to download database and no local fallback available');
    }
  }
}

async function getDatabasePath() {
  // Check if cache exists and is valid
  if (await isCacheValid()) {
    console.log('Using cached database');
    return CACHE_FILE;
  }

  // Download fresh database
  return await downloadDatabase();
}

export async function GET(request) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search') || '';

    // Get database path (from cache or download)
    const dbPath = await getDatabasePath();

    // Open database connection
    const db = new Database(dbPath, { readonly: true });

    // Fetch ALL events first, then filter for future events
    // This is necessary because startDate is stored inside JSON
    let query = 'SELECT url, event_json FROM events';
    const params = [];

    // Add search filter if provided
    if (search) {
      query += ' WHERE event_json LIKE ?';
      params.push(`%${search}%`);
    }

    // Execute query (get all events)
    const stmt = db.prepare(query);
    const rows = stmt.all(...params);

    // Close database connection
    db.close();

    // Parse JSON and filter future events BEFORE applying limit
    const now = new Date();
    const allFutureEvents = rows
      .map(row => {
        try {
          const eventData = JSON.parse(row.event_json);
          return {
            url: row.url,
            ...eventData,
          };
        } catch (e) {
          console.error('Error parsing event JSON:', e);
          return null;
        }
      })
      .filter(event => event !== null)
      .filter(event => {
        // Only show future events
        if (event.startDate) {
          const startDate = new Date(event.startDate);
          return startDate >= now;
        }
        return true;
      })
      .sort((a, b) => {
        // Sort by start date (earliest first)
        const dateA = a.startDate ? new Date(a.startDate) : new Date();
        const dateB = b.startDate ? new Date(b.startDate) : new Date();
        return dateA - dateB;
      });

    // Apply pagination AFTER filtering
    const total = allFutureEvents.length;
    const events = allFutureEvents.slice(offset, offset + limit);

    return NextResponse.json({
      events,
      total,
      limit,
      offset,
      hasMore: offset + limit < total
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events', details: error.message },
      { status: 500 }
    );
  }
}
