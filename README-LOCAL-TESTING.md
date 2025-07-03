# Local Testing Guide for Invoxa

This guide will help you set up and test the Invoxa application locally.

## Quick Start

1. **Clone and Setup**
   \`\`\`bash
   git clone <repository-url>
   cd invoxa-fullstack
   npm install
   npm run setup
   \`\`\`

2. **Configure Environment**
   \`\`\`bash
   # Edit .env.local with your actual values
   cp .env.example .env.local
   \`\`\`

3. **Start Development Server**
   \`\`\`bash
   npm run dev
   \`\`\`

4. **Run Tests**
   - Visit: http://localhost:3000/test
   - Click "Run All Tests"

## Environment Variables Setup

### Required Variables

| Variable | Description | How to Get |
|----------|-------------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | [supabase.com](https://supabase.com) → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Same as above |
| `EXCHANGE_API_KEY` | Currency exchange API key | [exchangerate-api.com](https://exchangerate-api.com) (free tier available) |
| `NEXT_PUBLIC_SITE_URL` | Your site URL | `http://localhost:3000` for local development |

### Optional Variables

| Variable | Description | How to Get |
|----------|-------------|------------|
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Supabase Project Settings → API |
| `DATABASE_URL` | PostgreSQL connection string | [neon.tech](https://neon.tech) or local PostgreSQL |
| `RESEND_API_KEY` | Email service API key | [resend.com](https://resend.com) |
| `OPENAI_API_KEY` | OpenAI API key | [platform.openai.com](https://platform.openai.com) |

## Testing Features

### 1. Currency Converter
- Tests real-time currency conversion
- Falls back to mock data if API key is missing
- Supports 40+ currencies

### 2. Authentication
- Tests Supabase authentication
- Falls back to mock authentication for development
- Supports email/password and OAuth

### 3. Database Operations
- Tests database connectivity
- Uses mock data if database is not configured
- Supports both Supabase and Neon databases

## Test Page Features

Visit `http://localhost:3000/test` to access:

- **Environment Tests**: Verify all environment variables
- **Currency Converter Test**: Interactive currency conversion
- **Service Status**: Check all external services
- **Setup Guide**: Step-by-step configuration help

## Troubleshooting

### Common Issues

1. **"Module not found" errors**
   \`\`\`bash
   rm -rf node_modules package-lock.json
   npm install
   \`\`\`

2. **Environment variables not loading**
   - Ensure `.env.local` exists in project root
   - Restart development server after changes
   - Check for typos in variable names

3. **Currency conversion fails**
   - Verify `EXCHANGE_API_KEY` is set correctly
   - Check API key limits (free tier has limits)
   - App will use mock data as fallback

4. **Authentication issues**
   - Verify Supabase URL and keys
   - Check Supabase project is active
   - App will use mock authentication as fallback

### Development Mode Features

- **Mock Data**: App works without external services
- **Error Handling**: Graceful fallbacks for missing services
- **Test Suite**: Comprehensive testing of all features
- **Hot Reload**: Changes reflect immediately

## Production Deployment

Before deploying to production:

1. **Set Real API Keys**: Replace all demo values
2. **Configure Database**: Set up production database
3. **Test All Features**: Run full test suite
4. **Environment Check**: Verify all required variables

## Getting Help

- Check the test page for detailed error messages
- Review console logs for debugging information
- Ensure all environment variables are properly set
- Verify external services are accessible

## Next Steps

Once local testing is complete:
1. Deploy to Vercel/Netlify
2. Configure production environment variables
3. Set up monitoring and error tracking
4. Configure custom domain and SSL
