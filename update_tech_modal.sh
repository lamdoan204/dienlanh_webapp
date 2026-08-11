#!/bin/bash
sed -i '/{isAddTechModalOpen && (/,/Thêm kỹ thuật viên<\/button>/c\
      {isAddTechModalOpen && (\
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">\
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">\
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">\
              <h3 className="font-bold text-lg text-[#005396]">{editingTechId ? "Sửa kỹ thuật viên" : "Thêm kỹ thuật viên"}</h3>\
              <button\
                onClick={() => { setIsAddTechModalOpen(false); setEditingTechId(null); }}\
                className="p-1 text-[#717783] hover:bg-gray-100 rounded-full"\
              >\
                <span className="material-symbols-outlined">close</span>\
              </button>\
            </div>\
            <form onSubmit={handleSaveTechnician} className="space-y-3 text-sm">\
              <div className="flex gap-2">\
                <div className="flex-1">\
                  <label className="block text-xs font-bold text-[#717783] mb-1">Họ và tên lót</label>\
                  <input\
                    type="text"\
                    required\
                    value={newTechForm.last_name}\
                    onChange={(e) => setNewTechForm({ ...newTechForm, last_name: e.target.value })}\
                    placeholder="Nguyễn Văn"\
                    className="w-full p-2.5 border border-[#c1c7d3] rounded-xl"\
                  />\
                </div>\
                <div className="flex-1">\
                  <label className="block text-xs font-bold text-[#717783] mb-1">Tên</label>\
                  <input\
                    type="text"\
                    required\
                    value={newTechForm.first_name}\
                    onChange={(e) => setNewTechForm({ ...newTechForm, first_name: e.target.value })}\
                    placeholder="A"\
                    className="w-full p-2.5 border border-[#c1c7d3] rounded-xl"\
                  />\
                </div>\
              </div>\
              <div>\
                <label className="block text-xs font-bold text-[#717783] mb-1">Số điện thoại</label>\
                <input\
                  type="text"\
                  required\
                  value={newTechForm.phone_number}\
                  onChange={(e) => setNewTechForm({ ...newTechForm, phone_number: e.target.value })}\
                  placeholder="0988777666"\
                  className="w-full p-2.5 border border-[#c1c7d3] rounded-xl"\
                />\
              </div>\
              <div>\
                <label className="block text-xs font-bold text-[#717783] mb-1">Email</label>\
                <input\
                  type="email"\
                  required\
                  value={newTechForm.email}\
                  onChange={(e) => setNewTechForm({ ...newTechForm, email: e.target.value })}\
                  placeholder="email@example.com"\
                  className="w-full p-2.5 border border-[#c1c7d3] rounded-xl"\
                />\
              </div>\
              {!editingTechId && (\
                <div>\
                  <label className="block text-xs font-bold text-[#717783] mb-1">Mật khẩu</label>\
                  <input\
                    type="password"\
                    required\
                    value={newTechForm.password}\
                    onChange={(e) => setNewTechForm({ ...newTechForm, password: e.target.value })}\
                    placeholder="********"\
                    className="w-full p-2.5 border border-[#c1c7d3] rounded-xl"\
                  />\
                </div>\
              )}\
              {editingTechId && (\
                <div>\
                  <label className="block text-xs font-bold text-[#717783] mb-1">Trạng thái</label>\
                  <select\
                    value={newTechForm.status}\
                    onChange={(e) => setNewTechForm({ ...newTechForm, status: e.target.value })}\
                    className="w-full p-2.5 border border-[#c1c7d3] rounded-xl"\
                  >\
                    <option value="đang chờ">Đang chờ</option>\
                    <option value="đang làm việc">Đang làm việc</option>\
                    <option value="đang nghỉ">Đang nghỉ</option>\
                  </select>\
                </div>\
              )}\
              <div className="pt-2 flex justify-end gap-2">\
                <button\
                  type="button"\
                  onClick={() => { setIsAddTechModalOpen(false); setEditingTechId(null); }}\
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-bold"\
                >\
                  Hủy\
                </button>\
                <button\
                  type="submit"\
                  className="px-4 py-2 bg-[#005396] text-white rounded-xl text-xs font-bold hover:brightness-95"\
                >\
                  {editingTechId ? "Cập nhật" : "Thêm kỹ thuật viên"}\
                </button>' src/components/AdminDashboard.tsx
