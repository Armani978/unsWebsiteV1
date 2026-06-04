param(
  [string]$NodeVersion = "24.15.0",
  [switch]$SkipDevCheck
)

$ErrorActionPreference = "Stop"

function Add-PathIfExists($PathToAdd) {
  if ((Test-Path $PathToAdd) -and (($env:Path -split ";") -notcontains $PathToAdd)) {
    $env:Path = "$PathToAdd;$env:Path"
  }
}

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectRoot

Write-Host "Up n Smoke package installer" -ForegroundColor Cyan
Write-Host "Project: $projectRoot"

$nvmHome = $env:NVM_HOME
$nvmSymlink = $env:NVM_SYMLINK

if (-not $nvmHome) {
  $localNvm = Join-Path $env:LOCALAPPDATA "nvm"
  if (Test-Path $localNvm) {
    $nvmHome = $localNvm
    $env:NVM_HOME = $nvmHome
  }
}

if (-not $nvmSymlink) {
  if (Test-Path "C:\nvm4w\nodejs") {
    $nvmSymlink = "C:\nvm4w\nodejs"
    $env:NVM_SYMLINK = $nvmSymlink
  } elseif (Test-Path "C:\Program Files\nodejs") {
    $nvmSymlink = "C:\Program Files\nodejs"
  }
}

if ($nvmHome) {
  Add-PathIfExists $nvmHome
}
if ($nvmSymlink) {
  Add-PathIfExists $nvmSymlink
}

$nvmExe = if ($nvmHome) { Join-Path $nvmHome "nvm.exe" } else { $null }

if ($nvmExe -and (Test-Path $nvmExe)) {
  Write-Host "Using NVM from $nvmHome"
  & $nvmExe install $NodeVersion
  & $nvmExe use $NodeVersion
} else {
  Write-Host "NVM was not found. Continuing with node/npm on PATH." -ForegroundColor Yellow
}

Write-Host "Node version:"
node -v

Write-Host "npm version:"
npm -v

if (-not (Test-Path "package-lock.json")) {
  throw "package-lock.json is missing. Cannot run npm ci."
}

Write-Host "Installing packages from package-lock.json..."
npm ci

if (-not (Test-Path ".env.local") -and (Test-Path ".env.example")) {
  Copy-Item ".env.example" ".env.local"
  Write-Host "Created .env.local from .env.example. Add Clover secrets there when ready." -ForegroundColor Yellow
}

if (-not $SkipDevCheck) {
  Write-Host "Running TypeScript check..."
  node .\node_modules\typescript\bin\tsc --noEmit
}

Write-Host "Done. Start the app with: npm run dev" -ForegroundColor Green
