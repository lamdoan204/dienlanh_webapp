export type ActiveTab = 'home' | 'pricing' | 'booking' | 'purchasing' | 'reviews' | 'history' | 'account' | 'auth' | 'onboarding' | 'admin';

export type AdminSubTab = 'requests' | 'purchasing' | 'technicians' | 'customers' | 'services';

export interface AdminTechnician {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  avatar?: string;
  stars: number;
  completedOrders: number;
}

export interface AdminCustomer {
  id: string;
  numericId: number;
  first_name: string;
  last_name: string;
  code?: string;
  name: string; // Họ tên đầy đủ (Ví dụ: Nguyễn Văn A)
  avatar: string;
  phone: string;
  email: string;
  address: string;
  province?: string;
  ward?: string;
  street?: string;
  house_number?: string;
  birth_year?: number | null;
  hasAccount: boolean;
  password?: string | null;
  created_at?: string;
  totalOrders: number;
  totalSpend: number;
  lastServiceDate?: string;
  lastServiceType?: string;
  notes?: string;
}

export interface AdminService {
  id: string;
  name: string;
  category: string;
  deviceType: string;
  price: number;
  imageUrl?: string;
  note?: string;
}

export interface AdminOrderItem {
  id: number;
  serviceId: number;
  serviceName: string;
  deviceType: string;
  quantity: number;
  unitPrice: number;
  subTotalPrice: number;
}

export interface AssignedWorker {
  workerId: number;
  workerName: string;
  workerPhone: string;
  workerStars: number;
  assignedAt?: string | null;
}

export interface AdminOrder {
  id: number;
  orderCode: string;
  customerId: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  address: string;
  orderTime: string;
  appointmentTime: string | null;
  timeSlot: string;
  status: 'pending' | 'verified' | 'completed' | 'cancelled' | string;
  statusText: string;
  totalPrice: number;
  note: string;
  workerId: number | null;
  workerName: string;
  workerPhone: string;
  workerStars: number;
  assignedWorkers: AssignedWorker[];
  items: AdminOrderItem[];
  assignmentCreatedAt?: string | null;
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

export interface SelectedServiceItem {
  serviceId: number | string;
  serviceName: string;
  deviceType?: string;
  serviceType?: string;
  unitPrice: number;
  quantity: number;
}

export interface BookingFormData {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  device?: DeviceType;
  servicePackage?: ServicePackageType;
  items?: SelectedServiceItem[];
  selectedDate: string; // YYYY-MM-DD format
  selectedTimeSlot: string;
  notes?: string;
}

// Supabase relational schema types
export interface AddressRecord {
  id?: number;
  user_id: number;
  province: string;
  ward: string;
  street?: string | null;
  house_number?: string | null;
  full_address: string;
  note?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface UserProfile {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  role: 'customer' | 'admin' | 'loyal_customer' | 'unregistered_customer' | 'worker';
  avatar?: string | null;
  birth_year?: number | null;
  created_at?: string;
  updated_at?: string;
}

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

export interface DBAssignment {
  id: number;
  order_id: number;
  worker_id: number;
  created_at?: string;
  updated_at?: string;
  worker?: DBUser;
}

export interface DBOrder {
  id: number;
  customer_id: number;
  worker_id?: number | null;
  appointment_time: string;
  time_slot_id: number;
  status: string;
  order_time: string;
  total_price: number;
  
  // Joined data
  customer?: DBUser;
  worker?: DBUser;
  assignment?: DBAssignment[];
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

export type BookingStatus = 'pending' | 'verified' | 'technician_assigned' | 'in_progress' | 'completed' | 'cancelled';

export interface BookingRecord extends BookingFormData {
  id: string;
  serviceName?: string;
  createdAt: string;
  status: BookingStatus;
  technicianName?: string;
  technicianPhone?: string;
  technicianId?: number;
  workerId?: number;
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
  orderId?: string;
  workerId?: number;
}

// ----------------------------------------------------
// Purchasing Service Types (Dịch vụ thu mua thiết bị)
// ----------------------------------------------------
export type PurchasingDeviceType = 'Tủ lạnh' | 'Máy giặt' | 'Máy lạnh';

export interface PurchasingItemInput {
  device: PurchasingDeviceType | string;
  quantity: number;
  desired_price: number; // Tổng giá mong muốn cho nhóm thiết bị này
  note: string; // Mô tả tình trạng thiết bị
  images?: File[];
  previewUrls?: string[];
}

export interface PurchasingOrderInput {
  address_id?: number | null;
  fullName: string;
  phone: string;
  email: string;
  province: string;
  ward: string;
  street?: string;
  house_number?: string;
  full_address: string;
  address_note?: string;
  time_slot_id: number;
  appointment_time: string; // YYYY-MM-DD
  items: PurchasingItemInput[];
}

export interface PurchasingOrderDetail {
  id: number;
  purchassing_order_id: number;
  device: string;
  quantity: number;
  desired_price: number | null;
  verified_price: number | null;
  note: string | null;
  images?: string[];
  previewUrls?: string[];
  image_url?: string | null;
}

export interface PurchasingOrderRecord {
  id: number;
  orderCode: string;
  user_id: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  address_id: number;
  address: string;
  province?: string;
  ward?: string;
  street?: string;
  house_number?: string;
  addressNote?: string;
  status: 'pending' | 'verified' | 'completed' | 'canceled';
  statusText: string;
  create_at: string;
  time_slot_id: number | null;
  timeSlotStr: string;
  appointment_time: string | null;
  details: PurchasingOrderDetail[];
  totalDesiredPrice: number;
  totalVerifiedPrice: number;
}
