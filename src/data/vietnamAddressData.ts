export interface ProvinceData {
  name: string;
  wards: {
    name: string;
    streets: string[];
  }[];
}

export const VIETNAM_ADDRESS_DATA: ProvinceData[] = [
  {
    name: 'TP. Hồ Chí Minh',
    wards: [
      {
        name: 'Phường Bến Nghé (Quận 1)',
        streets: ['Đường Nguyễn Huệ', 'Đường Lê Lợi', 'Đường Đồng Khởi', 'Đường Hai Bà Trưng', 'Đường Tôn Đức Thắng', 'Đường Pasteur', 'Đường Nam Kỳ Khởi Nghĩa']
      },
      {
        name: 'Phường Bến Thành (Quận 1)',
        streets: ['Đường Nguyễn Trãi', 'Đường Trương Định', 'Đường Lý Tự Trọng', 'Đường Lê Thánh Tôn', 'Đường Phạm Hồng Thái', 'Đường Nguyễn Du']
      },
      {
        name: 'Phường Tân Định (Quận 1)',
        streets: ['Đường Hai Bà Trưng', 'Đường Trần Quang Khải', 'Đường Nguyễn Hữu Cảnh', 'Đường Đinh Tiên Hoàng', 'Đường Hoàng Sa']
      },
      {
        name: 'Phường Thảo Điền (TP. Thủ Đức)',
        streets: ['Đường Xuân Thủy', 'Đường Nguyễn Văn Hưởng', 'Đường Quốc Hương', 'Đường Thảo Điền', 'Đường Đỗ Quang']
      },
      {
        name: 'Phường An Phú (TP. Thủ Đức)',
        streets: ['Đường Song Hành', 'Đường Nguyễn Thị Định', 'Đường Mai Chí Thọ', 'Đường Đỗ Xuân Hợp', 'Đường Lương Định Của']
      },
      {
        name: 'Phường Võ Thị Sáu (Quận 3)',
        streets: ['Đường Nguyễn Đình Chiểu', 'Đường Điện Biên Phủ', 'Đường Nam Kỳ Khởi Nghĩa', 'Đường Phạm Ngọc Thạch', 'Đường Trần Quốc Thảo']
      },
      {
        name: 'Phường Tân Phong (Quận 7)',
        streets: ['Đường Nguyễn Văn Linh', 'Đường Nguyễn Hữu Thọ', 'Đường Nguyễn Thị Thập', 'Đường Bùi Bằng Đoàn', 'Đường Lê Văn Lương']
      },
      {
        name: 'Phường 12 (Quận 10)',
        streets: ['Đường Ba Tháng Hai', 'Đường Cao Thắng', 'Đường Sư Vạn Hạnh', 'Đường Tô Hiến Thành', 'Đường CMT8']
      },
      {
        name: 'Phường 15 (Quận Tân Bình)',
        streets: ['Đường Cộng Hòa', 'Đường Trường Chinh', 'Đường Phạm Văn Bạch', 'Đường Tân Sơn', 'Đường Nguyễn Sỹ Sách']
      },
      {
        name: 'Phường 2 (Quận Bình Thạnh)',
        streets: ['Đường Bạch Đằng', 'Đường Điện Biên Phủ', 'Đường Xô Viết Nghệ Tĩnh', 'Đường Phan Đăng Lưu', 'Đường Bùi Hữu Nghĩa']
      }
    ]
  },
  {
    name: 'Thành phố Hà Nội',
    wards: [
      {
        name: 'Phường Hàng Bạc (Quận Hoàn Kiếm)',
        streets: ['Đường Hàng Bạc', 'Đường Đinh Liệt', 'Đường Ta Hiện', 'Đường Mã Mây', 'Đường Hàng Bè']
      },
      {
        name: 'Phường Tràng Tiền (Quận Hoàn Kiếm)',
        streets: ['Đường Tràng Tiền', 'Đường Lý Thường Kiệt', 'Đường Ngo Quyen', 'Đường Hai Bà Trưng', 'Đường Phan Chu Trinh']
      },
      {
        name: 'Phường Dịch Vọng (Quận Cầu Giấy)',
        streets: ['Đường Cầu Giấy', 'Đường Xuân Thủy', 'Đường Duy Tân', 'Đường Trần Thái Tông', 'Đường Nguyễn Phong Sắc']
      },
      {
        name: 'Phường Mỹ Đình 1 (Quận Nam Từ Liêm)',
        streets: ['Đường Phạm Hùng', 'Đường Lê Đức Thọ', 'Đường Nguyễn Hoàng', 'Đường Hàm Nghi', 'Đường Đỗ Đức Dục']
      },
      {
        name: 'Phường Kim Liên (Quận Đống Đa)',
        streets: ['Đường Phạm Ngọc Thạch', 'Đường Đào Duy Anh', 'Đường Xã Đàn', 'Đường Chùa Bộc', 'Đường Tôn Thất Tùng']
      },
      {
        name: 'Phường Bách Khoa (Quận Hai Bà Trưng)',
        streets: ['Đường Giải Phóng', 'Đường Đại Cồ Việt', 'Đường Trần Đại Nghĩa', 'Đường Lê Thanh Nghị', 'Đường Tạ Quang Bửu']
      }
    ]
  },
  {
    name: 'Thành phố Đà Nẵng',
    wards: [
      {
        name: 'Phường Hải Châu 1 (Quận Hải Châu)',
        streets: ['Đường Bạch Đằng', 'Đường Trần Phú', 'Đường Nguyễn Thái Học', 'Đường Hùng Vương', 'Đường Yên Bái']
      },
      {
        name: 'Phường Phước Mỹ (Quận Sơn Trà)',
        streets: ['Đường Võ Nguyên Giáp', 'Đường Phạm Văn Đồng', 'Đường Nguyễn Văn Thoại', 'Đường Hồ Nghinh', 'Đường Vương Thừa Vũ']
      },
      {
        name: 'Phường Hòa Minh (Quận Liên Chiểu)',
        streets: ['Đường Tôn Đức Thắng', 'Đường Nguyễn Sinh Cung', 'Đường Hoang Thi Thieu', 'Đường Nam Cao', 'Đường Nguyễn Tất Thành']
      }
    ]
  },
  {
    name: 'Tỉnh Bình Dương',
    wards: [
      {
        name: 'Phường Phú Cường (TP. Thủ Dầu Một)',
        streets: ['Đường Yersin', 'Đường Cách Mạng Tháng Tam', 'Đường Bác Bác', 'Đường Đinh Hòa', 'Đường Nguyễn Du']
      },
      {
        name: 'Phường Dĩ An (TP. Dĩ An)',
        streets: ['Đường Lý Thường Kiệt', 'Đường Nguyễn An Ninh', 'Đường Trần Hưng Đạo', 'Đường Nguyễn Trãi']
      },
      {
        name: 'Phường Lái Thiêu (TP. Thuận An)',
        streets: ['Đường Gia Long', 'Đường Nguyễn Trãi', 'Đường Phan Thanh Giản', 'Đường Nguyễn Văn Tiết']
      }
    ]
  },
  {
    name: 'Tỉnh Đồng Nai',
    wards: [
      {
        name: 'Phường Quyết Thắng (TP. Biên Hòa)',
        streets: ['Đường Cách Mạng Tháng Tam', 'Đường Hà Huy Giáp', 'Đường Nguyễn Văn Trị', 'Đường Võ Thị Sáu']
      },
      {
        name: 'Phường Tân Phong (TP. Biên Hòa)',
        streets: ['Đường Đồng Khởi', 'Đường Phạm Văn Thuận', 'Đường Nguyễn Ai Quốc', 'Đường Bùi Trọng Nghĩa']
      }
    ]
  },
  {
    name: 'Thành phố Cần Thơ',
    wards: [
      {
        name: 'Phường Tân An (Quận Ninh Kiều)',
        streets: ['Đường Hai Bà Trưng', 'Đường Hòa Bình', 'Đường Ngô Quyền', 'Đường Nguyễn Trãi', 'Đường 30 Tháng 4']
      },
      {
        name: 'Phường An Khánh (Quận Ninh Kiều)',
        streets: ['Đường Nguyễn Văn Cừ', 'Đường Mậu Thân', 'Đường Võ Văn Kiệt', 'Đường Trần Bạch Đằng']
      }
    ]
  }
];

