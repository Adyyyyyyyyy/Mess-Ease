import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollHandler = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash);

      if (el) {
        setTimeout(() => {
          el.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 100);
      }
    } else {
      // scroll to top on route change
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, [pathname, hash]);

  return null;
};

export default ScrollHandler;