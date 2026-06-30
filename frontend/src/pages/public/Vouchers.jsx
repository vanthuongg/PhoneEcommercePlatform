import React from 'react';
import { Tag } from 'lucide-react';
import Breadcrumb from '../../components/ui/Breadcrumb';

const Vouchers = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <Breadcrumb items={[{ label: 'Trang chủ', link: '/' }, { label: 'Khuyến mãi' }]} />
        
        <div className="flex items-center gap-3">
          <Tag className="w-8 h-8 text-primary" />
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">Kho Voucher & Khuyến Mãi</h1>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 sm:p-12 border border-gray-100 dark:border-gray-800 shadow-sm text-center">
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Trang danh sách Voucher đang được xây dựng. Các bạn vui lòng quay lại sau nhé!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Vouchers;