export function getProvincesList(): string[] {
  return VIETNAM_ADDRESS_DATA.map(p => p.name);
}

export function getWardsForProvince(provinceName: string): string[] {
  if (!provinceName) return [];
  const found = VIETNAM_ADDRESS_DATA.find(
    p => p.name.toLowerCase() === provinceName.toLowerCase() || provinceName.toLowerCase().includes(p.name.toLowerCase())
  );
  if (found) {
    return found.wards.map(w => w.name);
  }
  // Generic fallback wards if province is typed manually
  return [
    'Phường 1', 'Phường 2', 'Phường 3', 'Phường 5', 'Phường 7', 'Phường 10',
    'Phường Bến Nghé', 'Phường Bến Thành', 'Phường Tân Định', 'Phường Thảo Điền'
  ];
}

export function getStreetsForWard(provinceName: string, wardName: string): string[] {
  if (!wardName) return [];
  const prov = VIETNAM_ADDRESS_DATA.find(
    p => p.name.toLowerCase() === provinceName.toLowerCase() || provinceName.toLowerCase().includes(p.name.toLowerCase())
  );
  if (prov) {
    const ward = prov.wards.find(
      w => w.name.toLowerCase() === wardName.toLowerCase() || wardName.toLowerCase().includes(w.name.toLowerCase())
    );
    if (ward) {
      return ward.streets;
    }
  }
  // Generic fallback streets
  return [
    'Đường Nguyễn Huệ', 'Đường Lê Lợi', 'Đường Nguyễn Trãi', 'Đường Nam Kỳ Khởi Nghĩa',
    'Đường Điện Biên Phủ', 'Đường CMT8', 'Đường Bạch Đằng', 'Đường Cộng Hòa'
  ];
}
