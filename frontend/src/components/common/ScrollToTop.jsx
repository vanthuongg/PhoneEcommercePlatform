import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // 1. Cuộn trình duyệt (window) lên đầu trang ngay lập tức
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });

    // 2. Cuộn documentElement / body
    if (document.documentElement) {
      document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
    if (document.body) {
      document.body.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }

    // 3. Cuộn các container có scroll riêng (như main của admin/manager layout)
    const scrollContainers = document.querySelectorAll('main, [class*="overflow-y-auto"], [class*="overflow-auto"]');
    scrollContainers.forEach((container) => {
      if (typeof container.scrollTo === 'function') {
        container.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      }
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
