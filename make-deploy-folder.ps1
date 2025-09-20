param(
    [string]$RootPath = (Get-Location).Path,
    [string[]]$Files = @('index.html','guide.html','events.html','museum.html','downloads.html','contact.html','styles.css','script.js','netlify.toml'),
    [string]$ImagesDir = 'images',
    [string]$DocsDir = 'docs',
    [switch]$OpenExplorer
)

$ErrorActionPreference = 'Stop'

try {
    # Timestamp like 20250907-0911
    $ts = Get-Date -Format 'yyyyMMdd-HHmm'
    $deployName = "deploy-$ts"
    $deployPath = Join-Path $RootPath $deployName

    # Create deploy folder
    New-Item -ItemType Directory -Path $deployPath -Force | Out-Null

    # Copy core files
    foreach ($f in $Files) {
        $src = Join-Path $RootPath $f
        if (Test-Path $src) {
            Copy-Item $src -Destination $deployPath -Force
        } else {
            Write-Warning "Not found: $src"
        }
    }

    # Copy images folder recursively
    $imgSrc = Join-Path $RootPath $ImagesDir
    if (Test-Path $imgSrc) {
        $imgDst = Join-Path $deployPath $ImagesDir
        robocopy $imgSrc $imgDst /E /NFL /NDL /NJH /NJS | Out-Null
    } else {
        Write-Warning "Images directory not found: $imgSrc"
    }

    # Copy docs folder recursively (e.g., PDFs referenced by downloads.html)
    $docsSrc = Join-Path $RootPath $DocsDir
    if (Test-Path $docsSrc) {
        $docsDst = Join-Path $deployPath $DocsDir
        robocopy $docsSrc $docsDst /E /NFL /NDL /NJH /NJS | Out-Null
    } else {
        Write-Warning "Docs directory not found: $docsSrc"
    }

    Write-Host "Created: $deployPath" -ForegroundColor Green
    Get-ChildItem $deployPath | Select-Object Name, Length | Format-Table -AutoSize

    if ($OpenExplorer) {
        Start-Process explorer.exe $deployPath
    }
}
catch {
    Write-Error $_
    exit 1
}
