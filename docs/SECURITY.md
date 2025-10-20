# Security and Privacy Policy

## Overview

Amazon PPC Keyword Genius is a client-side web application that prioritizes user privacy and data security. This document outlines how your data is handled and what security measures are in place.

## API Keys and Credentials

### Google Gemini API Key

- **Storage**: Your Gemini API key is stored locally in your browser's localStorage only
- **Transmission**: API key is sent directly from your browser to Google's Gemini API servers
- **Server Access**: We do not have access to your API key on any server
- **Responsibility**: You are responsible for obtaining and securing your own API key
- **Get Your Key**: https://aistudio.google.com/app/apikey

⚠️ **Important**: Never commit your API key to version control or share it publicly. If you believe your key has been exposed, rotate it immediately at Google AI Studio.

### Supabase Configuration (Optional)

If you choose to enable cloud synchronization:

- **Storage**: Supabase URL and anonymous key are stored in environment variables and browser localStorage
- **Purpose**: Used for optional cloud data synchronization and multi-device access
- **Authentication**: User authentication is handled securely by Supabase Auth
- **Encryption**: All connections to Supabase use TLS/SSL encryption

## Data Storage and Privacy

### Local Storage Mode (Default)

When you use the application without signing in:

- **Where Data is Stored**: All data is stored locally in your browser's localStorage
- **What is Stored**:
  - Brand configurations
  - Keyword research results
  - Campaign structures and ad groups
  - Search history
  - User preferences and settings
- **Privacy**: Your data never leaves your device
- **Persistence**: Data persists until you clear your browser data
- **Multi-Device**: Not synced across devices

### Cloud Storage Mode (Optional - Sign In Required)

When you sign in with a Supabase account:

- **Where Data is Stored**: Data is stored in a PostgreSQL database hosted by Supabase
- **What is Stored in Cloud**:
  - Brand configurations
  - Keyword research results
  - Campaign structures and ad groups
  - Search history
  - User preferences and settings
- **Data Access**: Only you can access your data (protected by Row-Level Security)
- **Encryption**: All data transmitted to/from Supabase is encrypted using TLS 1.3
- **Multi-Device**: Your data syncs across all devices where you're signed in
- **Backup**: Supabase provides automated backups of your data

### Data Sent to Third Parties

**Google Gemini API**:
- **What is Sent**: Seed keywords, brand names, and search parameters you provide
- **Purpose**: To generate keyword suggestions and AI-powered insights
- **Privacy**: Subject to Google's Privacy Policy
- **URL**: https://ai.google.dev/terms

**Supabase (Optional)**:
- **What is Sent**: Your research data (when signed in)
- **Purpose**: Cloud storage and multi-device synchronization
- **Privacy**: Subject to Supabase's Privacy Policy
- **URL**: https://supabase.com/privacy

### Data NOT Stored or Transmitted

- We do NOT collect analytics or telemetry data
- We do NOT track your usage patterns
- We do NOT sell or share your data with third parties
- We do NOT store your payment information (no payments required)
- We do NOT access your Amazon Seller Central account

## Security Best Practices

### For Users

1. **API Key Security**:
   - Never share your Gemini API key
   - Rotate keys immediately if exposed
   - Use environment variables, never commit keys to repositories

2. **Password Security** (if using Supabase):
   - Use a strong, unique password
   - Enable two-factor authentication if available
   - Don't reuse passwords from other services

3. **Browser Security**:
   - Keep your browser updated
   - Use a secure, private network when accessing sensitive data
   - Clear browser data if using a shared computer

### For Developers

1. **Environment Variables**:
   - Always use `.env` for local development
   - Never commit `.env` files to version control
   - Use `.env.example` with placeholder values only

2. **API Key Handling**:
   - API keys should only be stored in environment variables
   - For production deployments, use secure environment variable management
   - Consider implementing a backend proxy for API calls in production

3. **Content Security Policy**:
   - CSP headers are configured in `index.html`
   - Only allow trusted domains for script and style sources
   - Regularly review and update CSP as needed

## Security Headers

The application implements the following security headers:

- **Content-Security-Policy**: Restricts resource loading to trusted domains
- **Referrer-Policy**: Controls referrer information sent with requests (strict-origin-when-cross-origin)

## Reporting Security Issues

If you discover a security vulnerability:

1. **DO NOT** open a public GitHub issue
2. Email the repository maintainer directly
3. Provide details about the vulnerability
4. Allow reasonable time for a fix before public disclosure

## Rate Limiting and API Protection

**Current Status**: 
- API calls are made directly from the browser to Google Gemini API
- Rate limiting is controlled by your Gemini API key quota

**Future Enhancement**:
For production deployments beyond hobby use, consider:
- Implementing a backend API proxy to gate Gemini calls
- Adding rate limiting per user/IP
- Implementing a domain allowlist
- Monitoring and alerting for suspicious activity

## Data Retention

### Local Storage
- Data persists indefinitely until you clear browser data
- You can delete individual brands or clear all data in Settings

### Cloud Storage (Supabase)
- Data persists until you delete it manually
- You can delete individual brands or your entire account
- Account deletion will permanently remove all associated data

## Compliance

This application:
- Does not collect personal information beyond what's needed for authentication (if using cloud sync)
- Complies with GDPR principles of data minimization and user control
- Provides clear information about data storage and usage
- Allows users to export and delete their data

## Updates to This Policy

We may update this security and privacy policy as the application evolves. Major changes will be documented in the CHANGELOG.md file.

**Last Updated**: 2025-10-20
**Version**: 1.0.0
