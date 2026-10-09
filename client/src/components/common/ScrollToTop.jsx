import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop Component
 * Resets window and document scroll position instantly on every route change,
 * fixing the bug where navigated pages open near the bottom or footer.
 */
export default function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // 1. Instantly reset window scroll position
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });

    // 2. Also reset standard document root elements (handles 100vh / body overflow containers)
    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
    if (document.body) {
      document.body.scrollTop = 0;
    }

    // 3. Reset any dashboard or main container scroll positions if present
    const mainContainers = document.querySelectorAll('main, [data-scroll-container], .dashboard-content');
    mainContainers.forEach((el) => {
      if (el && el.scrollTop) {
        el.scrollTop = 0;
      }
    });
  }, [pathname, search]);

  return null;
}
