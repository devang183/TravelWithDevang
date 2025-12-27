# Quick Start: Namma Metro Data Sync

## 🚀 Get Started in 3 Steps

### Step 1: Initial Data Sync

Run this command or visit the URL to populate your database with the latest data:

```bash
# Local development
curl http://localhost:3000/api/namma-metro/sync

# Production (replace with your domain)
curl https://your-domain.vercel.app/api/namma-metro/sync
```

Or simply visit the sync dashboard in your browser:
- Local: http://localhost:3000/test-cities/bangalore/reddit
- Production: https://your-domain.vercel.app/test-cities/bangalore/reddit

Click the "Sync Now" button in the dashboard.

### Step 2: Verify Data

Check that data was synced successfully:

```bash
# Check record count
curl http://localhost:3000/api/namma-metro | jq '. | length'

# View latest record
curl http://localhost:3000/api/namma-metro | jq '.[0]'
```

Expected output: ~300+ records with the latest date being recent.

### Step 3: Set Up Automated Sync

#### Option A: GitHub Actions (Recommended - Free for all plans)

The workflow file is already created at `.github/workflows/sync-namma-metro.yml`.

1. **Update the URL** in the workflow file:
   ```yaml
   curl -X GET https://your-domain.vercel.app/api/cron/sync-namma-metro
   ```
   Replace `your-domain.vercel.app` with your actual Vercel domain.

2. **Commit and push** the workflow file:
   ```bash
   git add .github/workflows/sync-namma-metro.yml
   git commit -m "Add Namma Metro data sync workflow"
   git push
   ```

3. **Enable GitHub Actions**:
   - Go to your repository on GitHub
   - Click "Actions" tab
   - If prompted, click "I understand my workflows, go ahead and enable them"

4. **Test the workflow**:
   - Go to Actions tab → "Sync Namma Metro Data"
   - Click "Run workflow" → "Run workflow"
   - Wait ~30 seconds and refresh to see the result

✅ Done! The workflow will now run automatically 3 times daily at 08:30, 13:30, and 18:30 UTC.

#### Option B: Vercel Cron (Only for Pro/Enterprise plans)

The `vercel.json` file is already configured. Simply:

1. **Ensure you're on Vercel Pro or Enterprise**
2. **Deploy your app** to Vercel
3. **Verify cron is active**:
   - Go to Vercel Dashboard → Your Project → Settings → Crons
   - You should see the sync job listed

✅ Done! Vercel will automatically run the sync 3 times daily.

## 📊 Viewing the Data

Once synced, your Namma Metro Analysis page will display:
- Daily ridership trends with interactive monthly storytelling
- Payment method breakdowns
- Peak and lowest ridership days
- Weekday patterns
- AI-powered predictions

Visit: http://localhost:3000/test-cities/bangalore/reddit

## 🔄 Sync Schedule

- **GitHub Source**: Updates 3x daily at 07:33, 12:07, 17:22 UTC
- **Your Sync**: Runs 3x daily at 08:30, 13:30, 18:30 UTC
- **Lag**: ~30-60 minutes behind source (ensures fresh data is available)

## 🛠️ Troubleshooting

### Sync fails with "Cannot connect to MongoDB"

**Solution**: Verify your MongoDB URI in `.env.local`:
```env
MONGODB_URI=mongodb+srv://...
DB_NAME=hello
```

### GitHub Actions workflow not running

**Solutions**:
1. Check Actions tab for error messages
2. Ensure GitHub Actions is enabled in repository settings
3. Verify the workflow file is in `.github/workflows/` directory
4. Check that the URL in the workflow matches your deployment

### Data not showing in frontend

**Solutions**:
1. Run manual sync: Visit `/api/namma-metro/sync`
2. Check browser console for errors
3. Verify API returns data: `curl http://localhost:3000/api/namma-metro`
4. Clear browser cache and refresh

### Want to sync more/less frequently?

Edit the cron schedule in `.github/workflows/sync-namma-metro.yml`:

```yaml
# Current: 3 times daily
- cron: '30 8,13,18 * * *'

# Every 6 hours
- cron: '0 */6 * * *'

# Once daily at 9 AM UTC
- cron: '0 9 * * *'

# Every hour
- cron: '0 * * * *'
```

## 📈 What's Next?

The data is now automatically syncing! The NammaMetroAnalysis component will:
- Show up-to-date ridership trends
- Highlight major events (line openings, fare hikes, celebrations)
- Provide interactive monthly storytelling
- Display peak/low ridership insights
- Generate ridership predictions

## 🔗 Useful Links

- **GitHub Source**: https://github.com/thecont1/namma-metro-ridership-tracker
- **Full Documentation**: See `NAMMA_METRO_SYNC.md`
- **Manual Sync Endpoint**: `/api/namma-metro/sync`
- **Cron Endpoint**: `/api/cron/sync-namma-metro`
- **Data API**: `/api/namma-metro`

---

**Need help?** Check the full documentation in `NAMMA_METRO_SYNC.md` or create an issue.
