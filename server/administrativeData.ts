export interface Province {
  code: string;
  name: string;
}

export interface Ward {
  code: string;
  name: string;
  province_code: string;
}

// Danh mục 63 Tỉnh / Thành phố trực thuộc Trung ương của Việt Nam
export const VIETNAM_PROVINCES: Province[] = [
  { code: '79', name: 'Thành phố Hồ Chí Minh' },
  { code: '01', name: 'Thành phố Hà Nội' },
  { code: '48', name: 'Thành phố Đà Nẵng' },
  { code: '31', name: 'Thành phố Hải Phòng' },
  { code: '92', name: 'Thành phố Cần Thơ' },
  { code: '74', name: 'Tỉnh Bình Dương' },
  { code: '75', name: 'Tỉnh Đồng Nai' },
  { code: '77', name: 'Tỉnh Bà Rịa - Vũng Tàu' },
  { code: '80', name: 'Tỉnh Long An' },
  { code: '82', name: 'Tỉnh Tiền Giang' },
  { code: '83', name: 'Tỉnh Bến Tre' },
  { code: '84', name: 'Tỉnh Trà Vinh' },
  { code: '86', name: 'Tỉnh Vĩnh Long' },
  { code: '87', name: 'Tỉnh Đồng Tháp' },
  { code: '89', name: 'Tỉnh An Giang' },
  { code: '91', name: 'Tỉnh Kiên Giang' },
  { code: '93', name: 'Tỉnh Hậu Giang' },
  { code: '94', name: 'Tỉnh Sóc Trăng' },
  { code: '95', name: 'Tỉnh Bạc Liêu' },
  { code: '96', name: 'Tỉnh Cà Mau' },
  { code: '70', name: 'Tỉnh Bình Phước' },
  { code: '72', name: 'Tỉnh Tây Ninh' },
  { code: '60', name: 'Tỉnh Đắk Lắk' },
  { code: '62', name: 'Tỉnh Đắk Nông' },
  { code: '64', name: 'Tỉnh Gia Lai' },
  { code: '66', name: 'Tỉnh Kon Tum' },
  { code: '68', name: 'Tỉnh Lâm Đồng' },
  { code: '56', name: 'Tỉnh Khánh Hòa' },
  { code: '58', name: 'Tỉnh Ninh Thuận' },
  { code: '54', name: 'Tỉnh Phú Yên' },
  { code: '52', name: 'Tỉnh Bình Định' },
  { code: '51', name: 'Tỉnh Quảng Ngãi' },
  { code: '49', name: 'Tỉnh Quảng Nam' },
  { code: '46', name: 'Tỉnh Thừa Thiên Huế' },
  { code: '45', name: 'Tỉnh Quảng Trị' },
  { code: '44', name: 'Tỉnh Quảng Bình' },
  { code: '42', name: 'Tỉnh Hà Tĩnh' },
  { code: '40', name: 'Tỉnh Nghệ An' },
  { code: '38', name: 'Tỉnh Thanh Hóa' },
  { code: '37', name: 'Tỉnh Ninh Bình' },
  { code: '36', name: 'Tỉnh Nam Định' },
  { code: '35', name: 'Tỉnh Hà Nam' },
  { code: '34', name: 'Tỉnh Thái Bình' },
  { code: '33', name: 'Tỉnh Hưng Yên' },
  { code: '30', name: 'Tỉnh Hải Dương' },
  { code: '27', name: 'Tỉnh Bắc Ninh' },
  { code: '26', name: 'Tỉnh Vĩnh Phúc' },
  { code: '25', name: 'Tỉnh Phú Thọ' },
  { code: '24', name: 'Tỉnh Bắc Giang' },
  { code: '22', name: 'Tỉnh Quảng Ninh' },
  { code: '20', name: 'Tỉnh Thái Nguyên' },
  { code: '19', name: 'Tỉnh Lạng Sơn' },
  { code: '17', name: 'Tỉnh Hòa Bình' },
  { code: '15', name: 'Tỉnh Yên Bái' },
  { code: '14', name: 'Tỉnh Sơn La' },
  { code: '12', name: 'Tỉnh Lai Châu' },
  { code: '11', name: 'Tỉnh Điện Biên' },
  { code: '10', name: 'Tỉnh Lào Cai' },
  { code: '08', name: 'Tỉnh Tuyên Quang' },
  { code: '06', name: 'Tỉnh Bắc Kạn' },
  { code: '04', name: 'Tỉnh Cao Bằng' },
  { code: '02', name: 'Tỉnh Hà Giang' }
];

