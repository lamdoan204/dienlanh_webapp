-- Tắt RLS để chèn dữ liệu mẫu (tuỳ chọn, nếu bạn muốn dùng trên frontend)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.address DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.services DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_slots DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_details DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews DISABLE ROW LEVEL SECURITY;

-- 1. Thêm Users
INSERT INTO public.users (first_name, last_name, email, phone_number, role)
VALUES 
('Nguyễn', 'Văn A', 'nguyenvana@example.com', '0901234567', 'customer'),
('Trần', 'Thị B', 'tranthib@example.com', '0912345678', 'loyal_customer'),
('Lê', 'Văn C', 'levanc@example.com', '0987654321', 'admin'),
('Phạm', 'Thợ 1', 'tho1@example.com', '0900000001', 'admin');

-- 2. Thêm Address
INSERT INTO public.address (user_id, province, ward, street, house_number, full_address)
VALUES 
(1, 'Hà Nội', 'Phường Kim Mã', 'Ba Đình', 'Số 10', 'Số 10 Kim Mã, Ba Đình, Hà Nội'),
(2, 'TP.HCM', 'Phường Bến Nghé', 'Quận 1', 'Số 20', 'Số 20 Lê Lợi, Bến Nghé, Quận 1, TP.HCM');

-- 3. Thêm Services
INSERT INTO public.services (name, service_type, price, device_type, note)
VALUES 
('Vệ sinh điều hòa tiêu chuẩn', 'cleaning', 150000, 'air_conditioner', 'Vệ sinh lưới lọc, dàn lạnh, dàn nóng'),
('Sửa chữa tủ lạnh', 'repair', 350000, 'refrigerator', 'Phí kiểm tra và sửa chữa cơ bản'),
('Bảo dưỡng máy giặt', 'maintenance', 250000, 'washing_machine', 'Vệ sinh lồng giặt, bảo dưỡng động cơ');

-- 4. Thêm Time Slots
INSERT INTO public.time_slots (start_time, end_time, max_orders, is_active)
VALUES 
('08:00', '10:00', 5, true),
('10:00', '12:00', 5, true),
('13:00', '15:00', 5, true),
('15:00', '17:00', 5, true);

-- 5. Thêm Orders
INSERT INTO public.orders (customer_id, worker_id, appointment_time, time_slot_id, status, total_price)
VALUES 
(1, 4, CURRENT_TIMESTAMP + INTERVAL '1 day', 1, 'pending', 150000),
(2, 4, CURRENT_TIMESTAMP - INTERVAL '2 days', 2, 'completed', 350000);

-- 6. Thêm Order Details
INSERT INTO public.order_details (order_id, service_id, quantity, sub_total_price)
VALUES 
(1, 1, 1, 150000),
(2, 2, 1, 350000);

-- 7. Thêm Reviews
INSERT INTO public.reviews (user_id, order_id, stars, detail)
VALUES 
(2, 2, 5, 'Dịch vụ rất tốt, thợ nhiệt tình, sửa chữa nhanh chóng.');
