export type ActiveTab = 'home' | 'pricing' | 'booking' | 'reviews' | 'history' | 'account' | 'auth' | 'onboarding' | 'admin';

export type AdminSubTab = 'requests' | 'technicians' | 'customers' | 'services' | 'reports';

export interface AdminTechnician {
  id: string;
  code: string;
  name: string;
  avatar: string;
  skill: string;
  completedOrders: number;
  rating: number;
  status: 'working' | 'waiting' | 'leave';
  phone: string;
}

export interface AdminCustomer {
  id: string;
  code: string;
  name: string;
  avatar: string;
  phone: string;
  email: string;
  address: string;
  totalOrders: number;
  totalSpend: number;
  lastServiceDate: string;
  lastServiceType: string;
  notes?: string;
}

export interface AdminService {
  id: string;
  name: string;
  category: 'Khẩn cấp' | 'Bảo trì' | 'Trọn gói' | 'Lắp đặt';
  deviceType: string;
  price: number;
  imageUrl?: string;
}

export type DeviceType = 'air_conditioner' | 'refrigerator' | 'washing_machine' | 'microwave';

export interface DeviceOption {
  id: DeviceType;
  name: string;
  icon: string;
  description: string;
}

export type ServicePackageType = 'cleaning' | 'repair' | 'maintenance';

export interface ServicePackage {
  id: ServicePackageType;
  name: string;
  icon: string;
  description: string;
  priceText: string;
  basePrice: number;
}

export interface TimeSlot {
  id: string;
  label: string;
  available: boolean;
}

export interface BookingFormData {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  device: DeviceType;
  servicePackage: ServicePackageType;
  selectedDate: string; // YYYY-MM-DD format
  selectedTimeSlot: string;
  notes?: string;
}

// Supabase relational schema types
export interface DBUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  role: string;
  avatar: string | null;
}

export interface DBService {
  id: number;
  name: string;
  service_type: string;
  price: number;
  device_type: string;
}

export interface DBTimeSlot {
  id: number;
  start_time: string;
  end_time: string;
}

export interface DBOrderDetail {
  id: number;
  order_id: number;
  service_id: number;
  quantity: number;
  sub_total_price: number;
  services?: DBService; // Joined data
}

export interface DBOrder {
  id: number;
  customer_id: number;
  worker_id: number | null;
  appointment_time: string;
  time_slot_id: number;
  status: string;
  order_time: string;
  total_price: number;
  
  // Joined data
  customer?: DBUser;
  worker?: DBUser;
  time_slots?: DBTimeSlot;
  order_details?: DBOrderDetail[];
}

export interface DBReview {
  id: number;
  user_id: number;
  order_id: number;
  stars: number;
  detail: string;
  created_at: string;
  
  // Joined data
  users?: DBUser;
  orders?: DBOrder;
}

export type BookingStatus = 'pending' | 'technician_assigned' | 'in_progress' | 'completed' | 'cancelled';

export interface BookingRecord extends BookingFormData {
  id: string;
  createdAt: string;
  status: BookingStatus;
  technicianName?: string;
  technicianPhone?: string;
  estimatedCost: number;
  finalCost?: number;
}

export interface CustomerReview {
  id: string;
  author: string;
  avatar?: string;
  rating: number;
  date: string;
  serviceType: string;
  comment: string;
  verified: boolean;
}