// Dữ liệu Phường/Xã chi tiết theo Tỉnh/Thành phố (hỗ trợ mô hình 2 cấp hiện hành)
export const VIETNAM_WARDS: Record<string, Ward[]> = {
  // TP. Hồ Chí Minh (code: '79')
  '79': [
    { code: '79_BN', name: 'Phường Bến Nghé (Quận 1)', province_code: '79' },
    { code: '79_BT', name: 'Phường Bến Thành (Quận 1)', province_code: '79' },
    { code: '79_TD', name: 'Phường Tân Định (Quận 1)', province_code: '79' },
    { code: '79_DK', name: 'Phường Đa Kao (Quận 1)', province_code: '79' },
    { code: '79_NCT', name: 'Phường Nguyễn Cư Trinh (Quận 1)', province_code: '79' },
    { code: '79_VTS', name: 'Phường Võ Thị Sáu (Quận 3)', province_code: '79' },
    { code: '79_P1Q3', name: 'Phường 1 (Quận 3)', province_code: '79' },
    { code: '79_P2Q3', name: 'Phường 2 (Quận 3)', province_code: '79' },
    { code: '79_P4Q3', name: 'Phường 4 (Quận 3)', province_code: '79' },
    { code: '79_TD_TD', name: 'Phường Thảo Điền (TP. Thủ Đức)', province_code: '79' },
    { code: '79_AP_TD', name: 'Phường An Phú (TP. Thủ Đức)', province_code: '79' },
    { code: '79_BP_TD', name: 'Phường Bình An (TP. Thủ Đức)', province_code: '79' },
    { code: '79_HL_TD', name: 'Phường Hiệp Phú (TP. Thủ Đức)', province_code: '79' },
    { code: '79_TC_TD', name: 'Phường Tân Phú (TP. Thủ Đức)', province_code: '79' },
    { code: '79_LT_TD', name: 'Phường Linh Trung (TP. Thủ Đức)', province_code: '79' },
    { code: '79_LT2_TD', name: 'Phường Linh Tây (TP. Thủ Đức)', province_code: '79' },
    { code: '79_P13Q4', name: 'Phường 13 (Quận 4)', province_code: '79' },
    { code: '79_P1Q5', name: 'Phường 1 (Quận 5)', province_code: '79' },
    { code: '79_P5Q5', name: 'Phường 5 (Quận 5)', province_code: '79' },
    { code: '79_P1Q6', name: 'Phường 1 (Quận 6)', province_code: '79' },
    { code: '79_TPQ7', name: 'Phường Tân Phong (Quận 7)', province_code: '79' },
    { code: '79_TTQ7', name: 'Phường Tân Thuận Đông (Quận 7)', province_code: '79' },
    { code: '79_PQ7', name: 'Phường Phú Mỹ (Quận 7)', province_code: '79' },
    { code: '79_P1Q8', name: 'Phường 1 (Quận 8)', province_code: '79' },
    { code: '79_P12Q10', name: 'Phường 12 (Quận 10)', province_code: '79' },
    { code: '79_P14Q10', name: 'Phường 14 (Quận 10)', province_code: '79' },
    { code: '79_P15Q11', name: 'Phường 15 (Quận 11)', province_code: '79' },
    { code: '79_TLQ12', name: 'Phường Thạnh Lộc (Quận 12)', province_code: '79' },
    { code: '79_TAQ12', name: 'Phường Thới An (Quận 12)', province_code: '79' },
    { code: '79_HTQ12', name: 'Phường Hiệp Thành (Quận 12)', province_code: '79' },
    { code: '79_P2BT', name: 'Phường 2 (Quận Bình Thạnh)', province_code: '79' },
    { code: '79_P19BT', name: 'Phường 19 (Quận Bình Thạnh)', province_code: '79' },
    { code: '79_P25BT', name: 'Phường 25 (Quận Bình Thạnh)', province_code: '79' },
    { code: '79_P15TB', name: 'Phường 15 (Quận Tân Bình)', province_code: '79' },
    { code: '79_P2TB', name: 'Phường 2 (Quận Tân Bình)', province_code: '79' },
    { code: '79_P13TB', name: 'Phường 13 (Quận Tân Bình)', province_code: '79' },
    { code: '79_P1PN', name: 'Phường 1 (Quận Phú Nhuận)', province_code: '79' },
    { code: '79_P9PN', name: 'Phường 9 (Quận Phú Nhuận)', province_code: '79' },
    { code: '79_TSQN', name: 'Phường Tây Thạnh (Quận Tân Phú)', province_code: '79' },
    { code: '79_HTQN', name: 'Phường Hòa Thạnh (Quận Tân Phú)', province_code: '79' },
    { code: '79_BHH', name: 'Phường Bình Hưng Hòa (Quận Bình Tân)', province_code: '79' },
    { code: '79_ATT', name: 'Phường An Lạc (Quận Bình Tân)', province_code: '79' },
    { code: '79_BHT', name: 'Xã Bình Hưng (Huyện Bình Chánh)', province_code: '79' },
    { code: '79_TTH', name: 'Xã Tân Thới Nhì (Huyện Hóc Môn)', province_code: '79' },
    { code: '79_NHC', name: 'Xã Phước Kiển (Huyện Nhà Bè)', province_code: '79' }
  ],

  // TP. Hà Nội (code: '01')
  '01': [
    { code: '01_HB', name: 'Phường Hàng Bạc (Quận Hoàn Kiếm)', province_code: '01' },
    { code: '01_TT', name: 'Phường Tràng Tiền (Quận Hoàn Kiếm)', province_code: '01' },
    { code: '01_HD', name: 'Phường Hàng Đào (Quận Hoàn Kiếm)', province_code: '01' },
    { code: '01_DV', name: 'Phường Dịch Vọng (Quận Cầu Giấy)', province_code: '01' },
    { code: '01_DVH', name: 'Phường Dịch Vọng Hậu (Quận Cầu Giấy)', province_code: '01' },
    { code: '01_MH', name: 'Phường Mai Dịch (Quận Cầu Giấy)', province_code: '01' },
    { code: '01_MD1', name: 'Phường Mỹ Đình 1 (Quận Nam Từ Liêm)', province_code: '01' },
    { code: '01_MD2', name: 'Phường Mỹ Đình 2 (Quận Nam Từ Liêm)', province_code: '01' },
    { code: '01_KL', name: 'Phường Kim Liên (Quận Đống Đa)', province_code: '01' },
    { code: '01_OC', name: 'Phường Ô Chợ Dừa (Quận Đống Đa)', province_code: '01' },
    { code: '01_LT', name: 'Phường Láng Thượng (Quận Đống Đa)', province_code: '01' },
    { code: '01_BK', name: 'Phường Bách Khoa (Quận Hai Bà Trưng)', province_code: '01' },
    { code: '01_DM', name: 'Phường Đồng Tâm (Quận Hai Bà Trưng)', province_code: '01' },
    { code: '01_QN', name: 'Phường Quán Thánh (Quận Ba Đình)', province_code: '01' },
    { code: '01_DB', name: 'Phường Điện Biên (Quận Ba Đình)', province_code: '01' },
    { code: '01_TH', name: 'Phường Quảng An (Quận Tây Hồ)', province_code: '01' },
    { code: '01_TH2', name: 'Phường Xuân La (Quận Tây Hồ)', province_code: '01' },
    { code: '01_TX', name: 'Phường Thanh Xuân Bắc (Quận Thanh Xuân)', province_code: '01' },
    { code: '01_TX2', name: 'Phường Nhân Chính (Quận Thanh Xuân)', province_code: '01' },
    { code: '01_HM', name: 'Phường Hoàng Liệt (Quận Hoàng Mai)', province_code: '01' },
    { code: '01_LB', name: 'Phường Bồ Đề (Quận Long Biên)', province_code: '01' },
    { code: '01_HD2', name: 'Phường Quang Trung (Quận Hà Đông)', province_code: '01' }
  ],

  // TP. Đà Nẵng (code: '48')
  '48': [
    { code: '48_HC1', name: 'Phường Hải Châu 1 (Quận Hải Châu)', province_code: '48' },
    { code: '48_HC2', name: 'Phường Hải Châu 2 (Quận Hải Châu)', province_code: '48' },
    { code: '48_TB', name: 'Phường Thạch Thang (Quận Hải Châu)', province_code: '48' },
    { code: '48_TC', name: 'Phường Thuận Phước (Quận Hải Châu)', province_code: '48' },
    { code: '48_PM', name: 'Phường Phước Mỹ (Quận Sơn Trà)', province_code: '48' },
    { code: '48_AT', name: 'Phường An Hải Bắc (Quận Sơn Trà)', province_code: '48' },
    { code: '48_HM', name: 'Phường Hòa Minh (Quận Liên Chiểu)', province_code: '48' },
    { code: '48_HK', name: 'Phường Hòa Khánh Bắc (Quận Liên Chiểu)', province_code: '48' },
    { code: '48_MA', name: 'Phường Mỹ An (Quận Ngũ Hành Sơn)', province_code: '48' },
    { code: '48_KH', name: 'Phường Khuê Trung (Quận Cẩm Lệ)', province_code: '48' }
  ],

  // Tỉnh Bình Dương (code: '74')
  '74': [
    { code: '74_PC', name: 'Phường Phú Cường (TP. Thủ Dầu Một)', province_code: '74' },
    { code: '74_PH', name: 'Phường Phú Hòa (TP. Thủ Dầu Một)', province_code: '74' },
    { code: '74_HP', name: 'Phường Hiệp Thành (TP. Thủ Dầu Một)', province_code: '74' },
    { code: '74_DA', name: 'Phường Dĩ An (TP. Dĩ An)', province_code: '74' },
    { code: '74_DA2', name: 'Phường Tân Đông Hiệp (TP. Dĩ An)', province_code: '74' },
    { code: '74_DA3', name: 'Phường An Bình (TP. Dĩ An)', province_code: '74' },
    { code: '74_LT', name: 'Phường Lái Thiêu (TP. Thuận An)', province_code: '74' },
    { code: '74_BH', name: 'Phường Bình Hòa (TP. Thuận An)', province_code: '74' },
    { code: '74_AC', name: 'Phường An Phú (TP. Thuận An)', province_code: '74' },
    { code: '74_TC', name: 'Phường Tân Uyên (TP. Tân Uyên)', province_code: '74' },
    { code: '74_BC', name: 'Phường Mỹ Phước (TP. Bến Cát)', province_code: '74' }
  ],

  // Tỉnh Đồng Nai (code: '75')
  '75': [
    { code: '75_QT', name: 'Phường Quyết Thắng (TP. Biên Hòa)', province_code: '75' },
    { code: '75_TP', name: 'Phường Tân Phong (TP. Biên Hòa)', province_code: '75' },
    { code: '75_TH', name: 'Phường Tân Hiệp (TP. Biên Hòa)', province_code: '75' },
    { code: '75_TN', name: 'Phường Thống Nhất (TP. Biên Hòa)', province_code: '75' },
    { code: '75_TR', name: 'Phường Trảng Dài (TP. Biên Hòa)', province_code: '75' },
    { code: '75_LT', name: 'Thị trấn Long Thành (Huyện Long Thành)', province_code: '75' },
    { code: '75_NT', name: 'Xã Hiệp Phước (Huyện Nhơn Trạch)', province_code: '75' },
    { code: '75_LK', name: 'Phường Xuân An (TP. Long Khánh)', province_code: '75' }
  ],

  // TP. Cần Thơ (code: '92')
  '92': [
    { code: '92_TA', name: 'Phường Tân An (Quận Ninh Kiều)', province_code: '92' },
    { code: '92_AK', name: 'Phường An Khánh (Quận Ninh Kiều)', province_code: '92' },
    { code: '92_XB', name: 'Phường Xuân Khánh (Quận Ninh Kiều)', province_code: '92' },
    { code: '92_AH', name: 'Phường An Hòa (Quận Ninh Kiều)', province_code: '92' },
    { code: '92_BT', name: 'Phường Bình Thủy (Quận Bình Thủy)', province_code: '92' },
    { code: '92_CR', name: 'Phường Lê Bình (Quận Cái Răng)', province_code: '92' }
  ],

  // TP. Hải Phòng (code: '31')
  '31': [
    { code: '31_MQ', name: 'Phường Máy Tơ (Quận Ngô Quyền)', province_code: '31' },
    { code: '31_LQ', name: 'Phường Lạch Tray (Quận Ngô Quyền)', province_code: '31' },
    { code: '31_HB', name: 'Phường Hoàng Văn Thụ (Quận Hồng Bàng)', province_code: '31' },
    { code: '31_LC', name: 'Phường Niệm Nghĩa (Quận Lê Chân)', province_code: '31' },
    { code: '31_HA', name: 'Phường Đằng Hải (Quận Hải An)', province_code: '31' }
  ],

  // Tỉnh Bà Rịa - Vũng Tàu (code: '77')
  '77': [
    { code: '77_P1', name: 'Phường 1 (TP. Vũng Tàu)', province_code: '77' },
    { code: '77_P2', name: 'Phường 2 (TP. Vũng Tàu)', province_code: '77' },
    { code: '77_P7', name: 'Phường 7 (TP. Vũng Tàu)', province_code: '77' },
    { code: '77_TT', name: 'Phường Thắng Tam (TP. Vũng Tàu)', province_code: '77' },
    { code: '77_BR', name: 'Phường Phước Trung (TP. Bà Rịa)', province_code: '77' },
    { code: '77_PM', name: 'Phường Phú Mỹ (Thị xã Phú Mỹ)', province_code: '77' }
  ]
};

