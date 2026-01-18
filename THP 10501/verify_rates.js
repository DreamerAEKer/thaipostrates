/**
 * Verify Rate Logic (Test Suite)
 * Run with: node verify_rates.js
 */

const RateEngine = require('./rateEngine.js');

let passed = 0;
let failed = 0;

function assertRate(name, weight, zip, expectedService, expectedPrice) {
    const results = RateEngine.calculateAllDomestic(weight, zip);
    const service = results.find(r => r.name === expectedService);

    // Allow slight float tolerance or string matching
    let isMatch = false;
    if (service) {
        if (typeof expectedPrice === 'number') {
            isMatch = Math.abs(parseFloat(service.price) - expectedPrice) < 0.1;
        } else {
            isMatch = service.price === expectedPrice;
        }
    }

    if (isMatch) {
        // console.log(`[PASS] ${name}: ${expectedService} @ ${weight}g = ${service.price}`);
        passed++;
    } else {
        console.error(`[FAIL] ${name}: ${expectedService} @ ${weight}g`);
        console.error(`   Expected: ${expectedPrice}`);
        console.error(`   Actual:   ${service ? service.price : 'Service Not Found'}`);
        failed++;
    }
}

console.log("=== Starting Verification ===");

// 1. EMS (2026 General)
assertRate("EMS 20g", 20, "", "EMS", 32);
assertRate("EMS 1kg", 1000, "", "EMS", 67);
assertRate("EMS 2kg", 2000, "", "EMS", 97);
assertRate("EMS 10kg", 10000, "", "EMS", 220);

// 2. EMS (Remote Area) - Koh Samui (84140)
// 20g Remote: 32 + 20? No table shows 20g -> 52
assertRate("EMS Remote 20g", 20, "84140", "EMS", 52);
// 1kg Remote: 67 -> 87 (+20)
assertRate("EMS Remote 1kg", 1000, "84140", "EMS", 87);

// 3. eCo-Post
assertRate("Eco 20g", 20, "", "eCo-Post", 20);
assertRate("Eco 1kg", 1000, "", "eCo-Post", 40);

// 4. Registered Envelope
assertRate("Reg Env 10g", 10, "", "Registered (Envelope)", 18);
assertRate("Reg Env 2kg", 2000, "", "Registered (Envelope)", 75);

// 5. Registered Box
assertRate("Reg Box 20g", 20, "", "Registered (Box)", null); // Unavailable
assertRate("Reg Box 21g", 21, "", "Registered (Box)", 49); // >20
assertRate("Reg Box 1kg", 1000, "", "Registered (Box)", 60);

// 6. Letter
assertRate("Letter 10g", 10, "", "Letter", 5);

// 7. Printed Matter
assertRate("Printed 50g", 50, "", "Printed Matter", 4);
assertRate("Printed 3kg", 3000, "", "Printed Matter", 49); // 33 + 16 (1 extra kg: 2001-3000)

// 8. Parcel Post
assertRate("Parcel 1kg", 1000, "", "Parcel Post", 25);
assertRate("Parcel 2kg", 2000, "", "Parcel Post", 45); // 25 + 20 (1 extra kg)

console.log("===========================");
console.log(`Tests Completed: ${passed + failed}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);

if (failed === 0) {
    console.log("SUCCESS: All logic verified.");
} else {
    console.log("FAILURE: Some tests failed.");
    process.exit(1);
}
