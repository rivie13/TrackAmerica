# Environment Setup Guide

This guide explains how to obtain and configure all required API keys and services for TrackAmerica.

## Prerequisites

**Required Software:**
- **Node.js 22+ (LTS)** - [Download here](https://nodejs.org/)
- **npm 9+** - Comes with Node.js
- **PostgreSQL 14+** - [Download here](https://www.postgresql.org/download/)

**Check your versions:**
```bash
node --version   # Should be v22.x.x or higher
npm --version    # Should be 9.x.x or higher
```

**If you need to install/upgrade Node.js:**
- Use [nvm](https://github.com/nvm-sh/nvm) (recommended): `nvm install 22 && nvm use 22`
- Or download from [nodejs.org](https://nodejs.org/) (choose LTS version)

---

## Quick Start

1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Follow the sections below to get your API keys
3. Fill in the values in your `.env` file
4. **Never commit `.env` to git** - it contains secrets!

---

## Required Services

### 1. Congress.gov API Key (FREE)

**What it's for:** Fetch representatives, bills, and voting records

**How to get it:**
1. Visit: https://api.congress.gov/sign-up/
2. Fill out the registration form
3. Check your email for the API key
4. Add to `.env`:
   ```
   CONGRESS_API_KEY=your_key_here
   ```

**Rate Limits:** 5,000 requests per hour (generous for development)

**Cost:** FREE ✅

---

### 2. PostgreSQL Database with pgvector

**What it's for:** Store representatives, bills, votes, and embeddings

**Option A: Local Development (Recommended for now)**

Install PostgreSQL locally:

**Windows:**
1. Download from: https://www.postgresql.org/download/windows/
2. Install with default settings
3. Remember the password you set for `postgres` user
4. Install pgvector extension:
   ```sql
   CREATE EXTENSION vector;
   ```

**Your DATABASE_URL:**
```
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/trackamerica
```

**Option B: Azure Database for PostgreSQL (Production)**

1. Go to: https://portal.azure.com
2. Create new resource → Azure Database for PostgreSQL flexible server
3. Enable pgvector extension in server parameters
4. Get connection string from Azure portal
5. Add to `.env`

**Cost:** 
- Local: FREE ✅
- Azure: ~$50-100/month (production only)

---

### 3. Azure OpenAI Service

**What it's for:** AI chatbot (GPT-4o) [TBD what model will be used] and bill embeddings (text-embedding-ada-002)

**How to get it:**

1. **Create Azure Account** (if you don't have one):
   - Visit: https://azure.microsoft.com/free/
   - Get $200 free credit for 30 days

2. **Create Azure OpenAI Resource**:
   - Go to: https://portal.azure.com
   - Click "Create a resource"
   - Search for "Azure OpenAI"
   - Click Create
   - Fill in:
     - Resource group: Create new (e.g., "trackamerica-rg")
     - Region: Choose one (e.g., "East US")
     - Name: Your resource name (e.g., "trackamerica-openai")
     - Pricing tier: Standard S0

3. **Deploy Models**:
   
   After resource is created:
   
   - Go to your Azure OpenAI resource
   - Click "Go to Azure OpenAI Studio"
   - Navigate to "Deployments"
   - Click "+ Create new deployment"
   
   **Deploy GPT-4o for chat:**
   - <TBD> AI model to be decided for now examples uses 4o
   - Model: gpt-4o
   - Deployment name: `gpt-4o-deployment` (use this exact name or update .env)
   - Click Create
   
   **Deploy text-embedding-ada-002 for embeddings:**
   - Model: text-embedding-ada-002
   - Deployment name: `text-embedding-ada-002` (use this exact name or update .env)
   - Click Create

4. **Get Your Keys and Endpoint**:
   - Go back to Azure Portal
   - Navigate to your Azure OpenAI resource
   - Click "Keys and Endpoint" in left menu
   - Copy:
     - **Endpoint** (e.g., `https://trackamerica-openai.openai.azure.com/`)
     - **Key 1** (your API key)

5. **Add to `.env`**:
    - <TBD> model to be decided for now examples uses 4o
   ```
   AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com/
   AZURE_OPENAI_API_KEY=your_api_key_here
   AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o-deployment
   AZURE_OPENAI_EMBEDDING_DEPLOYMENT=text-embedding-ada-002
   ```

**Cost:** 
- Pay-per-use (only charged when you make requests)
- GPT-4o: ~$0.03 per 1,000 tokens (~750 words) [examples use 4o, model to be decided later]
- Embeddings: ~$0.0001 per 1,000 tokens
- Estimated monthly cost for development: $10-50

---

## Development vs Production

### Development (Local)
- ✅ Congress.gov API: FREE
- ✅ PostgreSQL: Local (FREE)
- ✅ Azure OpenAI: Pay-per-use (~$10-50/month)
- **Total:** ~$10-50/month

### Production (Azure)
- ✅ Congress.gov API: FREE
- Azure App Service: ~$50-100/month
- Azure Database for PostgreSQL: ~$50-100/month
- Azure OpenAI: ~$50-100/month
- **Total:** ~$150-300/month

---

## Verification

After setting up your `.env` file, verify it works:

1. **Start the API server:**
   ```bash
   npm run api
   ```

2. **Check health endpoint:**
   ```bash
   curl http://localhost:3000/health
   ```

3. **Test database connection:**
   ```bash
   npx prisma migrate dev
   ```

4. **Test Congress.gov API** (once you implement the endpoint):
   ```bash
   curl http://localhost:3000/api/representatives/CA
   ```

---

## Security Best Practices

✅ **DO:**
- Keep `.env` in `.gitignore` (already configured)
- Use different API keys for development and production
- Rotate API keys periodically
- Use Azure Key Vault in production

❌ **DON'T:**
- Commit `.env` to git
- Share API keys in Slack/Discord/email
- Use production keys in development
- Hardcode secrets in code

---

## Troubleshooting

### "CONGRESS_API_KEY not set"
- Check that `.env` file exists in root directory
- Verify the key is copied correctly (no extra spaces)
- Restart the API server after changing `.env`

### Database connection errors
- Check PostgreSQL is running: `psql -U postgres`
- Verify DATABASE_URL format matches the template
- Make sure `trackamerica` database exists

### Azure OpenAI errors
- Verify endpoint URL ends with `/`
- Check deployment names match exactly
- Ensure models are deployed in Azure OpenAI Studio

### Node.js version errors
- Check your Node.js version: `node --version`
- Must be v22.0.0 or higher
- Install/upgrade: `nvm install 22 && nvm use 22` (or download from nodejs.org)
- After upgrading, run `npm install` again

---

## Next Steps

1. **Install Node.js 22 LTS** (if not already installed)
2. Get Congress.gov API key (takes 5 minutes)
3. Install PostgreSQL locally (takes 15 minutes)
4. Create Azure OpenAI resource (takes 10 minutes)
5. Fill in `.env` file
6. Start building! 🚀

For more help, see:
- Node.js downloads: https://nodejs.org/
- Congress.gov API docs: https://api.congress.gov/
- Azure OpenAI docs: https://learn.microsoft.com/azure/ai-services/openai/
- PostgreSQL docs: https://www.postgresql.org/docs/
