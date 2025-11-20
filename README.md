# Service Dashboard (Cloudflare Pages + Worker + D1)

This project is ready to deploy on Cloudflare Pages with Functions (Workers), D1, and KV.

## Quick deploy summary
1. Create Pages project and upload this repo.
2. Add D1 database and run `d1/migrations.sql`.
3. Create KV namespace `OTP_KV`.
4. In Pages project settings -> Functions -> Bind DB and OTP_KV and set JWT_SECRET.
5. Redeploy Pages.

API endpoints are under `/api/*`.

Customer portal at `/track`.
