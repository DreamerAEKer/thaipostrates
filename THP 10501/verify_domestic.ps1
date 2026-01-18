
$domesticRemoteZipCodes = @(
    "20120", "20150", "21160", "23000", "23120", "23170", "50250", "50310", "50350",
    "55130", "55220", "57170", "57180", "57260", "57310", "57340", "58000", "58110",
    "58120", "58130", "58140", "58150", "63150", "63170", "71180", "71240", "81130",
    "81150", "81210", "82000", "82160", "83000", "83100", "83110", "83120", "83130",
    "83150", "84140", "84310", "84320", "84330", "84220", "84280", "84360", "85000",
    "91000", "91110", "92110", "92120", "94000", "94110", "94120", "94130", "94140",
    "94150", "94160", "94170", "94180", "94190", "94220", "94230", "95000", "95110",
    "95120", "95130", "95140", "95150", "95160", "95170", "96000", "96110", "96120",
    "96130", "96140", "96150", "96160", "96170", "96180", "96190", "96210", "96220"
)

$emsRates = @(
    @{max = 20; gen = 32; rem = 52 },
    @{max = 100; gen = 37; rem = 57 },
    @{max = 250; gen = 42; rem = 62 },
    @{max = 500; gen = 52; rem = 72 },
    @{max = 1000; gen = 67; rem = 87 },
    @{max = 1500; gen = 82; rem = 102 },
    @{max = 2000; gen = 97; rem = 117 }
)

function Calculate-Rate ($weight, $zip) {
    Write-Host "Calculating for Weight: $weight g, Zip: $zip"
    
    $isRemote = $domesticRemoteZipCodes -contains $zip
    Write-Host "  Is Remote: $isRemote"
    
    $price = 0
    foreach ($step in $emsRates) {
        if ($weight -le $step.max) {
            $price = if ($isRemote) { $step.rem } else { $step.gen }
            break
        }
    }
    
    Write-Host "  EMS Price: $price THB"
    Write-Host "-----------------------------"
}

Calculate-Rate -weight 1000 -zip "83000" # Phuket
Calculate-Rate -weight 1000 -zip "10400" # Bangkok
