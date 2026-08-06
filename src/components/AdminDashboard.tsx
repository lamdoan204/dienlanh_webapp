import React, { useState } from 'react';
import {
  ActiveTab,
  AdminSubTab,
  BookingRecord,
  AdminTechnician,
  AdminCustomer,
  AdminService
} from '../types';
import { User } from '@supabase/supabase-js';

interface AdminDashboardProps {
  setActiveTab: (tab: ActiveTab) => void;
  user?: User | null;
  bookings: BookingRecord[];
  onUpdateBookings?: (bookings: BookingRecord[]) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  setActiveTab,
  user,
  bookings,
  onUpdateBookings
}) => {
  const [adminSubTab, setAdminSubTab] = useState<AdminSubTab>('requests');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // --- 1. REQUESTS / ORDERS STATE ---
  const [orderTab, setOrderTab] = useState<'unassigned' | 'processing' | 'completed'>('unassigned');
  const [selectedOrderForAssign, setSelectedOrderForAssign] = useState<string | null>(null);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);

  // Default orders if local bookings list is small or empty
  const [adminOrders, setAdminOrders] = useState([
    { id: "#HVAC-9901", customer: "Trần Anh Quân", phone: "0901234567", service: "Bảo trì điều hòa", date: "24/10 - 14:00", tech: "Chưa chỉ định", status: "Chờ xử lý", category: "unassigned", price: 250000 },
    { id: "#HVAC-9904", customer: "Lê Minh Tâm", phone: "0912345678", service: "Sửa máy giặt", date: "24/10 - 15:30", tech: "Chưa chỉ định", status: "Chờ xử lý", category: "unassigned", price: 350000 },
    { id: "#HVAC-9907", customer: "Phạm Hữu Đạt", phone: "0987654321", service: "Lắp đặt tủ lạnh", date: "25/10 - 08:00", tech: "Chưa chỉ định", status: "Chờ xử lý", category: "unassigned", price: 450000 },
    { id: "#HVAC-9910", customer: "Hoàng Gia Bảo", phone: "0900000001", service: "Vệ sinh máy lạnh", date: "25/10 - 09:15", tech: "Chưa chỉ định", status: "Chờ xử lý", category: "unassigned", price: 250000 },
    { id: "#HVAC-9912", customer: "Đặng Thu Hà", phone: "0911222333", service: "Sửa bình nóng lạnh", date: "25/10 - 10:45", tech: "Chưa chỉ định", status: "Chờ xử lý", category: "unassigned", price: 300000 },
    { id: "#HVAC-9915", customer: "Bùi Tuyết Nhung", phone: "0922333444", service: "Kiểm tra gas", date: "25/10 - 13:30", tech: "Chưa chỉ định", status: "Chờ xử lý", category: "unassigned", price: 150000 },
    { id: "#HVAC-9850", customer: "Nguyễn Văn A", phone: "090 123 4567", service: "Lắp đặt hệ thống VRV", date: "24/10 - 09:00", tech: "Nguyễn Hoàng", status: "Đang xử lý", category: "processing", price: 1500000 },
    { id: "#HVAC-9855", customer: "Phạm Thị B", phone: "0933444555", service: "Sửa chữa bo mạch", date: "24/10 - 10:30", tech: "Vũ Tiến", status: "Đang xử lý", category: "processing", price: 650000 },
    { id: "#HVAC-9800", customer: "Đỗ Thế C", phone: "0944555666", service: "Bơm gas R32", date: "23/10 - 16:00", tech: "Nguyễn Hoàng", status: "Đã hoàn thành", category: "completed", price: 450000 }
  ]);

  // Form state for creating a new admin order
  const [newOrderForm, setNewOrderForm] = useState({
    customerName: '',
    phone: '',
    serviceName: 'Vệ sinh máy lạnh',
    dateTime: 'Hôm nay - 14:00',
    price: 250000
  });

  // --- 2. TECHNICIANS STATE ---
  const [technicians, setTechnicians] = useState<AdminTechnician[]>([
    {
      id: "tech-1",
      code: "TECH-001",
      name: "Nguyễn Văn A",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDIB5Sltv6FZZyqMTpCFWDf6NUyHMqhQGYRdF-nPUikl1tw1ojk_JUy2nnpP8Zr85eGIdyEaAcWLGKUc94OwHJ0wT6qzZxrrPmOEMYhNjpiqa9O32ldx2aSAoaWXoaoc5PDDxHl8JXINVSQqSCcO1M7pgQno3TT-TSSxiOZI_pjgzQM6_ZjVTDZVE3R7Yu18JUdEgjpAOALgIsR485xjekpqz489GmabPETB15TSIcmVXtEs-P6tcw3UQ",
      skill: "Sửa chữa điều hòa",
      completedOrders: 120,
      rating: 4.8,
      status: "working",
      phone: "0987654321"
    },
    {
      id: "tech-2",
      code: "TECH-002",
      name: "Trần Minh B",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuA6rSZkFGnHLnRK0ObycbQVfnzlybmuovZYHJjfxx3_mDCNzLkR5veLNkj59CYbWWlBE-hXGWlGucCsYb0JQSJfGlK11JKIdWmOekL44G1x5IFMF9DLD4qTMhtzlNGZxDJRhnxgdcCQ9wfURPmCGbmehAmoRh537cMplsnywJpqByIQBSyGQiuveN3kzofXYU6huQICUHum9C8sFnilyJkfJGnv-ZBkjrVoxtRUPe473xy--ho1xeJQbQ",
      skill: "Lắp đặt hệ thống",
      completedOrders: 85,
      rating: 4.9,
      status: "leave",
      phone: "0912345678"
    },
    {
      id: "tech-3",
      code: "TECH-003",
      name: "Lê Văn C",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAFWX6ZIONJoYIzdv4TLS_VUZWJ1Cf2x_KtBTvYJI-306If_Obc-zS7r51YBce1fEUr0h8Y1fMJ8VtLHho0oRXdLSp6RXOzqhCT77-FKKrlBeZ92x1y8l1kUbUJq883IlVgD9yVS7GuwA6SFcLJjThCmTYJqcswSXyde6rXHS8pixqsuquqhkrMpZPkfl_oWbdLbdSOwwPIMXaZt9zkpsEbx5Wb1mooN1ZKsg1fF6D8q9zgMPFSEo5tFA",
      skill: "Bảo trì định kỳ",
      completedOrders: 45,
      rating: 4.7,
      status: "waiting",
      phone: "0901234567"
    }
  ]);
  const [techSearch, setTechSearch] = useState('');
  const [techSkillFilter, setTechSkillFilter] = useState('all');
  const [techStatusFilter, setTechStatusFilter] = useState('all');
  const [isAddTechModalOpen, setIsAddTechModalOpen] = useState(false);
  const [newTechForm, setNewTechForm] = useState({
    name: '',
    phone: '',
    skill: 'Sửa chữa điều hòa'
  });

  // --- 3. CUSTOMERS STATE ---
  const [customers, setCustomers] = useState<AdminCustomer[]>([
    {
      id: "cust-1",
      code: "HVAC-C001",
      name: "Nguyễn Văn An",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDANYRDZKEYHtdRC8ECMWPgmOXHbHd9ZpE4m5u1J6THkUOaScsNSxyyoRTvfCVinhZ6OemcIJRhrr8qQLLoZEw058oM7KhF8evKOcW92CBDzoXz4pJIdqrfjvjnFpolas1m4YY2XqjK22keyR8IvvFSr7c2-JDaTNgnJbnCtjjZIAIreyL0AI8k4R6Tf3PXtw53v9LxbmY9kPwR5c3k_Iv8PmcqVzlblp8-_TKrRATvwy9im6cjM6ljow",
      phone: "0912 345 678",
      email: "an.nguyen@email.com",
      address: "123 Đường Lê Lợi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh",
      totalOrders: 5,
      totalSpend: 12500000,
      lastServiceDate: "24/10/2024",
      lastServiceType: "Bảo trì hệ thống",
      notes: "Khách hàng thân thiết, ưu tiên lịch bảo trì cuối tuần."
    },
    {
      id: "cust-2",
      code: "HVAC-C012",
      name: "Lê Thị Mai",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBhM0TaqRGn4mr5LtjkfAktUua2_4hu0a3cvk_jl0UtYLO2_O4-XUENm7BbulQIrvDta6CPyaIe_9-dRS3vYxKDcnEhOMfNigMlkpB6042lK9Ivy0GJcohpZsklfGu4PyTtP0lMkY4rwcmwbl3a28Iov2GDlLHuu2jwOakDMJOkTGTNn5wSq0Ivhu-uzdPS4qXng1kUwW_8Ae6dDff_dhT8GuILne0M0IFv1rgKhS9VXR2s2j9P2FIiSg",
      phone: "0908 123 456",
      email: "mai.le@email.com",
      address: "456 Nguyễn Thị Minh Khai, Quận 3, TP. Hồ Chí Minh",
      totalOrders: 2,
      totalSpend: 4200000,
      lastServiceDate: "15/09/2024",
      lastServiceType: "Lắp đặt máy mới",
      notes: "Khách hàng cẩn thận, hay yêu cầu kỹ thuật viên kiểm tra kỹ bo mạch."
    },
    {
      id: "cust-3",
      code: "HVAC-C205",
      name: "Trần Minh Tâm",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDhpCwRAzDAc1Okdezg7HIwft1CNZBsSVCidB2_GAPKcKEYJ9eR_FCGW1ODmCANL204T1Wj-7zmJKSXcMYOpLBoKKrrs2See6vxMAgFQ-uRZco_VZYaAfcyrNgabsxOF-QdupEK74Az3az8GYmthKZAJ-c2gBg_BrFdiCGHKXMNGIuetNXnU7mIPwwnH8wnvUNudeXACn2ENX7S0PX_LaD5ztdFwBATIDpLXO1AK7ovg3j469iF-ThKNg",
      phone: "0933 555 999",
      email: "tam.tm@email.com",
      address: "789 Điện Biên Phủ, Bình Thạnh, TP. Hồ Chí Minh",
      totalOrders: 1,
      totalSpend: 1500000,
      lastServiceDate: "12/02/2023",
      lastServiceType: "Sửa chữa khẩn cấp",
      notes: "Liên hệ qua Zalo trước khi tới."
    }
  ]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [expandedCustomerHistory, setExpandedCustomerHistory] = useState<string | null>(null);

  // --- 4. SERVICES STATE ---
  const [services, setServices] = useState<AdminService[]>([
    {
      id: "srv-1",
      name: "Sửa chữa máy lạnh (AC Repair)",
      category: "Khẩn cấp",
      deviceType: "Máy lạnh (AC)",
      price: 1500000,
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuC5q_q5A8AtiWprTcpV0J1zNaEI3TfSYazI9qODLYK6L40_wZ70QnzSk6BX68nKzxVtigdQ2VQigkZ4hrbvxtCXdV3P0xxUb91IS6BviIZF5B4PPer5l4MsbvCWX6L3vlRJEAgG1mXBEML5ta7hUAftaA10Vz4dxLDq3D_dPQpLzHa-hCsi-jzfL_IxPU6859f_oQPYC0EcH4P-cZoiuywFgAe81uwqzqOGWmWMeB1Ol3C0Pz7_2uXo-Q"
    },
    {
      id: "srv-2",
      name: "Nạp Gas (Gas Refill)",
      category: "Bảo trì",
      deviceType: "Máy lạnh / Tủ lạnh",
      price: 800000,
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAaYapZ6zleYshSwF4kSy3AfRVtWnyCDaJKRXz9k3LPYKdVoXLVqqetuJcVX901iV-w3Xae53PT4pixQS82vOTg4YrlxXzMEFXABQOwtcnKoHyZSn5kB_EWX1x1gabIZetnM4qJGn5ewetJYamjJFiW-q2cGU9Bfh_I-WY52IgILdUxUV9yjHp0IPY7V1NGXtHDIrts6kKFSXfn-cmgUlfevYhoaKzdaDTv82XTfASbTMPtqvphkUfoZw"
    },
    {
      id: "srv-3",
      name: "Bảo trì định kỳ (Maintenance)",
      category: "Trọn gói",
      deviceType: "Hệ thống HVAC",
      price: 500000,
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuD9TTiSmOgqiH6RnRWBKtTTAZyhYQcPDdDxYGlXU26DgHF9jTrLt-r6g-W5rTXzC6zfDP7hs_axDQJU_Uc3tEreSFxQWG-b7Kq8GbMIBVkuMkmSgZ3XDy_C3UgEQAu1Te5M6e0C9LCOJurpdUIi2ubbOAPhDZU8mb5kPzlb-x1mwq-PU_XA6HGUsZOSoYJI28NW50kqS0-9b8dRka_qnJeoscO-aDg6Zuij0Faa1WFcMCpx1i2W8rKNDQ"
    },
    {
      id: "srv-4",
      name: "Lắp đặt mới (Installation)",
      category: "Lắp đặt",
      deviceType: "Thiết bị mới",
      price: 3200000,
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDjPbyUq8-5uTCUgDzUy8xVT7LIVLdKcfatHlHWAhS2Ert8NEsOiiENWTcyBuLLKb9BaPu27vlkZqPha3miRJo4lrz2oCGJtxnQvERvW9AC5F0at-VBuURWhNbMLL5Gr0VukNx_13V-77CD3eXa3cNum3Fq4FK4jXKaNZqB94lCRDRYUENaM6dXEfh6gYy3s4CtJWPDLSdSxnZ9XnqbmTSKMH7nFcdx_EWkLh3t3586y26A8JsTMAbHyA"
    }
  ]);
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);
  const [newServiceForm, setNewServiceForm] = useState({
    name: '',
    category: 'Khẩn cấp' as const,
    deviceType: 'Máy lạnh (AC)',
    price: 500000
  });

  // --- 5. REPORTS STATE ---
  const [reportPeriod, setReportPeriod] = useState<'7days' | '1month' | '2months' | '6months' | 'thisYear'>('7days');
  const [reportNotification, setReportNotification] = useState<string | null>(null);

  // --- ACTION HANDLERS ---
  const handleAssignTechnician = (techName: string) => {
    if (!selectedOrderForAssign) return;
    setAdminOrders(prev =>
      prev.map(o => {
        if (o.id === selectedOrderForAssign) {
          return {
            ...o,
            tech: techName,
            status: "Đang xử lý",
            category: "processing"
          };
        }
        return o;
      })
    );
    setSelectedOrderForAssign(null);
  };

  const handleCreateAdminOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrderForm.customerName.trim()) return;
    const newId = `#HVAC-${Math.floor(1000 + Math.random() * 9000)}`;
    setAdminOrders(prev => [
      {
        id: newId,
        customer: newOrderForm.customerName,
        phone: newOrderForm.phone || '0900000000',
        service: newOrderForm.serviceName,
        date: newOrderForm.dateTime,
        tech: 'Chưa chỉ định',
        status: 'Chờ xử lý',
        category: 'unassigned',
        price: Number(newOrderForm.price)
      },
      ...prev
    ]);
    setIsNewOrderModalOpen(false);
    setNewOrderForm({ customerName: '', phone: '', serviceName: 'Vệ sinh máy lạnh', dateTime: 'Hôm nay - 14:00', price: 250000 });
  };

  const handleAddTechnician = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTechForm.name.trim()) return;
    const newTech: AdminTechnician = {
      id: `tech-${Date.now()}`,
      code: `TECH-00${technicians.length + 1}`,
      name: newTechForm.name,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      skill: newTechForm.skill,
      completedOrders: 0,
      rating: 5.0,
      status: 'waiting',
      phone: newTechForm.phone || '0900000000'
    };
    setTechnicians(prev => [newTech, ...prev]);
    setIsAddTechModalOpen(false);
    setNewTechForm({ name: '', phone: '', skill: 'Sửa chữa điều hòa' });
  };

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceForm.name.trim()) return;
    const newSrv: AdminService = {
      id: `srv-${Date.now()}`,
      name: newServiceForm.name,
      category: newServiceForm.category,
      deviceType: newServiceForm.deviceType,
      price: Number(newServiceForm.price),
      imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=150'
    };
    setServices(prev => [...prev, newSrv]);
    setIsAddServiceModalOpen(false);
    setNewServiceForm({ name: '', category: 'Khẩn cấp', deviceType: 'Máy lạnh (AC)', price: 500000 });
  };

  const handleDeleteService = (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id));
  };

  const handleExportReport = () => {
    setReportNotification("Đã xuất báo cáo thành công! Tải xuống tệp CSV báo cáo tài chính.");
    setTimeout(() => setReportNotification(null), 4000);
  };

  // Filtered orders for current tab
  const filteredOrders = adminOrders.filter(o => o.category === orderTab);

  // Filtered technicians
  const filteredTechnicians = technicians.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(techSearch.toLowerCase()) || t.code.toLowerCase().includes(techSearch.toLowerCase());
    const matchesSkill = techSkillFilter === 'all' || t.skill === techSkillFilter;
    const matchesStatus = techStatusFilter === 'all' || t.status === techStatusFilter;
    return matchesSearch && matchesSkill && matchesStatus;
  });

  // Filtered customers
  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.phone.includes(customerSearch) ||
    c.email.toLowerCase().includes(customerSearch.toLowerCase())
  );

  return (
    <div className="bg-[#f9f9ff] text-[#141b2b] flex min-h-screen relative font-['Inter',sans-serif]">
      {/* Mobile Sidebar Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SideNavBar Shell */}
      <aside
        className={`flex flex-col h-full py-6 px-3 w-64 fixed left-0 top-0 bg-[#f1f3ff] border-r border-[#c1c7d3] z-50 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 transition-transform duration-300 shadow-lg lg:shadow-none`}
      >
        <div className="mb-8 px-3 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-9 h-9 bg-[#005396] rounded-full flex items-center justify-center text-white shadow-sm">
                <span className="material-symbols-outlined text-[22px]">ac_unit</span>
              </div>
              <h1 className="font-bold text-xl text-[#005396]">Climate Core</h1>
            </div>
            <p className="text-xs text-[#717783] font-medium pl-11">Engineering Trust</p>
          </div>
          <button
            className="lg:hidden p-1.5 text-[#414751] hover:bg-[#e1e8fd] rounded-lg transition-colors"
            onClick={() => setIsSidebarOpen(false)}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Sidebar Navigation Items */}
        <nav className="flex-1 space-y-1">
          <button
            onClick={() => { setAdminSubTab('requests'); setIsSidebarOpen(false); }}
            className={`flex items-center gap-3 w-full rounded-xl p-3 transition-all cursor-pointer text-left min-h-[44px] font-semibold text-sm ${
              adminSubTab === 'requests'
                ? 'bg-[#005396] text-white shadow-md'
                : 'text-[#414751] hover:bg-[#e1e8fd]'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">receipt_long</span>
            <span className="flex-grow">Dịch vụ yêu cầu</span>
            <span className="bg-[#ba1a1a] text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
              {adminOrders.filter(o => o.category === 'unassigned').length}
            </span>
          </button>

          <button
            onClick={() => { setAdminSubTab('technicians'); setIsSidebarOpen(false); }}
            className={`flex items-center gap-3 w-full rounded-xl p-3 transition-all cursor-pointer text-left min-h-[44px] font-semibold text-sm ${
              adminSubTab === 'technicians'
                ? 'bg-[#005396] text-white shadow-md'
                : 'text-[#414751] hover:bg-[#e1e8fd]'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">engineering</span>
            <span className="flex-grow">Kỹ thuật viên</span>
          </button>

          <button
            onClick={() => { setAdminSubTab('customers'); setIsSidebarOpen(false); }}
            className={`flex items-center gap-3 w-full rounded-xl p-3 transition-all cursor-pointer text-left min-h-[44px] font-semibold text-sm ${
              adminSubTab === 'customers'
                ? 'bg-[#005396] text-white shadow-md'
                : 'text-[#414751] hover:bg-[#e1e8fd]'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">group</span>
            <span className="flex-grow">Khách hàng</span>
          </button>

          <button
            onClick={() => { setAdminSubTab('services'); setIsSidebarOpen(false); }}
            className={`flex items-center gap-3 w-full rounded-xl p-3 transition-all cursor-pointer text-left min-h-[44px] font-semibold text-sm ${
              adminSubTab === 'services'
                ? 'bg-[#005396] text-white shadow-md'
                : 'text-[#414751] hover:bg-[#e1e8fd]'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">settings_suggest</span>
            <span className="flex-grow">Dịch vụ</span>
          </button>

          <button
            onClick={() => { setAdminSubTab('reports'); setIsSidebarOpen(false); }}
            className={`flex items-center gap-3 w-full rounded-xl p-3 transition-all cursor-pointer text-left min-h-[44px] font-semibold text-sm ${
              adminSubTab === 'reports'
                ? 'bg-[#005396] text-white shadow-md'
                : 'text-[#414751] hover:bg-[#e1e8fd]'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">analytics</span>
            <span className="flex-grow">Báo cáo</span>
          </button>
        </nav>

        {/* Sidebar Footer */}
        <div className="mt-auto pt-4 border-t border-[#c1c7d3] space-y-1">
          <button
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 text-[#005396] p-3 hover:bg-[#e1e8fd] transition-all cursor-pointer min-h-[44px] rounded-xl font-bold text-sm w-full text-left"
          >
            <span className="material-symbols-outlined text-[22px]">home</span>
            <span>Về giao diện Khách</span>
          </button>
          <button
            onClick={() => setActiveTab('auth')}
            className="flex items-center gap-3 text-[#ba1a1a] p-3 hover:bg-[#ffdad6] transition-all cursor-pointer min-h-[44px] rounded-xl font-bold text-sm w-full text-left"
          >
            <span className="material-symbols-outlined text-[22px]">logout</span>
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64 min-h-screen flex flex-col transition-all duration-300 w-full overflow-x-hidden">
        {/* TopNavBar Shell */}
        <header className="sticky top-0 bg-[#f9f9ff] shadow-sm z-30 border-b border-[#c1c7d3]/30">
          <div className="flex justify-between items-center px-4 md:px-8 w-full h-[72px]">
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden p-2 text-[#414751] hover:bg-[#e1e8fd] rounded-lg transition-colors"
                onClick={() => setIsSidebarOpen(true)}
              >
                <span className="material-symbols-outlined">menu</span>
              </button>
              <h2 className="text-xl md:text-2xl font-bold text-[#005396] truncate">
                {adminSubTab === 'requests' && 'Dịch vụ yêu cầu'}
                {adminSubTab === 'technicians' && 'Quản lý kỹ thuật viên'}
                {adminSubTab === 'customers' && 'Quản lý khách hàng'}
                {adminSubTab === 'services' && 'Quản lý dịch vụ'}
                {adminSubTab === 'reports' && 'Báo cáo tài chính'}
              </h2>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 border-l border-[#c1c7d3]/50 pl-4">
                <div className="text-right hidden md:block">
                  <p className="text-sm font-bold text-[#141b2b]">
                    {user?.email ? user.email.split('@')[0] : 'Admin User'}
                  </p>
                  <p className="text-xs text-[#717783] font-medium">Quản trị viên (Super Admin)</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#0f6cbd] flex items-center justify-center text-white font-bold shadow-sm">
                  AD
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Canvas */}
        <div className="flex-1 p-4 md:p-8 space-y-6">
          {/* ========================================================= */}
          {/* SUB-TAB 1: DỊCH VỤ YÊU CẦU (REQUESTS)                       */}
          {/* ========================================================= */}
          {adminSubTab === 'requests' && (
            <div className="space-y-6">
              {/* Stats Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-gray-100">
                  <p className="text-xs font-bold text-[#717783] uppercase tracking-wider mb-1">Tổng đơn hôm nay</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-[#141b2b]">24</span>
                    <span className="text-xs text-green-600 font-bold">+12%</span>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-gray-100">
                  <p className="text-xs font-bold text-[#717783] uppercase tracking-wider mb-1">Chưa phân công</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-[#914c00]">
                      {adminOrders.filter(o => o.category === 'unassigned').length}
                    </span>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-gray-100">
                  <p className="text-xs font-bold text-[#717783] uppercase tracking-wider mb-1">Đang thực hiện</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-[#005396]">
                      {adminOrders.filter(o => o.category === 'processing').length}
                    </span>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-gray-100">
                  <p className="text-xs font-bold text-[#717783] uppercase tracking-wider mb-1">Hoàn thành</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-green-600">
                      {adminOrders.filter(o => o.category === 'completed').length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Main Orders Table Card */}
              <div className="bg-white rounded-2xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col min-h-[500px]">
                {/* Tab Navigation & Controls */}
                <div className="px-4 md:px-6 pt-5 border-b border-[#c1c7d3]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3">
                  <div className="flex gap-4 overflow-x-auto whitespace-nowrap">
                    <button
                      onClick={() => setOrderTab('unassigned')}
                      className={`pb-3 text-sm font-bold transition-all border-b-2 cursor-pointer ${
                        orderTab === 'unassigned'
                          ? 'border-[#005396] text-[#005396]'
                          : 'border-transparent text-[#717783] hover:text-[#005396]'
                      }`}
                    >
                      Chưa phân công ({adminOrders.filter(o => o.category === 'unassigned').length})
                    </button>
                    <button
                      onClick={() => setOrderTab('processing')}
                      className={`pb-3 text-sm font-bold transition-all border-b-2 cursor-pointer ${
                        orderTab === 'processing'
                          ? 'border-[#005396] text-[#005396]'
                          : 'border-transparent text-[#717783] hover:text-[#005396]'
                      }`}
                    >
                      Đang xử lý ({adminOrders.filter(o => o.category === 'processing').length})
                    </button>
                    <button
                      onClick={() => setOrderTab('completed')}
                      className={`pb-3 text-sm font-bold transition-all border-b-2 cursor-pointer ${
                        orderTab === 'completed'
                          ? 'border-[#005396] text-[#005396]'
                          : 'border-transparent text-[#717783] hover:text-[#005396]'
                      }`}
                    >
                      Đã hoàn thành ({adminOrders.filter(o => o.category === 'completed').length})
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsNewOrderModalOpen(true)}
                      className="flex items-center justify-center gap-1 px-4 py-2 bg-[#ff8a00] text-white font-bold rounded-xl text-sm hover:brightness-95 transition-all shadow-sm cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">add</span> Đơn mới
                    </button>
                  </div>
                </div>

                {/* Desktop Orders Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[750px]">
                    <thead>
                      <tr className="bg-[#f1f3ff]/50 border-b border-gray-100">
                        <th className="p-4 text-xs text-[#717783] font-bold uppercase tracking-wider">Mã đơn</th>
                        <th className="p-4 text-xs text-[#717783] font-bold uppercase tracking-wider">Khách hàng</th>
                        <th className="p-4 text-xs text-[#717783] font-bold uppercase tracking-wider">Dịch vụ</th>
                        <th className="p-4 text-xs text-[#717783] font-bold uppercase tracking-wider">Ngày/Giờ</th>
                        <th className="p-4 text-xs text-[#717783] font-bold uppercase tracking-wider">Kỹ thuật viên</th>
                        <th className="p-4 text-xs text-[#717783] font-bold uppercase tracking-wider">Trạng thái</th>
                        <th className="p-4 text-xs text-[#717783] font-bold uppercase tracking-wider">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-[#f1f3ff]/40 transition-colors">
                          <td className="p-4 font-bold text-[#005396]">{order.id}</td>
                          <td className="p-4 font-semibold text-[#141b2b]">{order.customer}</td>
                          <td className="p-4 text-[#414751] font-medium">{order.service}</td>
                          <td className="p-4 text-[#414751] font-medium">{order.date}</td>
                          <td className="p-4">
                            <span className={order.tech === 'Chưa chỉ định' ? 'text-[#717783] italic' : 'font-semibold text-[#141b2b] flex items-center gap-1'}>
                              {order.tech !== 'Chưa chỉ định' && <span className="material-symbols-outlined text-[18px] text-[#005396]">person</span>}
                              {order.tech}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                              order.category === 'unassigned' ? 'bg-orange-100 text-orange-700' :
                              order.category === 'processing' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="p-4">
                            {order.category === 'unassigned' ? (
                              <button
                                onClick={() => setSelectedOrderForAssign(order.id)}
                                className="bg-[#005396] text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-sm hover:brightness-95 active:scale-95 transition-all whitespace-nowrap cursor-pointer"
                              >
                                Giao việc
                              </button>
                            ) : (
                              <span className="text-xs font-semibold text-[#005396]">Đã phân công</span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {filteredOrders.length === 0 && (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-[#717783]">
                            Không có đơn hàng nào trong danh mục này.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Orders Cards */}
                <div className="md:hidden flex flex-col p-4 space-y-3">
                  {filteredOrders.map((order) => (
                    <div key={order.id} className="bg-white border border-[#c1c7d3]/40 rounded-xl p-4 flex flex-col gap-2 shadow-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-bold text-[#005396]">{order.id}</span>
                          <h4 className="font-semibold text-[#141b2b] mt-0.5">{order.customer}</h4>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          order.category === 'unassigned' ? 'bg-orange-100 text-orange-700' :
                          order.category === 'processing' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="block text-[#717783]">Dịch vụ</span>
                          <span className="font-medium text-[#141b2b]">{order.service}</span>
                        </div>
                        <div>
                          <span className="block text-[#717783]">Thời gian</span>
                          <span className="font-medium text-[#141b2b]">{order.date}</span>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-gray-100 flex justify-between items-center">
                        <span className="text-xs text-[#717783]">KTV: <strong className="text-[#141b2b]">{order.tech}</strong></span>
                        {order.category === 'unassigned' && (
                          <button
                            onClick={() => setSelectedOrderForAssign(order.id)}
                            className="bg-[#005396] text-white px-3 py-1 rounded-lg text-xs font-bold cursor-pointer"
                          >
                            Giao việc
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {filteredOrders.length === 0 && (
                    <div className="p-6 text-center text-[#717783] text-sm">
                      Không có đơn hàng nào.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SUB-TAB 2: KỸ THUẬT VIÊN (TECHNICIANS)                    */}
          {/* ========================================================= */}
          {adminSubTab === 'technicians' && (
            <div className="space-y-6">
              {/* Header Title & Button */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <p className="text-sm text-[#717783]">Theo dõi năng suất và điều phối đội ngũ hiện trường.</p>
                </div>
                <button
                  onClick={() => setIsAddTechModalOpen(true)}
                  className="flex items-center justify-center gap-1 px-5 py-2.5 bg-[#005396] text-white rounded-xl font-bold text-sm hover:brightness-95 transition-all shadow-md cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">add</span>
                  Thêm kỹ thuật viên mới
                </button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="material-symbols-outlined p-2 bg-blue-50 text-[#005396] rounded-xl">engineering</span>
                    <span className="text-xs text-[#717783] font-bold">Tổng cộng</span>
                  </div>
                  <div className="text-3xl font-extrabold text-[#141b2b]">{technicians.length}</div>
                  <p className="text-green-600 text-xs font-bold mt-1">+2 tháng này</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="material-symbols-outlined p-2 bg-orange-50 text-[#ff8a00] rounded-xl">bolt</span>
                    <span className="text-xs text-[#717783] font-bold">Đang làm việc</span>
                  </div>
                  <div className="text-3xl font-extrabold text-[#141b2b]">
                    {technicians.filter(t => t.status === 'working').length}
                  </div>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2">
                    <div className="bg-[#ff8a00] h-full rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="material-symbols-outlined p-2 bg-gray-100 text-[#414751] rounded-xl">event_busy</span>
                    <span className="text-xs text-[#717783] font-bold">Đang nghỉ</span>
                  </div>
                  <div className="text-3xl font-extrabold text-[#141b2b]">
                    {technicians.filter(t => t.status === 'leave').length}
                  </div>
                  <p className="text-[#717783] text-xs font-medium mt-1">Lịch trình sẵn sàng</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="material-symbols-outlined p-2 bg-indigo-50 text-indigo-600 rounded-xl">pending_actions</span>
                    <span className="text-xs text-[#717783] font-bold">Đang chờ</span>
                  </div>
                  <div className="text-3xl font-extrabold text-[#141b2b]">
                    {technicians.filter(t => t.status === 'waiting').length}
                  </div>
                  <p className="text-[#ff8a00] text-xs font-bold mt-1">Cần phân bổ</p>
                </div>
              </div>

              {/* Filters & Table Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-[#f1f3ff]/30 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                  <div className="flex flex-col sm:flex-row gap-3 flex-1">
                    <div className="relative flex-1">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#717783]">search</span>
                      <input
                        type="text"
                        value={techSearch}
                        onChange={(e) => setTechSearch(e.target.value)}
                        placeholder="Tìm theo tên hoặc ID..."
                        className="w-full pl-10 pr-4 py-2 border border-[#c1c7d3] rounded-xl text-sm focus:border-[#005396] outline-none"
                      />
                    </div>
                    <select
                      value={techSkillFilter}
                      onChange={(e) => setTechSkillFilter(e.target.value)}
                      className="px-3 py-2 border border-[#c1c7d3] rounded-xl text-sm font-semibold text-[#414751]"
                    >
                      <option value="all">Kỹ năng (Tất cả)</option>
                      <option value="Sửa chữa điều hòa">Sửa chữa điều hòa</option>
                      <option value="Lắp đặt hệ thống">Lắp đặt hệ thống</option>
                      <option value="Bảo trì định kỳ">Bảo trì định kỳ</option>
                    </select>
                    <select
                      value={techStatusFilter}
                      onChange={(e) => setTechStatusFilter(e.target.value)}
                      className="px-3 py-2 border border-[#c1c7d3] rounded-xl text-sm font-semibold text-[#414751]"
                    >
                      <option value="all">Trạng thái (Tất cả)</option>
                      <option value="working">Đang làm việc</option>
                      <option value="waiting">Đang chờ</option>
                      <option value="leave">Đang nghỉ</option>
                    </select>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-[#f1f3ff]/50 border-b border-gray-100">
                        <th className="p-4 text-xs text-[#717783] font-bold uppercase">Kỹ thuật viên</th>
                        <th className="p-4 text-xs text-[#717783] font-bold uppercase">Kỹ năng chính</th>
                        <th className="p-4 text-xs text-[#717783] font-bold uppercase text-center">Đơn hoàn thành</th>
                        <th className="p-4 text-xs text-[#717783] font-bold uppercase">Đánh giá</th>
                        <th className="p-4 text-xs text-[#717783] font-bold uppercase">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredTechnicians.map((tech) => (
                        <tr key={tech.id} className="hover:bg-[#f1f3ff]/30 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <img src={tech.avatar} alt={tech.name} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                              <div>
                                <div className="font-bold text-[#141b2b]">{tech.name}</div>
                                <div className="text-xs text-[#717783]">{tech.code} • {tech.phone}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="px-3 py-1 bg-[#dce2f7] text-[#141b2b] rounded-full text-xs font-medium">
                              {tech.skill}
                            </span>
                          </td>
                          <td className="p-4 text-center font-bold text-[#141b2b]">
                            {tech.completedOrders}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1 font-bold text-[#141b2b]">
                              <span className="material-symbols-outlined text-[18px] text-[#ff8a00] fill-1">star</span>
                              <span>{tech.rating}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            {tech.status === 'working' && (
                              <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold inline-flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" /> Đang làm việc
                              </span>
                            )}
                            {tech.status === 'waiting' && (
                              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold inline-flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-blue-500" /> Đang chờ
                              </span>
                            )}
                            {tech.status === 'leave' && (
                              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold inline-flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-gray-400" /> Đang nghỉ
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SUB-TAB 3: KHÁCH HÀNG (CUSTOMERS)                          */}
          {/* ========================================================= */}
          {adminSubTab === 'customers' && (
            <div className="space-y-6">
              <div>
                <p className="text-sm text-[#717783]">Theo dõi và chăm sóc các mối quan hệ khách hàng trong hệ thống Climate Core.</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                  <div>
                    <p className="text-xs font-bold text-[#717783] mb-1">Tổng khách hàng</p>
                    <h3 className="text-2xl font-extrabold text-[#141b2b]">1,250</h3>
                    <p className="text-xs text-green-600 font-bold flex items-center gap-1 mt-1">
                      <span class="material-symbols-outlined text-[16px]">trending_up</span>
                      +5% tháng này
                    </p>
                  </div>
                  <div className="bg-[#005396]/10 p-3 rounded-2xl text-[#005396]">
                    <span className="material-symbols-outlined text-[32px]">group</span>
                  </div>
                </div>
              </div>

              {/* Filter */}
              <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#717783]">search</span>
                  <input
                    type="text"
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    placeholder="Tìm kiếm tên, SĐT, email..."
                    className="w-full pl-10 pr-4 py-2 border border-[#c1c7d3] rounded-xl text-sm focus:border-[#005396] outline-none"
                  />
                </div>
              </div>

              {/* Desktop Table */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-[#f1f3ff]/50 border-b border-gray-100">
                        <th className="p-4 text-xs font-bold text-[#717783] uppercase">Khách hàng</th>
                        <th className="p-4 text-xs font-bold text-[#717783] uppercase">Liên hệ</th>
                        <th className="p-4 text-xs font-bold text-[#717783] uppercase">Số đơn</th>
                        <th className="p-4 text-xs font-bold text-[#717783] uppercase">Dịch vụ cuối</th>
                        <th className="p-4 text-xs font-bold text-[#717783] uppercase text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredCustomers.map((cust) => {
                        const isExpanded = expandedCustomerHistory === cust.id;
                        return (
                          <React.Fragment key={cust.id}>
                            <tr className="hover:bg-[#f1f3ff]/30 transition-colors">
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <img src={cust.avatar} alt={cust.name} className="w-10 h-10 rounded-full object-cover border border-blue-200" />
                                  <div>
                                    <p className="font-bold text-[#141b2b]">{cust.name}</p>
                                    <p className="text-xs text-[#717783]">ID: {cust.code}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4">
                                <p className="font-semibold text-[#141b2b] text-sm">{cust.phone}</p>
                                <p className="text-xs text-[#717783]">{cust.email}</p>
                              </td>
                              <td className="p-4">
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#d3e3ff] text-[#001c39] font-bold text-xs">
                                  {cust.totalOrders}
                                </span>
                              </td>
                              <td className="p-4">
                                <p className="font-semibold text-[#141b2b] text-sm">{cust.lastServiceDate}</p>
                                <p className="text-xs text-[#717783]">{cust.lastServiceType}</p>
                              </td>
                              <td className="p-4 text-right">
                                <button
                                  onClick={() => setExpandedCustomerHistory(isExpanded ? null : cust.id)}
                                  className="px-4 py-1.5 bg-[#005396] text-white rounded-lg text-xs font-bold hover:bg-[#005396]/90 transition-colors cursor-pointer"
                                >
                                  {isExpanded ? 'Ẩn chi tiết' : 'Chi tiết'}
                                </button>
                              </td>
                            </tr>
                            {isExpanded && (
                              <tr className="bg-[#f1f3ff]/50">
                                <td colSpan={5} className="p-4 border-l-4 border-[#005396]">
                                  <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-2 text-sm">
                                    <p className="font-bold text-[#005396]">Thông tin chi tiết & Lịch sử:</p>
                                    <p><strong>Địa chỉ:</strong> {cust.address}</p>
                                    <p><strong>Tổng chi tiêu:</strong> {cust.totalSpend.toLocaleString('vi-VN')} VNĐ</p>
                                    <p><strong>Ghi chú:</strong> <em>{cust.notes || 'Không có'}</em></p>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Maintenance Reminder Alert */}
              <div className="bg-[#d3e3ff] p-4 rounded-2xl border border-blue-200 flex items-center gap-4">
                <div className="bg-[#005396] text-white p-2 rounded-xl shrink-0">
                  <span className="material-symbols-outlined">campaign</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-[#001c39]">Nhắc nhở bảo trì tự động</p>
                  <p className="text-xs text-[#004883]">Có 12 khách hàng sắp đến hạn bảo trì định kỳ trong 7 ngày tới.</p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SUB-TAB 4: DỊCH VỤ (SERVICES)                             */}
          {/* ========================================================= */}
          {adminSubTab === 'services' && (
            <div className="space-y-6">
              <div>
                <p className="text-sm text-[#717783]">Danh mục các dịch vụ sửa chữa và bảo trì HVAC hiện có.</p>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 bg-blue-100 text-[#005396] rounded-xl">
                      <span className="material-symbols-outlined">category</span>
                    </div>
                    <span className="text-xs font-bold text-[#005396]">+2 mới</span>
                  </div>
                  <p className="text-xs font-bold text-[#717783]">Tổng số dịch vụ</p>
                  <p className="text-3xl font-extrabold text-[#141b2b]">{services.length}</p>
                </div>

                <button
                  onClick={() => setIsAddServiceModalOpen(true)}
                  className="p-5 bg-[#005396] text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:brightness-95 transition-all cursor-pointer h-full min-h-[100px]"
                >
                  <span className="material-symbols-outlined">add</span>
                  Thêm dịch vụ mới
                </button>
              </div>

              {/* Services Table */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-[#f1f3ff]/50 border-b border-gray-100">
                        <th className="p-4 text-xs font-bold text-[#717783] uppercase">Tên dịch vụ</th>
                        <th className="p-4 text-xs font-bold text-[#717783] uppercase">Danh mục</th>
                        <th className="p-4 text-xs font-bold text-[#717783] uppercase">Loại thiết bị</th>
                        <th className="p-4 text-xs font-bold text-[#717783] uppercase">Đơn giá (VNĐ)</th>
                        <th className="p-4 text-xs font-bold text-[#717783] uppercase text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {services.map((srv) => (
                        <tr key={srv.id} className="hover:bg-[#f1f3ff]/30 transition-colors">
                          <td className="p-4 font-bold text-[#141b2b]">{srv.name}</td>
                          <td className="p-4">
                            <span className="px-3 py-1 bg-[#d3e3ff] text-[#004883] rounded-full text-xs font-bold">
                              {srv.category}
                            </span>
                          </td>
                          <td className="p-4 font-medium text-[#414751] text-sm">{srv.deviceType}</td>
                          <td className="p-4 font-bold text-[#005396]">
                            {srv.price.toLocaleString('vi-VN')} đ
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleDeleteService(srv.id)}
                              className="p-1.5 text-[#ba1a1a] hover:bg-[#ffdad6] rounded-lg transition-colors cursor-pointer"
                              title="Xóa dịch vụ"
                            >
                              <span className="material-symbols-outlined text-[20px]">delete</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SUB-TAB 5: BÁO CÁO (REPORTS)                              */}
          {/* ========================================================= */}
          {adminSubTab === 'reports' && (
            <div className="space-y-6">
              {reportNotification && (
                <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded-xl font-medium text-sm flex items-center justify-between">
                  <span>{reportNotification}</span>
                  <span className="material-symbols-outlined text-green-600">check_circle</span>
                </div>
              )}

              {/* Filters & Export */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2 bg-[#e9edff] rounded-xl p-1 overflow-x-auto">
                  <button
                    onClick={() => setReportPeriod('7days')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                      reportPeriod === '7days' ? 'bg-white text-[#005396] shadow-sm' : 'text-[#414751]'
                    }`}
                  >
                    7 ngày qua
                  </button>
                  <button
                    onClick={() => setReportPeriod('1month')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                      reportPeriod === '1month' ? 'bg-white text-[#005396] shadow-sm' : 'text-[#414751]'
                    }`}
                  >
                    1 tháng
                  </button>
                  <button
                    onClick={() => setReportPeriod('2months')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                      reportPeriod === '2months' ? 'bg-white text-[#005396] shadow-sm' : 'text-[#414751]'
                    }`}
                  >
                    2 tháng
                  </button>
                  <button
                    onClick={() => setReportPeriod('6months')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                      reportPeriod === '6months' ? 'bg-white text-[#005396] shadow-sm' : 'text-[#414751]'
                    }`}
                  >
                    6 tháng
                  </button>
                  <button
                    onClick={() => setReportPeriod('thisYear')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                      reportPeriod === 'thisYear' ? 'bg-white text-[#005396] shadow-sm' : 'text-[#414751]'
                    }`}
                  >
                    Năm nay
                  </button>
                </div>

                <button
                  onClick={handleExportReport}
                  className="flex justify-center items-center gap-2 bg-[#005396] text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md hover:bg-[#0f6cbd] transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined">download</span>
                  Xuất báo cáo
                </button>
              </div>

              {/* Financial Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 bg-[#d3e3ff] text-[#005396] rounded-xl">
                      <span className="material-symbols-outlined">payments</span>
                    </div>
                    <span className="text-[#914c00] font-bold text-sm flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">trending_up</span>
                      +12.5%
                    </span>
                  </div>
                  <p className="text-xs font-bold text-[#717783] mb-1">Tổng thu nhập</p>
                  <h3 className="text-2xl font-extrabold text-[#005396]">1.250.000.000đ</h3>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 bg-[#ffdcc4] text-[#914c00] rounded-xl">
                      <span className="material-symbols-outlined">account_balance_wallet</span>
                    </div>
                    <span className="text-[#914c00] font-bold text-sm flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">show_chart</span>
                      Ổn định
                    </span>
                  </div>
                  <p className="text-xs font-bold text-[#717783] mb-1">Tổng lợi nhuận</p>
                  <h3 className="text-2xl font-extrabold text-[#914c00]">450.000.000đ</h3>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 bg-[#e2dfff] text-[#403acc] rounded-xl">
                      <span className="material-symbols-outlined">engineering</span>
                    </div>
                    <span className="text-[#717783] text-xs font-semibold">Chi lương thợ</span>
                  </div>
                  <p className="text-xs font-bold text-[#717783] mb-1">Tổng chi phí nhân sự</p>
                  <h3 className="text-2xl font-extrabold text-[#403acc]">380.000.000đ</h3>
                </div>
              </div>

              {/* Financial Chart Bar Representation */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xl font-bold text-[#141b2b]">Xu hướng tài chính</h4>
                    <p className="text-sm text-[#717783]">So sánh thu nhập và lợi nhuận thuần</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#005396]" />
                      <span className="text-xs font-semibold text-[#717783]">Thu nhập</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#ff8a00]" />
                      <span className="text-xs font-semibold text-[#717783]">Lợi nhuận</span>
                    </div>
                  </div>
                </div>

                {/* Bars */}
                <div className="h-64 flex items-end gap-4 sm:gap-8 px-4 border-b border-gray-100 pb-2">
                  {[
                    { label: 'T2', income: '60%', profit: '25%' },
                    { label: 'T3', income: '80%', profit: '35%' },
                    { label: 'T4', income: '45%', profit: '15%' },
                    { label: 'T5', income: '95%', profit: '40%' },
                    { label: 'T6', income: '70%', profit: '30%' },
                    { label: 'T7', income: '85%', profit: '38%', active: true },
                    { label: 'CN', income: '30%', profit: '10%' }
                  ].map((bar, idx) => (
                    <div key={idx} className="flex-1 flex flex-col justify-end items-center gap-2 h-full group relative">
                      {bar.active && (
                        <div className="absolute -top-8 bg-[#141b2b] text-white text-[10px] px-2 py-0.5 rounded font-bold shadow-md">
                          Hôm nay
                        </div>
                      )}
                      <div className="w-full flex gap-1 justify-center items-end cursor-pointer h-full">
                        <div
                          style={{ height: bar.income }}
                          className={`w-3 sm:w-6 bg-[#005396] rounded-t-sm transition-all group-hover:brightness-110 ${
                            bar.active ? 'animate-pulse' : ''
                          }`}
                        />
                        <div
                          style={{ height: bar.profit }}
                          className={`w-3 sm:w-6 bg-[#ff8a00] rounded-t-sm transition-all group-hover:brightness-110 ${
                            bar.active ? 'animate-pulse' : ''
                          }`}
                        />
                      </div>
                      <span className={`text-xs font-bold ${bar.active ? 'text-[#005396]' : 'text-[#717783]'}`}>
                        {bar.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ========================================================= */}
      {/* MODALS                                                    */}
      {/* ========================================================= */}

      {/* 1. Modal Assign Technician */}
      {selectedOrderForAssign && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-bold text-lg text-[#005396]">Giao việc cho thợ</h3>
              <button
                onClick={() => setSelectedOrderForAssign(null)}
                className="p-1 text-[#717783] hover:bg-gray-100 rounded-full"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <p className="text-sm text-[#717783]">
              Chọn kỹ thuật viên phù hợp để xử lý đơn <strong className="text-[#141b2b]">{selectedOrderForAssign}</strong>
            </p>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {technicians.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-xl hover:border-[#005396] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <p className="font-bold text-sm text-[#141b2b]">{t.name}</p>
                      <p className="text-xs text-green-600 font-semibold">
                        {t.status === 'working' ? 'Đang làm việc' : t.status === 'waiting' ? 'Sẵn sàng' : 'Nghỉ phép'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAssignTechnician(t.name)}
                    className="bg-[#005396] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:brightness-95 transition-all cursor-pointer"
                  >
                    Chọn
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. Modal Create New Order */}
      {isNewOrderModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-bold text-lg text-[#005396]">Tạo đơn yêu cầu mới</h3>
              <button
                onClick={() => setIsNewOrderModalOpen(false)}
                className="p-1 text-[#717783] hover:bg-gray-100 rounded-full"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleCreateAdminOrder} className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-bold text-[#717783] mb-1">Tên khách hàng</label>
                <input
                  type="text"
                  required
                  value={newOrderForm.customerName}
                  onChange={(e) => setNewOrderForm({ ...newOrderForm, customerName: e.target.value })}
                  placeholder="Nguyễn Văn A"
                  className="w-full p-2.5 border border-[#c1c7d3] rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#717783] mb-1">Số điện thoại</label>
                <input
                  type="text"
                  required
                  value={newOrderForm.phone}
                  onChange={(e) => setNewOrderForm({ ...newOrderForm, phone: e.target.value })}
                  placeholder="0901234567"
                  className="w-full p-2.5 border border-[#c1c7d3] rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#717783] mb-1">Dịch vụ</label>
                <input
                  type="text"
                  required
                  value={newOrderForm.serviceName}
                  onChange={(e) => setNewOrderForm({ ...newOrderForm, serviceName: e.target.value })}
                  className="w-full p-2.5 border border-[#c1c7d3] rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#717783] mb-1">Chi phí ước tính (VNĐ)</label>
                <input
                  type="number"
                  value={newOrderForm.price}
                  onChange={(e) => setNewOrderForm({ ...newOrderForm, price: Number(e.target.value) })}
                  className="w-full p-2.5 border border-[#c1c7d3] rounded-xl"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewOrderModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#ff8a00] text-white rounded-xl text-xs font-bold hover:brightness-95"
                >
                  Tạo đơn
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Modal Add Technician */}
      {isAddTechModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-bold text-lg text-[#005396]">Thêm kỹ thuật viên</h3>
              <button
                onClick={() => setIsAddTechModalOpen(false)}
                className="p-1 text-[#717783] hover:bg-gray-100 rounded-full"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleAddTechnician} className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-bold text-[#717783] mb-1">Họ và tên</label>
                <input
                  type="text"
                  required
                  value={newTechForm.name}
                  onChange={(e) => setNewTechForm({ ...newTechForm, name: e.target.value })}
                  placeholder="Nguyễn Văn KTV"
                  className="w-full p-2.5 border border-[#c1c7d3] rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#717783] mb-1">Số điện thoại</label>
                <input
                  type="text"
                  required
                  value={newTechForm.phone}
                  onChange={(e) => setNewTechForm({ ...newTechForm, phone: e.target.value })}
                  placeholder="0988777666"
                  className="w-full p-2.5 border border-[#c1c7d3] rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#717783] mb-1">Kỹ năng chính</label>
                <select
                  value={newTechForm.skill}
                  onChange={(e) => setNewTechForm({ ...newTechForm, skill: e.target.value })}
                  className="w-full p-2.5 border border-[#c1c7d3] rounded-xl"
                >
                  <option value="Sửa chữa điều hòa">Sửa chữa điều hòa</option>
                  <option value="Lắp đặt hệ thống">Lắp đặt hệ thống</option>
                  <option value="Bảo trì định kỳ">Bảo trì định kỳ</option>
                </select>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddTechModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#005396] text-white rounded-xl text-xs font-bold hover:brightness-95"
                >
                  Thêm kỹ thuật viên
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Modal Add Service */}
      {isAddServiceModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-bold text-lg text-[#005396]">Thêm dịch vụ mới</h3>
              <button
                onClick={() => setIsAddServiceModalOpen(false)}
                className="p-1 text-[#717783] hover:bg-gray-100 rounded-full"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleAddService} className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-bold text-[#717783] mb-1">Tên dịch vụ</label>
                <input
                  type="text"
                  required
                  value={newServiceForm.name}
                  onChange={(e) => setNewServiceForm({ ...newServiceForm, name: e.target.value })}
                  placeholder="Vệ sinh dàn lạnh Chuyên sâu"
                  className="w-full p-2.5 border border-[#c1c7d3] rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#717783] mb-1">Danh mục</label>
                <select
                  value={newServiceForm.category}
                  onChange={(e) => setNewServiceForm({ ...newServiceForm, category: e.target.value as any })}
                  className="w-full p-2.5 border border-[#c1c7d3] rounded-xl"
                >
                  <option value="Khẩn cấp">Khẩn cấp</option>
                  <option value="Bảo trì">Bảo trì</option>
                  <option value="Trọn gói">Trọn gói</option>
                  <option value="Lắp đặt">Lắp đặt</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#717783] mb-1">Loại thiết bị</label>
                <input
                  type="text"
                  required
                  value={newServiceForm.deviceType}
                  onChange={(e) => setNewServiceForm({ ...newServiceForm, deviceType: e.target.value })}
                  placeholder="Máy lạnh (AC)"
                  className="w-full p-2.5 border border-[#c1c7d3] rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#717783] mb-1">Đơn giá (VNĐ)</label>
                <input
                  type="number"
                  required
                  value={newServiceForm.price}
                  onChange={(e) => setNewServiceForm({ ...newServiceForm, price: Number(e.target.value) })}
                  className="w-full p-2.5 border border-[#c1c7d3] rounded-xl"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddServiceModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#005396] text-white rounded-xl text-xs font-bold hover:brightness-95"
                >
                  Thêm dịch vụ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
