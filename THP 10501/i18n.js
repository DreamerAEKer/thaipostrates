const translations = {
    th: {
        title: "ตรวจสอบค่าบริการไปรษณีย์ไทย",
        tabDomestic: "ในประเทศ",
        tabInternational: "ระหว่างประเทศ",
        labelWeight: "น้ำหนัก (กรัม)",
        phWeight: "เช่น 1000 สำหรับ 1 กก.",
        labelCountry: "ประเทศปลายทาง",
        optCountrySelect: "เลือกประเทศปลายทาง...",
        btnCalculate: "คำนวณค่าส่ง",
        "tabEMSJumbo": "EMS จัมโบ้",
        "headerAvailableServices": "บริการที่รองรับ",
        "labelServiceType": "บริการ",
        "labelOrigin": "ต้นทาง",
        "labelDest": "ปลายทาง",
        "labelVolumetric": "น้ำหนักปริมาตร (กก.)",
        "labelDimensions": "ขนาด (กว้าง x ยาว x สูง) ซม.",
        "labelZipcode": "รหัสปณ. (Zip)",
        "estimatedRates": "ราคาโดยประมาณ",
        "liveUnavailable": "ระบบดึงราคาขัดข้อง",
        "noServicesFound": "ไม่พบรูปแบบการจัดส่งที่รองรับ",
        "availableServices": "บริการที่รองรับ",

        // Services
        serviceEMS: "EMS ไปรษณีย์ด่วนพิเศษ",
        serviceEco: "eCo-Post (ประหยัด)",
        serviceReg: "ลงทะเบียน (Registered)",
        serviceParcel: "พัสดุ (Parcel Post)",
        serviceLetter: "จดหมาย (Letter)",
        servicePrinted: "ของตีพิมพ์ (Printed Matter)",

        // Options / Add-ons
        optAR: "ใบตอบรับ (AR)",
        optARTrack: "AR Tracking",
        linkEMSJumbo: "EMS ขนาดใหญ่",

        // Tooltips (HTML allowed)
        tooltipEMS: "น้ำหนัก: 30kg<br>ขนาดปกติ: ก+ย+ส ≤ 120ซม. (ด้านยาว ≤ 60ซม.)<br>ขนาดใหญ่: ก+ย+ส ≤ 240ซม.",
        tooltipEco: "น้ำหนักสูงสุด: 10kg<br>เหมาะสำหรับกล่อง<br>เช็คสถานะได้",
        tooltipRegBox: "น้ำหนักสูงสุด: 2kg<br>เหมาะสำหรับของชิ้นเล็ก",
        tooltipRegDoc: "น้ำหนักสูงสุด: 2kg<br>ขนาด: < 90ซม. (รวม)<br>เอกสาร/กระดาษ เท่านั้น",
        tooltipParcel: "น้ำหนัก: 20kg<br>ขนาด: ด้านยาว ≤ 1,500มม.<br>ยาว+รอบรูป ≤ 3,000มม.<br>ต่ำสุด: 90x140 มม.",
        tooltipLetter: "พิกัดน้ำหนัก: 2kg<br>แบบซอง: ก+ย+ส ไม่เกิน 600มม.<br>แบบหีบห่อ: ก+ย+ส เกิน 600มม.",
        tooltipPrinted: "น้ำหนัก: 2kg (หนังสือ 5kg)<br>ขนาด: ก+ย+ส ≤ 900มม. (ด้านยาว ≤ 600มม.)<br>ม้วน: ย+2ศก. ≤ 1,040มม. (ยาว ≤ 900มม.)<br>ต่ำสุด: 90x140 มม.",

        // Modals
        modalInsuranceTitle: "ประกันภัย EMS (เพิ่มเติม)",
        labelDeclaredValue: "มูลค่าสิ่งของ (สูงสุด 50,000 บาท)",
        labelBaseShipping: "ค่าส่งพื้นฐาน:",
        labelInsuranceFee: "ค่าประกัน:",
        labelTotal: "รวมทั้งหมด:",

        modalDimTitle: "ตรวจสอบ EMS ขนาดใหญ่",
        labelDim: "ขนาด (ซม.)",
        phWidth: "กว้าง",
        phLength: "ยาว",
        phHeight: "สูง",
        msgDimExceed: "ขนาดเกินกำหนด 240 ซม.!",
        msgNormalSize: "ขนาดปกติ",
        msgLargeSize: "พัสดุขนาดใหญ่ (คิดน้ำหนักตามปริมาตร)",
        btnUseVolumetric: "ใช้น้ำหนักตามปริมาตร",

        // Jumbo Results
        jumboRateTitle: "สรุปอัตราค่าบริการ EMS Jumbo",
        jumboRoute: "เส้นทาง",
        jumboChargeWeight: "น้ำหนักคำนวณ",
        jumboStep: "พิกัด",
        jumboActualWeight: "น้ำหนักจริง",
        jumboVolumetricWeight: "น้ำหนักปริมาตร",
        jumboUsed: "ที่ใช้",
        jumboBasePrice: "ค่าบริการพื้นฐาน",
        jumboDimSurcharge: "ส่วนเพิ่มขนาด",
        jumboMaxSide: "ด้านยาวสุด",
        jumboInsuranceFee: "ค่าประกันภัย",
        jumboValue: "ทุนประกัน",
        jumboRemoteSurcharge: "ค่าพื้นที่ห่างไกล/เกาะ",
        jumboPickupFee: "ค่ารับสิ่งของ",
        jumboDeliveryFee: "ค่านำจ่าย",
        jumboTotal: "ยอดรวมสุทธิ",

        // Jumbo UI (Remaining)
        optNoItem: "ไม่ได้เลือกสินค้า",
        optPalletGeneral: "บุคคลทั่วไป",
        optPalletStudent: "นักเรียน/นักศึกษา",
        optPalletOTOP: "OTOP/e-Commerce",
        msgZipMismatch: "รหัสไปรษณีย์ไม่ตรงกับจังหวัด",
        labelRemoteArea: "พื้นที่นําจ่ายเกาะ / ห่างไกล (+100฿)",
        labelInsurance: "ประกันภัยเพิ่ม",
        phDeclaredValue: "ระบุมูลค่าสิ่งของ (บาท)",
        msgInsuranceLimit: "*คุ้มครองสูงสุด 200,000 บาท (เริ่มต้น 15 บาท)",
        headerAddOns: "บริการเสริม",
        chkPickup: "รับสิ่งของ ณ ที่อยู่ผู้ฝาก",
        chkDelivery: "นำจ่าย ณ ที่อยู่ผู้รับ",

        // Calculation Mode
        labelCalcMode: "รูปแบบการคำนวณ (Calculation Mode)",
        radioWeightMode: "คำนวณตามน้ำหนัก/ขนาด",
        radioItemMode: "สินค้าสำเร็จรูป",
        radioPalletMode: "เหมาจ่าย Roll Pallet",

        // Settings
        headerSettings: "ตั้งค่า",
        labelDefaultLang: "ภาษาเริ่มต้น",
        btnAdminPanel: "จัดการเรทราคา (Admin)",

        // Placeholders / Options
        optProvincesLoading: "กำลังโหลด...",
        optSelectProvince: "เลือกจังหวัด...",
        phWidth: "กว้าง (W)",
        phLength: "ยาว (L)",
        phHeight: "สูง (H)",

        // Domestic / International UI
        labelCheckRemote: "ตรวจสอบพื้นที่ท่องเที่ยว พื้นที่ห่างไกล และพื้นที่เกาะ (Check Tourist, Remote & Island Areas)",
        btnProhibited: "สิ่งของต้องห้ามฝากส่ง",
        labelPartialAreaPrefix: "พื้นที่ "
    },
    en: {
        title: "Thai Post Rates",
        tabDomestic: "Domestic",
        tabInternational: "International",
        labelWeight: "Weight (grams)",
        phWeight: "e.g. 1000 for 1kg",
        labelCountry: "Destination Country",
        optCountrySelect: "Select Destination...",
        btnCalculate: "Calculate Shipping",
        btnCheckSize: "Check Size",
        headerAvailableServices: "Available Services",
        "tabEMSJumbo": "EMS Jumbo",
        "labelServiceType": "Service Type",
        "labelOrigin": "Origin",
        "labelDest": "Destination",
        "labelVolumetric": "Volumetric Weight (kg)",
        "labelVolumetric": "Volumetric Weight (kg)",
        "labelDimensions": "Dimensions (WxLxH) cm",
        "labelZipcode": "Zip Code",
        "estimatedRates": "Estimated Rates",
        "liveUnavailable": "Live Rates Unavailable",
        "noServicesFound": "No supporting services found",
        "availableServices": "Available Services",

        // Services
        serviceEMS: "EMS (Domestic)",
        serviceEco: "eCo-Post",
        serviceReg: "Registered",
        serviceParcel: "Parcel Post",
        serviceLetter: "Letter",
        servicePrinted: "Printed Matter",

        // Options
        optAR: "Advice of Receipt (AR)",
        optARTrack: "AR Tracking",
        linkEMSJumbo: "EMS Jumbo Check",

        // Tooltips
        tooltipEMS: "Max Weight: 30kg<br>Normal Size: Sum ≤ 120cm (Max Side ≤ 60cm)<br>Large Size: Sum ≤ 240cm",
        tooltipEco: "Max Weight: 10kg<br>Suitable for boxes<br>Trackable status",
        tooltipRegBox: "Max Weight: 2kg<br>Suitable for small items",
        tooltipRegDoc: "Max Weight: 2kg<br>Sum Dimensions < 90cm<br>Document/Paper only",
        tooltipParcel: "Max Weight: 20kg<br>Max Length ≤ 1500mm<br>Length+Girth ≤ 3000mm",
        tooltipLetter: "Max Weight: 2kg<br>Envelope: Sum ≤ 600mm<br>Box: Sum > 600mm",
        tooltipPrinted: "Max Weight: 2kg (Books 5kg)<br>Sum ≤ 900mm (Max Side ≤ 600mm)",

        // Modals
        modalInsuranceTitle: "EMS Insurance Add-on",
        labelDeclaredValue: "Declared Value (Max 50,000 THB)",
        labelBaseShipping: "Base Shipping:",
        labelInsuranceFee: "Insurance Fee:",
        labelTotal: "Total:",

        modalDimTitle: "EMS Large Size Check",
        labelDim: "Dimensions (cm)",
        phWidth: "Width",
        phLength: "Length",
        phHeight: "Height",
        msgDimExceed: "Dimensions exceed 240cm limit!",
        msgNormalSize: "Normal Size",
        msgLargeSize: "Large Size (Volumetric Weight applies)",
        btnUseVolumetric: "Use Volumetric Weight",

        // Jumbo Results
        jumboRateTitle: "EMS Jumbo Rate Summary",
        jumboRoute: "Route",
        jumboChargeWeight: "Charge Weight",
        jumboStep: "Step",
        jumboActualWeight: "Actual Weight",
        jumboVolumetricWeight: "Volumetric Weight",
        jumboUsed: "Used",
        jumboBasePrice: "Base Price",
        jumboDimSurcharge: "Dim Surcharge",
        jumboMaxSide: "Max side",
        jumboInsuranceFee: "Insurance Fee",
        jumboValue: "Value",
        jumboRemoteSurcharge: "Remote Area Surcharge",
        jumboPickupFee: "Pickup Fee",
        jumboDeliveryFee: "Delivery Fee",
        jumboTotal: "Grand Total",

        // Jumbo UI (Remaining)
        optNoItem: "No Item Selected",
        optPalletGeneral: "General Public",
        optPalletStudent: "Student",
        optPalletOTOP: "OTOP/e-Commerce",
        msgZipMismatch: "Zip code mismatch",
        labelRemoteArea: "Island / Remote Area (+100 THB)",
        labelInsurance: "Declared Value for Insurance",
        phDeclaredValue: "Declared Value (THB)",
        msgInsuranceLimit: "*Max coverage 200,000 THB (Starts 15 THB)",
        headerAddOns: "Additional Services",
        chkPickup: "Pickup at Sender",
        chkDelivery: "Delivery to Receiver",

        // Calculation Mode
        labelCalcMode: "Calculation Mode",
        radioWeightMode: "Weight/Dimensions",
        radioItemMode: "Ready-made Item",
        radioPalletMode: "Roll Pallet",

        // Settings
        headerSettings: "Settings",
        labelDefaultLang: "Default Language",
        btnAdminPanel: "Manage Rates (Admin)",

        // Placeholders / Options
        optProvincesLoading: "Loading...",
        optSelectProvince: "Select Province...",
        phWidth: "Width (W)",
        phLength: "Length (L)",
        phHeight: "Height (H)",

        // Domestic / International UI
        labelCheckRemote: "Check Tourist, Remote & Island Areas",
        btnProhibited: "Prohibited Items",
        labelPartialAreaPrefix: "Area "
    }
};
