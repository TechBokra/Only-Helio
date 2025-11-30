import React, { useState, useEffect } from 'react';
import { ArrowUpIcon } from '../ui/Icons';
import { Button } from '../ui/Button';

const BackToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  return (
    <>
      {isVisible && (
        <Button
          onClick={scrollToTop}
          variant="primary"
          size="icon"
          className="fixed bottom-24 right-6 z-50 rounded-full shadow-lg transform hover:scale-110"
          aria-label="Go to top"
        >
          <ArrowUpIcon className="h-6 w-6" />
        </Button>
      )}
    </>
  );
};

export default BackToTopButton;