/**
 * Thai Post Rate Calculation Engine
 * Handles logic for Domestic, EMS, and Jumbo services.
 */

// If running in Node.js, require the data files
let _domesticRates, _standardRates, _zipCodes, _remarks;
let _jumboRates, _jumboZones, _jumboFixed;

if (typeof module !== 'undefined' && module.exports) {
    // Node.js Environment
    const dData = require('./domesticRemoteData.js');
    _domesticRates = dData.domesticRates2026;
    _standardRates = dData.domesticStandardRates;
    _zipCodes = dData.domesticRemoteZipCodes;
    _remarks = dData.domesticRemoteRemarks;
    // 2026 Data
    try {
        const d26 = require('./data2026.js');
        if (d26) {
            // merge or store separately? Let's assume we use _rates2026 globals
            global.rates2026 = d26.rates2026;
            global.remoteGroups2026 = d26.remoteGroups2026;
            global.getRemoteGroup2026 = d26.getRemoteGroup2026;
        }
    } catch (e) { }
    // For Jumbo, we might need another file if it's separated, but currently checking if provided.
    // Assuming emsJumboData.js is also updated or available.
    try {
        const jData = require('./emsJumboData.js');
        _jumboRates = jData.emsJumboRates;
        _jumboZones = jData.emsJumboZones;
        _jumboFixed = jData.emsJumboFixedRates;
        // ... map other jumbo exports
    } catch (e) {
        // Jumbo data might not be in a require-able format yet if we didn't update it to export
    }
} else {
    // Browser Environment (Global Variables)
    _domesticRates = typeof domesticRates2026 !== 'undefined' ? domesticRates2026 : {};
    _standardRates = typeof domesticStandardRates !== 'undefined' ? domesticStandardRates : {};
    _zipCodes = typeof domesticRemoteZipCodes !== 'undefined' ? domesticRemoteZipCodes : [];
    _remarks = typeof domesticRemoteRemarks !== 'undefined' ? domesticRemoteRemarks : {};
    // Jumbo Globals
    _jumboRates = typeof emsJumboRates !== 'undefined' ? emsJumboRates : {};
    _jumboZones = typeof emsJumboZones !== 'undefined' ? emsJumboZones : {};
}

