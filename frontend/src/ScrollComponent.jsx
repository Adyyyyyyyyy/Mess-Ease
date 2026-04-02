import { createContext, useContext } from "react";

const ScrollContext = createContext();

export const SmoothScrollProvider = ({ children }) => {
  const scrollTo = (id, offset = -88) => {
    const el = document.getElementById(id);
    if (!el) return;

    const y =
      el.getBoundingClientRect().top +
      window.pageYOffset +
      offset;

    window.scrollTo({
      top: y,
      behavior: "smooth",
    });
  };

  return (
    <ScrollContext.Provider value={{ scrollTo }}>
      {children}
    </ScrollContext.Provider>
  );
};

// custom hook
export const useSmoothScroll = () => useContext(ScrollContext);