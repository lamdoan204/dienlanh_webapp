#!/bin/bash
sed -i '/{\/\* 4. Modal Add\/Edit Service \*\//i\
      {viewingTechHistoryId && (\
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">\
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-4 max-h-[80vh] flex flex-col">\
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">\
              <h3 className="font-bold text-lg text-[#005396]">Lịch sử đơn của kỹ thuật viên</h3>\
              <button\
                onClick={() => setViewingTechHistoryId(null)}\
                className="p-1 text-[#717783] hover:bg-gray-100 rounded-full"\
              >\
                <span className="material-symbols-outlined">close</span>\
              </button>\
            </div>\
            <div className="overflow-y-auto flex-1">\
              {isHistoryLoading ? (\
                <p className="text-center text-[#717783] text-sm py-4">Đang tải lịch sử...</p>\
              ) : techHistory.length === 0 ? (\
                <p className="text-center text-[#717783] text-sm py-4">Chưa có đơn nào.</p>\
              ) : (\
                <table className="w-full text-left border-collapse">\
                  <thead>\
                    <tr className="bg-[#f1f3ff]/50 border-b border-gray-100">\
                      <th className="p-3 text-xs text-[#717783] font-bold">Mã đơn</th>\
                      <th className="p-3 text-xs text-[#717783] font-bold">Dịch vụ</th>\
                      <th className="p-3 text-xs text-[#717783] font-bold">Ngày thực hiện</th>\
                      <th className="p-3 text-xs text-[#717783] font-bold">Giá</th>\
                      <th className="p-3 text-xs text-[#717783] font-bold">Trạng thái</th>\
                    </tr>\
                  </thead>\
                  <tbody className="divide-y divide-gray-100">\
                    {techHistory.map((item, idx) => (\
                      <tr key={idx} className="hover:bg-gray-50">\
                        <td className="p-3 text-sm font-bold text-[#141b2b]">#{item.id}</td>\
                        <td className="p-3 text-sm text-[#414751]">{item.service_name || "Dịch vụ"}</td>\
                        <td className="p-3 text-sm text-[#717783]">{new Date(item.created_at).toLocaleDateString("vi-VN")}</td>\
                        <td className="p-3 text-sm font-bold text-[#005396]">{item.price?.toLocaleString("vi-VN")} đ</td>\
                        <td className="p-3 text-sm text-[#414751]">{item.status}</td>\
                      </tr>\
                    ))}\
                  </tbody>\
                </table>\
              )}\
            </div>\
          </div>\
        </div>\
      )}\
' src/components/AdminDashboard.tsx
