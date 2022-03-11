import { Button } from "antd";
import { useTranslation } from "next-i18next";
import React from "react";
import {
  ResponsiveRequestedMedium,
  useResponsiveContext
} from "./ResponsiveContext";

const MobileDesktopSwitcher = () => {
  const { t } = useTranslation();
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
      ? t("change_to_mobile_version")
      : t("change_to_desktop_version");

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

