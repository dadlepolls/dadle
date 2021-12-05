import React, { useContext, useEffect, useState } from "react";

const ResponsiveContext = React.createContext({
  isSm: false,
  isXs: false,
});

const SM_WIDTH_LIMIT = 768;
const XS_WIDTH_LIMIT = 576;

const ResponsiveContextProvider = ({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) => {
  const [isSm, setIsSm] = useState(false);
  const [isXs, setIsXs] = useState(false);

  const handleResize = () => {
    if (window.innerWidth < SM_WIDTH_LIMIT) setIsSm(true);
    else setIsSm(false);

    if (window.innerWidth < XS_WIDTH_LIMIT) setIsXs(true);
    else setIsXs(false);
  };

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  });

  return (
    <ResponsiveContext.Provider value={{ isSm, isXs }}>
      {children}
    </ResponsiveContext.Provider>
  );
};

const useWindowIsXs = () => {
  const ctx = useContext(ResponsiveContext);
  return ctx.isXs;
};

const useWindowIsSm = () => {
  const ctx = useContext(ResponsiveContext);
  return ctx.isSm;
};

export { ResponsiveContextProvider, useWindowIsSm, useWindowIsXs };

