# 🚇 Namma Metro Data Sync System

> Automated daily sync of Bengaluru Metro ridership data from GitHub to MongoDB

## 🎯 What This Does

Automatically fetches the latest Namma Metro ridership data from [thecont1's GitHub repository](https://github.com/thecont1/namma-metro-ridership-tracker) and syncs it to your MongoDB database 3 times daily.

**Result**: Your Namma Metro Analysis dashboard always shows fresh, up-to-date ridership data with zero manual effort.

## ⚡ Quick Start

### 1️⃣ Initial Setup (One-Time)

Visit the sync endpoint to populate your database:

```bash
# Local
curl http://localhost:3000/api/namma-metro/sync

# Production
curl https://your-domain.vercel.app/api/namma-metro/sync
```

Or click **"Sync Now"** in the dashboard at:
`/test-cities/bangalore/reddit`

### 2️⃣ Enable Automated Sync

#### Option A: GitHub Actions (Recommended - Free)

1. Update the URL in `.github/workflows/sync-namma-metro.yml`:
   ```yaml
   curl -X GET https://your-domain.vercel.app/api/cron/sync-namma-metro
   ```

2. Commit and push:
   ```bash
   git add .github/workflows/sync-namma-metro.yml
   git commit -m "Enable Namma Metro data sync"
   git push
   ```

3. Enable Actions in your GitHub repository

✅ Done! Syncs automatically 3x daily (08:30, 13:30, 18:30 UTC)

#### Option B: Vercel Cron (Pro/Enterprise Only)

Just deploy - `vercel.json` is already configured!

### 3️⃣ Verify

Check that data is syncing:

```bash
# Check latest date
curl http://localhost:3000/api/namma-metro | jq '.[0]."Record Date"'

# Should return a recent date like "27-12-2024"
```

## 📊 Data Details

- **Source**: GitHub (updates 3x daily)
- **Your Sync**: 3x daily (30 min after source updates)
- **Storage**: MongoDB collection `dailyNammaMetro`
- **Records**: 300+ daily ridership entries
- **Format**: CSV → JSON → MongoDB

## 🔗 Key URLs

| Endpoint | Purpose | Method |
|----------|---------|--------|
| `/api/namma-metro/sync` | Manual sync | GET |
| `/api/cron/sync-namma-metro` | Automated sync | GET |
| `/api/namma-metro` | Fetch data | GET |
| `/test-cities/bangalore/reddit` | Dashboard | View |

## 📖 Documentation

- **Quick Setup**: [QUICK_START_SYNC.md](./QUICK_START_SYNC.md)
- **Full Guide**: [NAMMA_METRO_SYNC.md](./NAMMA_METRO_SYNC.md)
- **Implementation**: [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)

## 🛠️ How It Works

```
┌─────────────────────────────────────────────────────────┐
│ GitHub Repository (Source)                              │
│ Updates: 3x daily (07:33, 12:07, 17:22 UTC)            │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│ GitHub Actions / Vercel Cron                            │
│ Triggers: 3x daily (08:30, 13:30, 18:30 UTC)           │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│ Sync API (/api/cron/sync-namma-metro)                  │
│ 1. Fetch CSV from GitHub                                │
│ 2. Parse CSV data                                       │
│ 3. Clear MongoDB collection                             │
│ 4. Insert fresh data                                    │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│ MongoDB Atlas (Database)                                │
│ Collection: dailyNammaMetro                             │
│ Records: 307+ ridership entries                         │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│ Frontend API (/api/namma-metro)                         │
│ Returns: Sorted ridership data                          │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│ NammaMetroAnalysis Component                            │
│ Shows: Charts, trends, insights, predictions            │
└─────────────────────────────────────────────────────────┘
```

## 🎨 Dashboard Features

The sync dashboard (visible at top of Namma Metro page) shows:

- ✅ **Sync Now Button**: Manually trigger data refresh
- 📊 **Total Records**: Current count in database
- 📅 **Latest Date**: Most recent ridership data
- ⏰ **Last Sync Time**: When data was last updated
- ℹ️ **How It Works**: Quick reference guide

## 🧪 Testing

### Test Manual Sync
```bash
curl -X GET http://localhost:3000/api/namma-metro/sync | jq .
```

Expected response:
```json
{
  "success": true,
  "message": "Data synced successfully from GitHub",
  "stats": {
    "totalRecords": 307,
    "latestDate": "31-12-2024",
    "syncedAt": "2024-12-27T13:58:03.084Z"
  }
}
```

### Test Data API
```bash
curl -X GET http://localhost:3000/api/namma-metro | jq '.[0]'
```

Expected response:
```json
{
  "Record Date": "31-12-2024",
  "Total Smart Cards": 280798,
  "Total Tokens": 349701,
  "Total NCMC": 11091,
  ...
}
```

### Test GitHub Actions
1. Go to repository → Actions tab
2. Click "Sync Namma Metro Data"
3. Click "Run workflow" → "Run workflow"
4. Wait ~30 seconds, refresh to see result

## ⚠️ Troubleshooting

### Sync fails
- Check MongoDB connection in `.env.local`
- Verify GitHub is accessible
- Check API logs for errors

### Data not showing
- Run manual sync first
- Clear browser cache
- Check browser console for errors

### GitHub Actions not running
- Verify Actions is enabled in repo settings
- Check workflow file is in `.github/workflows/`
- Ensure URL in workflow matches your domain

## 💰 Cost

**Total Monthly Cost: $0**

- GitHub Actions: Free (< 1 min/day)
- Vercel Serverless: Free tier (well within limits)
- MongoDB Atlas: Free tier M0 (plenty of space)

## 🔐 Security

- No authentication required (data is public)
- Rate limiting not needed (low frequency)
- No sensitive data stored
- All endpoints are read-only or data-replacement

## 📈 What's Next?

The system is now running! Your Namma Metro Analysis page will:

1. ✅ Show latest ridership data automatically
2. ✅ Update 3 times daily with fresh numbers
3. ✅ Display interactive trends and insights
4. ✅ Provide AI-powered predictions
5. ✅ Highlight major events and milestones

## 🤝 Contributing

Found an issue? Want to improve the sync system?

1. Check the documentation files for answers
2. Test locally first
3. Create an issue or PR with details

## 📄 License

This sync system uses data from the public [Namma Metro Ridership Tracker](https://github.com/thecont1/namma-metro-ridership-tracker) repository. Credit to [@thecont1](https://github.com/thecont1) for maintaining the source dataset.

---

**Questions?** Check [NAMMA_METRO_SYNC.md](./NAMMA_METRO_SYNC.md) for detailed documentation.

**Need help?** See [QUICK_START_SYNC.md](./QUICK_START_SYNC.md) for troubleshooting.

**Want details?** Read [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) for technical specs.
