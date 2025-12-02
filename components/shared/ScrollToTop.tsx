
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Force scroll to top instantly on path change
    window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant', 
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