const RateEngine = {

    /**
     * Check if a zip code is a Remote Area
     */
    isRemoteArea: function (zipCode) {
        if (!zipCode) return false;
        return _zipCodes.includes(zipCode.toString());
    },

    /**
     * Get Remote Area Remark
     */
    getRemoteRemark: function (zipCode) {
        if (!zipCode) return null;
        return _remarks[zipCode.toString()] || null;
    },

    /**
     * Calculate all Domestic Services
     * @param {number} weight - Weight in grams
     * @param {string} zipCode - Destination Zip Code
     * @returns {Array} List of service objects { name, price, type, remote }
     */
    calculateAllDomestic: function (weight, zipCode) {
        const result = [];
        const isRemote = this.isRemoteArea(zipCode);

        // 1. EMS
        const emsPrice = this.lookupTablePrice(_domesticRates.ems, weight, isRemote ? 'remote' : 'general');
        if (emsPrice) {
            result.push({
                name: 'EMS',
                price: emsPrice,
                remote_applied: isRemote,
                details: isRemote ? 'Remote Area Surcharge Included' : null
            });
        }

        // 2. eCo-Post
        const ecoPrice = this.lookupTablePrice(_domesticRates.eco, weight, isRemote ? 'remote' : 'general');
        if (ecoPrice) {
            result.push({
                name: 'eCo-Post',
                price: ecoPrice,
                remote_applied: isRemote,
                details: isRemote ? 'Remote Area Surcharge Included' : null
            });
        }

        // 3. Registered (Envelope)
        const regEnvPrice = this.lookupTablePrice(_standardRates.registered_envelope, weight, 'price');
        if (regEnvPrice) {
            result.push({ name: 'Registered (Envelope)', price: regEnvPrice });
        }

        // 4. Registered (Box)
        const regBoxPrice = this.lookupTablePrice(_standardRates.registered_box, weight, 'price');
        if (regBoxPrice) {
            result.push({ name: 'Registered (Box)', price: regBoxPrice });
        }

        // 5. Letter
        const letterPrice = this.lookupTablePrice(_standardRates.letter, weight, 'price');
        if (letterPrice) {
            result.push({ name: 'Letter', price: letterPrice });
        }

        // 6. Printed Matter
        const printPrice = this.calculatePrintedMatter(weight);
        if (printPrice) {
            result.push({ name: 'Printed Matter', price: printPrice });
        }

        // 7. Parcel Post
        const parcelPrice = this.calculateParcelPost(weight);
        if (parcelPrice) {
            result.push({ name: 'Parcel Post', price: parcelPrice });
        }

        return result;
    },

    /**
     * Calculate Domestic Services for 2026 (New Remote Area Logic)
     * @param {number} weight 
     * @param {string} originZip 
     * @param {string} destZip 
     * @param {boolean} originConfirmedRemote - User confirmed partial area check
     * @param {boolean} destConfirmedRemote - User confirmed partial area check
     */
    calculateDomestic2026: function (weight, originZip, destZip, originConfirmedRemote, destConfirmedRemote) {
        const result = [];

        // 1. Determine Logic (General vs Remote)
        let isRemote = false;
        let note = "";

        // Helper to resolve group ID based on zip + confirmation
        const resolveGroup = (zip, isConfirmed) => {
            const info = typeof getRemoteGroup2026 === 'function' ? getRemoteGroup2026(zip) : null;
            if (!info) return null;

            // info is now { id, isPartial, remark }
            if (info.isPartial) {
                // Return ID only if user confirmed they are in the specific remote area
                return isConfirmed ? info.id : null;
            } else {
                // Whole area - always remote
                return info.id;
            }
        };

        const destGroup = resolveGroup(destZip, destConfirmedRemote);

        if (destGroup) {
            // Destination IS effective Remote. Now check Origin to see if waived.
            const originGroup = resolveGroup(originZip, originConfirmedRemote);

            if (originGroup && originGroup === destGroup) {
                // Same Group -> Waive Surcharge
                isRemote = false;
                note = "Origin & Dest in same Remote Group (No Surcharge)";
            } else {
                // Different Group or Origin not remote -> Apply Surcharge
                isRemote = true;
                note = "Remote Area Surcharge Applied (+20 THB)";
            }
        } else {
            // Destination is NOT Remote (or is partial but not selected)
            isRemote = false;
            note = "General Area (No Surcharge)";
        }

        // Access 2026 Data
        // Access 2026 Data (Prioritize detailed domesticRates2026)
        const r26 = typeof domesticRates2026 !== 'undefined' ? domesticRates2026 : (typeof rates2026 !== 'undefined' ? rates2026 : { ems: [], eco: [] });

        // 1. EMS
        const emsPrice = this.lookupTablePrice(r26.ems, weight, isRemote ? 'remote' : 'general');
        if (emsPrice) {
            result.push({
                name: 'EMS (2026)',
                price: emsPrice,
                remote_applied: isRemote,
                details: note
            });
        }

        // 2. eCo-Post
        const ecoPrice = this.lookupTablePrice(r26.eco, weight, isRemote ? 'remote' : 'general');
        if (ecoPrice) {
            result.push({
                name: 'eCo-Post (2026)',
                price: ecoPrice,
                remote_applied: isRemote,
                details: note
            });
        }

        return result;
    },

    /**
     * Lookup price in step table
     */
    lookupTablePrice: function (table, weight, key) {
        if (!table) return null;
        const step = table.find(r => weight <= r.max);
        if (step) {
            // Handle null (unavailable)
            if (step[key] === null) return null;
            return step[key];
        }
        return null;
    },

    /**
     * Special Calc for Printed Matter
     */
    calculatePrintedMatter: function (weight) {
        if (weight <= 2000) {
            return this.lookupTablePrice(_standardRates.printed_matter, weight, 'price');
        } else if (weight <= 5000) {
            // 33 baht + 16 baht per extra kg (or part thereof) over 2000g
            // Example: 2001g -> 3000g = +1kg = 33+16 = 49
            const extraGrams = weight - 2000;
            const extraKg = Math.ceil(extraGrams / 1000);
            return 33 + (extraKg * 16);
        }
        return null; // Max 5kg
    },

    /**
     * Special Calc for Parcel Post
     */
    calculateParcelPost: function (weight) {
        if (weight <= 1000) return 25;
        if (weight > 20000) return null; // Max 20kg

        // 25 baht + 20 baht per extra kg (or part thereof)
        // 1001g -> 2kg = 25 + 20 = 45
        const extraGrams = weight - 1000;
        const extraKg = Math.ceil(extraGrams / 1000);
        return 25 + (extraKg * 20);
    }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RateEngine;
} else {
    window.RateEngine = RateEngine;
}
