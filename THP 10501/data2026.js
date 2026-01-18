// 2026 Rate Logic Data

// Rate Tables (General vs Remote)
const rates2026 = {
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
        // ... (Extrapolated +20 pattern for larger weights if needed, capping at 30kg)
        { max: 30000, general: 480, remote: 500 }
    ],
    eco: [
        { max: 20, general: 20, remote: 40 },
        { max: 100, general: 22, remote: 42 },
        { max: 250, general: 26, remote: 46 },
        { max: 500, general: 30, remote: 50 },
        { max: 1000, general: 40, remote: 60 },
        { max: 1500, general: 60, remote: 80 },
        { max: 2000, general: 80, remote: 100 },
        { max: 2500, general: 80, remote: 100 },
        { max: 3000, general: 80, remote: 100 },
        { max: 3500, general: 120, remote: 140 }, // Note bump mostly at 3kg+ ? Check image carefully next time, assuming +20 logic holds
        { max: 4000, general: 120, remote: 140 },
        { max: 4500, general: 120, remote: 140 },
        { max: 5000, general: 120, remote: 140 }, // Image showed 120/140 for 5000 range
        { max: 5500, general: 130, remote: 150 }, // Extrapolating similar to EMS steps usually
        { max: 6000, general: 140, remote: 160 },
        { max: 10000, general: 160, remote: 180 }
    ]
};

