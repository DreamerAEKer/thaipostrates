
// --- EMS JUMBO LOGIC ---

function initJumbo() {
    const originSel = document.getElementById('jumboOrigin');
    const destSel = document.getElementById('jumboDest');

    if (!originSel || !destSel) return;

    // Clear loading
    originSel.innerHTML = '<option value="" disabled selected>เลือกต้นทาง...</option>';
    destSel.innerHTML = '<option value="" disabled selected>เลือกปลายทาง...</option>';

    // Get Provinces (Sorted)
    // Keys of emsJumboZones or emsJumboProvinceTH
    // Use emsJumboProvinceTH for Thai display
    if (typeof emsJumboProvinceTH === 'undefined') return;

    const provinces = Object.keys(emsJumboProvinceTH).sort((a, b) => {
        return emsJumboProvinceTH[a].localeCompare(emsJumboProvinceTH[b]);
    });

    provinces.forEach(engName => {
        const thName = emsJumboProvinceTH[engName];
        const val = engName; // Use English as value (matches Zone logic)
        const text = `${thName} (${engName})`;

        // Origin
        const opt1 = document.createElement('option');
        opt1.value = val;
        opt1.textContent = text;
        if (engName === 'Bangkok') opt1.selected = true; // Default Bangkok
        originSel.appendChild(opt1);

        // Dest
        const opt2 = document.createElement('option');
        opt2.value = val;
        opt2.textContent = text;
        destSel.appendChild(opt2);
    });

    // Listener for Dest Change to re-validate Zip
    destSel.addEventListener('change', checkJumboZipMatch);
}

function checkJumboZipMatch() {
    const zipInput = document.getElementById('jumboZipcode');
    const destSel = document.getElementById('jumboDest');
    const warning = document.getElementById('jumboZipWarning');

    if (!zipInput || !destSel || !warning) return;

    const zip = zipInput.value;
    const destProv = destSel.value; // English Name

    if (zip.length < 2 || !destProv) {
        warning.style.display = 'none';
        return;
    }

    // Check Prefix
    const prefix = zip.substring(0, 2);
    // 2-digit mapping
    if (typeof emsJumboZipMap !== 'undefined') {
        const mappedProv = emsJumboZipMap[prefix];

        // If mapped province exists AND implies mismatch
        // Note: emsJumboZipMap values are English names
        if (mappedProv && mappedProv !== destProv) {
            // Exceptions: Some provinces might share prefixes in reality or data incomplete?
            // But strict check requested: "Warn that code matches province X but selected Y"
            const thMapped = emsJumboProvinceTH[mappedProv] || mappedProv;
            const thDest = emsJumboProvinceTH[destProv] || destProv;

            warning.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> รหัสปณ. (Zip) ${prefix}xx คือลจ.${thMapped} <br> ไม่ตรงกับ ${thDest}`;
            warning.style.display = 'block';
        } else {
            warning.style.display = 'none';
        }
    }
}
