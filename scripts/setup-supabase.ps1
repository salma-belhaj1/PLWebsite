<#
PowerShell helper to apply migration and run the seeding script.
Usage:
  $Env:SUPABASE_SERVICE_ROLE_KEY = 'eyJ...'
  $Env:SUPABASE_URL = 'https://<ref>.supabase.co'
  pwsh ./scripts/setup-supabase.ps1
#>

if (-not $Env:SUPABASE_URL) {
  Write-Error "Set SUPABASE_URL environment variable before running this script. Example: https://idivzmkyhpfrudgsqpyr.supabase.co"
  exit 1
}

if (-not $Env:SUPABASE_SERVICE_ROLE_KEY) {
  Write-Error "Set SUPABASE_SERVICE_ROLE_KEY environment variable before running this script. Keep it secret."
  exit 1
}

Write-Host "Applying migration: supabase/migrations/20260618_create_ecommerce_core.sql"
supabase db query supabase/migrations/20260618_create_ecommerce_core.sql
if ($LASTEXITCODE -ne 0) { Write-Error "supabase db query failed"; exit 1 }

Write-Host "Applying migration: supabase/migrations/20260623_create_other_expenses.sql"
supabase db query supabase/migrations/20260623_create_other_expenses.sql
if ($LASTEXITCODE -ne 0) { Write-Error "supabase db query failed (other_expenses)"; exit 1 }

Write-Host "Running Node seeding script (create admin + demo data)"
node scripts/seed-db.js
if ($LASTEXITCODE -ne 0) { Write-Error "Seeding script failed"; exit 1 }

Write-Host "Done. Verify in Supabase dashboard or run the verification queries provided in the README." 
