import { Button, Modal, Result } from "antd";
import React from "react";
import { CalendarList } from "./CalendarList";

const FreshlyAddedCalendarModal = ({
  freshlyAddedCalendars,
  onDone,
}: {
  freshlyAddedCalendars: string[];
  onDone: () => unknown;
}) => {
  return (
    <Modal
      visible={freshlyAddedCalendars.length > 0}
      onCancel={onDone}
      footer={
        <Button type="primary" onClick={onDone}>
          Fertig
        </Button>
      }
    >
      <Result
        status="success"
        title="Die Kalender wurden verknüpft!"
        subTitle="Wähle aus, in welchen der verfügbaren Kalender nach Terminüberlappungen gesucht werden soll."
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

