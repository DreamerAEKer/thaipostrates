// Domestic Remote Area Data (Effective 1 Jan 2026)
// Source: User provided images of 85 Remote/Island Areas
// Pricing distinguishes between General Area and Remote/Island Area

const domesticRemoteZipCodes = [
    // 1. Chon Buri
    "20120", "20150", "21160",
    // 4. Trat
    "23000", "23120", "23170",
    // 7. Chiang Mai
    "50250", "50310", "50350",
    // 10. Nan
    "55130", "55220",
    // 12. Chiang Rai
    "57170", "57180", "57260", "57310", "57340",
    // 17. Mae Hong Son
    "58000", "58110", "58120", "58130", "58140", "58150",
    // 23. Tak
    "63150", "63170",
    // 25. Kanchanaburi
    "71180", "71240",
    // 27. Krabi
    "81130", "81150", "81210",
    // 30. Phang Nga
    "82000", "82160",
    // 32. Phuket (Whole Province)
    "83000", "83100", "83110", "83120", "83130", "83150",
    // 38. Surat Thani
    "84140", "84310", "84320", "84330", "84220", "84280", "84360",
    // 46. Ranong
    "85000",
    // 47. Satun
    "91000", "91110",
    // 51. Trang
    "92110", "92120",
    // 54. Pattani
    "94000", "94110", "94120", "94130", "94140", "94150", "94160", "94170", "94180", "94190", "94220", "94230",
    // 66. Yala
    "95000", "95110", "95120", "95130", "95140", "95150", "95160", "95170",
    // 74. Narathiwat
    "96000", "96110", "96120", "96130", "96140", "96150", "96160", "96170", "96180", "96190", "96210", "96220"
];

