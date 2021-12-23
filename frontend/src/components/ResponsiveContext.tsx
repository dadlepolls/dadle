import React, { useContext, useEffect, useState } from "react";

enum ResponsiveRequestedMedium {
  Default,
  Mobile,
  Desktop,
}

const ResponsiveContext = React.createContext({
  isSm: false,
  isXs: false,
  requestedMedium: ResponsiveRequestedMedium.Default,
  setRequestedMedium: (_: ResponsiveRequestedMedium) => {},
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
  const [requestedMedium, setRequestedMedium] = useState(
    ResponsiveRequestedMedium.Default
  );

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
    <ResponsiveContext.Provider
      value={{ isSm, isXs, requestedMedium, setRequestedMedium }}
    >
      {children}
    </ResponsiveContext.Provider>
  );
};

const useResponsiveContext = () => useContext(ResponsiveContext);

const useWindowIsXs = () => {
  const ctx = useResponsiveContext();
  return ctx.isXs;
};

const useWindowIsSm = () => {
  const ctx = useResponsiveContext();
  return ctx.isSm;
};

const useWindowIsXsAndMobileAccepted = () => {
  const ctx = useResponsiveContext();
  return (
    ctx.isXs &&
    (ctx.requestedMedium == ResponsiveRequestedMedium.Default ||
      ctx.requestedMedium == ResponsiveRequestedMedium.Mobile)
  );
};

const useWindowIsSmAndMobileAccepted = () => {
  const ctx = useResponsiveContext();
  return (
    ctx.isSm &&
    (ctx.requestedMedium == ResponsiveRequestedMedium.Default ||
      ctx.requestedMedium == ResponsiveRequestedMedium.Mobile)
  );
};

const useMobileComponentsPrefered = () => {
  const ctx = useResponsiveContext();
  return (
    (ctx.isSm && ctx.requestedMedium == ResponsiveRequestedMedium.Default) ||
    ctx.requestedMedium == ResponsiveRequestedMedium.Mobile
  );
};

export {
  ResponsiveContextProvider,
  useResponsiveContext,
  useMobileComponentsPrefered,
  useWindowIsSm,
  useWindowIsSmAndMobileAccepted,
  useWindowIsXs,
  useWindowIsXsAndMobileAccepted,
  ResponsiveRequestedMedium,
};

