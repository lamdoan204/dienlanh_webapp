#!/bin/bash
cat << 'INNER_EOF' >> src/components/AdminDashboard.tsx
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
              {!editingTechId && (
                <div>
                  <label className="block text-xs font-bold text-[#717783] mb-1">Mật khẩu</label>
                  <input
                    type="password"
                    required
                    value={newTechForm.password}
                    onChange={(e) => setNewTechForm({ ...newTechForm, password: e.target.value })}
                    placeholder="********"
                    className="w-full p-2.5 border border-[#c1c7d3] rounded-xl"
                  />
                </div>
              )}
              {editingTechId && (
                <div>
                  <label className="block text-xs font-bold text-[#717783] mb-1">Trạng thái</label>
                  <select
                    value={newTechForm.status}
                    onChange={(e) => setNewTechForm({ ...newTechForm, status: e.target.value })}
                    className="w-full p-2.5 border border-[#c1c7d3] rounded-xl"
                  >
                    <option value="đang chờ">Đang chờ</option>
                    <option value="đang làm việc">Đang làm việc</option>
                    <option value="đang nghỉ">Đang nghỉ</option>
                  </select>
                </div>
              )}
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
                <label className="block text-xs font-bold text-[#717783] mb-1">Loại dịch vụ</label>
                <select
                  value={newServiceForm.category}
                  onChange={(e) => setNewServiceForm({ ...newServiceForm, category: e.target.value })}
                  className="w-full p-2.5 border border-[#c1c7d3] rounded-xl"
                >
                  <option value="sửa chữa">Sửa chữa</option>
                  <option value="lắp đặt">Lắp đặt</option>
                  <option value="vệ sinh">Vệ sinh</option>
                  <option value="kiểm tra">Kiểm tra</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#717783] mb-1">Thiết bị</label>
                <select
                  value={newServiceForm.deviceType}
                  onChange={(e) => setNewServiceForm({ ...newServiceForm, deviceType: e.target.value })}
                  className="w-full p-2.5 border border-[#c1c7d3] rounded-xl"
                >
                  <option value="máy giặt">Máy giặt</option>
                  <option value="máy lạnh">Máy lạnh</option>
                  <option value="tủ lạnh">Tủ lạnh</option>
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
                <label className="block text-xs font-bold text-[#717783] mb-1">Ghi chú</label>
                <input
                  type="text"
                  value={newServiceForm.note}
                  onChange={(e) => setNewServiceForm({ ...newServiceForm, note: e.target.value })}
                  placeholder="Ghi chú thêm..."
                  className="w-full p-2.5 border border-[#c1c7d3] rounded-xl"
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
    </div>
  );
};
INNER_EOF