// Remarks for specific areas (e.g., Only specific islands)
const domesticRemoteRemarks = {
    // 1. Chon Buri
    "20120": "เกาะสีชัง (Koh Sichang)",
    "20150": "เฉพาะเกาะล้าน (Koh Larn Only)",
    "21160": "เฉพาะเกาะเสม็ด (Koh Samet Only)",
    // 4. Trat
    "23000": "เฉพาะเกาะกูด (Koh Kud Only)",
    "23120": "เฉพาะเกาะหมาก (Koh Mak Only)",
    "23170": "เกาะช้าง (Koh Chang)",
    // 7. Chiang Mai
    "50250": "สะเมิง (Samoeng)",
    "50310": "อมก๋อย (Omkoi)",
    "50350": "เวียงแหง (Wiang Haeng)",
    // 10. Nan
    "55130": "ทุ่งช้าง (Thung Chang)",
    "55220": "บ่อเกลือ (Bo Kluea)",
    // 12. Chiang Rai
    "57170": "เวียงป่าเป้า (Wiang Pa Pao)",
    "57180": "แม่สรวย (Mae Suai)",
    "57260": "แม่เจดีย์ (Mae Chedi)",
    "57310": "เวียงแก่น (Wiang Kaen)",
    "57340": "ขุนตาล (Khun Tan)",
    // 17. Mae Hong Son
    "58000": "แม่ฮ่องสอน (Mae Hong Son)",
    "58110": "แม่สะเรียง (Mae Sariang)",
    "58120": "แม่ลาน้อย (Mae La Noi)",
    "58130": "ปาย (Pai)",
    "58140": "ขุนยวม (Khun Yuam)",
    "58150": "ปางมะผ้า (Pang Mapha)",
    // 23. Tak
    "63150": "ท่าสองยาง (Tha Song Yang)",
    "63170": "อุ้มผาง (Umphang)",
    // 25. Kanchanaburi
    "71180": "ทองผาภูมิ (Thong Pha Phum)",
    "71240": "สังขละบุรี (Sangkhla Buri)",
    // 27. Krabi
    "81130": "เฉพาะเกาะศรีบอยา (Koh Si Boya Only)",
    "81150": "เกาะลันตา (Koh Lanta - All)",
    "81210": "เกาะพีพี (Koh Phi Phi)",
    // 30. Phang Nga
    "82000": "เฉพาะเกาะปันหยี (Koh Panyee Only)",
    "82160": "เกาะยาว (Koh Yao)",
    // 32. Phuket
    "83000": "ทุกพื้นที่ (All Areas)",
    "83100": "ทุกพื้นที่ (All Areas)",
    "83110": "ทุกพื้นที่ (All Areas)",
    "83120": "ทุกพื้นที่ (All Areas)",
    "83130": "ทุกพื้นที่ (All Areas)",
    "83150": "ทุกพื้นที่ (All Areas)",
    // 38. Surat Thani
    "84140": "เกาะสมุย (Koh Samui)",
    "84310": "ละไม (La Mai - Samui)",
    "84320": "เฉวง (Chaweng - Samui)",
    "84330": "แม่น้ำ (Mae Nam - Samui)",
    "84220": "เฉพาะเกาะพลวย/นกเภา (Koh Phaluai/Nok Pao Only)",
    "84280": "เกาะพะงัน (Koh Phangan)",
    "84360": "เกาะเต่า (Koh Tao)",
    // 46. Ranong
    "85000": "เฉพาะเกาะพยาม (Koh Phayam Only)",
    // 47. Satun
    "91000": "เฉพาะเกาะสาหร่าย/ปูยู (Koh Sarai/Pu Yu Only)",
    "91110": "เฉพาะเกาะหลีเป๊ะ/บุโหลน (Koh Lipe/Bulon Only)",
    // 51. Trang
    "92110": "เฉพาะเกาะลิบง/มุก (Koh Libong/Mook Only)",
    "92120": "เฉพาะเกาะสุกร (Koh Sukorn Only)",
    // 54. Pattani
    "94000": "ปัตตานี (Pattani - All)",
    "94110": "สายบุรี (Sai Buri)",
    "94120": "โคกโพธิ์ (Khok Pho)",
    "94130": "ปะนาเระ (Panare)",
    "94140": "มายอ (Mayo)",
    "94150": "ยะหริ่ง (Yaring)",
    "94160": "ยะรัง (Yarang)",
    "94170": "หนองจิก (Nong Chik)",
    "94180": "นาประดู่ (Na Pradu)",
    "94190": "ปาลัส (Palas)",
    "94220": "ไม้แก่น (Mai Kaen)",
    "94230": "กะพ้อ (Kapho)",
    // 66. Yala
    "95000": "ยะลา (Yala - All)",
    "95110": "เบตง (Betong)",
    "95120": "ยะหา (Yaha)",
    "95130": "บันนังสตา (Bannang Sata)",
    "95140": "รามัน (Raman)",
    "95150": "ธารโต (Than To)",
    "95160": "ลำใหม่ (Lam Mai)",
    "95170": "แม่หวาด (Mae Wat)",
    // 74. Narathiwat
    "96000": "นราธิวาส (Narathiwat - All)",
    "96110": "ตากใบ (Tak Bai)",
    "96120": "สุไหงโก-ลก (Su-ngai Kolok)",
    "96130": "ตันหยงมัส (Tanyong Mat)",
    "96140": "สุไหงปาดี (Su-ngai Padi)",
    "96150": "รือเสาะ (Rueso)",
    "96160": "แว้ง (Waeng)",
    "96170": "บาเจาะ (Bacho)",
    "96180": "ยี่งอ (Yi-ngo)",
    "96190": "สุคิริน (Sukhirin)",
    "96210": "ศรีสาคร (Si Sakhon)",
    "96220": "จะแนะ (Chanae)"
};

