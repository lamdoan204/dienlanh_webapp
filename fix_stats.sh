#!/bin/bash
sed -i '738,740c\
                  <div className="text-3xl font-extrabold text-[#141b2b]">\
                    {technicians.filter(t => t.status === "đang làm việc").length}\
                  </div>\
                </div>\
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">\
                  <div className="flex items-center justify-between mb-2">\
                    <span className="material-symbols-outlined p-2 bg-gray-100 text-[#414751] rounded-xl">event_busy</span>\
                    <span className="text-xs text-[#717783] font-bold">Đang nghỉ</span>\
                  </div>\
                  <div className="text-3xl font-extrabold text-[#141b2b]">\
                    {technicians.filter(t => t.status === "đang nghỉ").length}\
                  </div>\
                </div>\
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">\
                  <div className="flex items-center justify-between mb-2">\
                    <span className="material-symbols-outlined p-2 bg-indigo-50 text-indigo-600 rounded-xl">pending_actions</span>\
                    <span className="text-xs text-[#717783] font-bold">Đang chờ</span>\
                  </div>\
                  <div className="text-3xl font-extrabold text-[#141b2b]">\
                    {technicians.filter(t => t.status === "đang chờ").length}\
                  </div>\
                </div>\
              </div>' src/components/AdminDashboard.tsx