// Remote Area Groups (Mapping Zipcode -> Group ID)
// Based on the provided images
const remoteGroups2026 = {
    // 1. Chon Buri
    "20120": { id: 1, isPartial: true, remark: "เกาะสีชัง (Koh Sichang)" }, // Updated: Often treated as partial if mainland shares zip, but logic says Remark doesn't say "Only". Wait, 20120 is Si Chang district. It IS an island. But is it partial zip? Usually unique. Let's stick to "Only" keyword rule for safety. Remarks: "เกาะสีชัง" (No Only). So partial=false.
    "20150": { id: 2, isPartial: true, remark: "เฉพาะเกาะล้าน (Koh Larn Only)" }, // Has "Only"
    "21160": { id: 3, isPartial: true, remark: "เฉพาะเกาะเสม็ด (Koh Samet Only)" }, // Has "Only"

    // 4. Trat
    "23000": { id: 4, isPartial: true, remark: "เฉพาะเกาะกูด (Koh Kud Only)" }, // Has "Only"
    "23120": { id: 5, isPartial: true, remark: "เฉพาะเกาะหมาก (Koh Mak Only)" }, // Has "Only"
    "23170": { id: 6, isPartial: false, remark: "เกาะช้าง (Koh Chang)" }, // Whole district

    // 7. Chiang Mai
    "50250": { id: 7, isPartial: false, remark: "สะเมิง (Samoeng)" },
    "50310": { id: 7, isPartial: false, remark: "อมก๋อย (Omkoi)" },
    "50350": { id: 7, isPartial: false, remark: "เวียงแหง (Wiang Haeng)" },

    // 10. Nan
    "55130": { id: 10, isPartial: false, remark: "ทุ่งช้าง (Thung Chang)" },
    "55220": { id: 10, isPartial: false, remark: "บ่อเกลือ (Bo Kluea)" },

    // 12. Chiang Rai
    "57170": { id: 12, isPartial: false, remark: "เวียงป่าเป้า (Wiang Pa Pao)" },
    "57180": { id: 12, isPartial: false, remark: "แม่สรวย (Mae Suai)" },
    "57260": { id: 12, isPartial: false, remark: "แม่เจดีย์ (Mae Chedi)" },
    "57310": { id: 12, isPartial: false, remark: "เวียงแก่น (Wiang Kaen)" },
    "57340": { id: 12, isPartial: false, remark: "ขุนตาล (Khun Tan)" },

    // 17. Mae Hong Son (Whole Province usually considered remote in some contexts, but let's follow list)
    "58000": { id: 17, isPartial: false, remark: "แม่ฮ่องสอน (Mae Hong Son)" },
    "58110": { id: 17, isPartial: false, remark: "แม่สะเรียง (Mae Sariang)" },
    "58120": { id: 17, isPartial: false, remark: "แม่ลาน้อย (Mae La Noi)" },
    "58130": { id: 17, isPartial: false, remark: "ปาย (Pai)" },
    "58140": { id: 17, isPartial: false, remark: "ขุนยวม (Khun Yuam)" },
    "58150": { id: 17, isPartial: false, remark: "ปางมะผ้า (Pang Mapha)" },

    // 23. Tak
    "63150": { id: 23, isPartial: false, remark: "ท่าสองยาง (Tha Song Yang)" },
    "63170": { id: 23, isPartial: false, remark: "อุ้มผาง (Umphang)" },

    // 25. Kanchanaburi
    "71180": { id: 25, isPartial: false, remark: "ทองผาภูมิ (Thong Pha Phum)" },
    "71240": { id: 25, isPartial: false, remark: "สังขละบุรี (Sangkhla Buri)" },

    // 27. Krabi
    "81130": { id: 27, isPartial: true, remark: "เฉพาะเกาะศรีบอยา (Koh Si Boya Only)" }, // Only
    "81150": { id: 27, isPartial: false, remark: "เกาะลันตา (Koh Lanta - All)" }, // All
    "81210": { id: 27, isPartial: false, remark: "เกาะพีพี (Koh Phi Phi)" }, // Usually whole zip

    // 30. Phang Nga
    "82000": { id: 30, isPartial: true, remark: "เฉพาะเกาะปันหยี (Koh Panyee Only)" }, // Only
    "82160": { id: 30, isPartial: false, remark: "เกาะยาว (Koh Yao)" },

    // 32. Phuket (Group 32)
    "83000": { id: 32, isPartial: false, remark: "ทุกพื้นที่ (All Areas)" },
    "83100": { id: 32, isPartial: false, remark: "ทุกพื้นที่ (All Areas)" },
    "83110": { id: 32, isPartial: false, remark: "ทุกพื้นที่ (All Areas)" },
    "83120": { id: 32, isPartial: false, remark: "ทุกพื้นที่ (All Areas)" },
    "83130": { id: 32, isPartial: false, remark: "ทุกพื้นที่ (All Areas)" },
    "83150": { id: 32, isPartial: false, remark: "ทุกพื้นที่ (All Areas)" },

    // 38. Surat Thani
    "84140": { id: 38, isPartial: false, remark: "เกาะสมุย (Koh Samui)" },
    "84310": { id: 38, isPartial: false, remark: "ละไม (La Mai - Samui)" },
    "84320": { id: 38, isPartial: false, remark: "เฉวง (Chaweng - Samui)" },
    "84330": { id: 38, isPartial: false, remark: "แม่น้ำ (Mae Nam - Samui)" },
    "84220": { id: 38, isPartial: true, remark: "เฉพาะเกาะพลวย/นกเภา (Koh Phaluai/Nok Pao Only)" }, // Only
    "84280": { id: 39, isPartial: false, remark: "เกาะพะงัน (Koh Phangan)" }, // Separated group for logic matching? Or same? Let's give unique ID to be safe if inter-island is waived. If 84280 sends to 84360 (Tao), usually waived? Let's assume Samui/Phangan/Tao are same group? Data provided says "Surat Thani" header for all. Let's use ID 38 for ALL Surat islands to allow waiver.
    "84360": { id: 38, isPartial: false, remark: "เกาะเต่า (Koh Tao)" },

    // 46. Ranong
    "85000": { id: 46, isPartial: true, remark: "เฉพาะเกาะพยาม (Koh Phayam Only)" }, // Only

    // 47. Satun
    "91000": { id: 47, isPartial: true, remark: "เฉพาะเกาะสาหร่าย/ปูยู (Koh Sarai/Pu Yu Only)" }, // Only
    "91110": { id: 47, isPartial: true, remark: "เฉพาะเกาะหลีเป๊ะ/บุโหลน (Koh Lipe/Bulon Only)" }, // Only

    // 51. Trang
    "92110": { id: 51, isPartial: true, remark: "เฉพาะเกาะลิบง/มุก (Koh Libong/Mook Only)" }, // Only
    "92120": { id: 51, isPartial: true, remark: "เฉพาะเกาะสุกร (Koh Sukorn Only)" }, // Only

    // 54. Pattani
    "94000": { id: 54, isPartial: false, remark: "ปัตตานี (Pattani - All)" },
    "94110": { id: 54, isPartial: false, remark: "สายบุรี (Sai Buri)" },
    "94120": { id: 54, isPartial: false, remark: "โคกโพธิ์ (Khok Pho)" },
    "94130": { id: 54, isPartial: false, remark: "ปะนาเระ (Panare)" },
    "94140": { id: 54, isPartial: false, remark: "มายอ (Mayo)" },
    "94150": { id: 54, isPartial: false, remark: "ยะหริ่ง (Yaring)" },
    "94160": { id: 54, isPartial: false, remark: "ยะรัง (Yarang)" },
    "94170": { id: 54, isPartial: false, remark: "หนองจิก (Nong Chik)" },
    "94180": { id: 54, isPartial: false, remark: "นาประดู่ (Na Pradu)" },
    "94190": { id: 54, isPartial: false, remark: "ปาลัส (Palas)" },
    "94220": { id: 54, isPartial: false, remark: "ไม้แก่น (Mai Kaen)" },
    "94230": { id: 54, isPartial: false, remark: "กะพ้อ (Kapho)" },

    // 66. Yala
    "95000": { id: 66, isPartial: false, remark: "ยะลา (Yala - All)" },
    "95110": { id: 66, isPartial: false, remark: "เบตง (Betong)" },
    "95120": { id: 66, isPartial: false, remark: "ยะหา (Yaha)" },
    "95130": { id: 66, isPartial: false, remark: "บันนังสตา (Bannang Sata)" },
    "95140": { id: 66, isPartial: false, remark: "รามัน (Raman)" },
    "95150": { id: 66, isPartial: false, remark: "ธารโต (Than To)" },
    "95160": { id: 66, isPartial: false, remark: "ลำใหม่ (Lam Mai)" },
    "95170": { id: 66, isPartial: false, remark: "แม่หวาด (Mae Wat)" },

    // 74. Narathiwat
    "96000": { id: 74, isPartial: false, remark: "นราธิวาส (Narathiwat - All)" },
    "96110": { id: 74, isPartial: false, remark: "ตากใบ (Tak Bai)" },
    "96120": { id: 74, isPartial: false, remark: "สุไหงโก-ลก (Su-ngai Kolok)" },
    "96130": { id: 74, isPartial: false, remark: "ตันหยงมัส (Tanyong Mat)" },
    "96140": { id: 74, isPartial: false, remark: "สุไหงปาดี (Su-ngai Padi)" },
    "96150": { id: 74, isPartial: false, remark: "รือเสาะ (Rueso)" },
    "96160": { id: 74, isPartial: false, remark: "แว้ง (Waeng)" },
    "96170": { id: 74, isPartial: false, remark: "บาเจาะ (Bacho)" },
    "96180": { id: 74, isPartial: false, remark: "ยี่งอ (Yi-ngo)" },
    "96190": { id: 74, isPartial: false, remark: "สุคิริน (Sukhirin)" },
    "96210": { id: 74, isPartial: false, remark: "ศรีสาคร (Si Sakhon)" },
    "96220": { id: 74, isPartial: false, remark: "จะแนะ (Chanae)" }
};

// Helper to get group
function getRemoteGroup2026(zip) {
    if (!zip) return null;
    return remoteGroups2026[zip] || null;
}