// Rates Structure: { maxWeight (g): { general: price, remote: price } }
const domesticRates2026 = {
    // ECO-POST
    eco: [
        { max: 20, general: 20, remote: 40 },
        { max: 100, general: 22, remote: 42 },
        { max: 250, general: 26, remote: 46 },
        { max: 500, general: 30, remote: 50 },
        { max: 1000, general: 40, remote: 60 },
        { max: 1500, general: 60, remote: 80 },
        { max: 2000, general: 60, remote: 80 },
        { max: 3000, general: 80, remote: 100 },
        { max: 5000, general: 80, remote: 100 },
        { max: 6000, general: 120, remote: 140 },
        { max: 7000, general: 160, remote: 180 },
        { max: 8000, general: 160, remote: 180 },
        { max: 9000, general: 160, remote: 180 },
        { max: 10000, general: 160, remote: 180 }
    ],
    // EMS
    ems: [
        { max: 20, general: 32, remote: 52 },
        { max: 100, general: 37, remote: 57 },
        { max: 250, general: 42, remote: 62 },
        { max: 500, general: 52, remote: 72 },
        { max: 1000, general: 67, remote: 87 },
        { max: 1500, general: 82, remote: 102 },
        { max: 2000, general: 97, remote: 117 },
        { max: 2500, general: 100, remote: 120 },
        { max: 3000, general: 105, remote: 125 },
        { max: 3500, general: 110, remote: 130 },
        { max: 4000, general: 120, remote: 140 },
        { max: 4500, general: 120, remote: 140 },
        { max: 5000, general: 120, remote: 140 },
        { max: 5500, general: 130, remote: 150 },
        { max: 6000, general: 140, remote: 160 },
        { max: 6500, general: 150, remote: 170 },
        { max: 7000, general: 160, remote: 180 },
        { max: 7500, general: 170, remote: 190 },
        { max: 8000, general: 180, remote: 200 },
        { max: 8500, general: 190, remote: 210 },
        { max: 9000, general: 200, remote: 220 },
        { max: 9500, general: 210, remote: 230 },
        { max: 10000, general: 220, remote: 240 },
        { max: 11000, general: 230, remote: 250 },
        { max: 12000, general: 240, remote: 260 },
        { max: 13000, general: 250, remote: 270 },
        { max: 14000, general: 260, remote: 280 },
        { max: 15000, general: 270, remote: 290 },
        { max: 16000, general: 280, remote: 300 },
        { max: 17000, general: 290, remote: 310 },
        { max: 18000, general: 300, remote: 320 },
        { max: 19000, general: 310, remote: 330 },
        { max: 20000, general: 320, remote: 340 },
        { max: 21000, general: 330, remote: 350 },
        { max: 22000, general: 340, remote: 360 },
        { max: 23000, general: 350, remote: 370 },
        { max: 24000, general: 360, remote: 380 },
        { max: 25000, general: 380, remote: 400 },
        { max: 26000, general: 400, remote: 420 },
        { max: 27000, general: 420, remote: 440 },
        { max: 28000, general: 440, remote: 460 },
        { max: 29000, general: 460, remote: 480 },
        { max: 30000, general: 480, remote: 500 }
    ]
};

// Additional Standard Services (Previously hardcoded in app.js)
const domesticStandardRates = {
    // Registered Mail (Envelope)
    registered_envelope: [
        { max: 10, price: 18 },
        { max: 20, price: 19 },
        { max: 100, price: 24 },
        { max: 250, price: 30 },
        { max: 500, price: 36 },
        { max: 1000, price: 53 },
        { max: 2000, price: 75 }
    ],
    // Registered Mail (Box)
    registered_box: [
        { max: 20, price: null }, // Unavailable
        { max: 100, price: 49 },
        { max: 250, price: 49 },
        { max: 500, price: 49 },
        { max: 1000, price: 60 },
        { max: 2000, price: 77 }
    ],
    // Letter (Standard)
    letter: [
        { max: 10, price: 5 },
        { max: 20, price: 6 },
        { max: 100, price: 11 },
        { max: 250, price: 17 },
        { max: 500, price: 23 },
        { max: 1000, price: 40 },
        { max: 2000, price: 62 }
    ],
    // Printed Matter
    printed_matter: [
        { max: 50, price: 4 },
        { max: 100, price: 5 },
        { max: 250, price: 8 },
        { max: 500, price: 11 },
        { max: 1000, price: 17 },
        { max: 2000, price: 33 },
        { max: 5000, price: "calc:33+16/kg" } // Special logic marker
    ],
    // Parcel Post
    parcel: [
        { max: 1000, price: 25 },
        { max: 20000, price: "calc:25+20/kg" } // Special logic marker
    ]
};

// Node.js support
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        domesticRemoteZipCodes,
        domesticRemoteRemarks,
        domesticRates2026,
        domesticStandardRates
    };
}
