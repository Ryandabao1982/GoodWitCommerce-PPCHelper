# Database Integration User Guide

## Overview

Amazon PPC Keyword Genius now supports **cloud database synchronization** while maintaining **localStorage as a reliable fallback**. This gives you the best of both worlds:

- 🌐 **Cloud Sync**: Access your data from any device when signed in
- 💾 **Local Storage**: Always works, even offline
- 🔄 **Automatic Backup**: Data is saved in both places for redundancy
- 🚀 **No Interruption**: Seamless operation whether online or offline

## How It Works

### Storage Modes

The application operates in one of two modes:

#### 1. **Cloud Sync Mode** (When Signed In)
- ✅ Data is saved to the cloud database (Supabase)
- ✅ Data is also cached in localStorage for fast access
- ✅ Access your data from any device
- ✅ Automatic backups
- ✅ Synchronization happens in the background

#### 2. **Local Only Mode** (When Not Signed In)
- 💾 Data is saved only to localStorage
- 💾 Works completely offline
- 💾 No account required
- 💾 Can upgrade to Cloud Sync anytime by signing in

### Connection Status Indicator

Look for the **connection status badge** in the header:

- **🟢 Cloud Sync**: Your data is syncing to the cloud
- **🟡 Local Only**: Using localStorage only

Click on the badge to see detailed connection information.

## Getting Started

### Option 1: Start Without an Account (Local Only)

1. Simply use the application as normal
2. All your data is saved to your browser's localStorage
3. Your data persists across browser sessions
4. **Note**: Data is only available on this device/browser

### Option 2: Sign Up for Cloud Sync

1. Click on the **Settings** tab or connection status
2. Configure your Supabase credentials (if not already set)
3. Create an account or sign in
4. Your existing localStorage data will be automatically synced to the cloud

## Authentication Setup

To enable cloud synchronization, you need to configure your Supabase connection:

### Step 1: Get Supabase Credentials

If you're self-hosting or have been provided with Supabase credentials:

1. Go to **Settings**
2. Find the **API Configuration** section
3. Enter your:
   - Supabase URL (e.g., `https://xxxxx.supabase.co`)
   - Supabase Anon Key (public key for authentication)

### Step 2: Create an Account

1. Once credentials are configured, use the authentication UI
2. Sign up with your email and password
3. Verify your email (if required)

### Step 3: Automatic Data Migration

When you first sign in:
- Your existing localStorage data is automatically uploaded to the cloud
- No manual action needed
- You'll see a brief sync indicator

## Data Synchronization

### How Sync Works

1. **Write Operations** (Creating/Updating Data):
   - Data is saved to localStorage immediately (optimistic update)
   - Background sync to cloud database
   - If cloud sync fails, data remains in localStorage

2. **Read Operations** (Loading Data):
   - Cloud database is checked first (if authenticated)
   - Falls back to localStorage if database unavailable
   - localStorage serves as cache for fast access

3. **Delete Operations**:
   - Removes from both localStorage and cloud database
   - Gracefully handles if one fails

### Conflict Resolution

- **Last Write Wins**: If you edit data on multiple devices, the most recent change is kept
- **Local Always Works**: Even if cloud sync fails, localStorage keeps working
- **Background Sync**: Failed syncs are logged and can be retried

## Switching Between Modes

### From Local Only to Cloud Sync

1. Configure Supabase credentials in Settings
2. Sign in or create an account
3. Your localStorage data will be uploaded automatically
4. Status changes from "Local Only" to "Cloud Sync"

### From Cloud Sync to Local Only

1. Sign out from your account
2. Application switches to localStorage only
3. Your data remains in localStorage
4. You can sign back in anytime to resume cloud sync

## Data Privacy & Security

### What's Stored Where

**In localStorage (Always):**
- All your brands, keywords, and campaigns
- User preferences (dark mode, etc.)
- Session-specific data (current search, selections)

**In Cloud Database (When Signed In):**
- Brands and their metadata
- Keywords and their properties
- Campaigns and ad groups
- Does NOT include: API keys (kept local only)

### Security Features

- 🔒 **Encrypted in Transit**: All data sent to database uses TLS encryption
- 🔒 **Row-Level Security**: You can only see your own data
- 🔒 **API Keys Stay Local**: Your Gemini API key is never sent to the database
- 🔒 **Authentication Required**: Database access requires valid login

## Troubleshooting

### Issue: "Local Only" even though I'm signed in

**Possible Causes:**
- Supabase credentials not configured
- Database connection issue
- Network problems

**Solutions:**
1. Check your Supabase URL and Anon Key in Settings
2. Verify you're signed in (check authentication status)
3. Check browser console for error messages
4. Try signing out and back in

---

### Issue: Data not syncing to cloud

**Possible Causes:**
- Not signed in
- Network connectivity issues
- Database quota exceeded (free tier limits)

**Solutions:**
1. Check connection status indicator
2. Verify network connectivity
3. Check browser console for sync errors
4. Try signing out and back in
5. Your data is safe in localStorage regardless

---

### Issue: Data lost when clearing browser cache

**Prevention:**
- Sign in to enable cloud sync
- Export your data regularly (CSV exports)
- Use cloud sync for important projects

**Recovery:**
- If cloud sync was enabled, sign back in to restore data
- If using local only, data cannot be recovered after cache clear

---

### Issue: Different data on different devices

**Cause:** Using Local Only mode on multiple devices

**Solution:** Sign in on both devices to enable cloud sync

## Best Practices

1. **Sign In for Important Work**: Enable cloud sync for projects you care about
2. **Regular Exports**: Export campaigns to CSV as additional backup
3. **Check Connection Status**: Verify cloud sync is active before important work
4. **Multiple Devices**: Sign in on all devices for seamless experience
5. **Offline Work**: Don't worry, Local Only mode works perfectly offline

## FAQ

**Q: Do I need an account to use the application?**  
A: No! The application works perfectly with localStorage only. Cloud sync is optional.

**Q: What happens if I clear my browser data?**  
A: If you're using Local Only mode, your data will be lost. If you're using Cloud Sync, sign back in to restore your data.

**Q: Can I use the app offline?**  
A: Yes! The app works completely offline using localStorage. When you go online again, data will sync if you're signed in.

**Q: Is my data secure?**  
A: Yes! All cloud communication is encrypted, and row-level security ensures only you can access your data. API keys never leave your browser.

**Q: How much storage do I get?**  
A: localStorage typically provides 5-10MB. Cloud database storage depends on your Supabase plan (typically 500MB on free tier).

**Q: Can I export my data?**  
A: Yes! Use the export feature in Campaign Manager to download your campaigns as CSV files.

**Q: What happens if Supabase goes down?**  
A: The application automatically falls back to localStorage. You can continue working without interruption.

## Getting Help

If you encounter issues:

1. Check the connection status indicator
2. Review browser console for error messages
3. Verify your Supabase configuration in Settings
4. Consult the [DATABASE_IMPLEMENTATION.md](./DATABASE_IMPLEMENTATION.md) for technical details
5. Open an issue on GitHub with error details

---

**Last Updated**: 2025-10-19  
**Version**: 1.0
