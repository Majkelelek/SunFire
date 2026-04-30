import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // 1. Przewija główne okno
    window.scrollTo(0, 0);
    
    // 2. Przewija element html i body (ważne dla niektórych przeglądarek)
    document.documentElement.scrollTo(0, 0);
    document.body.scrollTo(0, 0);

    // 3. Przewija Twój wrapper, jeśli to on ma overflow (najczęstsza przyczyna)
    const wrapper = document.querySelector('.content-wrapper');
    if (wrapper) {
      wrapper.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
};

export default ScrollToTop;