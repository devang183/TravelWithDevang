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

    let query = 'SELECT url, event_json FROM events';
    let countQuery = 'SELECT COUNT(*) as total FROM events';
    const params = [];
    const countParams = [];

    // Add search filter if provided
    if (search) {
      query += ' WHERE event_json LIKE ?';
      countQuery += ' WHERE event_json LIKE ?';
      params.push(`%${search}%`);
      countParams.push(`%${search}%`);
    }

    // Get total count
    const totalResult = db.prepare(countQuery).get(...countParams);
    const total = totalResult.total;

    // Add pagination
    query += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    // Execute query
    const stmt = db.prepare(query);
    const rows = stmt.all(...params);

    // Parse JSON and filter future events
    const now = new Date();
    const events = rows
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

    // Close database connection
    db.close();

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
