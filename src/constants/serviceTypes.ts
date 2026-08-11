export interface ServiceTypeInfo {
  code: string;
  label: string;
  icon: string;
  colorClass: string;
  badgeBg: string;
  badgeText: string;
  description: string;
}

export const SERVICE_TYPES: ServiceTypeInfo[] = [
  {
    code: 'suachua',
    label: 'Dịch vụ sửa chữa',
    icon: 'build',
    colorClass: 'text-blue-600',
    badgeBg: 'bg-blue-50 border-blue-200 text-blue-700',
    badgeText: 'text-blue-700',
    description: 'Khắc phục sự cố hỏng hóc, thay thế linh kiện chính hãng'
  },
  {
    code: 'vesinh',
    label: 'Dịch vụ vệ sinh',
    icon: 'cleaning_services',
    colorClass: 'text-emerald-600',
    badgeBg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    badgeText: 'text-emerald-700',
    description: 'Làm sạch sâu dàn lạnh, dàn nóng, diệt khuẩn và khử mùi'
  },
  {
    code: 'baotri',
    label: 'Dịch vụ bảo trì bảo dưỡng',
    icon: 'engineering',
    colorClass: 'text-amber-600',
    badgeBg: 'bg-amber-50 border-amber-200 text-amber-700',
    badgeText: 'text-amber-700',
    description: 'Kiểm tra định kỳ, duy trì hiệu suất hoạt động tối ưu'
  },
  {
    code: 'thicong',
    label: 'Dịch vụ thi công',
    icon: 'architecture',
    colorClass: 'text-purple-600',
    badgeBg: 'bg-purple-50 border-purple-200 text-purple-700',
    badgeText: 'text-purple-700',
    description: 'Tháo lắp, di dời, đi ống âm tường chuyên nghiệp'
  },
  {
    code: 'bomgas',
    label: 'Dịch vụ bơm gas',
    icon: 'speed',
    colorClass: 'text-cyan-600',
    badgeBg: 'bg-cyan-50 border-cyan-200 text-cyan-700',
    badgeText: 'text-cyan-700',
    description: 'Châm bổ sung hoặc sạc gas mới R32, R410A, R22'
  },
  {
    code: 'thumua',
    label: 'Dịch vụ thu mua',
    icon: 'sell',
    colorClass: 'text-rose-600',
    badgeBg: 'bg-rose-50 border-rose-200 text-rose-700',
    badgeText: 'text-rose-700',
    description: 'Thu mua máy cũ, hỏng hóc tận nơi với giá hợp lý'
  }
];

export function getServiceTypeInfo(code: string): ServiceTypeInfo {
  const normalized = (code || '').toLowerCase().trim();
  const found = SERVICE_TYPES.find(t => t.code === normalized);
  if (found) return found;

  if (normalized.includes('sua') || normalized.includes('sửa')) return SERVICE_TYPES[0];
  if (normalized.includes('ve sinh') || normalized.includes('vệ sinh')) return SERVICE_TYPES[1];
  if (normalized.includes('bao tri') || normalized.includes('bảo trì')) return SERVICE_TYPES[2];
  if (normalized.includes('thi cong') || normalized.includes('thi công')) return SERVICE_TYPES[3];
  if (normalized.includes('gas') || normalized.includes('bom')) return SERVICE_TYPES[4];
  if (normalized.includes('thu mua')) return SERVICE_TYPES[5];

  return {
    code: normalized || 'khac',
    label: code || 'Dịch vụ khác',
    icon: 'miscellaneous_services',
    colorClass: 'text-gray-600',
    badgeBg: 'bg-gray-50 border-gray-200 text-gray-700',
    badgeText: 'text-gray-700',
    description: 'Dịch vụ kỹ thuật chuyên nghiệp'
  };
}
