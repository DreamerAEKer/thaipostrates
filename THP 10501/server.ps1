<#
.SYNOPSIS
    Robust PowerShell Web Server & API Proxy for Thailand Post Rate App
.DESCRIPTION
    Serves static files and proxies requests to Thailand Post API.
    Includes error handling to prevent crashes.
#>

$port = 8000
$root = $PSScriptRoot
$thpApiUrl = "https://www.thailandpost.co.th/php/webservice_nrs_cntry_id.php"

# Force TLS 1.2/1.3
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 -bor [Net.SecurityProtocolType]::Tls13

# Create HttpListener
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")

try {
    $listener.Start()
    Write-Host "Server started at http://localhost:$port/"
    Start-Process "http://localhost:$port/"
    Write-Host "Press Ctrl+C to stop..."
}
catch {
    Write-Host "Failed to start listener: $_" -ForegroundColor Red
    exit
}

# Session Cookie Container
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession

while ($listener.IsListening) {
    # Non-blocking check or just simple blocking GetContext
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $path = $request.Url.LocalPath
        $method = $request.HttpMethod
        
        Write-Host "[$([DateTime]::Now.ToString('HH:mm:ss'))] $method $path" -ForegroundColor Cyan

        # CORS Headers for all requests
        $response.AddHeader("Access-Control-Allow-Origin", "*")
        $response.AddHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        $response.AddHeader("Access-Control-Allow-Headers", "Content-Type")

        if ($method -eq "OPTIONS") {
            $response.StatusCode = 204
            $response.Close()
            continue
        }

        # API Proxy Route
        if ($path -eq "/api/rate" -and $method -eq "POST") {
            try {
                # Read body
                $reader = New-Object System.IO.StreamReader($request.InputStream)
                $body = $reader.ReadToEnd()
                
                Write-Host "  Proxying to Thailand Post..." -NoNewline
                
                # Forward request
                $thpResponse = Invoke-WebRequest -Uri $thpApiUrl `
                    -Method Post `
                    -Body $body `
                    -ContentType "application/x-www-form-urlencoded; charset=UTF-8" `
                    -WebSession $session `
                    -UserAgent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" `
                    -Headers @{
                    "Origin"           = "https://www.thailandpost.co.th"
                    "Referer"          = "https://www.thailandpost.co.th/un/rate_result"
                    "X-Requested-With" = "XMLHttpRequest"
                } -ErrorAction Stop

                Write-Host " Done." -ForegroundColor Green
                
                # Write response
                $response.ContentType = "application/json"
                $buffer = [System.Text.Encoding]::UTF8.GetBytes($thpResponse.Content)
                $response.ContentLength64 = $buffer.Length
                $response.OutputStream.Write($buffer, 0, $buffer.Length)
            }
            catch {
                Write-Host " ERROR: $_" -ForegroundColor Red
                $errMsg = $_.Exception.Message
                $serverError = [System.Text.Encoding]::UTF8.GetBytes("{`"error`":`"$errMsg`"}")
                $response.StatusCode = 500
                $response.OutputStream.Write($serverError, 0, $serverError.Length)
            }
        }
        # Static File Server
        else {
            if ($path -eq "/") { $path = "/index.html" }
            $filePath = Join-Path $root $path.TrimStart('/')
            
            if (Test-Path $filePath -PathType Leaf) {
                $content = [System.IO.File]::ReadAllBytes($filePath)
                
                switch ([System.IO.Path]::GetExtension($filePath)) {
                    ".html" { $response.ContentType = "text/html; charset=utf-8" }
                    ".css" { $response.ContentType = "text/css" }
                    ".js" { $response.ContentType = "application/javascript" }
                    default { $response.ContentType = "application/octet-stream" }
                }
                
                $response.ContentLength64 = $content.Length
                $response.OutputStream.Write($content, 0, $content.Length)
            }
            else {
                $response.StatusCode = 404
                Write-Host "  404 Not Found" -ForegroundColor Yellow
            }
        }
        
        $response.Close()
    }
    catch {
        Write-Host "Critical Error in request loop: $_" -ForegroundColor Red
        # Do not exit loop, just continue to next request
    }
}
