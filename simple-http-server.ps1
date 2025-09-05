$port = 8080
$url = "http://localhost:$port"

Write-Host "Starting server on $url" -ForegroundColor Green

# Start browser
Start-Process $url

# Simple HTTP server using .NET classes
Add-Type -AssemblyName System.Web

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("$url/")
$listener.Start()

Write-Host "Server running. Press Ctrl+C to stop." -ForegroundColor Yellow

try {
    while ($true) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $path = $request.Url.LocalPath
        if ($path -eq "/" -or $path -eq "") {
            $path = "/index.html"
        }
        
        $filePath = Join-Path $PSScriptRoot $path.TrimStart('/')
        
        if (Test-Path $filePath) {
            $content = Get-Content $filePath -Raw -Encoding UTF8
            $bytes = [System.Text.Encoding]::UTF8.GetBytes($content)
            
            $ext = [System.IO.Path]::GetExtension($filePath)
            switch ($ext) {
                ".html" { $response.ContentType = "text/html; charset=utf-8" }
                ".css" { $response.ContentType = "text/css; charset=utf-8" }
                ".js" { $response.ContentType = "application/javascript; charset=utf-8" }
                default { $response.ContentType = "text/plain; charset=utf-8" }
            }
            
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $errorBytes = [System.Text.Encoding]::UTF8.GetBytes("404 - Not Found")
            $response.ContentLength64 = $errorBytes.Length
            $response.OutputStream.Write($errorBytes, 0, $errorBytes.Length)
        }
        
        $response.Close()
    }
} finally {
    $listener.Stop()
}
