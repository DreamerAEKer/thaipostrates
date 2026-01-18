
const RateEngine = require('./rateEngine.js');
const d26 = require('./data2026.js');

// Mock Globals if RateEngine relies on them in Node environment (RateEngine.js handles require internally now, so this might be fine, but let's be safe)
// Actually RateEngine.js requires them if commonjs.

console.log("=== Verifying Domestic Logic 2026 ===");

function test(caseName, weight, origin, dest, originConf, destConf, expectedPrice, expectedRemote) {
    console.log(`\nTest Case: ${caseName}`);
    console.log(`Params: ${weight}g, ${origin} -> ${dest}, Confirmed[Orig:${originConf}, Dest:${destConf}]`);

    const results = RateEngine.calculateDomestic2026(weight, origin, dest, originConf, destConf);
    const ems = results.find(r => r.name.includes("EMS"));

    if (!ems) {
        console.error("FAIL: EMS service not returned");
        return;
    }

    const price = ems.price;
    const isRemote = ems.remote_applied;

    const priceMatch = price === expectedPrice;
    const remoteMatch = isRemote === expectedRemote;

    if (priceMatch && remoteMatch) {
        console.log(`PASS: Price ${price}, Remote ${isRemote}`);
    } else {
        console.error(`FAIL: Expected Price ${expectedPrice}, Remote ${expectedRemote}`);
        console.error(`GOT: Price ${price}, Remote ${isRemote}`);
        console.log(`Details: ${ems.details}`);
    }
}

// Data Check
// 1000g EMS General = 67, Remote = 87

// 1. General -> General (Bangkok -> Bangkok)
test("General to General", 1000, "10400", "10400", false, false, 67, false);

// 2. General -> Whole Remote (Bangkok -> Phuket 83000)
// 83000 is ID 18, isPartial false. Should be Remote.
test("General to Whole Remote", 1000, "10400", "83000", false, false, 87, true);

// 3. General -> Partial Remote (Bangkok -> Koh Larn 20150)
// 20150 is ID 2, isPartial true.

// 3a. Not Confirmed -> Should be General
test("General to Partial (Unconfirmed)", 1000, "10400", "20150", false, false, 67, false);

// 3b. Confirmed -> Should be Remote
test("General to Partial (Confirmed)", 1000, "10400", "20150", false, true, 87, true);

// 4. Same Remote Group (Phuket 83000 -> Phuket 83100)
// ID 18 -> ID 18. Should be Waived (General Price).
test("Same Remote Group", 1000, "83000", "83100", false, false, 67, false);

// 5. Different Remote Group (Phuket 83000 -> Koh Samui 84140)
// ID 18 -> ID 19. Should be Remote.
test("Different Remote Group", 1000, "83000", "84140", false, false, 87, true);

