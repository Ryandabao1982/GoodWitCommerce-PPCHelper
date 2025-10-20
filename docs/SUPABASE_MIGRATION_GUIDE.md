# Supabase Migration Guide

**Version 1.0** | **Date**: 2025-10-20

## Overview

Amazon PPC Keyword Genius now supports cloud data synchronization using Supabase! This allows you to:

- 🔄 **Sync data across devices** - Access your brands, keywords, campaigns, and SOPs from anywhere
- 💾 **Automatic backups** - Your data is safely stored in the cloud
- 🔒 **Secure storage** - All data is encrypted and protected with user authentication
- 👥 **Future collaboration** - Foundation for team features (coming soon)

## For New Users

If you're new to the application, you can choose to:

1. **Use without signing in** (Local Only Mode)
   - All data stored in your browser's localStorage
   - No cloud sync
   - Works offline
   - Data limited to single browser

2. **Sign up for cloud sync** (Recommended)
   - Click the "Sign In" button in the header
   - Create a free account
   - Your data will automatically sync to the cloud
   - Access from multiple devices

## For Existing Users

If you've been using the application with localStorage, **your data is safe!** Here's what you need to know:

### Your Data is Preserved

- All existing brands, keywords, campaigns, and SOPs remain in localStorage
- The application continues to work exactly as before
- No data is lost or removed

### How to Start Using Cloud Sync

**Step 1: Create an Account**

1. Click the "Sign In" button in the top-right corner of the header
2. Click "Sign up" in the modal
3. Enter your email and create a password (min 6 characters)
4. Click "Create Account"
5. Check your email for verification (optional but recommended)

**Step 2: Your Data is Automatically Synced**

Once you sign in:
- All new brands, keywords, campaigns, and SOPs are automatically saved to the cloud
- Existing data in localStorage is used as a fallback
- Data is synced in the background whenever you make changes

**Step 3: Manual Migration (Optional)**

To move your existing localStorage data to the cloud:

1. **For each brand:**
   - Open the brand
   - Go to Keyword Bank
   - The keywords will automatically sync when you sign in
   
2. **For campaigns:**
   - Open Campaign Planner
   - Campaigns are synced automatically on first load
   
3. **For SOPs:**
   - Open SOP Library
   - SOPs are synced automatically on first load

The application uses a "hybrid storage" pattern where it checks the database first, then falls back to localStorage. New data is always saved to both locations.

## Understanding Storage Modes

### Local Only Mode (No Sign In)

**Indicator:** "Sign In" button visible in header

**How it works:**
- All data stored in browser localStorage
- Fast and works offline
- Limited to single browser/device
- Data could be lost if browser cache is cleared

**When to use:**
- Quick testing or demos
- Privacy-sensitive work
- No need for multi-device access

### Cloud Sync Mode (Signed In)

**Indicator:** User profile with green "Cloud Sync Active" badge

**How it works:**
- Data saved to Supabase PostgreSQL database
- localStorage used as local cache for speed
- Automatic synchronization on all operations
- Access from any device with your account

**When to use:**
- Regular/professional use
- Multi-device workflow
- Data backup and security
- Future team collaboration

## Connection Status

The application shows your current connection status in the header (desktop view):

- 🟢 **Cloud Sync** - Connected to database, data being synced
- 🟡 **Local Only** - Using localStorage only (not signed in or connection issue)

Click the status badge to see detailed connection information.

## Frequently Asked Questions

### Q: What happens to my localStorage data when I sign in?

**A:** Your localStorage data remains intact and continues to serve as a backup. New operations will sync to the cloud, and existing data will be available from localStorage until it's naturally replaced by database versions.

### Q: Can I use the app without signing in?

**A:** Yes! The application works perfectly in localStorage-only mode. You can sign up later without losing data.

### Q: What if I lose internet connection?

**A:** The app continues to work using localStorage as a fallback. Once connection is restored, changes will sync to the database on the next operation.

### Q: Is my data secure?

**A:** Yes! We use:
- Row-level security (RLS) - You can only access your own data
- Encrypted connections (TLS/SSL)
- Supabase's secure authentication
- No data sharing with third parties

### Q: Can I sign out and switch accounts?

**A:** Yes! Click your profile in the header and select "Sign Out". Your localStorage data remains available, and you can sign in with a different account.

### Q: What data is synced?

Currently synced to cloud when signed in:
- ✅ Brands
- ✅ Keywords
- ✅ Campaigns and Ad Groups
- ✅ SOPs (Standard Operating Procedures)
- ✅ Keyword clusters

Stored locally only:
- 🔵 Search history (session-specific)
- 🔵 Recently viewed SOPs (session-specific)
- 🔵 API settings
- 🔵 UI preferences (dark mode, etc.)

### Q: How do I delete my account and data?

**A:** Contact support or use the Supabase dashboard to delete your user account. All associated data will be automatically deleted due to cascade delete policies.

### Q: Can I export my data?

**A:** Yes! Use the existing export features:
- Export Keyword Bank to CSV
- Export Campaign Plan to CSV
- SOPs can be copied manually (batch export coming soon)

## Troubleshooting

### "Failed to connect to database"

**Possible causes:**
- Internet connection issue
- Supabase service temporarily unavailable
- Incorrect credentials in settings

**Solution:**
- Check your internet connection
- Try signing out and signing in again
- Contact support if the issue persists
- App continues to work with localStorage

### "Authentication error"

**Possible causes:**
- Incorrect email or password
- Email not verified
- Session expired

**Solution:**
- Double-check credentials
- Use "Forgot password?" to reset
- Check email for verification link
- Clear browser cache and try again

### Data not syncing

**Possible causes:**
- Not signed in
- Connection lost
- Browser blocking requests

**Solution:**
- Verify "Cloud Sync Active" status
- Check browser console for errors
- Try signing out and back in
- Disable ad blockers temporarily

### Duplicate data after sign in

**Possible causes:**
- Data exists in both localStorage and database
- Multiple sync operations

**Solution:**
- This is expected behavior and resolves naturally
- Delete duplicate entries manually if needed
- Database data takes precedence going forward

## Technical Details

### Database Schema

The application uses the following tables:
- `users` - User profiles
- `brands` - Brand workspaces  
- `keywords` - Keyword data
- `campaigns` - Campaign structures
- `ad_groups` - Ad group configurations
- `ad_group_keywords` - Keyword assignments
- `sops` - Standard operating procedures
- `sop_view_history` - SOP view tracking

### Row-Level Security

All tables enforce row-level security:
- Users can only see their own data
- All operations validated against user ID
- Secure by default

### Hybrid Storage Pattern

```
User Operation
    ↓
Check if authenticated?
    ↓
Yes: Try database → Success: Update localStorage cache
                   → Fail: Fall back to localStorage
                   
No: Use localStorage only
```

## Support

For issues or questions:
- Check this guide and the main README
- Review the [Database Implementation Guide](./DATABASE_IMPLEMENTATION.md)
- Open a GitHub issue with details
- Include error messages from browser console

## What's Next?

Future enhancements for cloud sync:
- 📊 Real-time collaboration features
- 👥 Team workspaces and sharing
- 📈 Performance tracking and analytics
- 🔄 Automatic conflict resolution
- 📱 Mobile app with sync
- ⚡ Real-time updates across devices

---

**Thank you for using Amazon PPC Keyword Genius!** 🎉

Your feedback helps us improve. Please report any issues or suggestions via GitHub.
