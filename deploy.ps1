param(
    [string]$RootPath = (Split-Path -Parent $MyInvocation.MyCommand.Path),
    [string]$NetlifyDeploysUrl = 'https://app.netlify.com/sites/famous-mochi-10a8f3/deploys',
    [switch]$NoOpen
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

Push-Location $RootPath
try {
    Write-Host "[1/4] Project root: $RootPath" -ForegroundColor Cyan

    # 1) Create deploy folder (images/docs included)
    Write-Host "[2/4] Creating deploy folder via make-deploy-folder.ps1 ..." -ForegroundColor Cyan
    .\make-deploy-folder.ps1 | Out-Host

    # 2) Detect newest deploy-YYYYMMDD-HHmm folder
    $deployDir = Get-ChildItem -Directory -Filter 'deploy-*' | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if (-not $deployDir) { throw "deploy-* folder not found." }
    Write-Host "Created: $($deployDir.FullName)" -ForegroundColor Green

    # 3) Create ZIP next to the folder
    Write-Host "[3/4] Creating ZIP ..." -ForegroundColor Cyan
    $zipPath = "$($deployDir.FullName).zip"
    if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
    Compress-Archive -Path (Join-Path $deployDir.FullName '*') -DestinationPath $zipPath
    Write-Host "ZIP: $zipPath" -ForegroundColor Green

    # 4) Open Explorer and Netlify Deploys page (unless suppressed)
    if (-not $NoOpen) {
        Write-Host "[4/4] Opening Explorer and Netlify Deploys page ..." -ForegroundColor Cyan
        Start-Process explorer.exe $deployDir.FullName
        if ($NetlifyDeploysUrl) { Start-Process $NetlifyDeploysUrl }
    }

    Write-Host "Done. Drag & drop the folder or ZIP into Netlify Deploys." -ForegroundColor Yellow
}
catch {
    Write-Error $_
    exit 1
}
finally {
    Pop-Location
}
