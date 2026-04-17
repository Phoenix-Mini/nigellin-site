# DEPLOYMENT — nigellin.com

This document defines the fastest and lowest-risk path to publish the Nigel Life Archive.

## Recommendation (Primary)
Use Vercel hosting + keep domain registrar at Network Solutions.

Important:
- You do NOT need to buy Network Solutions hosting for this setup.
- Keep nameservers at Network Solutions and only add/update DNS records.

## Why this path
- Next.js native hosting support
- Fast deploy + rollback
- Low operational overhead
- Domain can stay where it is (Network Solutions)

## Prerequisites
- Repository accessible from GitHub/Git provider (or Vercel CLI manual deploy)
- Domain already registered: `nigellin.com` (confirmed)
- Site builds locally (`pnpm build`) (confirmed)

## Step-by-step

### 1) Create Vercel project
1. Sign in to Vercel.
2. Import this project (`projects/nigellin.com/site`).
3. Framework should auto-detect as Next.js.
4. Build command: `pnpm build`
5. Install command: `pnpm install`
6. Output: default (Next.js)

### 2) Set environment variables (if needed)
This site reads static snapshot JSON at runtime, so no Google tokens are required in production serving.
Only needed for scheduled snapshot refresh jobs (optional future enhancement).

### 3) Attach custom domain in Vercel
1. In Vercel project -> Settings -> Domains
2. Add:
   - `nigellin.com`
   - `www.nigellin.com`
3. Vercel will show required DNS records.

### 4) Configure DNS in Network Solutions
At Network Solutions DNS zone, add/update records to match Vercel instructions:

Typical pattern:
- A record
  - Host: `@`
  - Value: `76.76.21.21`
- CNAME record
  - Host: `www`
  - Value: `cname.vercel-dns.com`

Notes:
- Keep nameservers as-is (Network Solutions default).
- Remove conflicting old A/CNAME records for `@` / `www`.
- DNS propagation usually 5 min to 24h.

### 5) Verify
1. Vercel domain status turns to Valid/Configured.
2. Open:
   - https://nigellin.com
   - https://www.nigellin.com
3. Confirm hero image + timeline load correctly.

### 6) Post-deploy checks
- Run Lighthouse basic pass (performance + accessibility)
- Verify mobile layout on iPhone/Android widths
- Confirm no private entries are shown

## Rollback
If a bad deploy occurs:
1. Vercel -> Deployments
2. Promote previous successful deployment
3. Re-open domain URLs and verify

## Optional future automation
Current production serves from committed snapshot JSON.
If daily refresh is required later:
- Add GitHub Action cron:
  - run `pnpm snapshot`
  - commit updated `public/data/nigel-archive.json`
  - trigger Vercel redeploy

## Decision checkpoint for Charles
When Nova says "go live", execute:
1) Create Vercel project
2) Add domain in Vercel
3) Update DNS records in Network Solutions
No Network Solutions hosting purchase is required for this deployment model.
