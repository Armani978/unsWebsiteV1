$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "Up N Smoke Clover Sandbox Setup" -ForegroundColor Green
Write-Host "Enter values locally. Do not paste Clover secrets into chat." -ForegroundColor Yellow
Write-Host ""

$merchantId = Read-Host "Sandbox merchant ID"
if ([string]::IsNullOrWhiteSpace($merchantId)) {
  throw "Merchant ID is required."
}

$secureToken = Read-Host "Sandbox API token" -AsSecureString
$tokenPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureToken)

try {
  $accessToken = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($tokenPointer)
} finally {
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($tokenPointer)
}

if ([string]::IsNullOrWhiteSpace($accessToken)) {
  throw "API token is required."
}

$environment = @"
CLOVER_ENV=sandbox
CLOVER_MERCHANT_ID=$($merchantId.Trim())
CLOVER_ACCESS_TOKEN=$($accessToken.Trim())
CLOVER_ALLOW_WRITES=false
CLOVER_APP_ID=
CLOVER_APP_SECRET=
CLOVER_APP_URL=http://localhost:3000
# Optional override for non-US regions or custom test hosts.
# CLOVER_API_BASE_URL=https://apisandbox.dev.clover.com
"@

Set-Content -LiteralPath ".env.local" -Value $environment -Encoding utf8

Write-Host ""
Write-Host "Saved .env.local. Restart the Next.js dev server before testing Clover." -ForegroundColor Green
Write-Host "Then open: http://localhost:3000/api/clover/status" -ForegroundColor Cyan
Write-Host ""
Read-Host "Press Enter to close"
