import React from 'react';
import { ActiveTab, UserProfile } from '../types';
import { Logo } from './Logo';

interface FooterProps {
  setActiveTab: (tab: ActiveTab) => void;
  userProfile?: UserProfile | null;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab, userProfile }) => {
  return (
    <footer className="w-full py-12 bg-[#ffffff] border-t border-[#c1c7d3]/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center sm:text-left">
        {/* Col 1 */}
        <div className="col-span-1 sm:col-span-2 lg:col-span-1 flex flex-col gap-3 items-center sm:items-start">
          <Logo size="md" />
          <p className="text-xs text-[#414751] max-w-xs">
            © Điện lạnh Công Thương. Trải nghiệm sự tin cậy trong từng hơi thở. Dịch vụ kỹ thuật điều hòa &amp; điện lạnh chuẩn hóa cao cấp.
          </p>
          <div className="flex gap-3 mt-1">
            <a href="#" className="text-[#414751] hover:text-[#005396] p-2 bg-[#f1f3ff] rounded-full transition-colors" title="Bảo hành">
              <span className="material-symbols-outlined text-lg">verified</span>
            </a>
            <a href="#" className="text-[#414751] hover:text-[#005396] p-2 bg-[#f1f3ff] rounded-full transition-colors" title="Chia sẻ">
              <span className="material-symbols-outlined text-lg">share</span>
            </a>
            <a href="#" className="text-[#414751] hover:text-[#005396] p-2 bg-[#f1f3ff] rounded-full transition-colors" title="Hỗ trợ hotline">
              <span className="material-symbols-outlined text-lg">call</span>
            </a>
          </div>
        </div>

    

        {/* Col 3 */}
        <div className="col-span-1 flex flex-col gap-2.5">
          <h4 className="font-semibold text-sm text-[#141b2b] uppercase tracking-wider mb-1">Dịch vụ</h4>
          <button
            onClick={() => setActiveTab('pricing')}
            className="text-xs text-[#414751] hover:text-[#005396] hover:underline transition-all text-center sm:text-left cursor-pointer"
          >
            Bảng giá dịch vụ
          </button>

          <button
            onClick={() => setActiveTab('supplies')}
            className="text-xs text-[#414751] hover:text-[#005396] hover:underline transition-all text-center sm:text-left cursor-pointer"
          >
            Bảng giá thi công - vật tư
          </button>

          <button
            onClick={() => setActiveTab('articles')}
            className="text-xs text-[#414751] hover:text-[#005396] hover:underline transition-all text-center sm:text-left cursor-pointer font-bold text-[#005396]"
          >
            Góc kiến thức &amp; Mẹo hay
          </button>

          <button
            onClick={() => setActiveTab('purchasing')}
            className="text-xs text-[#414751] hover:text-[#005396] hover:underline transition-all text-center sm:text-left cursor-pointer"
          >
            Dịch vụ thu mua thiết bị
          </button>
          
          <button
            onClick={() => setActiveTab('booking')}
            className="text-xs text-[#414751] hover:text-[#005396] hover:underline transition-all text-center sm:text-left cursor-pointer"
          >
            Đặt lịch khẩn cấp
          </button>
        </div>

        {/* Col 4 */}
        <div className="col-span-1 flex flex-col gap-2.5">
          <h4 className="font-semibold text-sm text-[#141b2b] uppercase tracking-wider mb-1">Liên hệ</h4>
          <div className="flex items-center gap-2 text-xs text-[#414751] justify-center sm:justify-start">
            <span className="material-symbols-outlined text-[18px] text-[#005396]">location_on</span>
            <span>TP. Hồ Chí Minh</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#414751] justify-center sm:justify-start">
            <span className="material-symbols-outlined text-[18px] text-[#005396]">mail</span>
            <span>dienlanhcongthuongsupport@gmail.com</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#ba1a1a] justify-center sm:justify-start mt-1">
            <span className="material-symbols-outlined text-[18px]">phone_in_talk</span>
            <span>Zalo / Hotline: 0352572821</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
