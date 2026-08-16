import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Logo } from './Logo';
import {
  ActiveTab,
  AdminSubTab,
  BookingRecord,
  AdminTechnician,
  AdminCustomer,
  AdminService,
  AdminOrder,
  UserProfile,
  CustomerReview,
  PurchasingOrderRecord
} from '../types';
import { User } from '@supabase/supabase-js';
import { authService } from '../services/authService';
import { commonService } from '../services/commonService';
import { purchasingService } from '../services/purchasingService';
import { SERVICE_TYPES, getServiceTypeInfo } from '../constants/serviceTypes';

interface AdminDashboardProps {
  setActiveTab: (tab: ActiveTab) => void;
  user?: User | null;
  userProfile?: UserProfile | null;
  bookings: BookingRecord[];
  onUpdateBookings?: (bookings: BookingRecord[]) => void;
  onLogout?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  setActiveTab,
  user,
  userProfile,
  bookings,
  onUpdateBookings,
  onLogout
}) => {
  const [adminSubTab, setAdminSubTab] = useState<AdminSubTab>('requests');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleAdminLogout = () => {
    authService.logout();
    if (onLogout) {
      onLogout();
    }
    setActiveTab('auth');
  };

  // --- 1. REQUESTS / ORDERS STATE ---
  const [adminOrders, setAdminOrders] = useState<AdminOrder[]>([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderDateFilter, setOrderDateFilter] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<AdminOrder | null>(null);
  const [orderDetailReview, setOrderDetailReview] = useState<CustomerReview | null>(null);
  const [isLoadingOrderReview, setIsLoadingOrderReview] = useState<boolean>(false);
  const [assigningOrder, setAssigningOrder] = useState<AdminOrder | null>(null);
  const [assignWorkerId, setAssignWorkerId] = useState<string>('');
  const [modalAssignedWorkerIds, setModalAssignedWorkerIds] = useState<number[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignModalTechSearch, setAssignModalTechSearch] = useState('');

  // --- PURCHASING SERVICE STATE ---
  const [purchasingOrders, setPurchasingOrders] = useState<PurchasingOrderRecord[]>([]);
  const [isPurchasingLoading, setIsPurchasingLoading] = useState<boolean>(false);
  const [purchasingSearch, setPurchasingSearch] = useState<string>('');
  const [purchasingDateFilter, setPurchasingDateFilter] = useState<string>('');
  const [purchasingStatusFilter, setPurchasingStatusFilter] = useState<string>('all');
  const [selectedPurchasingForDetail, setSelectedPurchasingForDetail] = useState<PurchasingOrderRecord | null>(null);
  const [editItemVerifiedPrices, setEditItemVerifiedPrices] = useState<{ [itemId: number]: number }>({});
  const [isSavingPurchasing, setIsSavingPurchasing] = useState<boolean>(false);
  const [previewPurchasingImage, setPreviewPurchasingImage] = useState<string | null>(null);

  // --- 2. TECHNICIANS STATE ---
  const [technicians, setTechnicians] = useState<AdminTechnician[]>([]);
  const [isTechLoading, setIsTechLoading] = useState(false);

  const loadAdminOrders = useCallback(async () => {
    setIsOrdersLoading(true);
    const { adminService } = await import('../services/adminService');
    const data = await adminService.fetchAdminOrders();
    setAdminOrders(data);
    setIsOrdersLoading(false);
  }, []);

  const loadPurchasingOrders = useCallback(async () => {
    setIsPurchasingLoading(true);
    const data = await purchasingService.fetchAllPurchasingOrdersForAdmin();
    setPurchasingOrders(data);
    setIsPurchasingLoading(false);
  }, []);

  const loadTechnicians = useCallback(async () => {
    setIsTechLoading(true);
    const { adminService } = await import('../services/adminService');
    const data = await adminService.fetchTechnicians();
    setTechnicians(data);
    setIsTechLoading(false);
  }, []);

  useEffect(() => {
    loadAdminOrders();
    loadPurchasingOrders();
    loadTechnicians();
  }, [loadAdminOrders, loadPurchasingOrders, loadTechnicians]);

  useEffect(() => {
    if (adminSubTab === 'requests') {
      loadAdminOrders();
      loadTechnicians();
    } else if (adminSubTab === 'purchasing') {
      loadPurchasingOrders();
    } else if (adminSubTab === 'technicians') {
      loadTechnicians();
    }
  }, [adminSubTab, loadAdminOrders, loadPurchasingOrders, loadTechnicians]);

  const [techSearch, setTechSearch] = useState("");
  const [isAddTechModalOpen, setIsAddTechModalOpen] = useState(false);
  const [editingTechId, setEditingTechId] = useState<string | null>(null);
  const [newTechForm, setNewTechForm] = useState({ first_name: "", last_name: "", phone_number: "", email: "", password: "" });

  const [viewingTechHistoryId, setViewingTechHistoryId] = useState<string | null>(null);
  const [techHistory, setTechHistory] = useState<any[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);


  // --- 3. CUSTOMERS STATE ---
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [isCustomersLoading, setIsCustomersLoading] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerProvinceFilter, setCustomerProvinceFilter] = useState('');
  const [customerWardFilter, setCustomerWardFilter] = useState('');

  // Modals state for customers
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const [newCustomerForm, setNewCustomerForm] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    house_number: '',
    street: '',
    ward: '',
    province: '',
    full_address: ''
  });

  const updateCustomerAddressFields = (fields: Partial<typeof newCustomerForm>) => {
    setNewCustomerForm(prev => {
      const updated = { ...prev, ...fields };
      const parts = [
        updated.house_number.trim(),
        updated.street.trim(),
        updated.ward.trim(),
        updated.province.trim()
      ].filter(Boolean);
      updated.full_address = parts.join(', ');
      return updated;
    });
  };

  const [selectedCustomerDetail, setSelectedCustomerDetail] = useState<AdminCustomer | null>(null);

  // Edit & Delete guest customer state
  const [editingGuestCustomer, setEditingGuestCustomer] = useState<AdminCustomer | null>(null);
  const [editCustomerForm, setEditCustomerForm] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    house_number: '',
    street: '',
    ward: '',
    province: '',
    full_address: ''
  });

  const updateEditCustomerAddressFields = (fields: Partial<typeof editCustomerForm>) => {
    setEditCustomerForm(prev => {
      const updated = { ...prev, ...fields };
      const parts = [
        updated.house_number.trim(),
        updated.street.trim(),
        updated.ward.trim(),
        updated.province.trim()
      ].filter(Boolean);
      updated.full_address = parts.join(', ');
      return updated;
    });
  };

  const handleOpenEditGuestCustomer = (cust: AdminCustomer) => {
    setEditingGuestCustomer(cust);
    setEditCustomerForm({
      first_name: cust.first_name || '',
      last_name: cust.last_name || '',
      phone_number: cust.phone || '',
      house_number: cust.house_number || '',
      street: cust.street || '',
      ward: cust.ward || '',
      province: cust.province || '',
      full_address: cust.address || ''
    });
  };

  const handleEditGuestCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGuestCustomer) return;
    if (!editCustomerForm.first_name.trim() || !editCustomerForm.last_name.trim() || !editCustomerForm.phone_number.trim()) {
      alert('Vui lòng nhập đầy đủ Họ, Tên và Số điện thoại!');
      return;
    }
    const { adminService } = await import('../services/adminService');
    const res = await adminService.updateGuestCustomer(editingGuestCustomer.numericId, editCustomerForm);
    if (res.success) {
      alert('Cập nhật thông tin khách hàng thành công!');
      setEditingGuestCustomer(null);
      if (selectedCustomerDetail && selectedCustomerDetail.id === editingGuestCustomer.id) {
        setSelectedCustomerDetail(null);
      }
      loadCustomers();
    } else {
      alert('Có lỗi xảy ra: ' + res.message);
    }
  };

  const handleDeleteGuestCustomer = async (cust: AdminCustomer) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa khách hàng vãng lai "${cust.name}" (${cust.phone}) không?`)) {
      return;
    }
    const { adminService } = await import('../services/adminService');
    const res = await adminService.deleteGuestCustomer(cust.numericId);
    if (res.success) {
      alert('Xóa khách hàng vãng lai thành công!');
      if (selectedCustomerDetail && selectedCustomerDetail.id === cust.id) {
        setSelectedCustomerDetail(null);
      }
      loadCustomers();
    } else {
      alert(res.message || 'Không thể xóa khách hàng!');
    }
  };

  const [selectedCustomerHistory, setSelectedCustomerHistory] = useState<AdminCustomer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<any[]>([]);
  const [isCustomerOrdersLoading, setIsCustomerOrdersLoading] = useState(false);

  const [createAccountCustomer, setCreateAccountCustomer] = useState<AdminCustomer | null>(null);
  const [createAccountForm, setCreateAccountForm] = useState({
    email: '',
    password: ''
  });

  const loadCustomers = () => {
    setIsCustomersLoading(true);
    import('../services/adminService').then(({ adminService }) => {
      adminService.fetchCustomers().then(data => {
        setCustomers(data);
        setIsCustomersLoading(false);
      });
    });
  };

  React.useEffect(() => {
    if (adminSubTab === 'customers') {
      loadCustomers();
    }
  }, [adminSubTab]);

  const handleViewCustomerHistory = (cust: AdminCustomer) => {
    setSelectedCustomerHistory(cust);
    setIsCustomerOrdersLoading(true);
    import('../services/adminService').then(({ adminService }) => {
      adminService.fetchCustomerOrders(cust.numericId).then(orders => {
        setCustomerOrders(orders);
        setIsCustomerOrdersLoading(false);
      });
    });
  };

  const handleAddCustomerWithoutAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerForm.first_name.trim() || !newCustomerForm.last_name.trim() || !newCustomerForm.phone_number.trim()) {
      alert('Vui lòng nhập đầy đủ Họ, Tên và Số điện thoại!');
      return;
    }
    const { adminService } = await import('../services/adminService');
    const res = await adminService.addCustomerWithoutAccount(newCustomerForm);
    if (res.success) {
      alert('Thêm khách hàng thành công!');
      setIsAddCustomerModalOpen(false);
      setNewCustomerForm({
        first_name: '',
        last_name: '',
        phone_number: '',
        house_number: '',
        street: '',
        ward: '',
        province: '',
        full_address: ''
      });
      loadCustomers();
    } else {
      alert('Có lỗi xảy ra: ' + res.message);
    }
  };

  const handleOpenCreateAccount = (cust: AdminCustomer) => {
    setCreateAccountCustomer(cust);
    const suggestedEmail = cust.email && !cust.email.endsWith('@guest.local') 
      ? cust.email 
      : `khach_${cust.phone.replace(/\D/g, '') || Date.now()}@gmail.com`;
    setCreateAccountForm({
      email: suggestedEmail,
      password: ''
    });
  };

  const handleCreateAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createAccountCustomer) return;
    if (!createAccountForm.email.trim() || !createAccountForm.password.trim()) {
      alert('Vui lòng nhập Email và Mật khẩu!');
      return;
    }
    const { adminService } = await import('../services/adminService');
    const res = await adminService.createCustomerAccount(createAccountCustomer.numericId, createAccountForm);
    if (res.success) {
      alert('Tạo tài khoản thành công cho khách hàng ' + createAccountCustomer.name + '!');
      setCreateAccountCustomer(null);
      setCreateAccountForm({ email: '', password: '' });
      if (selectedCustomerDetail && selectedCustomerDetail.id === createAccountCustomer.id) {
        setSelectedCustomerDetail(null);
      }
      loadCustomers();
    } else {
      alert('Có lỗi xảy ra: ' + res.message);
    }
  };

  // --- 4. SERVICES STATE ---
  const [services, setServices] = useState<AdminService[]>([]);
  const [isServicesLoading, setIsServicesLoading] = useState(false);

  React.useEffect(() => {
    if (adminSubTab === 'services') {
      setIsServicesLoading(true);
      import('../services/adminService').then(({ adminService }) => {
        adminService.fetchAdminServices().then(data => {
          setServices(data);
          setIsServicesLoading(false);
        });
      });
    }
  }, [adminSubTab]);

  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [newServiceForm, setNewServiceForm] = useState({
    name: '',
    category: 'suachua',
    deviceType: 'máy lạnh',
    price: 350000,
    note: ''
  });

  const [serviceSearch, setServiceSearch] = useState('');
  const [serviceTypeFilter, setServiceTypeFilter] = useState('all');
  const [deviceTypeFilter, setDeviceTypeFilter] = useState('all');

  // --- 5. REPORTS STATE ---
  const [reportPeriod, setReportPeriod] = useState<'7days' | '1month' | '2months' | '6months' | 'thisYear'>('7days');
  const [reportNotification, setReportNotification] = useState<string | null>(null);

  // --- ACTION HANDLERS ---

  const handleSaveTechnician = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTechForm.first_name.trim() || !newTechForm.last_name.trim()) return;
    const { adminService } = await import("../services/adminService");
    if (editingTechId) {
      const success = await adminService.updateTechnician(editingTechId, newTechForm);
      if (success) {
        setTechnicians(prev => prev.map(t => t.id === editingTechId ? { ...t, ...newTechForm } : t));
      }
    } else {
      const success = await adminService.addTechnician(newTechForm);
      if (success) {
        const data = await adminService.fetchTechnicians();
        setTechnicians(data);
      }
    }
    setIsAddTechModalOpen(false);
    setEditingTechId(null);
    setNewTechForm({ first_name: "", last_name: "", phone_number: "", email: "", password: "" });
  };

  const handleEditTechnician = (tech: AdminTechnician) => {
    setEditingTechId(tech.id);
    setNewTechForm({
      first_name: tech.first_name,
      last_name: tech.last_name,
      phone_number: tech.phone_number,
      email: tech.email,
      password: ""
    });
    setIsAddTechModalOpen(true);
  };

  const handleDeleteTechnician = async (id: string) => {
    const { adminService } = await import("../services/adminService");
    const success = await adminService.deleteTechnician(id);
    if (success) {
      setTechnicians(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleViewTechHistory = async (id: string) => {
    setViewingTechHistoryId(id);
    setIsHistoryLoading(true);
    const { adminService } = await import("../services/adminService");
    const history = await adminService.fetchTechnicianHistory(id);
    setTechHistory(history);
    setIsHistoryLoading(false);
  };


  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceForm.name.trim()) return;
    
    const { adminService } = await import('../services/adminService');

    if (editingServiceId) {
      const updatedService = await adminService.updateAdminService(editingServiceId, {
        name: newServiceForm.name,
        service_type: newServiceForm.category,
        device_type: newServiceForm.deviceType,
        price: Number(newServiceForm.price),
        note: newServiceForm.note
      });
      if (updatedService) {
        setServices(prev => prev.map(s => s.id === editingServiceId ? updatedService : s));
      }
    } else {
      const addedService = await adminService.addAdminService({
        name: newServiceForm.name,
        service_type: newServiceForm.category,
        device_type: newServiceForm.deviceType,
        price: Number(newServiceForm.price),
        note: newServiceForm.note
      });

      if (addedService) {
        setServices(prev => [addedService, ...prev]);
      }
    }
    
    setIsAddServiceModalOpen(false);
    setEditingServiceId(null);
    setNewServiceForm({ name: '', category: 'suachua', deviceType: 'máy lạnh', price: 350000, note: '' });
  };

  const handleEditService = (service: AdminService) => {
    setEditingServiceId(service.id);
    const serviceTypeInfo = getServiceTypeInfo(service.category);
    setNewServiceForm({
      name: service.name,
      category: serviceTypeInfo.code || 'suachua',
      deviceType: service.deviceType || 'máy lạnh',
      price: service.price || 0,
      note: service.note || ''
    });
    setIsAddServiceModalOpen(true);
  };

  const handleDeleteService = async (id: string) => {
    const { adminService } = await import('../services/adminService');
    const success = await adminService.deleteAdminService(id);
    if (success) {
      setServices(prev => prev.filter(s => s.id !== id));
    }
  };

  // --- ORDER ACTION HANDLERS ---
  const formatVND = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const formatOrderDateTime = (dateStr?: string | null) => {
    if (!dateStr) return 'Mới đặt';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${hours}:${minutes} - ${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
  };

  const handleOpenOrderDetail = (order: AdminOrder) => {
    setSelectedOrderForDetail(order);
    const ids = order.assignedWorkers && order.assignedWorkers.length > 0
      ? order.assignedWorkers.map(w => Number(w.workerId))
      : (order.workerId ? [Number(order.workerId)] : []);
    setModalAssignedWorkerIds(ids);
    setAssignWorkerId('');

    // Fetch review for this order if present
    setOrderDetailReview(null);
    setIsLoadingOrderReview(true);
    commonService.checkOrderIsReviewed(order.id).then((res) => {
      setIsLoadingOrderReview(false);
      if (res.isReviewed && res.review) {
        setOrderDetailReview(res.review);
      } else {
        setOrderDetailReview(null);
      }
    }).catch(() => {
      setIsLoadingOrderReview(false);
    });
  };

  const handleOpenAssignModal = (order: AdminOrder) => {
    if (order.status === 'completed' || order.status === 'cancelled') {
      alert(`Đơn hàng đã ${order.status === 'completed' ? 'hoàn thành' : 'hủy'}, không thể chỉnh sửa kỹ thuật viên.`);
      return;
    }
    setAssigningOrder(order);
    const ids = order.assignedWorkers && order.assignedWorkers.length > 0
      ? order.assignedWorkers.map(w => Number(w.workerId))
      : (order.workerId ? [Number(order.workerId)] : []);
    setModalAssignedWorkerIds(ids);
    setAssignWorkerId('');
    setAssignModalTechSearch('');
  };

  const filteredTechsForAssignModal = useMemo(() => {
    return technicians.filter(t => {
      const fullName = `${t.last_name || ''} ${t.first_name || ''}`.toLowerCase();
      const phone = (t.phone_number || '').toLowerCase();
      const q = assignModalTechSearch.trim().toLowerCase();
      return !q || fullName.includes(q) || phone.includes(q);
    });
  }, [technicians, assignModalTechSearch]);

  const handleAddWorkerToModal = () => {
    if (!assignWorkerId) return;
    const wId = Number(assignWorkerId);
    if (!modalAssignedWorkerIds.includes(wId)) {
      setModalAssignedWorkerIds(prev => [...prev, wId]);
      setAssignWorkerId('');
    }
  };

  const handleRemoveWorkerFromModal = (wId: number) => {
    setModalAssignedWorkerIds(prev => prev.filter(id => id !== wId));
  };

  const handleSaveAssignModal = async () => {
    const targetOrder = assigningOrder || selectedOrderForDetail;
    if (!targetOrder) return;

    if (targetOrder.status === 'completed' || targetOrder.status === 'cancelled') {
      alert(`Đơn hàng đã ${targetOrder.status === 'completed' ? 'hoàn thành' : 'hủy'}, không thể chỉnh sửa phân công kỹ thuật viên.`);
      return;
    }

    if (modalAssignedWorkerIds.length === 0) {
      if (!confirm('Chưa có kỹ thuật viên nào được chọn. Tiếp tục lưu sẽ chuyển đơn hàng về trạng thái chưa phân công. Bạn có chắc chắn?')) {
        return;
      }
    }

    setIsAssigning(true);
    const { adminService } = await import('../services/adminService');
    const res = await adminService.assignWorkersToOrder(targetOrder.id, modalAssignedWorkerIds);
    setIsAssigning(false);

    if (res.success) {
      alert(`Lưu phân công kỹ thuật viên thành công! (${modalAssignedWorkerIds.length} KTV)`);
      setAssigningOrder(null);
      setSelectedOrderForDetail(null);
      setAssignWorkerId('');
      setModalAssignedWorkerIds([]);
      loadAdminOrders();
      loadTechnicians();
    } else {
      alert(`Có lỗi xảy ra khi phân công: ${res.message}`);
    }
  };

  const handleAssignWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSaveAssignModal();
  };

  const handleUpdateOrderStatus = async (orderId: number, newStatus: 'pending' | 'verified' | 'completed' | 'cancelled') => {
    if (newStatus === 'cancelled') {
      const confirmCancel = window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?');
      if (!confirmCancel) return;
    }
    const { adminService } = await import('../services/adminService');
    const res = await adminService.updateOrderStatus(orderId, newStatus);
    if (res.success) {
      alert('Cập nhật trạng thái đơn hàng thành công!');
      if (selectedOrderForDetail && selectedOrderForDetail.id === orderId) {
        setSelectedOrderForDetail(prev => prev ? {
          ...prev,
          status: newStatus,
          statusText: newStatus === 'verified' ? 'Đã xác nhận & Phân công' : newStatus === 'completed' ? 'Hoàn thành' : newStatus === 'cancelled' ? 'Đã hủy' : 'Chờ xác nhận'
        } : null);
      }
      loadAdminOrders();
    } else {
      alert('Lỗi cập nhật trạng thái: ' + res.message);
    }
  };

  // Order Counts
  const unconfirmedOrdersCount = adminOrders.filter(o => o.status === 'pending').length;
  const needAssignOrdersCount = adminOrders.filter(o => !o.workerId || o.status === 'pending').length;
  const verifiedOrdersCount = adminOrders.filter(o => o.status === 'verified').length;
  const completedOrdersCount = adminOrders.filter(o => o.status === 'completed').length;

  // --- PURCHASING STATS & HANDLERS ---
  const purchasingPendingCount = purchasingOrders.filter(o => o.status === 'pending').length;
  const purchasingVerifiedCount = purchasingOrders.filter(o => o.status === 'verified').length;
  const purchasingCompletedCount = purchasingOrders.filter(o => o.status === 'completed').length;
  const purchasingCanceledCount = purchasingOrders.filter(o => o.status === 'canceled').length;
  const purchasingTotalDesiredPrice = purchasingOrders.reduce((sum, o) => sum + (o.totalDesiredPrice || 0), 0);
  const purchasingTotalVerifiedPrice = purchasingOrders.reduce((sum, o) => sum + (o.totalVerifiedPrice || 0), 0);

  const handleOpenPurchasingDetail = (order: PurchasingOrderRecord) => {
    setSelectedPurchasingForDetail(order);
    const initialPrices: { [itemId: number]: number } = {};
    order.details.forEach(d => {
      if (d.id) {
        initialPrices[d.id] = d.verified_price !== null ? d.verified_price : (d.desired_price || 0);
      }
    });
    setEditItemVerifiedPrices(initialPrices);
  };

  const handleUpdatePurchasingStatus = async (
    orderId: number,
    newStatus: 'pending' | 'verified' | 'completed' | 'canceled'
  ) => {
    if (newStatus === 'canceled') {
      const confirmCancel = window.confirm('Bạn có chắc chắn muốn hủy đơn thu mua này không?');
      if (!confirmCancel) return;
    }
    const res = await purchasingService.updatePurchasingOrderStatus(orderId, newStatus);
    if (res.success) {
      alert('Cập nhật trạng thái đơn thu mua thành công!');
      if (selectedPurchasingForDetail && selectedPurchasingForDetail.id === orderId) {
        setSelectedPurchasingForDetail(prev => prev ? {
          ...prev,
          status: newStatus,
          statusText: newStatus === 'verified' ? 'Đã thẩm định & Xác nhận' :
                      newStatus === 'completed' ? 'Đã hoàn thành thu mua' :
                      newStatus === 'canceled' ? 'Đã hủy' : 'Chờ thẩm định & xác nhận'
        } : null);
      }
      loadPurchasingOrders();
    } else {
      alert('Lỗi cập nhật: ' + res.message);
    }
  };

  const handleSavePurchasingItemPrices = async () => {
    if (!selectedPurchasingForDetail) return;
    setIsSavingPurchasing(true);

    try {
      // Save all updated verified prices for items
      for (const item of selectedPurchasingForDetail.details) {
        if (item.id && editItemVerifiedPrices[item.id] !== undefined) {
          await purchasingService.updatePurchasingOrderDetailPrice(
            item.id,
            editItemVerifiedPrices[item.id]
          );
        }
      }

      // If status was pending, auto promote to 'verified'
      if (selectedPurchasingForDetail.status === 'pending') {
        await purchasingService.updatePurchasingOrderStatus(selectedPurchasingForDetail.id, 'verified');
      }

      alert('Đã lưu kết quả thẩm định giá thành công!');
      await loadPurchasingOrders();

      // Update modal view
      setSelectedPurchasingForDetail(prev => {
        if (!prev) return null;
        const updatedDetails = prev.details.map(d => ({
          ...d,
          verified_price: d.id && editItemVerifiedPrices[d.id] !== undefined ? editItemVerifiedPrices[d.id] : d.verified_price
        }));
        const newTotalVerified = updatedDetails.reduce((sum, d) => sum + (d.verified_price || 0), 0);
        return {
          ...prev,
          details: updatedDetails,
          totalVerifiedPrice: newTotalVerified,
          status: prev.status === 'pending' ? 'verified' : prev.status,
          statusText: prev.status === 'pending' ? 'Đã thẩm định & Xác nhận' : prev.statusText,
        };
      });
    } catch (err: any) {
      alert('Lỗi khi lưu: ' + (err?.message || 'Không thể lưu giá thẩm định'));
    } finally {
      setIsSavingPurchasing(false);
    }
  };

  // Filtered Purchasing Orders
  const filteredPurchasingOrders = purchasingOrders.filter(order => {
    const searchLower = purchasingSearch.trim().toLowerCase();
    const matchesSearch = !searchLower ||
      order.customerName.toLowerCase().includes(searchLower) ||
      order.customerPhone.includes(searchLower) ||
      order.orderCode.toLowerCase().includes(searchLower) ||
      order.details.some(d => d.device.toLowerCase().includes(searchLower));

    let matchesDate = true;
    if (purchasingDateFilter.trim()) {
      if (order.create_at) {
        const orderDateStr = new Date(order.create_at).toISOString().split('T')[0];
        matchesDate = orderDateStr === purchasingDateFilter.trim();
      } else {
        matchesDate = false;
      }
    }

    let matchesStatus = true;
    if (purchasingStatusFilter !== 'all') {
      matchesStatus = order.status === purchasingStatusFilter;
    }

    return matchesSearch && matchesDate && matchesStatus;
  });

  // Filtered orders for current search/date/status
  const filteredAdminOrders = adminOrders.filter(order => {
    // Search
    const searchLower = orderSearch.trim().toLowerCase();
    const matchesSearch = !searchLower ||
      order.customerName.toLowerCase().includes(searchLower) ||
      order.customerPhone.includes(searchLower) ||
      order.orderCode.toLowerCase().includes(searchLower);

    // Date filter YYYY-MM-DD
    let matchesDate = true;
    if (orderDateFilter.trim()) {
      if (order.orderTime) {
        const orderDateStr = new Date(order.orderTime).toISOString().split('T')[0];
        matchesDate = orderDateStr === orderDateFilter.trim();
      } else {
        matchesDate = false;
      }
    }

    // Status filter
    let matchesStatus = true;
    if (orderStatusFilter !== 'all') {
      if (orderStatusFilter === 'unassigned') {
        matchesStatus = !order.workerId || order.status === 'pending';
      } else {
        matchesStatus = order.status === orderStatusFilter;
      }
    }

    return matchesSearch && matchesDate && matchesStatus;
  });

  // Filtered technicians
  const filteredTechnicians = technicians.filter(t => {
    return (t.last_name + " " + t.first_name).toLowerCase().includes(techSearch.toLowerCase()) || (t.phone_number || "").includes(techSearch);
  });


  // Filtered customers
  const filteredCustomers = customers.filter(c => {
    const searchLower = customerSearch.toLowerCase();
    const matchesSearch = !searchLower ||
      c.name.toLowerCase().includes(searchLower) ||
      c.phone.includes(customerSearch) ||
      c.email.toLowerCase().includes(searchLower) ||
      c.address.toLowerCase().includes(searchLower);

    const matchesProvince = !customerProvinceFilter.trim() ||
      (c.province && c.province.toLowerCase().includes(customerProvinceFilter.toLowerCase())) ||
      c.address.toLowerCase().includes(customerProvinceFilter.toLowerCase());

    const matchesWard = !customerWardFilter.trim() ||
      (c.ward && c.ward.toLowerCase().includes(customerWardFilter.toLowerCase())) ||
      c.address.toLowerCase().includes(customerWardFilter.toLowerCase());

    return matchesSearch && matchesProvince && matchesWard;
  });

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
        <div className="mb-8 px-2 flex items-center justify-between">
          <div>
            <Logo size="sm" />
            <p className="text-[11px] text-[#717783] font-medium pl-1 mt-0.5">Trang quản trị hệ thống</p>
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
          {/* Tab 1: Dịch vụ yêu cầu */}
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
              {needAssignOrdersCount}
            </span>
          </button>

          {/* Tab 2: Dịch vụ thu mua (Nằm dưới Dịch vụ yêu cầu) */}
          <button
            onClick={() => { setAdminSubTab('purchasing'); setIsSidebarOpen(false); }}
            className={`flex items-center gap-3 w-full rounded-xl p-3 transition-all cursor-pointer text-left min-h-[44px] font-semibold text-sm ${
              adminSubTab === 'purchasing'
                ? 'bg-[#005396] text-white shadow-md'
                : 'text-[#414751] hover:bg-[#e1e8fd]'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">shopping_bag</span>
            <span className="flex-grow">Dịch vụ thu mua</span>
            {purchasingPendingCount > 0 ? (
              <span className="bg-[#ff8a00] text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                {purchasingPendingCount}
              </span>
            ) : (
              <span className="bg-blue-100 text-[#005396] text-[11px] font-bold px-2 py-0.5 rounded-full">
                {purchasingOrders.length}
              </span>
            )}
          </button>

          {/* Tab 3: Kỹ thuật viên */}
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

          {/* Tab 4: Khách hàng */}
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

          {/* Tab 5: Dịch vụ */}
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
            onClick={handleAdminLogout}
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
                {adminSubTab === 'purchasing' && 'Dịch vụ thu mua thiết bị'}
                {adminSubTab === 'technicians' && 'Quản lý kỹ thuật viên'}
                {adminSubTab === 'customers' && 'Quản lý khách hàng'}
                {adminSubTab === 'services' && 'Quản lý dịch vụ'}
              </h2>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 border-l border-[#c1c7d3]/50 pl-4">
                <div className="text-right hidden md:block">
                  <p className="text-sm font-bold text-[#141b2b]">
                    {userProfile ? `${userProfile.last_name} ${userProfile.first_name}`.trim() : user?.email ? user.email.split('@')[0] : 'Admin User'}
                  </p>
                  <p className="text-xs text-[#717783] font-medium">Quản trị viên (Super Admin)</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#0f6cbd] flex items-center justify-center text-white font-bold shadow-sm uppercase">
                  {userProfile?.first_name ? userProfile.first_name.charAt(0) : 'AD'}
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
              {/* Notification Banner */}
              {(unconfirmedOrdersCount > 0 || needAssignOrdersCount > 0) && (
                <div className="bg-[#fff4e5] border border-[#ff8a00]/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#ff8a00]/10 flex items-center justify-center text-[#ff8a00] shrink-0">
                      <span className="material-symbols-outlined text-2xl">notifications_active</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-[#141b2b] text-sm">
                        Cần xử lý: Có {unconfirmedOrdersCount} đơn chưa xác nhận
                      </h4>
                      <p className="text-xs text-[#717783] mt-0.5">
                        Hiện có <strong>{unconfirmedOrdersCount}</strong> đơn mới chưa xác nhận và <strong>{needAssignOrdersCount}</strong> đơn chưa phân công kỹ thuật viên.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setOrderStatusFilter('pending')}
                    className="px-4 py-2 bg-[#ff8a00] text-white rounded-xl text-xs font-bold hover:brightness-95 transition-all whitespace-nowrap cursor-pointer shadow-sm"
                  >
                    Xem đơn chưa xác nhận
                  </button>
                </div>
              )}

              {/* Stats Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-[#717783] uppercase tracking-wider mb-1">Đơn chưa xác nhận</p>
                    <span className="text-3xl font-extrabold text-[#ba1a1a]">{unconfirmedOrdersCount}</span>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl">pending_actions</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-[#717783] uppercase tracking-wider mb-1">Chưa phân công KTV</p>
                    <span className="text-3xl font-extrabold text-[#914c00]">{needAssignOrdersCount}</span>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl">person_add</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-[#717783] uppercase tracking-wider mb-1">Đã xác nhận & Phân công</p>
                    <span className="text-3xl font-extrabold text-[#005396]">{verifiedOrdersCount}</span>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#005396] flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl">verified</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-[#717783] uppercase tracking-wider mb-1">Đã hoàn thành</p>
                    <span className="text-3xl font-extrabold text-green-600">{completedOrdersCount}</span>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl">task_alt</span>
                  </div>
                </div>
              </div>

              {/* Main Orders Table Card */}
              <div className="bg-white rounded-2xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col min-h-[500px]">
                {/* Search & Filter Header Bar */}
                <div className="p-4 md:p-5 border-b border-gray-100 bg-[#f1f3ff]/30 flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
                  <div className="flex flex-col sm:flex-row gap-3 flex-1 items-stretch sm:items-center">
                    {/* Search Input */}
                    <div className="relative flex-1">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#717783]">search</span>
                      <input
                        type="text"
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                        placeholder="Tìm kiếm theo tên khách hàng, SĐT, mã đơn..."
                        className="w-full pl-10 pr-4 py-2 border border-[#c1c7d3] rounded-xl text-sm focus:border-[#005396] outline-none bg-white"
                      />
                    </div>

                    {/* Date Picker Filter */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#717783] whitespace-nowrap">Lọc theo ngày:</span>
                      <input
                        type="date"
                        value={orderDateFilter}
                        onChange={(e) => setOrderDateFilter(e.target.value)}
                        className="px-3 py-2 border border-[#c1c7d3] rounded-xl text-xs font-semibold text-[#141b2b] bg-white outline-none focus:border-[#005396]"
                      />
                      {orderDateFilter && (
                        <button
                          onClick={() => setOrderDateFilter('')}
                          className="text-xs text-[#ba1a1a] font-bold hover:underline whitespace-nowrap cursor-pointer"
                        >
                          Xóa ngày
                        </button>
                      )}
                    </div>

                    {/* Status Dropdown Filter */}
                    <select
                      value={orderStatusFilter}
                      onChange={(e) => setOrderStatusFilter(e.target.value)}
                      className="px-3 py-2 border border-[#c1c7d3] rounded-xl text-xs font-semibold text-[#141b2b] bg-white outline-none focus:border-[#005396]"
                    >
                      <option value="all">Tất cả trạng thái</option>
                      <option value="pending">Chờ xác nhận ({unconfirmedOrdersCount})</option>
                      <option value="unassigned">Chưa phân công KTV ({needAssignOrdersCount})</option>
                      <option value="verified">Đã xác nhận ({verifiedOrdersCount})</option>
                      <option value="completed">Đã hoàn thành ({completedOrdersCount})</option>
                      <option value="cancelled">Đã hủy</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-[#717783] font-medium self-end lg:self-center">
                    <span>Hiển thị: <strong>{filteredAdminOrders.length}</strong> / {adminOrders.length} đơn</span>
                  </div>
                </div>

                {/* Loading state */}
                {isOrdersLoading ? (
                  <div className="p-12 text-center text-[#717783] flex flex-col items-center justify-center gap-2">
                    <span className="material-symbols-outlined animate-spin text-3xl text-[#005396]">sync</span>
                    <p className="text-sm font-semibold">Đang tải danh sách đơn hàng từ csdl...</p>
                  </div>
                ) : (
                  <>
                    {/* Desktop Orders Table */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-[850px]">
                        <thead>
                          <tr className="bg-[#f1f3ff]/60 border-b border-gray-100">
                            <th className="p-4 text-xs text-[#717783] font-bold uppercase tracking-wider">Khách hàng & Mã đơn</th>
                            <th className="p-4 text-xs text-[#717783] font-bold uppercase tracking-wider">Thời gian đặt</th>
                            <th className="p-4 text-xs text-[#717783] font-bold uppercase tracking-wider">Lịch hẹn & Ca làm</th>
                            <th className="p-4 text-xs text-[#717783] font-bold uppercase tracking-wider">Trạng thái</th>
                            <th className="p-4 text-xs text-[#717783] font-bold uppercase tracking-wider">Kỹ thuật viên</th>
                            <th className="p-4 text-xs text-[#717783] font-bold uppercase tracking-wider text-right">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {filteredAdminOrders.map((order) => (
                            <tr key={order.id} className="hover:bg-[#f1f3ff]/40 transition-colors">
                              <td className="p-4">
                                <div className="font-bold text-[#141b2b] text-sm">{order.customerName}</div>
                                <div className="text-xs text-[#717783] flex items-center gap-1.5 mt-0.5">
                                  <span className="font-extrabold text-[#005396] bg-blue-50 px-1.5 py-0.5 rounded">{order.orderCode}</span>
                                  <span>•</span>
                                  <span>{order.customerPhone}</span>
                                </div>
                              </td>
                              <td className="p-4 text-xs font-semibold text-[#414751]">
                                {formatOrderDateTime(order.orderTime)}
                              </td>
                              <td className="p-4 text-xs text-[#414751]">
                                <div className="font-bold text-[#141b2b]">{order.appointmentTime || 'Chưa xếp ngày'}</div>
                                <div className="text-[11px] text-[#717783] mt-0.5">{order.timeSlot}</div>
                              </td>
                              <td className="p-4">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap inline-flex items-center gap-1 ${
                                  order.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                                  order.status === 'verified' ? 'bg-blue-100 text-blue-800' :
                                  order.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                  {order.statusText}
                                </span>
                              </td>
                              <td className="p-4">
                                {order.assignedWorkers && order.assignedWorkers.length > 0 ? (
                                  <div className="flex flex-col gap-1">
                                    {order.assignedWorkers.map((w) => (
                                      <div key={w.workerId} className="flex items-center gap-1.5 text-xs font-bold text-[#141b2b]">
                                        <span className="material-symbols-outlined text-[16px] text-[#005396]">engineering</span>
                                        <span>{w.workerName}</span>
                                        <span className="text-[#d97706] font-extrabold text-[11px] bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200/80 inline-flex items-center gap-0.5">
                                          ⭐ {Number(w.workerStars || 5).toFixed(1)}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                ) : order.workerId ? (
                                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#141b2b]">
                                    <span className="material-symbols-outlined text-[18px] text-[#005396]">engineering</span>
                                    <span>{order.workerName}</span>
                                    <span className="text-[#d97706] font-extrabold text-[11px] bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200/80 inline-flex items-center gap-0.5">
                                      ⭐ {Number(order.workerStars || 5).toFixed(1)}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold italic inline-block">
                                    Chưa phân công
                                  </span>
                                )}
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => handleOpenAssignModal(order)}
                                    className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm hover:brightness-95 active:scale-95 transition-all whitespace-nowrap cursor-pointer inline-flex items-center gap-1"
                                  >
                                    <span className="material-symbols-outlined text-[16px]">engineering</span>
                                    <span>Giao việc ({order.assignedWorkers?.length || (order.workerId ? 1 : 0)})</span>
                                  </button>
                                  <button
                                    onClick={() => handleOpenOrderDetail(order)}
                                    className="bg-[#005396] hover:bg-[#003d70] text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm hover:brightness-95 active:scale-95 transition-all whitespace-nowrap cursor-pointer inline-flex items-center gap-1"
                                  >
                                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                                    <span>Chi tiết</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {filteredAdminOrders.length === 0 && (
                            <tr>
                              <td colSpan={6} className="p-12 text-center text-[#717783]">
                                <span className="material-symbols-outlined text-4xl text-gray-300 block mb-2">inbox</span>
                                Không tìm thấy đơn hàng nào phù hợp với bộ lọc.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Orders Cards */}
                    <div className="md:hidden flex flex-col p-4 space-y-3">
                      {filteredAdminOrders.map((order) => (
                        <div key={order.id} className="bg-white border border-[#c1c7d3]/40 rounded-xl p-4 flex flex-col gap-3 shadow-sm">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-extrabold text-[#005396] text-xs bg-blue-50 px-2 py-0.5 rounded">{order.orderCode}</span>
                              <h4 className="font-bold text-[#141b2b] text-base mt-1">{order.customerName}</h4>
                              <p className="text-xs text-[#717783]">{order.customerPhone}</p>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                              order.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                              order.status === 'verified' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {order.statusText}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs bg-[#f8f9ff] p-2.5 rounded-lg border border-gray-100">
                            <div>
                              <span className="block text-[#717783] text-[11px]">Thời gian đặt:</span>
                              <span className="font-semibold text-[#141b2b]">{formatOrderDateTime(order.orderTime)}</span>
                            </div>
                            <div>
                              <span className="block text-[#717783] text-[11px]">Lịch hẹn:</span>
                              <span className="font-semibold text-[#141b2b]">{order.appointmentTime || 'Chưa xếp ngày'}</span>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-gray-100 flex flex-wrap justify-between items-center gap-2">
                            <span className="text-xs text-[#717783]">
                              KTV: <strong className="text-[#141b2b]">
                                {order.assignedWorkers && order.assignedWorkers.length > 0
                                  ? order.assignedWorkers.map(w => `${w.workerName} (⭐${Number(w.workerStars || 5).toFixed(1)})`).join(', ')
                                  : (order.workerName || 'Chưa phân công')}
                              </strong>
                            </span>
                            <div className="flex items-center gap-1.5 ml-auto">
                              <button
                                onClick={() => handleOpenAssignModal(order)}
                                className="bg-amber-600 hover:bg-amber-700 text-white px-2.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer"
                              >
                                Giao việc
                              </button>
                              <button
                                onClick={() => handleOpenOrderDetail(order)}
                                className="bg-[#005396] hover:bg-[#003d70] text-white px-2.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer"
                              >
                                Chi tiết
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      {filteredAdminOrders.length === 0 && (
                        <div className="p-8 text-center text-[#717783] text-sm">
                          Không tìm thấy đơn hàng nào.
                        </div>
                      )}
                    </div>
                  </>
                )}
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
              {/* Top Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="material-symbols-outlined p-2 bg-blue-50 text-[#005396] rounded-xl">engineering</span>
                    <span className="text-xs text-[#717783] font-bold">Tổng kỹ thuật viên</span>
                  </div>
                  <div className="text-3xl font-extrabold text-[#141b2b]">{technicians.length}</div>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="material-symbols-outlined p-2 bg-amber-50 text-amber-600 rounded-xl">star</span>
                    <span className="text-xs text-[#717783] font-bold">Đánh giá trung bình</span>
                  </div>
                  <div className="text-3xl font-extrabold text-[#141b2b]">
                    {technicians.length > 0
                      ? (technicians.reduce((acc, t) => acc + Number(t.stars || 5), 0) / technicians.length).toFixed(1)
                      : '5.0'} ⭐
                  </div>
                </div>
              </div>

              {/* Filters & Table Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-[#f1f3ff]/30 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                  <div className="relative flex-1">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#717783]">search</span>
                    <input
                      type="text"
                      value={techSearch}
                      onChange={(e) => setTechSearch(e.target.value)}
                      placeholder="Tìm theo tên hoặc SĐT kỹ thuật viên..."
                      className="w-full pl-10 pr-4 py-2 border border-[#c1c7d3] rounded-xl text-sm focus:border-[#005396] outline-none"
                    />
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="bg-[#f1f3ff]/50 border-b border-gray-100">
                        <th className="p-4 text-xs text-[#717783] font-bold uppercase">Kỹ thuật viên</th>
                        <th className="p-4 text-xs text-[#717783] font-bold uppercase text-center">Đơn hoàn thành</th>
                        <th className="p-4 text-xs text-[#717783] font-bold uppercase">Đánh giá</th>
                        <th className="p-4 text-xs text-[#717783] font-bold uppercase text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {isTechLoading ? (
                        <tr>
                          <td colSpan={4} className="p-8 text-center text-[#717783] text-sm font-semibold">
                            Đang tải dữ liệu...
                          </td>
                        </tr>
                      ) : filteredTechnicians.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-8 text-center text-[#717783] text-sm font-semibold">
                            Không tìm thấy kỹ thuật viên nào
                          </td>
                        </tr>
                      ) : (
                        filteredTechnicians.map((tech) => (
                          <tr key={tech.id} className="hover:bg-[#f1f3ff]/30 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <img src={tech.avatar} alt={`${tech.last_name} ${tech.first_name}`} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                                <div>
                                  <div className="font-bold text-[#141b2b]">{tech.last_name} {tech.first_name}</div>
                                  <div className="text-xs text-[#717783]">{tech.phone_number} • {tech.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-center font-bold text-[#141b2b]">
                              {tech.completedOrders}
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-1 font-bold text-[#141b2b]">
                                <span className="material-symbols-outlined text-[18px] text-[#ff8a00] fill-1">star</span>
                                <span>{Number(tech.stars || 5).toFixed(1)}</span>
                              </div>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleViewTechHistory(tech.id)}
                                  className="px-3 py-1 bg-[#dce2f7] text-[#005396] hover:bg-[#d3e3ff] rounded-full text-xs font-bold transition-colors cursor-pointer"
                                >
                                  Lịch sử
                                </button>
                                <button
                                  onClick={() => handleEditTechnician(tech)}
                                  className="px-3 py-1 bg-gray-100 text-[#414751] hover:bg-gray-200 rounded-full text-xs font-bold transition-colors cursor-pointer"
                                >
                                  Sửa
                                </button>
                                <button
                                  onClick={() => handleDeleteTechnician(tech.id)}
                                  className="px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-full text-xs font-bold transition-colors cursor-pointer"
                                >
                                  Xóa
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
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
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold text-[#141b2b]">Quản lý khách hàng</h2>
                  <p className="text-sm text-[#717783]">Quản lý danh sách khách hàng, thông tin cá nhân và lịch sử đặt lịch dịch vụ.</p>
                </div>
                <button
                  onClick={() => setIsAddCustomerModalOpen(true)}
                  className="px-4 py-2.5 bg-[#005396] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#005396]/90 transition-all cursor-pointer shadow-sm"
                >
                  <span className="material-symbols-outlined text-[20px]">person_add</span>
                  Thêm khách hàng mới
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                  <div>
                    <p className="text-xs font-bold text-[#717783] mb-1">Tổng khách hàng</p>
                    <h3 className="text-2xl font-extrabold text-[#141b2b]">{customers.length}</h3>
                    <p className="text-xs text-blue-600 font-semibold mt-1">Hệ thống Điện lạnh Công Thương</p>
                  </div>
                  <div className="bg-[#005396]/10 p-3 rounded-2xl text-[#005396]">
                    <span className="material-symbols-outlined text-[28px]">group</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                  <div>
                    <p className="text-xs font-bold text-[#717783] mb-1">Đã có tài khoản</p>
                    <h3 className="text-2xl font-extrabold text-green-600">{customers.filter(c => c.hasAccount).length}</h3>
                    <p className="text-xs text-gray-500 font-semibold mt-1">Có email/mật khẩu</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-2xl text-green-600">
                    <span className="material-symbols-outlined text-[28px]">verified_user</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                  <div>
                    <p className="text-xs font-bold text-[#717783] mb-1">Khách vãng lai</p>
                    <h3 className="text-2xl font-extrabold text-amber-600">{customers.filter(c => !c.hasAccount).length}</h3>
                    <p className="text-xs text-amber-600 font-semibold mt-1">Chưa tạo tài khoản</p>
                  </div>
                  <div className="bg-amber-50 p-3 rounded-2xl text-amber-600">
                    <span className="material-symbols-outlined text-[28px]">person_off</span>
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
                    placeholder="Tìm kiếm tên, số điện thoại, email..."
                    className="w-full pl-10 pr-4 py-2.5 border border-[#c1c7d3] rounded-xl text-sm focus:border-[#005396] outline-none"
                  />
                </div>
                <div className="w-full md:w-56 relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#717783]">location_city</span>
                  <input
                    type="text"
                    value={customerProvinceFilter}
                    onChange={(e) => setCustomerProvinceFilter(e.target.value)}
                    placeholder="Lọc Tỉnh / Thành phố..."
                    className="w-full pl-10 pr-4 py-2.5 border border-[#c1c7d3] rounded-xl text-sm focus:border-[#005396] outline-none"
                  />
                </div>
                <div className="w-full md:w-56 relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#717783]">map</span>
                  <input
                    type="text"
                    value={customerWardFilter}
                    onChange={(e) => setCustomerWardFilter(e.target.value)}
                    placeholder="Lọc Phường / Xã..."
                    className="w-full pl-10 pr-4 py-2.5 border border-[#c1c7d3] rounded-xl text-sm focus:border-[#005396] outline-none"
                  />
                </div>
                {(customerSearch || customerProvinceFilter || customerWardFilter) && (
                  <button
                    onClick={() => {
                      setCustomerSearch('');
                      setCustomerProvinceFilter('');
                      setCustomerWardFilter('');
                    }}
                    className="px-3 py-2.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                    Xóa lọc
                  </button>
                )}
              </div>

              {/* Table */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[750px]">
                    <thead>
                      <tr className="bg-[#f1f3ff]/50 border-b border-gray-100">
                        <th className="p-4 text-xs font-bold text-[#717783] uppercase">Tên khách hàng</th>
                        <th className="p-4 text-xs font-bold text-[#717783] uppercase">Số điện thoại</th>
                        <th className="p-4 text-xs font-bold text-[#717783] uppercase">Email liên hệ</th>
                        <th className="p-4 text-xs font-bold text-[#717783] uppercase text-center">Tài khoản</th>
                        <th className="p-4 text-xs font-bold text-[#717783] uppercase text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {isCustomersLoading ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-[#717783] text-sm font-semibold">
                            Đang tải dữ liệu khách hàng...
                          </td>
                        </tr>
                      ) : filteredCustomers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-[#717783] text-sm font-semibold">
                            Không tìm thấy khách hàng nào phù hợp.
                          </td>
                        </tr>
                      ) : (
                        filteredCustomers.map((cust) => (
                          <tr key={cust.id} className="hover:bg-[#f1f3ff]/30 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <img src={cust.avatar} alt={cust.name} className="w-10 h-10 rounded-full object-cover border border-blue-200" />
                                <div>
                                  <p className="font-bold text-[#141b2b]">{cust.name}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <p className="font-bold text-[#141b2b] text-sm">{cust.phone}</p>
                            </td>
                            <td className="p-4">
                              <p className="text-sm text-[#414751]">{cust.email}</p>
                            </td>
                            <td className="p-4 text-center">
                              {cust.hasAccount ? (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                                  Đã tạo
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                  Vãng lai
                                </span>
                              )}
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex justify-end items-center gap-1.5">
                                <button
                                  onClick={() => setSelectedCustomerDetail(cust)}
                                  className="px-3 py-1.5 bg-[#dce2f7] text-[#005396] hover:bg-[#d3e3ff] rounded-full text-xs font-bold transition-colors cursor-pointer"
                                >
                                  Chi tiết
                                </button>
                                <button
                                  onClick={() => handleViewCustomerHistory(cust)}
                                  className="px-3 py-1.5 bg-[#005396] text-white hover:bg-[#005396]/90 rounded-full text-xs font-bold transition-colors cursor-pointer"
                                >
                                  Lịch sử đặt lịch
                                </button>
                                {!cust.hasAccount && (
                                  <>
                                    <button
                                      onClick={() => handleOpenEditGuestCustomer(cust)}
                                      title="Chỉnh sửa thông tin khách hàng vãng lai"
                                      className="p-1.5 text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-full text-xs font-bold transition-colors cursor-pointer flex items-center justify-center"
                                    >
                                      <span className="material-symbols-outlined text-[16px]">edit</span>
                                    </button>
                                    <button
                                      onClick={() => handleDeleteGuestCustomer(cust)}
                                      title="Xóa khách hàng vãng lai"
                                      className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-full text-xs font-bold transition-colors cursor-pointer flex items-center justify-center"
                                    >
                                      <span className="material-symbols-outlined text-[16px]">delete</span>
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
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

              {/* Services Filter */}
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#717783]">search</span>
                  <input
                    type="text"
                    placeholder="Tìm kiếm theo tên dịch vụ, ghi chú..."
                    value={serviceSearch}
                    onChange={(e) => setServiceSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-[#c1c7d3] rounded-xl text-sm focus:outline-none focus:border-[#005396]"
                  />
                </div>
                <select
                  value={serviceTypeFilter}
                  onChange={(e) => setServiceTypeFilter(e.target.value)}
                  className="px-4 py-2 border border-[#c1c7d3] rounded-xl text-sm focus:outline-none focus:border-[#005396] font-medium"
                >
                  <option value="all">Tất cả loại dịch vụ ({services.length})</option>
                  {SERVICE_TYPES.map(st => (
                    <option key={st.code} value={st.code}>
                      {st.label}
                    </option>
                  ))}
                </select>
                <select
                  value={deviceTypeFilter}
                  onChange={(e) => setDeviceTypeFilter(e.target.value)}
                  className="px-4 py-2 border border-[#c1c7d3] rounded-xl text-sm focus:outline-none focus:border-[#005396] font-medium capitalize"
                >
                  <option value="all">Tất cả thiết bị</option>
                  <option value="máy lạnh">Máy lạnh</option>
                  <option value="tủ lạnh">Tủ lạnh</option>
                  <option value="máy giặt">Máy giặt</option>
                  <option value="lò vi sóng">Lò vi sóng</option>
                  <option value="máy nước nóng">Máy nước nóng</option>
                </select>
              </div>

              {/* Services Table */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-[#f1f3ff]/50 border-b border-gray-100">
                        <th className="p-4 text-xs font-bold text-[#717783] uppercase">Tên dịch vụ</th>
                        <th className="p-4 text-xs font-bold text-[#717783] uppercase">Loại dịch vụ (service_type)</th>
                        <th className="p-4 text-xs font-bold text-[#717783] uppercase">Loại thiết bị</th>
                        <th className="p-4 text-xs font-bold text-[#717783] uppercase">Đơn giá (VNĐ)</th>
                        <th className="p-4 text-xs font-bold text-[#717783] uppercase text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {isServicesLoading ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-[#717783] text-sm font-semibold">
                            Đang tải dữ liệu dịch vụ...
                          </td>
                        </tr>
                      ) : services.filter(srv => {
                        const searchLower = serviceSearch.toLowerCase().trim();
                        const matchSearch = !searchLower ||
                          srv.name.toLowerCase().includes(searchLower) ||
                          (srv.note && srv.note.toLowerCase().includes(searchLower));

                        const typeInfo = getServiceTypeInfo(srv.category);
                        const matchType = serviceTypeFilter === 'all' ||
                          typeInfo.code === serviceTypeFilter ||
                          (srv.category || '').toLowerCase().trim() === serviceTypeFilter;

                        const srvDevice = (srv.deviceType || '').toLowerCase().trim();
                        const matchDevice = deviceTypeFilter === 'all' || srvDevice.includes(deviceTypeFilter.toLowerCase());

                        return matchSearch && matchType && matchDevice;
                      }).length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-[#717783] text-sm font-semibold">
                            Không tìm thấy dịch vụ nào phù hợp
                          </td>
                        </tr>
                      ) : (
                        services.filter(srv => {
                          const searchLower = serviceSearch.toLowerCase().trim();
                          const matchSearch = !searchLower ||
                            srv.name.toLowerCase().includes(searchLower) ||
                            (srv.note && srv.note.toLowerCase().includes(searchLower));

                          const typeInfo = getServiceTypeInfo(srv.category);
                          const matchType = serviceTypeFilter === 'all' ||
                            typeInfo.code === serviceTypeFilter ||
                            (srv.category || '').toLowerCase().trim() === serviceTypeFilter;

                          const srvDevice = (srv.deviceType || '').toLowerCase().trim();
                          const matchDevice = deviceTypeFilter === 'all' || srvDevice.includes(deviceTypeFilter.toLowerCase());

                          return matchSearch && matchType && matchDevice;
                        }).map((srv) => {
                          const typeInfo = getServiceTypeInfo(srv.category);
                          return (
                            <tr key={srv.id} className="hover:bg-[#f1f3ff]/30 transition-colors">
                              <td className="p-4">
                                <p className="font-bold text-[#141b2b]">{srv.name}</p>
                                {srv.note && <p className="text-xs text-[#717783] mt-1">{srv.note}</p>}
                              </td>
                              <td className="p-4">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${typeInfo.badgeBg}`}>
                                  <span className="material-symbols-outlined text-[16px]">{typeInfo.icon}</span>
                                  <span>{typeInfo.label}</span>
                                </span>
                              </td>
                              <td className="p-4 font-semibold text-[#414751] text-sm capitalize">{srv.deviceType}</td>
                              <td className="p-4 font-extrabold text-[#005396]">
                                {srv.price === 0 ? (
                                  <span className="text-amber-700 font-bold bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200 text-xs">
                                    Báo giá sau kiểm tra
                                  </span>
                                ) : (
                                  `${srv.price.toLocaleString('vi-VN')} đ`
                                )}
                              </td>
                              <td className="p-4 text-right flex justify-end gap-2">
                                <button
                                  onClick={() => handleEditService(srv)}
                                  className="p-1.5 text-[#005396] hover:bg-[#d3e3ff] rounded-lg transition-colors cursor-pointer"
                                  title="Sửa dịch vụ"
                                >
                                  <span className="material-symbols-outlined text-[20px]">edit</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteService(srv.id)}
                                  className="p-1.5 text-[#ba1a1a] hover:bg-[#ffdad6] rounded-lg transition-colors cursor-pointer"
                                  title="Xóa dịch vụ"
                                >
                                  <span className="material-symbols-outlined text-[20px]">delete</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SUB-TAB 5: DỊCH VỤ THU MUA (PURCHASING)                   */}
          {/* ========================================================= */}
          {adminSubTab === 'purchasing' && (
            <div className="space-y-6">
              {/* Stat Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Chờ thẩm định / xác nhận */}
                <div
                  onClick={() => setPurchasingStatusFilter('pending')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    purchasingStatusFilter === 'pending'
                      ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400 shadow-sm'
                      : 'bg-white border-gray-100 shadow-sm hover:border-amber-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#717783]">Chờ thẩm định</span>
                    <span className="p-1.5 bg-amber-100 text-amber-700 rounded-lg material-symbols-outlined text-[18px]">
                      pending_actions
                    </span>
                  </div>
                  <div className="text-2xl font-extrabold text-amber-600">
                    {purchasingPendingCount}
                  </div>
                  <p className="text-[11px] text-[#717783] mt-1">Cần xem xét và định giá</p>
                </div>

                {/* 2. Đã thẩm định & Báo giá */}
                <div
                  onClick={() => setPurchasingStatusFilter('verified')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    purchasingStatusFilter === 'verified'
                      ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-400 shadow-sm'
                      : 'bg-white border-gray-100 shadow-sm hover:border-blue-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#717783]">Đã thẩm định</span>
                    <span className="p-1.5 bg-[#d3e3ff] text-[#005396] rounded-lg material-symbols-outlined text-[18px]">
                      verified
                    </span>
                  </div>
                  <div className="text-2xl font-extrabold text-[#005396]">
                    {purchasingVerifiedCount}
                  </div>
                  <p className="text-[11px] text-[#717783] mt-1">Đã chốt giá với khách</p>
                </div>

                {/* 3. Đã hoàn thành thu mua */}
                <div
                  onClick={() => setPurchasingStatusFilter('completed')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    purchasingStatusFilter === 'completed'
                      ? 'bg-green-50 border-green-300 ring-2 ring-green-400 shadow-sm'
                      : 'bg-white border-gray-100 shadow-sm hover:border-green-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#717783]">Đã hoàn thành</span>
                    <span className="p-1.5 bg-green-100 text-green-700 rounded-lg material-symbols-outlined text-[18px]">
                      check_circle
                    </span>
                  </div>
                  <div className="text-2xl font-extrabold text-green-600">
                    {purchasingCompletedCount}
                  </div>
                  <p className="text-[11px] text-[#717783] mt-1">Đã nhận hàng và thanh toán</p>
                </div>

                {/* 4. Tổng số đơn thu mua */}
                <div
                  onClick={() => setPurchasingStatusFilter('all')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    purchasingStatusFilter === 'all'
                      ? 'bg-slate-100 border-slate-300 ring-2 ring-slate-400 shadow-sm'
                      : 'bg-white border-gray-100 shadow-sm hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#717783]">Tổng đơn thu mua</span>
                    <span className="p-1.5 bg-[#e9edff] text-[#005396] rounded-lg material-symbols-outlined text-[18px]">
                      inventory_2
                    </span>
                  </div>
                  <div className="text-2xl font-extrabold text-[#141b2b]">
                    {purchasingOrders.length}
                  </div>
                  <p className="text-[11px] text-[#717783] mt-1">Toàn bộ hồ sơ thu mua</p>
                </div>
              </div>

              {/* Financial Totals Banner */}
              <div className="bg-gradient-to-r from-[#005396] to-[#0f6cbd] text-white p-5 rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/10 backdrop-blur rounded-xl">
                    <span className="material-symbols-outlined text-[28px] text-white">price_check</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-base">Tổng giá trị đơn hàng thu mua</h3>
                    <p className="text-xs text-blue-100">Ước tính giá khách mong muốn vs. Giá trị đã thẩm định</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-white/20">
                  <div>
                    <p className="text-[11px] text-blue-100 uppercase tracking-wider font-semibold">Khách đề xuất</p>
                    <p className="text-lg font-extrabold text-amber-200">
                      {purchasingTotalDesiredPrice.toLocaleString('vi-VN')} đ
                    </p>
                  </div>
                  <div className="w-[1px] h-8 bg-white/20" />
                  <div>
                    <p className="text-[11px] text-blue-100 uppercase tracking-wider font-semibold">Đã thẩm định</p>
                    <p className="text-lg font-extrabold text-green-300">
                      {purchasingTotalVerifiedPrice.toLocaleString('vi-VN')} đ
                    </p>
                  </div>
                </div>
              </div>

              {/* Search & Filters */}
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                <div className="flex-1 flex flex-col sm:flex-row items-center gap-3">
                  {/* Search Input */}
                  <div className="relative w-full sm:w-72">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">
                      search
                    </span>
                    <input
                      type="text"
                      placeholder="Tìm mã đơn, tên, SĐT, thiết bị..."
                      value={purchasingSearch}
                      onChange={(e) => setPurchasingSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#005396] focus:bg-white transition-all"
                    />
                    {purchasingSearch && (
                      <button
                        onClick={() => setPurchasingSearch('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <span className="material-symbols-outlined text-[18px]">cancel</span>
                      </button>
                    )}
                  </div>

                  {/* Date Filter */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-xs font-bold text-[#717783] whitespace-nowrap">Ngày tạo:</span>
                    <input
                      type="date"
                      value={purchasingDateFilter}
                      onChange={(e) => setPurchasingDateFilter(e.target.value)}
                      className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#005396]"
                    />
                    {purchasingDateFilter && (
                      <button
                        onClick={() => setPurchasingDateFilter('')}
                        className="text-xs text-red-600 font-bold hover:underline"
                      >
                        Xóa
                      </button>
                    )}
                  </div>

                  {/* Status Dropdown */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-xs font-bold text-[#717783] whitespace-nowrap">Trạng thái:</span>
                    <select
                      value={purchasingStatusFilter}
                      onChange={(e) => setPurchasingStatusFilter(e.target.value)}
                      className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#005396]"
                    >
                      <option value="all">Tất cả ({purchasingOrders.length})</option>
                      <option value="pending">Chờ thẩm định ({purchasingPendingCount})</option>
                      <option value="verified">Đã thẩm định ({purchasingVerifiedCount})</option>
                      <option value="completed">Đã hoàn thành ({purchasingCompletedCount})</option>
                      <option value="canceled">Đã hủy ({purchasingCanceledCount})</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 justify-end">
                  <button
                    onClick={loadPurchasingOrders}
                    disabled={isPurchasingLoading}
                    className="flex items-center gap-1.5 px-3 py-2 bg-[#f1f3ff] hover:bg-[#e1e8fd] text-[#005396] rounded-xl text-xs font-bold transition-all cursor-pointer"
                    title="Tải lại dữ liệu"
                  >
                    <span className={`material-symbols-outlined text-[18px] ${isPurchasingLoading ? 'animate-spin' : ''}`}>
                      refresh
                    </span>
                    <span>Làm mới</span>
                  </button>
                </div>
              </div>

              {/* Purchasing Orders Table */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#f1f3ff] text-[#414751] uppercase font-extrabold tracking-wider border-b border-[#c1c7d3]/50">
                        <th className="p-4">Mã đơn & Thời gian</th>
                        <th className="p-4">Khách hàng</th>
                        <th className="p-4">Thiết bị thu mua</th>
                        <th className="p-4">Giá đề xuất / Thẩm định</th>
                        <th className="p-4">Lịch hẹn thu mua</th>
                        <th className="p-4">Trạng thái</th>
                        <th className="p-4 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {isPurchasingLoading ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-gray-500">
                            <span className="material-symbols-outlined animate-spin text-3xl text-[#005396] mb-2">
                              autorenew
                            </span>
                            <p className="font-semibold text-sm">Đang tải danh sách đơn thu mua...</p>
                          </td>
                        </tr>
                      ) : filteredPurchasingOrders.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-12 text-center text-gray-500">
                            <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">
                              inventory_2
                            </span>
                            <p className="font-bold text-[#141b2b] text-base">Không tìm thấy đơn thu mua nào</p>
                            <p className="text-xs text-[#717783] mt-1">
                              Thử điều chỉnh bộ lọc hoặc tạo yêu cầu thu mua mới từ phía khách hàng.
                            </p>
                          </td>
                        </tr>
                      ) : (
                        filteredPurchasingOrders.map((order) => {
                          const totalItems = order.details.reduce((sum, d) => sum + (d.quantity || 1), 0);
                          const isPending = order.status === 'pending';
                          const isVerified = order.status === 'verified';
                          const isCompleted = order.status === 'completed';
                          const isCanceled = order.status === 'canceled';

                          return (
                            <tr
                              key={order.id}
                              className="hover:bg-[#f1f3ff]/40 transition-colors"
                            >
                              {/* Order Code & Date */}
                              <td className="p-4 align-top">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-extrabold text-[#005396] text-sm font-mono">
                                    {order.orderCode}
                                  </span>
                                </div>
                                <p className="text-[11px] text-[#717783] mt-1 flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                                  {order.create_at
                                    ? new Date(order.create_at).toLocaleDateString('vi-VN', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric'
                                      })
                                    : '---'}
                                </p>
                              </td>

                              {/* Customer info */}
                              <td className="p-4 align-top">
                                <p className="font-bold text-[#141b2b] text-sm">{order.customerName}</p>
                                <p className="text-xs font-semibold text-[#005396] flex items-center gap-1 mt-0.5">
                                  <span className="material-symbols-outlined text-[14px]">call</span>
                                  <a href={`tel:${order.customerPhone}`} className="hover:underline">
                                    {order.customerPhone}
                                  </a>
                                </p>
                                <p className="text-[11px] text-[#717783] line-clamp-2 mt-1 max-w-[220px]" title={order.address}>
                                  📍 {order.address}
                                </p>
                              </td>

                              {/* Devices list */}
                              <td className="p-4 align-top">
                                <div className="space-y-1.5 max-w-[260px]">
                                  {order.details.map((detail, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-start justify-between gap-2 bg-[#f8f9fc] px-2 py-1 rounded-lg border border-gray-100"
                                    >
                                      <div className="flex items-center gap-1.5 truncate">
                                        <span className="material-symbols-outlined text-[16px] text-[#005396]">
                                          {detail.device === 'Tủ lạnh' ? 'kitchen' :
                                           detail.device === 'Máy giặt' ? 'local_laundry_service' : 'mode_fan'}
                                        </span>
                                        <span className="font-bold text-xs text-[#141b2b] truncate">
                                          {detail.device}
                                        </span>
                                        <span className="bg-[#e9edff] text-[#005396] text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                                          x{detail.quantity}
                                        </span>
                                      </div>
                                      <span className="text-[11px] font-bold text-amber-700 whitespace-nowrap">
                                        {(detail.desired_price || 0).toLocaleString('vi-VN')} đ
                                      </span>
                                    </div>
                                  ))}
                                  {order.note && (
                                    <p className="text-[10px] text-gray-500 italic bg-amber-50/60 px-2 py-1 rounded border border-amber-100 line-clamp-1">
                                      📝 {order.note}
                                    </p>
                                  )}
                                </div>
                              </td>

                              {/* Price breakdown */}
                              <td className="p-4 align-top whitespace-nowrap">
                                <div>
                                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Đề xuất:</span>
                                  <span className="font-bold text-amber-700 text-xs">
                                    {(order.totalDesiredPrice || 0).toLocaleString('vi-VN')} đ
                                  </span>
                                </div>
                                <div className="mt-1.5 pt-1.5 border-t border-gray-100">
                                  <span className="text-[10px] uppercase font-bold text-[#005396] block">Thẩm định:</span>
                                  {order.totalVerifiedPrice ? (
                                    <span className="font-extrabold text-green-700 text-sm">
                                      {order.totalVerifiedPrice.toLocaleString('vi-VN')} đ
                                    </span>
                                  ) : (
                                    <span className="text-[11px] text-amber-600 font-bold italic">
                                      Chưa thẩm định
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Appointment date & slot */}
                              <td className="p-4 align-top">
                                <div className="flex items-center gap-1 font-bold text-xs text-[#141b2b]">
                                  <span className="material-symbols-outlined text-[16px] text-[#005396]">
                                    event
                                  </span>
                                  <span>{order.appointment_date || 'Chưa chọn'}</span>
                                </div>
                                <div className="inline-block bg-blue-50 text-[#005396] px-2 py-0.5 rounded-full text-[11px] font-bold mt-1">
                                  ⏰ {order.timeslot}
                                </div>
                              </td>

                              {/* Status Badge */}
                              <td className="p-4 align-top">
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                                    isPending
                                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                      : isVerified
                                      ? 'bg-blue-100 text-[#005396] border border-blue-200'
                                      : isCompleted
                                      ? 'bg-green-100 text-green-800 border border-green-200'
                                      : 'bg-red-100 text-red-800 border border-red-200'
                                  }`}
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                  <span>{order.statusText}</span>
                                </span>
                              </td>

                              {/* Actions */}
                              <td className="p-4 align-top text-right">
                                <div className="flex flex-col items-end gap-1.5">
                                  <button
                                    onClick={() => handleOpenPurchasingDetail(order)}
                                    className="flex items-center gap-1 bg-[#005396] hover:bg-[#0f6cbd] text-white px-3 py-1.5 rounded-xl font-bold text-xs shadow-sm transition-all cursor-pointer whitespace-nowrap"
                                  >
                                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                                    <span>Chi tiết & Định giá</span>
                                  </button>

                                  {/* Quick status transitions */}
                                  <div className="flex items-center gap-1">
                                    {isPending && (
                                      <button
                                        onClick={() => handleUpdatePurchasingStatus(order.id, 'verified')}
                                        className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                        title="Xác nhận thẩm định"
                                      >
                                        <span className="material-symbols-outlined text-[18px]">verified</span>
                                      </button>
                                    )}
                                    {!isCompleted && !isCanceled && (
                                      <button
                                        onClick={() => handleUpdatePurchasingStatus(order.id, 'completed')}
                                        className="p-1 text-green-600 hover:bg-green-50 rounded-lg transition-colors cursor-pointer"
                                        title="Đánh dấu đã hoàn tất"
                                      >
                                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                      </button>
                                    )}
                                    {!isCanceled && !isCompleted && (
                                      <button
                                        onClick={() => handleUpdatePurchasingStatus(order.id, 'canceled')}
                                        className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                        title="Hủy đơn thu mua"
                                      >
                                        <span className="material-symbols-outlined text-[18px]">cancel</span>
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ========================================================= */}
      {/* MODALS                                                    */}
      {/* ========================================================= */}

      {/* 3. Modal Add Technician */}
      {isAddTechModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-bold text-lg text-[#005396]">{editingTechId ? "Sửa kỹ thuật viên" : "Thêm kỹ thuật viên"}</h3>
              <button
                onClick={() => { setIsAddTechModalOpen(false); setEditingTechId(null); }}
                className="p-1 text-[#717783] hover:bg-gray-100 rounded-full"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSaveTechnician} className="space-y-3 text-sm">
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-[#717783] mb-1">Họ và tên lót</label>
                  <input
                    type="text"
                    required
                    value={newTechForm.last_name}
                    onChange={(e) => setNewTechForm({ ...newTechForm, last_name: e.target.value })}
                    placeholder="Nguyễn Văn"
                    className="w-full p-2.5 border border-[#c1c7d3] rounded-xl"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-[#717783] mb-1">Tên</label>
                  <input
                    type="text"
                    required
                    value={newTechForm.first_name}
                    onChange={(e) => setNewTechForm({ ...newTechForm, first_name: e.target.value })}
                    placeholder="A"
                    className="w-full p-2.5 border border-[#c1c7d3] rounded-xl"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#717783] mb-1">Số điện thoại</label>
                <input
                  type="text"
                  required
                  value={newTechForm.phone_number}
                  onChange={(e) => setNewTechForm({ ...newTechForm, phone_number: e.target.value })}
                  placeholder="0988777666"
                  className="w-full p-2.5 border border-[#c1c7d3] rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#717783] mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={newTechForm.email}
                  onChange={(e) => setNewTechForm({ ...newTechForm, email: e.target.value })}
                  placeholder="email@example.com"
                  className="w-full p-2.5 border border-[#c1c7d3] rounded-xl"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setIsAddTechModalOpen(false); setEditingTechId(null); }}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#005396] text-white rounded-xl text-xs font-bold hover:brightness-95"
                >
                  {editingTechId ? "Cập nhật" : "Thêm kỹ thuật viên"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewingTechHistoryId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-4 max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-bold text-lg text-[#005396]">Lịch sử đơn của kỹ thuật viên</h3>
              <button
                onClick={() => setViewingTechHistoryId(null)}
                className="p-1 text-[#717783] hover:bg-gray-100 rounded-full"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="overflow-y-auto flex-1">
              {isHistoryLoading ? (
                <p className="text-center text-[#717783] text-sm py-4">Đang tải lịch sử...</p>
              ) : techHistory.length === 0 ? (
                <p className="text-center text-[#717783] text-sm py-4">Chưa có đơn nào.</p>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#f1f3ff]/50 border-b border-gray-100">
                      <th className="p-3 text-xs text-[#717783] font-bold">Mã đơn</th>
                      <th className="p-3 text-xs text-[#717783] font-bold">Dịch vụ</th>
                      <th className="p-3 text-xs text-[#717783] font-bold">Ngày thực hiện</th>
                      <th className="p-3 text-xs text-[#717783] font-bold">Giá</th>
                      <th className="p-3 text-xs text-[#717783] font-bold">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {techHistory.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="p-3 text-sm font-bold text-[#141b2b]">#{item.id}</td>
                        <td className="p-3 text-sm text-[#414751]">{item.service_name || "Dịch vụ"}</td>
                        <td className="p-3 text-sm text-[#717783]">{new Date(item.created_at).toLocaleDateString("vi-VN")}</td>
                        <td className="p-3 text-sm font-bold text-[#005396]">{item.price?.toLocaleString("vi-VN")} đ</td>
                        <td className="p-3 text-sm text-[#414751]">{item.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. Modal Add/Edit Service */}
      {isAddServiceModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-bold text-lg text-[#005396]">
                {editingServiceId ? 'Sửa dịch vụ' : 'Thêm dịch vụ mới'}
              </h3>
              <button
                onClick={() => {
                  setIsAddServiceModalOpen(false);
                  setEditingServiceId(null);
                }}
                className="p-1 text-[#717783] hover:bg-gray-100 rounded-full"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSaveService} className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-bold text-[#717783] mb-1">Tên dịch vụ</label>
                <input
                  type="text"
                  required
                  value={newServiceForm.name}
                  onChange={(e) => setNewServiceForm({ ...newServiceForm, name: e.target.value })}
                  placeholder="Lắp đặt điều hòa"
                  className="w-full p-2.5 border border-[#c1c7d3] rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#717783] mb-1">Loại dịch vụ *</label>
                <select
                  value={newServiceForm.category}
                  onChange={(e) => setNewServiceForm({ ...newServiceForm, category: e.target.value })}
                  className="w-full p-2.5 border border-[#c1c7d3] rounded-xl outline-none focus:border-[#005396] font-medium"
                >
                  {SERVICE_TYPES.map(st => (
                    <option key={st.code} value={st.code}>
                      {st.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#717783] mb-1">Loại thiết bị *</label>
                <select
                  value={newServiceForm.deviceType}
                  onChange={(e) => setNewServiceForm({ ...newServiceForm, deviceType: e.target.value })}
                  className="w-full p-2.5 border border-[#c1c7d3] rounded-xl outline-none focus:border-[#005396] font-medium capitalize"
                >
                  <option value="máy lạnh">Máy lạnh</option>
                  <option value="tủ lạnh">Tủ lạnh</option>
                  <option value="máy giặt">Máy giặt</option>
                  <option value="lò vi sóng">Lò vi sóng</option>
                  <option value="máy nước nóng">Máy nước nóng</option>
                </select>
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
              <div>
                <label className="block text-xs font-bold text-[#717783] mb-1">Ghi chú / Nội dung chi tiết dịch vụ</label>
                <textarea
                  rows={4}
                  value={newServiceForm.note}
                  onChange={(e) => setNewServiceForm({ ...newServiceForm, note: e.target.value })}
                  placeholder="Nhập ghi chú hoặc nội dung mô tả chi tiết theo từng đoạn văn..."
                  className="w-full p-2.5 border border-[#c1c7d3] rounded-xl outline-none focus:border-[#005396] font-medium text-xs sm:text-sm"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddServiceModalOpen(false);
                    setEditingServiceId(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#005396] text-white rounded-xl text-xs font-bold hover:brightness-95"
                >
                  {editingServiceId ? 'Lưu thay đổi' : 'Thêm dịch vụ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== CUSTOMER MODALS ==================== */}

      {/* 1. Modal Xem chi tiết khách hàng */}
      {selectedCustomerDetail && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div className="flex items-center gap-3">
                <img src={selectedCustomerDetail.avatar} alt={selectedCustomerDetail.name} className="w-12 h-12 rounded-full object-cover border-2 border-[#005396]" />
                <div>
                  <h3 className="font-bold text-lg text-[#141b2b]">{selectedCustomerDetail.name}</h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomerDetail(null)}
                className="p-1 text-[#717783] hover:bg-gray-100 rounded-full cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3 bg-[#f8f9ff] p-3 rounded-xl border border-gray-100">
                <div>
                  <p className="text-xs text-[#717783] font-semibold">Số điện thoại</p>
                  <p className="font-bold text-[#141b2b]">{selectedCustomerDetail.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-[#717783] font-semibold">Email liên hệ</p>
                  <p className="font-bold text-[#141b2b] truncate">{selectedCustomerDetail.email}</p>
                </div>
                <div>
                  <p className="text-xs text-[#717783] font-semibold">Năm sinh</p>
                  <p className="font-bold text-[#141b2b]">{selectedCustomerDetail.birth_year || 'Chưa cập nhật'}</p>
                </div>
                <div>
                  <p className="text-xs text-[#717783] font-semibold">Trạng thái tài khoản</p>
                  <p className="font-bold text-[#141b2b]">
                    {selectedCustomerDetail.hasAccount ? (
                      <span className="text-green-600 font-bold">Đã có tài khoản</span>
                    ) : (
                      <span className="text-amber-600 font-bold">Chưa tạo tài khoản</span>
                    )}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs text-[#717783] font-semibold mb-1">Địa chỉ giao dịch/lắp đặt</p>
                <p className="p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-[#141b2b]">
                  {selectedCustomerDetail.address || 'Chưa cập nhật địa chỉ'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 border border-gray-100 rounded-xl bg-blue-50/50">
                  <p className="text-xs text-[#717783] font-semibold">Tổng số đơn hàng</p>
                  <p className="text-lg font-extrabold text-[#005396]">{selectedCustomerDetail.totalOrders} đơn</p>
                </div>
                <div className="p-3 border border-gray-100 rounded-xl bg-green-50/50">
                  <p className="text-xs text-[#717783] font-semibold">Tổng chi tiêu tích lũy</p>
                  <p className="text-lg font-extrabold text-green-700">{selectedCustomerDetail.totalSpend.toLocaleString('vi-VN')} đ</p>
                </div>
              </div>

              {!selectedCustomerDetail.hasAccount && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex justify-between items-center gap-2">
                  <span>Khách hàng này chưa có tài khoản đăng nhập app.</span>
                  <button
                    onClick={() => handleOpenCreateAccount(selectedCustomerDetail)}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shrink-0 cursor-pointer transition-colors"
                  >
                    Tạo tài khoản
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center gap-2 pt-3 border-t border-gray-100">
              <div>
                {!selectedCustomerDetail.hasAccount && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenEditGuestCustomer(selectedCustomerDetail)}
                      className="px-3 py-2 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold hover:bg-amber-100 cursor-pointer flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                      Sửa thông tin
                    </button>
                    <button
                      onClick={() => handleDeleteGuestCustomer(selectedCustomerDetail)}
                      className="px-3 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-bold hover:bg-red-100 cursor-pointer flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                      Xóa khách hàng
                    </button>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const cust = selectedCustomerDetail;
                    setSelectedCustomerDetail(null);
                    handleViewCustomerHistory(cust);
                  }}
                  className="px-4 py-2 bg-[#005396] text-white rounded-xl text-xs font-bold hover:brightness-95 cursor-pointer"
                >
                  Lịch sử đặt lịch
                </button>
                <button
                  onClick={() => setSelectedCustomerDetail(null)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-bold hover:bg-gray-50 cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Chỉnh sửa thông tin khách hàng vãng lai */}
      {editingGuestCustomer && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-bold text-lg text-[#005396]">Chỉnh sửa thông tin khách hàng vãng lai</h3>
              <button
                onClick={() => setEditingGuestCustomer(null)}
                className="p-1 text-[#717783] hover:bg-gray-100 rounded-full cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleEditGuestCustomerSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#717783] mb-1">Họ *</label>
                  <input
                    type="text"
                    required
                    value={editCustomerForm.last_name}
                    onChange={(e) => setEditCustomerForm({ ...editCustomerForm, last_name: e.target.value })}
                    placeholder="VD: Nguyễn"
                    className="w-full p-2.5 border border-[#c1c7d3] rounded-xl outline-none focus:border-[#005396]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#717783] mb-1">Tên *</label>
                  <input
                    type="text"
                    required
                    value={editCustomerForm.first_name}
                    onChange={(e) => setEditCustomerForm({ ...editCustomerForm, first_name: e.target.value })}
                    placeholder="VD: Văn A"
                    className="w-full p-2.5 border border-[#c1c7d3] rounded-xl outline-none focus:border-[#005396]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#717783] mb-1">Số điện thoại *</label>
                <input
                  type="tel"
                  required
                  value={editCustomerForm.phone_number}
                  onChange={(e) => setEditCustomerForm({ ...editCustomerForm, phone_number: e.target.value })}
                  placeholder="0912345678"
                  className="w-full p-2.5 border border-[#c1c7d3] rounded-xl outline-none focus:border-[#005396]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#717783] mb-1">Tỉnh / Thành phố</label>
                  <input
                    type="text"
                    value={editCustomerForm.province}
                    onChange={(e) => updateEditCustomerAddressFields({ province: e.target.value })}
                    placeholder="VD: TP. Hồ Chí Minh"
                    className="w-full p-2.5 border border-[#c1c7d3] rounded-xl outline-none focus:border-[#005396]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#717783] mb-1">Phường / Xã</label>
                  <input
                    type="text"
                    value={editCustomerForm.ward}
                    onChange={(e) => updateEditCustomerAddressFields({ ward: e.target.value })}
                    placeholder="VD: Phường Bến Thành"
                    className="w-full p-2.5 border border-[#c1c7d3] rounded-xl outline-none focus:border-[#005396]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#717783] mb-1">Tên đường</label>
                  <input
                    type="text"
                    value={editCustomerForm.street}
                    onChange={(e) => updateEditCustomerAddressFields({ street: e.target.value })}
                    placeholder="VD: Lê Lợi"
                    className="w-full p-2.5 border border-[#c1c7d3] rounded-xl outline-none focus:border-[#005396]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#717783] mb-1">Số nhà</label>
                  <input
                    type="text"
                    value={editCustomerForm.house_number}
                    onChange={(e) => updateEditCustomerAddressFields({ house_number: e.target.value })}
                    placeholder="VD: 123/4"
                    className="w-full p-2.5 border border-[#c1c7d3] rounded-xl outline-none focus:border-[#005396]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#717783] mb-1">Địa chỉ đầy đủ (Tự động cập nhật)</label>
                <textarea
                  readOnly
                  rows={2}
                  value={editCustomerForm.full_address}
                  placeholder="Địa chỉ sẽ tự động cập nhật từ các thông tin trên..."
                  className="w-full p-2.5 bg-[#f8f9ff] border border-[#c1c7d3] rounded-xl text-xs font-medium text-[#005396] outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingGuestCustomer(null)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-bold hover:bg-gray-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#005396] text-white rounded-xl text-xs font-bold hover:brightness-95 cursor-pointer"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal Lịch sử đơn hàng của khách hàng */}
      {selectedCustomerHistory && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-bold text-lg text-[#005396]">Lịch sử đặt lịch của khách hàng</h3>
                <p className="text-xs text-[#717783]">Khách hàng: <strong>{selectedCustomerHistory.name}</strong> • SĐT: {selectedCustomerHistory.phone}</p>
              </div>
              <button
                onClick={() => setSelectedCustomerHistory(null)}
                className="p-1 text-[#717783] hover:bg-gray-100 rounded-full cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-3 pr-1">
              {isCustomerOrdersLoading ? (
                <p className="text-center text-[#717783] text-sm py-8">Đang tải danh sách đơn hàng...</p>
              ) : customerOrders.length === 0 ? (
                <div className="text-center py-10 space-y-2">
                  <span className="material-symbols-outlined text-[48px] text-gray-300">receipt_long</span>
                  <p className="text-[#717783] text-sm font-semibold">Khách hàng chưa có lịch sử đặt lịch nào.</p>
                </div>
              ) : (
                customerOrders.map((ord: any) => (
                  <div key={ord.id} className="border border-gray-200 rounded-2xl p-4 bg-white shadow-sm space-y-3">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-gray-100 pb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-[#005396]">Mã đơn #{ord.id}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold whitespace-nowrap shrink-0 ${
                            ord.status === 'completed' ? 'bg-green-100 text-green-800' :
                            ord.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            ord.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {ord.status_text}
                          </span>
                        </div>
                        <p className="text-xs text-[#717783] mt-0.5">
                          Thời gian đặt: {ord.order_time ? new Date(ord.order_time).toLocaleString('vi-VN') : 'N/A'}
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-xs text-[#717783]">Kỹ thuật viên phụ trách</p>
                        <p className="text-sm font-bold text-[#141b2b]">{ord.worker_name} {ord.worker_phone ? `(${ord.worker_phone})` : ''}</p>
                      </div>
                    </div>

                    {/* Service details breakdown */}
                    {ord.items && ord.items.length > 0 && (
                      <div className="bg-[#f8f9ff] p-3 rounded-xl space-y-1.5">
                        <p className="text-xs font-bold text-[#717783]">Chi tiết dịch vụ:</p>
                        {ord.items.map((it: any, i: number) => (
                          <div key={i} className="flex justify-between items-center text-xs">
                            <span className="font-semibold text-[#141b2b]">
                              • {it.service_name} {it.device_type ? `(${it.device_type})` : ''} x{it.quantity}
                            </span>
                            <span className="font-bold text-[#414751]">{Number(it.price).toLocaleString('vi-VN')} đ</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-1 text-sm">
                      <span className="text-xs font-bold text-[#717783]">Tổng thanh toán:</span>
                      <span className="text-base font-extrabold text-[#005396]">{Number(ord.total_price).toLocaleString('vi-VN')} VNĐ</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. Modal Thêm khách hàng vãng lai (không tạo tài khoản) */}
      {isAddCustomerModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-bold text-lg text-[#005396]">Thêm khách hàng vãng lai</h3>
                <p className="text-xs text-[#717783]">Tạo hồ sơ khách hàng nhanh không cần mật khẩu.</p>
              </div>
              <button
                onClick={() => setIsAddCustomerModalOpen(false)}
                className="p-1 text-[#717783] hover:bg-gray-100 rounded-full cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleAddCustomerWithoutAccount} className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#717783] mb-1">Họ *</label>
                  <input
                    type="text"
                    required
                    value={newCustomerForm.last_name}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, last_name: e.target.value })}
                    placeholder="Nguyễn"
                    className="w-full p-2.5 border border-[#c1c7d3] rounded-xl outline-none focus:border-[#005396]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#717783] mb-1">Tên *</label>
                  <input
                    type="text"
                    required
                    value={newCustomerForm.first_name}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, first_name: e.target.value })}
                    placeholder="Văn An"
                    className="w-full p-2.5 border border-[#c1c7d3] rounded-xl outline-none focus:border-[#005396]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#717783] mb-1">Số điện thoại *</label>
                <input
                  type="text"
                  required
                  value={newCustomerForm.phone_number}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, phone_number: e.target.value })}
                  placeholder="0912345678"
                  className="w-full p-2.5 border border-[#c1c7d3] rounded-xl outline-none focus:border-[#005396]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#717783] mb-1">Tỉnh / Thành phố</label>
                  <input
                    type="text"
                    value={newCustomerForm.province}
                    onChange={(e) => updateCustomerAddressFields({ province: e.target.value })}
                    placeholder="VD: TP. Hồ Chí Minh"
                    className="w-full p-2.5 border border-[#c1c7d3] rounded-xl outline-none focus:border-[#005396]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#717783] mb-1">Phường / Xã</label>
                  <input
                    type="text"
                    value={newCustomerForm.ward}
                    onChange={(e) => updateCustomerAddressFields({ ward: e.target.value })}
                    placeholder="VD: Phường Bến Thành"
                    className="w-full p-2.5 border border-[#c1c7d3] rounded-xl outline-none focus:border-[#005396]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#717783] mb-1">Tên đường</label>
                  <input
                    type="text"
                    value={newCustomerForm.street}
                    onChange={(e) => updateCustomerAddressFields({ street: e.target.value })}
                    placeholder="VD: Lê Lợi"
                    className="w-full p-2.5 border border-[#c1c7d3] rounded-xl outline-none focus:border-[#005396]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#717783] mb-1">Số nhà</label>
                  <input
                    type="text"
                    value={newCustomerForm.house_number}
                    onChange={(e) => updateCustomerAddressFields({ house_number: e.target.value })}
                    placeholder="VD: 123/4"
                    className="w-full p-2.5 border border-[#c1c7d3] rounded-xl outline-none focus:border-[#005396]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#717783] mb-1">Địa chỉ đầy đủ (Tự động cập nhật)</label>
                <textarea
                  readOnly
                  rows={2}
                  value={newCustomerForm.full_address}
                  placeholder="Địa chỉ sẽ tự động cập nhật từ các thông tin trên..."
                  className="w-full p-2.5 bg-[#f8f9ff] border border-[#c1c7d3] rounded-xl text-xs font-medium text-[#005396] outline-none"
                />
              </div>
              <p className="text-xs text-[#717783] italic bg-blue-50/70 p-2.5 rounded-xl">
                Lưu ý: Khách hàng sẽ được lưu trong hệ thống để đặt lịch. Bạn có thể tạo tài khoản đăng nhập cho họ bất cứ lúc nào.
              </p>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddCustomerModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#005396] text-white rounded-xl text-xs font-bold hover:brightness-95 cursor-pointer"
                >
                  Thêm khách hàng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Modal Tạo tài khoản cho khách hàng vãng lai */}
      {createAccountCustomer && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-bold text-lg text-[#005396]">Tạo tài khoản đăng nhập</h3>
                <p className="text-xs text-[#717783]">Cấp tài khoản cho: <strong>{createAccountCustomer.name}</strong></p>
              </div>
              <button
                onClick={() => setCreateAccountCustomer(null)}
                className="p-1 text-[#717783] hover:bg-gray-100 rounded-full cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleCreateAccountSubmit} className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-bold text-[#717783] mb-1">Email đăng nhập *</label>
                <input
                  type="email"
                  required
                  value={createAccountForm.email}
                  onChange={(e) => setCreateAccountForm({ ...createAccountForm, email: e.target.value })}
                  placeholder="khachhang@gmail.com"
                  className="w-full p-2.5 border border-[#c1c7d3] rounded-xl outline-none focus:border-[#005396]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#717783] mb-1">Mật khẩu khởi tạo *</label>
                <input
                  type="password"
                  required
                  value={createAccountForm.password}
                  onChange={(e) => setCreateAccountForm({ ...createAccountForm, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full p-2.5 border border-[#c1c7d3] rounded-xl outline-none focus:border-[#005396]"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateAccountCustomer(null)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
                >
                  Xác nhận tạo tài khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Phân công Kỹ thuật viên (Dedicated Quick Assignment Modal) */}
      {assigningOrder && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-5 my-8 max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-extrabold text-lg text-[#005396] flex items-center gap-2">
                  <span className="material-symbols-outlined text-2xl text-amber-600">engineering</span>
                  Phân công Kỹ thuật viên
                </h3>
                <p className="text-xs text-[#717783] mt-0.5">
                  Mã đơn: <span className="font-bold text-[#005396] bg-blue-50 px-2 py-0.5 rounded">{assigningOrder.orderCode}</span> — {assigningOrder.customerName} ({assigningOrder.customerPhone})
                </p>
              </div>
              <button
                type="button"
                onClick={() => { setAssigningOrder(null); setModalAssignedWorkerIds([]); }}
                className="p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 rounded-full cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Order Brief Info Card */}
            <div className="bg-[#f8f9ff] p-3.5 rounded-xl border border-blue-100 text-xs text-[#141b2b] space-y-1">
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                <div><strong className="text-[#717783]">Lịch hẹn:</strong> <span className="font-bold text-[#005396]">{assigningOrder.appointmentTime || 'Chưa xếp ngày'} ({assigningOrder.timeSlot})</span></div>
                <div><strong className="text-[#717783]">Địa chỉ:</strong> {assigningOrder.address}</div>
              </div>
              <div>
                <strong className="text-[#717783]">Dịch vụ yêu cầu:</strong> <span className="font-semibold text-gray-800">{assigningOrder.items.map(i => i.serviceName).join(', ') || 'Dịch vụ HVAC'}</span>
              </div>
            </div>

            {/* Selected Workers Banner */}
            <div className="bg-[#fff9f2] p-3 rounded-xl border border-amber-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#914c00]">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">group</span>
                  Kỹ thuật viên đã phân công ({modalAssignedWorkerIds.length})
                </span>
                {modalAssignedWorkerIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setModalAssignedWorkerIds([])}
                    className="text-red-600 hover:underline text-[11px] font-semibold cursor-pointer"
                  >
                    Bỏ chọn tất cả
                  </button>
                )}
              </div>

              {modalAssignedWorkerIds.length > 0 ? (
                <div className="flex flex-wrap gap-2 pt-1">
                  {modalAssignedWorkerIds.map(wId => {
                    const tech = technicians.find(t => Number(t.id) === wId);
                    const fromOrder = assigningOrder.assignedWorkers?.find(w => w.workerId === wId);
                    const name = tech ? `${tech.last_name} ${tech.first_name}` : (fromOrder?.workerName || `KTV #${wId}`);
                    const stars = tech ? (tech.stars || 5) : (fromOrder?.workerStars || 5);

                    return (
                      <div key={wId} className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-amber-200 text-xs shadow-sm">
                        <span className="material-symbols-outlined text-sm text-[#005396]">engineering</span>
                        <span className="font-bold text-[#141b2b]">{name}</span>
                        <span className="text-amber-600 font-extrabold text-[11px]">⭐{Number(stars).toFixed(1)}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveWorkerFromModal(wId)}
                          className="text-gray-400 hover:text-red-500 font-bold ml-1 cursor-pointer"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-amber-800 italic bg-amber-50 p-2 rounded-lg">
                  Chưa chọn KTV nào. Vui lòng nhấp vào danh sách KTV bên dưới để phân công.
                </p>
              )}
            </div>

            {/* Technician Search */}
            <div>
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 text-lg">search</span>
                <input
                  type="text"
                  placeholder="Tìm theo tên hoặc SĐT kỹ thuật viên..."
                  value={assignModalTechSearch}
                  onChange={(e) => setAssignModalTechSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-[#c1c7d3] rounded-xl text-xs font-semibold outline-none focus:border-[#005396] bg-white"
                />
              </div>
            </div>
            {/* Technician Cards Selector List */}
            <div className="flex-1 overflow-y-auto pr-1 max-h-[300px] space-y-2">
              {filteredTechsForAssignModal.map((t) => {
                const tId = Number(t.id);
                const isSelected = modalAssignedWorkerIds.includes(tId);

                return (
                  <div
                    key={t.id}
                    onClick={() => {
                      if (isSelected) {
                        handleRemoveWorkerFromModal(tId);
                      } else {
                        setModalAssignedWorkerIds(prev => [...prev, tId]);
                      }
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-50/80 border-[#005396] shadow-sm ring-1 ring-[#005396]'
                        : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-gray-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                        isSelected ? 'bg-[#005396] text-white' : 'bg-blue-100 text-[#005396]'
                      }`}>
                        {t.last_name?.charAt(0) || t.first_name?.charAt(0) || 'K'}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-[#141b2b] flex items-center gap-2">
                          <span>{t.last_name} {t.first_name}</span>
                          <span className="text-[#d97706] font-extrabold text-[11px] bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 inline-flex items-center gap-0.5">
                            ⭐ {Number(t.stars || 5).toFixed(1)}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#717783] mt-0.5">
                          <span>SĐT: {t.phone_number || 'Chưa có'}</span>
                        </div>
                      </div>
                    </div>

                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-[#005396] border-[#005396] text-white'
                        : 'border-gray-300 bg-white'
                    }`}>
                      {isSelected && <span className="material-symbols-outlined text-[16px]">check</span>}
                    </div>
                  </div>
                );
              })}

              {filteredTechsForAssignModal.length === 0 && (
                <div className="text-center p-8 text-xs text-[#717783]">
                  <span className="material-symbols-outlined text-3xl text-gray-300 block mb-1">person_search</span>
                  Không tìm thấy kỹ thuật viên nào phù hợp.
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="pt-3 border-t border-gray-100 flex flex-wrap justify-between gap-2 items-center">
              {assigningOrder.assignedWorkers && assigningOrder.assignedWorkers.length > 0 && (
                <button
                  type="button"
                  onClick={async () => {
                    if (confirm('Bạn có chắc muốn hủy tất cả phân công của đơn hàng này? Đơn hàng sẽ quay về trạng thái Chờ xác nhận.')) {
                      setIsAssigning(true);
                      const { adminService } = await import('../services/adminService');
                      const res = await adminService.assignWorkersToOrder(assigningOrder.id, []);
                      setIsAssigning(false);
                      if (res.success) {
                        await adminService.updateOrderStatus(assigningOrder.id, 'pending');
                        alert('Đã hủy phân công kỹ thuật viên!');
                        setAssigningOrder(null);
                        loadAdminOrders();
                        loadTechnicians();
                      } else {
                        alert('Lỗi: ' + res.message);
                      }
                    }
                  }}
                  className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Hủy tất cả phân công
                </button>
              )}

              <div className="flex gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => { setAssigningOrder(null); setModalAssignedWorkerIds([]); }}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Đóng
                </button>

                <button
                  type="button"
                  onClick={handleSaveAssignModal}
                  disabled={isAssigning}
                  className="px-5 py-2 bg-[#005396] hover:bg-[#003d70] disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
                  {isAssigning ? 'Đang lưu...' : `Xác nhận phân công (${modalAssignedWorkerIds.length} KTV)`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* 5. Modal Xem chi tiết đơn hàng & Phân công kỹ thuật viên */}
      {selectedOrderForDetail && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-3xl p-6 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-gray-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xl text-[#005396]">{selectedOrderForDetail.orderCode}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    selectedOrderForDetail.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                    selectedOrderForDetail.status === 'verified' ? 'bg-blue-100 text-blue-800' :
                    selectedOrderForDetail.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedOrderForDetail.statusText}
                  </span>
                </div>
                <p className="text-xs text-[#717783] mt-1">
                  Thời gian đặt đơn: <strong>{formatOrderDateTime(selectedOrderForDetail.orderTime)}</strong>
                </p>
              </div>
              <button
                onClick={() => { setSelectedOrderForDetail(null); setAssignWorkerId(''); }}
                className="p-1 text-[#717783] hover:bg-gray-100 rounded-full cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Grid: Information breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer & Address Information */}
              <div className="bg-[#f8f9ff] p-4 rounded-xl border border-[#c1c7d3]/40 space-y-2">
                <h4 className="font-bold text-[#005396] text-sm flex items-center gap-1.5 border-b border-gray-200 pb-2">
                  <span className="material-symbols-outlined text-[18px]">person</span> Thông tin khách hàng & Địa chỉ
                </h4>
                <div className="text-xs space-y-1.5 pt-1 text-[#141b2b]">
                  <p><strong className="text-[#717783]">Họ và tên:</strong> {selectedOrderForDetail.customerName}</p>
                  <p><strong className="text-[#717783]">Số điện thoại:</strong> {selectedOrderForDetail.customerPhone}</p>
                  {selectedOrderForDetail.customerEmail && (
                    <p><strong className="text-[#717783]">Email:</strong> {selectedOrderForDetail.customerEmail}</p>
                  )}
                  <p><strong className="text-[#717783]">Địa chỉ phục vụ:</strong> <span className="font-semibold text-[#005396]">{selectedOrderForDetail.address}</span></p>
                  <p><strong className="text-[#717783]">Lịch hẹn yêu cầu:</strong> {selectedOrderForDetail.appointmentTime || 'Chưa xếp ngày'} ({selectedOrderForDetail.timeSlot})</p>
                  <p><strong className="text-[#717783]">Ghi chú đơn hàng:</strong> <span className="italic text-gray-700">{selectedOrderForDetail.note || 'Không có ghi chú'}</span></p>
                </div>
              </div>

              {/* Worker & Assignment Box */}
              <div className="bg-[#fff9f2] p-4 rounded-xl border border-amber-200 space-y-3">
                <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                  <h4 className="font-bold text-[#914c00] text-sm flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px]">engineering</span>
                    Kỹ thuật viên thực hiện ({modalAssignedWorkerIds.length})
                  </h4>
                </div>

                {/* List of assigned workers for this order */}
                {modalAssignedWorkerIds.length > 0 ? (
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {modalAssignedWorkerIds.map(wId => {
                      const tech = technicians.find(t => Number(t.id) === wId);
                      const fromOrder = selectedOrderForDetail.assignedWorkers?.find(w => w.workerId === wId);
                      const name = tech ? `${tech.last_name} ${tech.first_name}` : (fromOrder?.workerName || `KTV #${wId}`);
                      const phone = tech ? tech.phone_number : (fromOrder?.workerPhone || '');
                      const stars = tech ? (tech.stars || 5) : (fromOrder?.workerStars || 5);

                      return (
                        <div key={wId} className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-amber-100 shadow-sm">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-[#005396] font-bold flex items-center justify-center text-xs">
                              {name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-xs text-[#141b2b] flex items-center gap-1.5">
                                <span>{name}</span>
                                <span className="text-[#d97706] font-extrabold text-[11px] bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 inline-flex items-center gap-0.5">
                                  ⭐ {Number(stars).toFixed(1)}
                                </span>
                              </div>
                              <p className="text-[11px] text-[#717783]">SĐT: {phone || 'Chưa có'}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-amber-800 italic bg-amber-50 p-3 rounded-lg border border-amber-200 text-center">
                    Chưa có kỹ thuật viên nào được phân công cho đơn hàng này.
                  </p>
                )}

                {(selectedOrderForDetail.status === 'completed' || selectedOrderForDetail.status === 'cancelled') && (
                  <p className="text-[11px] text-gray-500 italic bg-gray-50 p-2 rounded-lg border border-gray-200 text-center">
                    🔒 Đơn hàng đã {selectedOrderForDetail.status === 'completed' ? 'hoàn thành' : 'hủy'} — Không thể thay đổi phân công.
                  </p>
                )}
              </div>
            </div>

            {/* Services Items Table */}
            <div className="space-y-2">
              <h4 className="font-bold text-[#141b2b] text-sm flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-[#005396]">build</span> Danh sách dịch vụ trong đơn ({selectedOrderForDetail.items.length})
              </h4>
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#f1f3ff] border-b border-gray-200">
                      <th className="p-3 font-bold text-[#414751]">Tên dịch vụ</th>
                      <th className="p-3 font-bold text-[#414751] text-center">Số lượng</th>
                      <th className="p-3 font-bold text-[#414751] text-right">Đơn giá</th>
                      <th className="p-3 font-bold text-[#414751] text-right">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {selectedOrderForDetail.items.map((item, idx) => (
                      <tr key={item.id || idx} className="hover:bg-gray-50">
                        <td className="p-3">
                          <span className="font-bold text-[#141b2b]">{item.serviceName}</span>
                          {item.deviceType && (
                            <span className="block text-[11px] text-[#717783]">Loại thiết bị: {item.deviceType}</span>
                          )}
                        </td>
                        <td className="p-3 text-center font-bold text-[#141b2b]">{item.quantity}</td>
                        <td className="p-3 text-right text-gray-700 font-medium">{formatVND(item.unitPrice)}</td>
                        <td className="p-3 text-right font-bold text-[#005396]">{formatVND(item.subTotalPrice)}</td>
                      </tr>
                    ))}
                    {selectedOrderForDetail.items.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-gray-500 italic">
                          Chưa có chi tiết dịch vụ cụ thể.
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 border-t border-gray-200 font-extrabold text-sm text-[#141b2b]">
                      <td colSpan={3} className="p-3 text-right">Tổng tiền dịch vụ:</td>
                      <td className="p-3 text-right text-[#005396] text-base">{formatVND(selectedOrderForDetail.totalPrice)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Customer Review & Rating Section */}
            <div className="space-y-2 pt-3 border-t border-gray-200">
              <h4 className="font-bold text-[#141b2b] text-sm flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[20px] text-[#ff8a00]">star</span>
                Đánh giá &amp; Phản hồi từ khách hàng
              </h4>
              {isLoadingOrderReview ? (
                <div className="text-xs text-[#717783] italic p-3 bg-gray-50 rounded-xl border border-gray-200">
                  Đang kiểm tra thông tin đánh giá...
                </div>
              ) : orderDetailReview ? (
                <div className="bg-[#fffdf5] p-4 rounded-xl border border-amber-200/90 space-y-2.5 shadow-sm">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-amber-100 text-[#d97706] font-extrabold text-xs flex items-center justify-center">
                        {orderDetailReview.author?.charAt(0) || 'K'}
                      </div>
                      <span className="text-xs font-bold text-[#141b2b]">
                        {orderDetailReview.author} <span className="text-[#717783] font-normal">({orderDetailReview.date})</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 text-[#ff8a00]">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span
                          key={i}
                          className={`material-symbols-outlined text-base ${i < orderDetailReview.rating ? 'fill-1' : 'text-gray-300'}`}
                        >
                          star
                        </span>
                      ))}
                      <span className="text-xs font-extrabold text-[#141b2b] ml-1">{orderDetailReview.rating}/5 sao</span>
                    </div>
                  </div>
                  <p className="text-xs text-[#414751] bg-white p-3 rounded-xl border border-amber-100 italic leading-relaxed">
                    "{orderDetailReview.comment}"
                  </p>
                </div>
              ) : (
                <p className="text-xs text-[#717783] italic bg-gray-50 p-3 rounded-xl border border-gray-200 text-center">
                  Đơn hàng này chưa nhận được đánh giá từ khách hàng.
                </p>
              )}
            </div>

            {/* Direct Status Actions Footer */}
            <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#717783] font-bold">Chuyển trạng thái:</span>
                {selectedOrderForDetail.status !== 'completed' && (
                  <button
                    onClick={() => handleUpdateOrderStatus(selectedOrderForDetail.id, 'completed')}
                    className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
                  >
                    Hoàn thành đơn
                  </button>
                )}
                {selectedOrderForDetail.status !== 'cancelled' && selectedOrderForDetail.status !== 'completed' && (
                  <button
                    onClick={() => handleUpdateOrderStatus(selectedOrderForDetail.id, 'cancelled')}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
                  >
                    Hủy đơn hàng
                  </button>
                )}
              </div>
              <button
                onClick={() => { setSelectedOrderForDetail(null); setAssignWorkerId(''); }}
                className="px-5 py-2 border border-gray-300 rounded-xl text-xs font-bold hover:bg-gray-100 cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* PURCHASING ORDER DETAIL & APPRAISAL MODAL                */}
      {/* ========================================================= */}
      {selectedPurchasingForDetail && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-xs">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-gray-200 p-6 my-8 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-gray-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-[#d3e3ff] text-[#005396] rounded-xl material-symbols-outlined text-[20px]">
                    shopping_bag
                  </span>
                  <h3 className="font-extrabold text-xl text-[#005396]">
                    Chi tiết đơn thu mua #{selectedPurchasingForDetail.orderCode}
                  </h3>
                </div>
                <p className="text-xs text-[#717783] mt-1 pl-1">
                  Ngày gửi yêu cầu:{' '}
                  {selectedPurchasingForDetail.create_at
                    ? new Date(selectedPurchasingForDetail.create_at).toLocaleString('vi-VN')
                    : '---'}
                </p>
              </div>
              <button
                onClick={() => setSelectedPurchasingForDetail(null)}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Customer & Appointment Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Customer Box */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2 text-xs">
                <h4 className="font-bold text-[#005396] text-sm flex items-center gap-1.5 border-b border-gray-200 pb-1.5">
                  <span className="material-symbols-outlined text-[18px]">person</span>
                  Thông tin khách hàng
                </h4>
                <p><strong className="text-[#717783]">Họ và tên:</strong> {selectedPurchasingForDetail.customerName}</p>
                <p>
                  <strong className="text-[#717783]">Số điện thoại:</strong>{' '}
                  <a href={`tel:${selectedPurchasingForDetail.customerPhone}`} className="text-[#005396] font-bold hover:underline">
                    {selectedPurchasingForDetail.customerPhone}
                  </a>
                </p>
                <p><strong className="text-[#717783]">Địa chỉ thu mua:</strong> <span className="font-semibold text-[#141b2b]">{selectedPurchasingForDetail.address}</span></p>
                {selectedPurchasingForDetail.note && (
                  <p><strong className="text-[#717783]">Ghi chú chung:</strong> <span className="italic text-gray-700">{selectedPurchasingForDetail.note}</span></p>
                )}
              </div>

              {/* Appointment Box */}
              <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-200 space-y-2 text-xs">
                <h4 className="font-bold text-[#005396] text-sm flex items-center gap-1.5 border-b border-blue-200 pb-1.5">
                  <span className="material-symbols-outlined text-[18px]">event</span>
                  Lịch hẹn & Trạng thái
                </h4>
                <p>
                  <strong className="text-[#717783]">Ngày hẹn:</strong>{' '}
                  <span className="font-bold text-[#141b2b]">{selectedPurchasingForDetail.appointment_date || 'Chưa chọn ngày'}</span>
                </p>
                <p>
                  <strong className="text-[#717783]">Khung giờ:</strong>{' '}
                  <span className="font-bold text-[#005396]">{selectedPurchasingForDetail.timeslot}</span>
                </p>
                <div className="pt-1 flex items-center gap-2">
                  <strong className="text-[#717783]">Trạng thái:</strong>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      selectedPurchasingForDetail.status === 'pending'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : selectedPurchasingForDetail.status === 'verified'
                        ? 'bg-blue-100 text-[#005396] border border-blue-200'
                        : selectedPurchasingForDetail.status === 'completed'
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}
                  >
                    {selectedPurchasingForDetail.statusText}
                  </span>
                </div>
              </div>
            </div>

            {/* Devices & Appraisal Pricing Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-[#141b2b] text-sm flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-[#005396]">inventory</span>
                  Danh sách thiết bị thu mua & Thẩm định giá ({selectedPurchasingForDetail.details.length} loại)
                </h4>
                <span className="text-[11px] text-[#717783] italic">
                  * Nhập giá thẩm định cho từng thiết bị bên dưới
                </span>
              </div>

              <div className="border border-gray-200 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#f1f3ff] text-[#414751] uppercase font-bold border-b border-gray-200">
                    <tr>
                      <th className="p-3">Thiết bị & Số lượng</th>
                      <th className="p-3">Tình trạng / Mô tả của khách</th>
                      <th className="p-3 text-right">Giá khách đề xuất</th>
                      <th className="p-3 text-right">Giá thẩm định (Admin)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {selectedPurchasingForDetail.details.map((item, idx) => {
                      const currentVal = item.id && editItemVerifiedPrices[item.id] !== undefined
                        ? editItemVerifiedPrices[item.id]
                        : (item.verified_price || 0);

                      return (
                        <tr key={idx} className="hover:bg-gray-50/60">
                          <td className="p-3 align-middle">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-[20px] text-[#005396]">
                                {item.device === 'Tủ lạnh' ? 'kitchen' :
                                 item.device === 'Máy giặt' ? 'local_laundry_service' : 'mode_fan'}
                              </span>
                              <div>
                                <p className="font-bold text-sm text-[#141b2b]">{item.device}</p>
                                <p className="text-[11px] text-[#717783]">Số lượng: <strong className="text-[#005396]">{item.quantity} cái</strong></p>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 align-middle">
                            <p className="text-gray-700 italic max-w-xs bg-amber-50/50 p-2 rounded-lg border border-amber-100">
                              {item.note || 'Không có mô tả chi tiết'}
                            </p>
                            {item.previewUrls && item.previewUrls.length > 0 && (
                              <div className="mt-2 space-y-1">
                                <span className="text-[10px] font-bold text-[#005396] flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[13px]">image</span>
                                  Hình ảnh khách đã tải lên ({item.previewUrls.length}):
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                  {item.previewUrls.map((url, imgIdx) => (
                                    <button
                                      key={imgIdx}
                                      type="button"
                                      onClick={() => setPreviewPurchasingImage(url)}
                                      className="relative group w-12 h-12 rounded-lg overflow-hidden border border-gray-200 hover:border-[#005396] shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                                      title="Nhấn để phóng to ảnh"
                                    >
                                      <img
                                        src={url}
                                        alt={`Ảnh thiết bị ${imgIdx + 1}`}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                      />
                                      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors flex items-center justify-center">
                                        <span className="material-symbols-outlined text-white text-[12px] opacity-0 group-hover:opacity-100 drop-shadow">zoom_in</span>
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </td>
                          <td className="p-3 align-middle text-right font-bold text-amber-700">
                            {(item.desired_price || 0).toLocaleString('vi-VN')} đ
                          </td>
                          <td className="p-3 align-middle text-right">
                            <div className="flex items-center justify-end gap-1">
                              <input
                                type="number"
                                min={0}
                                step={50000}
                                value={currentVal}
                                onChange={(e) => {
                                  if (item.id) {
                                    const val = Math.max(0, parseInt(e.target.value) || 0);
                                    setEditItemVerifiedPrices(prev => ({
                                      ...prev,
                                      [item.id!]: val
                                    }));
                                  }
                                }}
                                className="w-32 px-2.5 py-1.5 border border-[#005396] rounded-lg text-right font-bold text-[#005396] text-xs focus:ring-2 focus:ring-[#005396]/30 focus:outline-none"
                              />
                              <span className="text-xs font-bold text-gray-500">đ</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-gray-50 font-bold border-t border-gray-200">
                    <tr>
                      <td colSpan={2} className="p-3 text-right text-xs uppercase text-[#717783]">
                        Tổng cộng:
                      </td>
                      <td className="p-3 text-right text-sm text-amber-700">
                        {(selectedPurchasingForDetail.totalDesiredPrice || 0).toLocaleString('vi-VN')} đ
                      </td>
                      <td className="p-3 text-right text-base text-green-700">
                        {selectedPurchasingForDetail.details.reduce((sum, item) => {
                          const val = item.id && editItemVerifiedPrices[item.id] !== undefined
                            ? editItemVerifiedPrices[item.id]
                            : (item.verified_price || 0);
                          return sum + val;
                        }, 0).toLocaleString('vi-VN')} đ
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Appraisal Save & Quick Status Transitions */}
            <div className="p-4 bg-[#f8f9ff] rounded-xl border border-blue-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div>
                <p className="font-bold text-xs text-[#005396]">Xác nhận giá & Cập nhật trạng thái</p>
                <p className="text-[11px] text-[#717783]">Lưu bảng giá thẩm định sẽ tự động cập nhật đơn sang 'Đã thẩm định & Xác nhận'</p>
              </div>
              <button
                onClick={handleSavePurchasingItemPrices}
                disabled={isSavingPurchasing}
                className="flex items-center justify-center gap-1.5 bg-[#005396] hover:bg-[#0f6cbd] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isSavingPurchasing ? 'hourglass_top' : 'save'}
                </span>
                <span>{isSavingPurchasing ? 'Đang lưu...' : 'Lưu kết quả thẩm định'}</span>
              </button>
            </div>

            {/* Direct Status Actions Footer */}
            <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#717783] font-bold">Chuyển trạng thái:</span>
                {selectedPurchasingForDetail.status !== 'verified' && (
                  <button
                    onClick={() => handleUpdatePurchasingStatus(selectedPurchasingForDetail.id, 'verified')}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
                  >
                    Đã thẩm định
                  </button>
                )}
                {selectedPurchasingForDetail.status !== 'completed' && (
                  <button
                    onClick={() => handleUpdatePurchasingStatus(selectedPurchasingForDetail.id, 'completed')}
                    className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
                  >
                    Hoàn thành thu mua
                  </button>
                )}
                {selectedPurchasingForDetail.status !== 'canceled' && (
                  <button
                    onClick={() => handleUpdatePurchasingStatus(selectedPurchasingForDetail.id, 'canceled')}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
                  >
                    Hủy đơn
                  </button>
                )}
              </div>
              <button
                onClick={() => setSelectedPurchasingForDetail(null)}
                className="px-5 py-2 border border-gray-300 rounded-xl text-xs font-bold hover:bg-gray-100 cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Purchasing Image Lightbox Viewer */}
      {previewPurchasingImage && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setPreviewPurchasingImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-black rounded-2xl overflow-hidden shadow-2xl flex flex-col items-center justify-center border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewPurchasingImage(null)}
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Đóng xem ảnh"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
            <img
              src={previewPurchasingImage}
              alt="Ảnh thiết bị chi tiết"
              className="max-h-[85vh] max-w-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};
