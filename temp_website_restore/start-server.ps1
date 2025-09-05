# Simple HTTP Server for Fumon-ji Website, with netlify.toml features
$port = 8081
$url = "http://localhost:$port"

Write-Host "Starting HTTP Server on port $port..." -ForegroundColor Green

# Create HTTP Listener
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("$url/")
$listener.Start()

Write-Host "Server running at: $url" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Cyan

# Open browser
Start-Process $url

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        # Decode URL path to handle non-ASCII characters correctly
        $localPath = [System.Net.WebUtility]::UrlDecode($request.Url.AbsolutePath)

        # --- Start of netlify.toml implementation ---

        # 1. Handle Redirects
        if ($localPath -eq "/home") {
            Write-Host "Redirecting /home to /" -ForegroundColor Magenta
            $response.RedirectLocation = "/"
            $response.StatusCode = 301 # Permanent Redirect
            $response.Close()
            continue # Skip to the next request
        }

        # 2. Add Headers
        $response.AddHeader("X-Frame-Options", "DENY")
        $response.AddHeader("X-XSS-Protection", "1; mode=block")
        $response.AddHeader("X-Content-Type-Options", "nosniff")
        $response.AddHeader("Referrer-Policy", "strict-origin-when-cross-origin")

        # --- End of netlify.toml implementation ---
        
        # Get requested file path
        if ($localPath -eq "/" -or $localPath -eq "") {
            $localPath = "/index.html"
        }
        
        # Construct a safe file path
        $relative_path = $localPath.TrimStart('/')
        $filePath = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($PSScriptRoot, $relative_path))
        
        Write-Host "Request: $($request.Url.LocalPath) -> $filePath" -ForegroundColor Gray
        
        if (Test-Path $filePath) {
            # Set content type and cache headers based on file extension
            $extension = [System.IO.Path]::GetExtension($filePath).ToLower()
            $contentType = switch ($extension) {
                ".html" { "text/html; charset=utf-8" }
                ".css"  { "text/css; charset=utf-8" }
                ".js"   { "application/javascript; charset=utf-8" }
                ".png"  { "image/png" }
                ".jpg"  { "image/jpeg" }
                ".jpeg" { "image/jpeg" }
                ".gif"  { "image/gif" }
                ".svg"  { "image/svg+xml" }
                default { "text/plain; charset=utf-8" }
            }
            
            if ($extension -in @(".css", ".js", ".jpg", ".png")) {
                $response.AddHeader("Cache-Control", "public, max-age=31536000")
            }

            $response.ContentType = $contentType
            
            # Read and serve file
            if ($extension -in @(".png", ".jpg", ".jpeg", ".gif")) {
                $content = [System.IO.File]::ReadAllBytes($filePath)
            } else {
                $content = [System.Text.Encoding]::UTF8.GetBytes((Get-Content $filePath -Raw -Encoding UTF8))
            }
            
            $response.ContentLength64 = $content.Length
            $response.OutputStream.Write($content, 0, $content.Length)
            $response.StatusCode = 200
        } else {
            # File not found
            $response.StatusCode = 404
            $notFoundContent = [System.Text.Encoding]::UTF8.GetBytes("404 - File Not Found")
            $response.ContentLength64 = $notFoundContent.Length
            $response.OutputStream.Write($notFoundContent, 0, $notFoundContent.Length)
        }
        
        $response.Close()
    }
} catch {
    Write-Host "Server stopped: $($_.Exception.Message)" -ForegroundColor Red
} finally {
    if ($listener -ne $null -and $listener.IsListening) {
        Write-Host "Stopping server..."
        $listener.Stop()
        $listener.Close()
    }
}

# Keep the script running until manually stopped
while ($true) {
    Start-Sleep -Seconds 1
}
