import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumb = ({ items = [] }) => {
  return (
    <nav className="flex items-center text-sm text-gray-500 dark:text-gray-400 py-3 overflow-x-auto">
      <Link to="/" className="flex items-center hover:text-primary-600 transition-colors shrink-0">
        <Home size={16} className="mr-1" /> Trang chủ
      </Link>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight size={14} className="mx-2 shrink-0 text-gray-400" />
          {item.link && index < items.length - 1 ? (
            <Link to={item.link} className="hover:text-primary-600 transition-colors shrink-0 font-medium text-gray-700 dark:text-gray-300">
              {item.label}
            </Link>
          ) : (
            <span className="font-semibold text-primary-600 dark:text-primary-400 truncate max-w-[200px] sm:max-w-xs">
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;
