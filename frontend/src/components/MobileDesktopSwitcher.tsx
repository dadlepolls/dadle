import { Button } from "antd";
import React from "react";
import {
  ResponsiveRequestedMedium,
  useResponsiveContext
} from "./ResponsiveContext";

const MobileDesktopSwitcher = () => {
  const { requestedMedium, setRequestedMedium, isSm } = useResponsiveContext();

  const currentExpectedMedium:
    | ResponsiveRequestedMedium.Mobile
    | ResponsiveRequestedMedium.Desktop =
    requestedMedium == ResponsiveRequestedMedium.Mobile ||
    (requestedMedium == ResponsiveRequestedMedium.Default && isSm)
      ? ResponsiveRequestedMedium.Mobile
      : ResponsiveRequestedMedium.Desktop;

  let displayText =
    currentExpectedMedium == ResponsiveRequestedMedium.Desktop
      ? "Zu mobiler Ansicht wechseln"
      : "Zu Desktop-Ansicht wechseln";

  return (
    <Button
      type="link"
      size="small"
      onClick={() => {
        if (currentExpectedMedium == ResponsiveRequestedMedium.Mobile)
          setRequestedMedium(ResponsiveRequestedMedium.Desktop);
        else setRequestedMedium(ResponsiveRequestedMedium.Mobile);
      }}
    >
      {displayText}
    </Button>
  );
};

export { MobileDesktopSwitcher };

