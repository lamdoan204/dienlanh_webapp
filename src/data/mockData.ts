import { DeviceOption, ServicePackage } from '../types';

export const HERO_IMAGE_URL = "/images/work-1.jpg";

export const DEVICE_OPTIONS: DeviceOption[] = [
  {
    id: 'air_conditioner',
    name: 'Máy lạnh',
    icon: 'ac_unit',
    description: 'Máy lạnh treo tường, âm trần, tủ đứng'
  },
  {
    id: 'refrigerator',
    name: 'Tủ lạnh',
    icon: 'kitchen',
    description: 'Tủ lạnh gia đình, tủ đông, tủ mát'
  },
  {
    id: 'washing_machine',
    name: 'Máy giặt',
    icon: 'local_laundry_service',
    description: 'Máy giặt lồng ngang, lồng đứng, máy sấy'
  },
  {
    id: 'microwave',
    name: 'Lò vi sóng',
    icon: 'microwave',
    description: 'Lò vi sóng, lò nướng âm tủ'
  }
];

export const SERVICE_PACKAGES: ServicePackage[] = [
  {
    id: 'cleaning',
    name: 'Vệ sinh',
    icon: 'water_drop',
    description: 'Vệ sinh sâu dàn lạnh, lưới lọc và cục nóng.',
    priceText: 'Từ 250.000 VNĐ',
    basePrice: 250000
  },
  {
    id: 'repair',
    name: 'Sửa chữa',
    icon: 'home_repair_service',
    description: 'Chẩn đoán và khắc phục sự cố.',
    priceText: 'Báo giá sau kiểm tra (Phí kiểm tra 150k)',
    basePrice: 150000
  },
  {
    id: 'maintenance',
    name: 'Bảo trì',
    icon: 'engineering',
    description: 'Kiểm tra hiệu suất định kỳ.',
    priceText: 'Từ 350.000 VNĐ',
    basePrice: 350000
  }
];

export const PRICING_CATEGORIES = [
  {
    category: 'Máy Lạnh & Điều Hòa',
    subtitle: 'Vệ sinh, sửa chữa và lắp đặt',
    startingPrice: '250.000đ',
    borderSecondary: false,
    icon: 'ac_unit',
    items: [
      { name: 'Vệ sinh máy lạnh', price: '250k - 450k' },
      { name: 'Sạc gas R22/R32/R410A', price: 'Từ 150k' },
      { name: 'Thay tụ block', price: '450k - 850k' },
      { name: 'Tháo lắp di dời', price: 'Từ 500k' }
    ]
  },
  {
    category: 'Tủ Lạnh & Tủ Đông',
    subtitle: 'Xử lý mọi sự cố làm lạnh',
    startingPrice: '350.000đ',
    borderSecondary: true,
    icon: 'kitchen',
    items: [
      { name: 'Sửa lỗi không đông đá', price: '350k - 650k' },
      { name: 'Thay sensor nhiệt', price: '450k+' },
      { name: 'Nạp gas tủ lạnh', price: 'Từ 550k' },
      { name: 'Thay Block (Máy nén)', price: 'Báo giá sau KT' }
    ]
  },
  {
    category: 'Máy Giặt & Máy Sấy',
    subtitle: 'Bảo dưỡng và xử lý bo mạch',
    startingPrice: '300.000đ',
    borderSecondary: false,
    icon: 'local_laundry_service',
    items: [
      { name: 'Vệ sinh máy giặt (Lồng ngang)', price: '450k - 650k' },
      { name: 'Thay van cấp nước', price: '350k+' },
      { name: 'Thay dây curoa', price: '300k - 500k' },
      { name: 'Sửa bo mạch điều khiển', price: '650k+' }
    ]
  }
];
export const PROJECT_IMAGES = [
  "/images/i2.jpg",
  "/images/i3.jpg",
  "/images/i4.jpg",
  "/images/i5.jpg",
  "/images/i6.jpg",
  "/images/i7.jpeg",
  "/images/i8.jpeg",
  "/images/i9.jpeg",
  "/images/i10.jpeg",
  "/images/i11.jpeg",
];