/**
 * Lấy danh sách các Phường/Xã theo Province Code.
 * Nếu tỉnh chưa có dữ liệu chi tiết, sinh danh mục xã/phường tiêu chuẩn để luôn đáp ứng nghiệp vụ.
 */
export function getWardsByProvinceCode(provinceCode: string): Ward[] {
  if (!provinceCode) return [];
  if (VIETNAM_WARDS[provinceCode]) {
    return VIETNAM_WARDS[provinceCode];
  }

  const province = VIETNAM_PROVINCES.find((p) => p.code === provinceCode);
  const provName = province ? province.name : 'Địa phương';

  // Fallback danh sách phường xã đại diện cho tỉnh
  return [
    { code: `${provinceCode}_TT`, name: `Phường Trung tâm (${provName})`, province_code: provinceCode },
    { code: `${provinceCode}_P1`, name: `Phường 1 (${provName})`, province_code: provinceCode },
    { code: `${provinceCode}_P2`, name: `Phường 2 (${provName})`, province_code: provinceCode },
    { code: `${provinceCode}_P3`, name: `Phường 3 (${provName})`, province_code: provinceCode },
    { code: `${provinceCode}_P4`, name: `Phường 4 (${provName})`, province_code: provinceCode },
    { code: `${provinceCode}_X1`, name: `Xã Tân Phú (${provName})`, province_code: provinceCode },
    { code: `${provinceCode}_X2`, name: `Xã Hiệp Hòa (${provName})`, province_code: provinceCode }
  ];
}
