$assetsDir = "c:/Users/MrAEK/Desktop/THP 10501/assets"
$keepList = @(
    "rate_ems.png",
    "uploaded_image_0_1766950892467.jpg",
    "uploaded_image_1_1766950892467.jpg",
    "uploaded_image_2_1766950892467.jpg",
    "uploaded_image_3_1766950892467.jpg",
    "uploaded_image_4_1766950892467.jpg",
    "info_domestic.jpg",
    "info_domestic_delivery.jpg",
    "info_international.jpg",
    "rate_domestic_basic.jpg",
    "uploaded_image_1766821381063.png"
)

# Function to get file hash
function Get-FileHashMD5 {
    param([string]$FilePath)
    $hash = Get-FileHash -Path $FilePath -Algorithm MD5
    return $hash.Hash
}

$files = Get-ChildItem -Path $assetsDir -File
$hashMap = @{}

foreach ($file in $files) {
    if ($file.Extension -match "\.jpg|\.png") {
        $hash = Get-FileHashMD5 -FilePath $file.FullName
        if (-not $hashMap.ContainsKey($hash)) {
            $hashMap[$hash] = @()
        }
        $hashMap[$hash] += $file.Name
    }
}

foreach ($hash in $hashMap.Keys) {
    $fileNames = $hashMap[$hash]
    if ($fileNames.Count -gt 1) {
        Write-Host "Found duplicates for hash $hash : $fileNames"
        
        # Determine which one to keep
        $keepFile = $null
        
        # 1. Prefer one in the KeepList
        foreach ($name in $fileNames) {
            if ($keepList -contains $name) {
                # If we already have a keepFile, and this one is ALSO in KeepList, we must keep BOTH (do nothing for this pair)
                if ($keepFile) {
                    Write-Host "  Both $name and $keepFile are in KeepList. Keeping both."
                    $keepFile = "KEEP_ALL"
                    break
                }
                $keepFile = $name
            }
        }
        
        if ($keepFile -eq "KEEP_ALL") {
            continue
        }

        # 2. If none in KeepList, keep the one with shortest name (likely original)
        if (-not $keepFile) {
            $keepFile = $fileNames | Sort-Object Length | Select-Object -First 1
        }
        
        # Delete others
        foreach ($name in $fileNames) {
            if ($name -ne $keepFile) {
                Write-Host "  Deleting duplicate: $name (Keeping $keepFile)"
                Remove-Item -Path "$assetsDir/$name" -Force
            }
        }
    }
}
Write-Host "Cleanup complete."
