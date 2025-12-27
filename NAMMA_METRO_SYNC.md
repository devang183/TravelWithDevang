# Namma Metro Data Sync Setup

This document explains how the automated Namma Metro ridership data sync works.

## Overview

The system automatically fetches the latest ridership data from GitHub and syncs it to your MongoDB `dailyNammaMetro` collection.

**Data Source**: [thecont1/namma-metro-ridership-tracker](https://github.com/thecont1/namma-metro-ridership-tracker)

The source repository updates 3 times daily (07:33, 12:07, 17:22 UTC) via GitHub Actions.

## How It Works

### 1. **Manual Sync** (On-Demand)

You can manually trigger a sync anytime by visiting:

```
https://your-domain.com/api/namma-metro/sync
```

Or locally:

```
http://localhost:3000/api/namma-metro/sync
```

This will:
- Fetch the latest CSV from GitHub
- Parse all records
- Clear the existing `dailyNammaMetro` collection
- Insert fresh data
- Return sync statistics

### 2. **Automated Sync** (Vercel Cron)

**Schedule**: 3 times daily at 08:00, 13:00, and 18:00 UTC (aligns with GitHub updates)

The `vercel.json` configuration automatically calls `/api/cron/sync-namma-metro` on this schedule.

**Vercel Cron Configuration**:
```json
{
  "crons": [
    {
      "path": "/api/cron/sync-namma-metro",
      "schedule": "0 8,13,18 * * *"
    }
  ]
}
```

**Note**: Vercel Cron is only available on **Pro and Enterprise** plans. For Hobby plans, use one of the alternatives below.

### 3. **Alternative Cron Solutions** (For Vercel Hobby Plan)

If you're on Vercel Hobby plan, use one of these free cron services:

#### Option A: GitHub Actions (Recommended)

Create `.github/workflows/sync-namma-metro.yml`:

```yaml
name: Sync Namma Metro Data

on:
  schedule:
    # Run 3 times daily at 08:30, 13:30, 18:30 UTC (30 min after GitHub source updates)
    - cron: '30 8,13,18 * * *'
  workflow_dispatch: # Allow manual trigger

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Sync API
        run: |
          curl -X GET https://your-domain.com/api/cron/sync-namma-metro
```

#### Option B: EasyCron (Free tier available)

1. Sign up at [EasyCron.com](https://www.easycron.com/)
2. Create a new cron job:
   - URL: `https://your-domain.com/api/cron/sync-namma-metro`
   - Cron Expression: `0 8,13,18 * * *`
   - Timezone: UTC

#### Option C: cron-job.org (Free)

1. Sign up at [cron-job.org](https://cron-job.org/)
2. Create a new cron job:
   - URL: `https://your-domain.com/api/cron/sync-namma-metro`
   - Schedule: Three times daily at 08:00, 13:00, 18:00 UTC

## API Endpoints

### `/api/namma-metro/sync` (GET)

Manual sync endpoint. Returns:

```json
{
  "success": true,
  "message": "Data synced successfully from GitHub",
  "stats": {
    "totalRecords": 450,
    "latestDate": "27-12-2024",
    "sourceUrl": "https://raw.githubusercontent.com/...",
    "syncedAt": "2024-12-27T10:30:00.000Z"
  }
}
```

### `/api/cron/sync-namma-metro` (GET)

Automated cron endpoint (same functionality, designed for cron services).

### `/api/namma-metro` (GET)

Fetches ridership data from MongoDB for the frontend component.

## Data Collection Strategy

The source GitHub repository:
- **Updates**: 3x daily (07:33, 12:07, 17:22 UTC)
- **Format**: CSV with columns:
  - Record Date
  - Total Smart Cards
  - Stored Value Card
  - One Day Pass
  - Three Day Pass
  - Five Day Pass
  - Total Tokens
  - Total NCMC
  - Group Ticket
  - Total QR

Our sync runs ~30-60 minutes after each source update to ensure fresh data.

## MongoDB Collection

**Database**: `hello`
**Collection**: `dailyNammaMetro`

**Document Structure**:
```javascript
{
  "Record Date": "27-12-2024",
  "Total Smart Cards": 650000,
  "Stored Value Card": 0,
  "One Day Pass": 5000,
  "Three Day Pass": 500,
  "Five Day Pass": 100,
  "Total Tokens": 150000,
  "Total NCMC": 100000,
  "Group Ticket": 2000,
  "Total QR": 50000
}
```

## First-Time Setup

1. **Run Initial Sync** (locally or in production):

```bash
# Locally
curl http://localhost:3000/api/namma-metro/sync

# Production
curl https://your-domain.com/api/namma-metro/sync
```

2. **Verify Data**:

Check your MongoDB Atlas dashboard to confirm the `dailyNammaMetro` collection was created with records.

3. **Test Frontend**:

Visit your Namma Metro Analysis page to ensure charts are rendering with the new data.

4. **Set Up Automated Sync**:

- **Vercel Pro/Enterprise**: Deploy with `vercel.json` (already configured)
- **Vercel Hobby**: Set up GitHub Actions or external cron service

## Monitoring

### Check Sync Status

Visit the sync endpoint directly in a browser:

```
https://your-domain.com/api/namma-metro/sync
```

You'll see the sync statistics including latest date and record count.

### Check Vercel Logs

If using Vercel Cron:

1. Go to Vercel Dashboard → Your Project
2. Click "Logs" tab
3. Filter by function: `/api/cron/sync-namma-metro`
4. View sync timestamps and any errors

### Check GitHub Actions Logs

If using GitHub Actions:

1. Go to your repository → "Actions" tab
2. Click on "Sync Namma Metro Data" workflow
3. View run history and logs

## Troubleshooting

### Sync Fails with Network Error

**Issue**: Cannot fetch CSV from GitHub

**Solutions**:
- Check if GitHub is accessible from your server
- Verify the GitHub repository URL is still valid
- Check if the CSV file path changed

### MongoDB Connection Error

**Issue**: Cannot connect to MongoDB

**Solutions**:
- Verify `MONGODB_URI` in `.env.local` is correct
- Check MongoDB Atlas allows connections from your deployment IP
- Ensure database name matches (`hello`)

### No Data Showing in Frontend

**Issue**: Charts are empty

**Solutions**:
- Run manual sync to populate data
- Check browser console for API errors
- Verify `/api/namma-metro` returns data
- Confirm collection name is `dailyNammaMetro`

### Cron Not Running

**Vercel Cron**:
- Verify you're on Pro/Enterprise plan
- Check Vercel logs for cron execution

**GitHub Actions**:
- Check Actions tab for failed runs
- Verify workflow file is in `.github/workflows/`
- Ensure repository has Actions enabled

**External Cron**:
- Check cron service dashboard
- Verify URL is publicly accessible
- Check cron service logs

## Cost Considerations

### Vercel

- **Hobby Plan**: No cron support, use GitHub Actions (free)
- **Pro Plan**: $20/month, includes cron jobs
- **Enterprise**: Custom pricing

### GitHub Actions

- **Free tier**: 2,000 minutes/month (this sync uses ~1 min/day = 30 min/month)
- More than enough for daily syncs

### MongoDB Atlas

- **Free tier (M0)**: 512 MB storage
- Namma Metro dataset: ~450 records × 250 bytes ≈ 112 KB
- Plenty of space on free tier

## Security Notes

⚠️ **Important**:

1. **No Authentication by Default**: The cron endpoint is publicly accessible. This is fine since it only reads public data.

2. **Optional Authentication**: To add authentication, uncomment these lines in `/api/cron/sync-namma-metro/route.js`:

```javascript
const authHeader = request.headers.get('authorization');
if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  return Response.json({ error: 'Unauthorized' }, { status: 401 });
}
```

Then add `CRON_SECRET` to `.env.local` and configure your cron service to send the bearer token.

3. **Rate Limiting**: Consider adding rate limiting if the sync endpoint is abused.

## Data Freshness

- **Source updates**: 3× daily (07:33, 12:07, 17:22 UTC)
- **Our sync**: 3× daily (08:00, 13:00, 18:00 UTC)
- **Lag**: ~30-60 minutes behind source
- **Data displayed**: Real-time from MongoDB (no caching)

## Migration from Old Collection

If you have existing data in the `nammaMetro` collection:

```javascript
// Optional: Backup old collection before switching
// Run in MongoDB Atlas shell or Compass

use hello
db.nammaMetro.aggregate([
  { $out: "nammaMetro_backup_20241227" }
])
```

Then run the initial sync to populate `dailyNammaMetro`.

## Future Enhancements

Potential improvements:

1. **Incremental Sync**: Only update new/changed records instead of full replacement
2. **Data Validation**: Verify data integrity before inserting
3. **Notifications**: Send alerts if sync fails
4. **Metrics**: Track sync performance and data quality
5. **Caching**: Add Redis cache layer for faster frontend queries
6. **Historical Snapshots**: Keep monthly snapshots for trend analysis

---

**Questions or Issues?**

Check the [source repository](https://github.com/thecont1/namma-metro-ridership-tracker) for data format changes or updates.
