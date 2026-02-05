import { useEffect, useState } from "react";

const useScrollPosition = () => {
  const [isNavDark, setIsNavDark] = useState<boolean>(false);
  useEffect(() => {
    let scrollPos = window.scrollY;
    const scrollChange = 40;
    const scrollClass = () => {
      scrollPos = window.scrollY;
      setIsNavDark(scrollPos >= scrollChange);
    };
    window.addEventListener("scroll", scrollClass);
    return () => window.removeEventListener("scroll", scrollClass);
  }, []);
  return isNavDark;
};

export default useScrollPosition;