import { Button, Modal, Result } from "antd";
import { useTranslation } from "next-i18next";
import React from "react";
import { CalendarList } from "./CalendarList";

const FreshlyAddedCalendarModal = ({
  freshlyAddedCalendars,
  onDone,
}: {
  freshlyAddedCalendars: string[];
  onDone: () => unknown;
}) => {
  const { t } = useTranslation("profile");

  return (
    <Modal
      visible={freshlyAddedCalendars.length > 0}
      onCancel={onDone}
      footer={
        <Button type="primary" onClick={onDone}>
          {t("cal_link_success_done")}
        </Button>
      }
    >
      <Result
        status="success"
        title={t("cal_link_success_title")}
        subTitle={t("cal_link_success_explanation")}
      />
      <CalendarList
        filter={(id) => freshlyAddedCalendars.some((c) => c == id)}
        showDeleteButtons={false}
        showHealthCheckButtons={false}
      />
    </Modal>
  );
};

export { FreshlyAddedCalendarModal };

