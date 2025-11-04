# Supabase Setup Guide for NoteLoom

**Note:** Supabase is **optional** for NoteLoom. The app works perfectly fine without it using local storage only. If you want cloud sync across devices, follow this guide to set up Supabase.

This guide will walk you through setting up Supabase for NoteLoom from scratch, including account creation, database configuration, and security setup.

---

## Table of Contents

1. [Creating a Supabase Account](#1-creating-a-supabase-account)
2. [Getting Your Project Credentials](#2-getting-your-project-credentials)
3. [Creating the Database Table](#3-creating-the-database-table)
4. [Setting Up Row Level Security (RLS)](#4-setting-up-row-level-security-rls)
5. [Configuring Authentication Settings](#5-configuring-authentication-settings)
6. [Updating Your Local Configuration](#6-updating-your-local-configuration)
7. [Verifying the Setup](#7-verifying-the-setup)

---

## 1. Creating a Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"** or **"Sign Up"**
3. Sign up using one of these methods:
   - GitHub account (recommended)
   - Email and password
4. Verify your email if required
5. You'll be redirected to your Supabase dashboard

---

## 2. Getting Your Project Credentials

1. In your Supabase dashboard, click **"New Project"**
2. Fill in the project details:
   - **Name**: Choose a name for your project (e.g., "NoteLoom")
   - **Database Password**: Create a strong password (save this securely - you'll need it)
   - **Region**: Choose the region closest to you or your users
   - **Pricing Plan**: Select **Free** (or your preferred plan)
3. Click **"Create new project"**
4. Wait 2-3 minutes for the project to be set up

### Finding Your API Credentials

Once your project is ready:

1. Go to **Settings** (gear icon in the left sidebar)
2. Click **"API"** in the settings menu
3. You'll see two important values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public** key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

4. Copy both values - you'll need them later for your local configuration

---

## 3. Creating the Database Table

1. In your Supabase dashboard, click **"SQL Editor"** in the left sidebar
2. Click **"New query"**
3. Open the file `create_user_data_table.sql` from this folder (`Supabase Setup Info/`)
4. Copy the entire contents of the file and paste it into the SQL Editor
5. Click **"Run"** (or press `Ctrl+Enter` / `Cmd+Enter`)
6. You should see a success message: "Success. No rows returned"

### Verifying the Table

1. Go to **"Table Editor"** in the left sidebar
2. You should see a table called **"user_data"**
3. Click on it to view the structure - it should have these columns:
   - `id` (bigserial, primary key)
   - `user_uuid` (text)
   - `data_type` (text)
   - `data` (jsonb)
   - `updated_at` (timestamptz)
   - `created_at` (timestamptz)

---

## 4. Setting Up Row Level Security (RLS)

Row Level Security ensures users can only access their own data. This is critical for data protection.

1. Go back to **"SQL Editor"**
2. Click **"New query"**
3. Open the file `supabase_rls_policies.sql` from this folder
4. Copy the entire contents and paste it into the SQL Editor
5. Click **"Run"**

### What This Does

The RLS policies script:
- Creates a helper function to get the user's UUID from their authentication metadata
- Sets up policies that allow users to:
  - **SELECT**: Read only their own data
  - **INSERT**: Create only records with their own UUID
  - **UPDATE**: Update only their own data
  - **DELETE**: Delete only their own data

### Verifying RLS is Active

1. Go to **"Table Editor"**
2. Click on the **"user_data"** table
3. Look for a shield icon or "RLS enabled" indicator
4. You can also check in **"Authentication"** → **"Policies"** to see the policies listed

---

## 5. Configuring Authentication Settings

For NoteLoom to work properly, you need to configure authentication settings.

### Enable Email Provider

1. Go to **"Authentication"** in the left sidebar
2. Click **"Providers"** in the submenu
3. Find **"Email"** in the list
4. Make sure it's **enabled** (toggle should be ON)
5. Under **"Enable email confirmations"**, toggle it **OFF**
   - This allows users to sign in immediately without email verification
   - Important for NoteLoom's seamless login experience

### Disable Email Confirmations (Alternative Method)

If you can't find the toggle:

1. Go to **"Authentication"** → **"Settings"**
2. Look for **"Enable email confirmations"**
3. Toggle it **OFF**

---

## 6. Updating Your Local Configuration

Now you need to configure your local NoteLoom project with your Supabase credentials using environment variables.

### Setting Up Environment Variables

1. Create a `.env.local` file in the project root directory (if it doesn't exist)
2. Add your Supabase credentials to the file:

```bash
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE
```

3. Save the file

**Important:** 
- The `.env.local` file is already in `.gitignore` and won't be committed to version control
- Never commit your actual credentials to GitHub or any public repository
- Each developer/user needs to create their own `.env.local` file with their credentials

### Where to Find These Values

- **VITE_SUPABASE_URL**: Found in Supabase Dashboard → **Settings** → **API** → **Project URL**
- **VITE_SUPABASE_ANON_KEY**: Found in Supabase Dashboard → **Settings** → **API** → **anon public** key

### Example .env.local File

```bash
# Supabase Configuration (Required for cloud sync)
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MjE5NjE4MCwiZXhwIjoxOTU3NzczNzgwfQ.abcdefghijklmnopqrstuvwxyz1234567890

# Optional: Gemini API Key (for AI features)
GEMINI_API_KEY=your-gemini-api-key-here
```

---

## 7. Verifying the Setup

### Test Connection from NoteLoom

1. Make sure your `.env.local` file is set up with your Supabase credentials
2. Start your NoteLoom application (`npm run dev`)
3. Open the browser console (F12)
4. Look for debug messages:
   - If Supabase is configured: `[Supabase Debug] Testing Supabase connection...` followed by success message
   - If Supabase is NOT configured: `[Supabase Debug] Supabase not configured, skipping connection test` (this is normal - the app works without Supabase)

### Test Authentication

1. Create a new profile in NoteLoom
2. Enable "server-side sync" during profile creation
3. Enter a username and secret phrase (minimum 6 characters)
4. Check the browser console for:
   - `[Supabase Debug] Authentication successful`
   - `[Supabase Debug] Successfully inserted profiles`

### Check Data in Supabase

1. Go to Supabase dashboard → **"Table Editor"**
2. Click on **"user_data"** table
3. You should see rows with:
   - `user_uuid`: A UUID string
   - `data_type`: Either "profiles" or "settings"
   - `data`: JSON object containing your NoteLoom data

---

## Troubleshooting

### "Email signups are disabled"

**Solution**: Go to **Authentication** → **Providers** → **Email** and make sure it's enabled.

### "Password should be at least 6 characters"

**Solution**: This is expected. Make sure your secret phrase is at least 6 characters long.

### "Authentication failed"

**Possible causes**:
1. Email confirmations are enabled - disable them in Authentication settings
2. Wrong credentials in `.env.local` - double-check your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` values
3. RLS policies not set up - run the `supabase_rls_policies.sql` script
4. Environment variables not loaded - make sure `.env.local` is in the project root and restart the dev server

### "No data showing in Supabase"

**Possible causes**:
1. User hasn't created an account yet - create a profile with sync enabled
2. Sync hasn't completed - wait a few seconds and check console logs
3. Authentication failed - check console for error messages

### Connection Test Fails

**Check**:
1. Your Supabase project is active (not paused)
2. Your `VITE_SUPABASE_URL` in `.env.local` is correct
3. Your `VITE_SUPABASE_ANON_KEY` in `.env.local` is correct
4. Your `.env.local` file is in the project root directory
5. You've restarted the dev server after creating/updating `.env.local`
6. Your internet connection is working

### App Works Without Supabase

If you see `[Supabase Debug] Supabase not configured, skipping...` messages, this is normal. The app is designed to work without Supabase using local storage only. To enable cloud sync, you need to:
1. Set up a Supabase project (following this guide)
2. Add your credentials to `.env.local`
3. Restart the dev server

---

## SQL Files Reference

This folder contains the following SQL files:

### `create_user_data_table.sql`
Creates the `user_data` table with all necessary columns and indexes.

**When to use**: Run this first when setting up a new Supabase project.

### `supabase_rls_policies.sql`
Sets up Row Level Security policies to ensure users can only access their own data.

**When to use**: Run this after creating the table, before enabling authentication.

**Location**: This file is included in this folder for easy access.

---

## Security Best Practices

1. **Never commit your service role key** - Only use the anon/public key in client-side code
2. **Never commit `.env.local`** - This file is already in `.gitignore` and should never be committed
3. **Keep your database password secure** - You'll need it for direct database access
4. **Review RLS policies regularly** - Make sure they're correctly protecting user data
5. **Monitor your Supabase dashboard** - Check for unusual activity or errors
6. **Environment variables are required** - Credentials are now stored in `.env.local` for security

---

## Next Steps

Once your Supabase setup is complete:

1. ✅ Test creating a profile with sync enabled
2. ✅ Test logging in from another device using the same credentials
3. ✅ Verify data syncs between devices
4. ✅ Test the manual sync button in Account/Settings
5. ✅ Test account deletion (if needed)

---

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Authentication Guide](https://supabase.com/docs/guides/auth)

---

## Support

If you encounter issues:

1. Check the browser console for error messages
2. Review the Supabase dashboard logs (Logs section)
3. Verify all SQL scripts have been run successfully
4. Ensure authentication settings are configured correctly

---

**Last Updated**: 2024

---

## Quick Start (Optional Setup)

If you just want to use NoteLoom locally without cloud sync:

1. Clone the repository
2. Run `npm install`
3. Run `npm run dev`
4. Start using the app - it works with local storage only!

Supabase setup is only needed if you want to:
- Sync data across multiple devices
- Have cloud backup of your data
- Access your notes from anywhere

