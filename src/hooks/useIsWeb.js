import { useState, useEffect } from 'react';

export const useIsWeb = (breakpoint = 768) => {
  const [isWeb, setIsWeb] = useState(false);

  useEffect(() => {
    const checkScreen = () => {
      setIsWeb(window.innerWidth > breakpoint);
    };

    checkScreen(); // одразу при монтуванні
    window.addEventListener('resize', checkScreen);

    return () => window.removeEventListener('resize', checkScreen);
  }, [breakpoint]);

  return isWeb;
};
