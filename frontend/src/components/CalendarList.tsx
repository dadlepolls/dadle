import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  LinkOutlined,
  QuestionOutlined,
  WindowsOutlined
} from "@ant-design/icons";
import { useQuery } from "@apollo/client";
import { CHECK_CALENDAR_HEALTH } from "@operations/mutations/CheckCalendarHealth";
import { DELETE_CALENDAR } from "@operations/mutations/DeleteCalendar";
import { SET_CALENDAR_ENABLED } from "@operations/mutations/SetCalendarEnabled";
import {
  CheckCalendarHealth,
  CheckCalendarHealthVariables
} from "@operations/mutations/__generated__/CheckCalendarHealth";
import {
  DeleteCalendar,
  DeleteCalendarVariables
} from "@operations/mutations/__generated__/DeleteCalendar";
import {
  SetCalendarEnabled,
  SetCalendarEnabledVariables
} from "@operations/mutations/__generated__/SetCalendarEnabled";
import { GET_MY_CALENDARS } from "@operations/queries/GetMyCalendars";
import { GetMyCalendars } from "@operations/queries/__generated__/GetMyCalendars";
import { useStyledMutation } from "@util/mutationWrapper";
import {
  Avatar,
  Button,
  List,
  message,
  Popconfirm,
  Switch,
  Tooltip
} from "antd";
import React from "react";
import { useImmer } from "use-immer";

type TCalendarHealthCheck = {
  calId: string;
  loading?: boolean;
  healthy?: boolean | null;
};

const getIconForCalendarProvider = (provider: string) => {
  switch (provider) {
    case "microsoft":
      return <WindowsOutlined />;
    default:
      return <QuestionOutlined />;
  }
};

const getIconForHealthCheck = (checkResult?: TCalendarHealthCheck) => {
  if (!checkResult) return <LinkOutlined />;
  if (checkResult.healthy) return <CheckCircleOutlined />;
  return <CloseCircleOutlined />;
};

const CalendarList = ({
  filter = () => true,
  showHealthCheckButtons = true,
  showDeleteButtons = true,
}: {
  filter?: (calendarId: string) => boolean;
  showHealthCheckButtons?: boolean;
  showDeleteButtons?: boolean;
}) => {
  const { loading: calendarsLoading, data: calendarsData } =
    useQuery<GetMyCalendars>(GET_MY_CALENDARS);

  const [
    calendarsWithPendingEnabledChange,
    updateCalendarsWithPendingEnabledChange,
  ] = useImmer<string[]>([]); //ids of calendars currently being enabled/ disabled (loading state)
  const setCalendarEnabled = useStyledMutation<
    SetCalendarEnabled,
    SetCalendarEnabledVariables
  >(SET_CALENDAR_ENABLED, {
    successMessage: null,
  });

  const [calendarsBeingDeleted, updateCalendarsBeingDeleted] = useImmer<
    string[]
  >([]); //ids of calendars currently being deleted (loading state)
  const deleteCalender = useStyledMutation<
    DeleteCalendar,
    DeleteCalendarVariables
  >(DELETE_CALENDAR, { successMessage: "Kalender gelöscht!" });

  const [calendarHealthChecks, updateCalendarHealthChecks] = useImmer<
    TCalendarHealthCheck[]
  >([]);
  const checkCalendarHealth = useStyledMutation<
    CheckCalendarHealth,
    CheckCalendarHealthVariables
  >(CHECK_CALENDAR_HEALTH, { successMessage: null });
  const calendars =
    calendarsData?.getMyCalendars.filter((c) => filter(c._id)) ?? [];

  const onDeleteClick = async (calendarId: string) => {
    updateCalendarsBeingDeleted((l) => {
      l.push(calendarId);
    });
    await deleteCalender(
      { calendarId: calendarId },
      {
        update(cache) {
          const existingCalendars = cache.readQuery<GetMyCalendars>({
            query: GET_MY_CALENDARS,
          });
          const newCalendars = existingCalendars!.getMyCalendars.filter(
            (c) => c._id != calendarId
          );
          cache.writeQuery<GetMyCalendars>({
            query: GET_MY_CALENDARS,
            data: { getMyCalendars: newCalendars },
          });
        },
      }
    );
    updateCalendarsBeingDeleted((l) => l.filter((x) => x != calendarId));
  };

  const onHealthCheckClick = async (calendarId: string) => {
    updateCalendarHealthChecks((checks) => {
      const checkResult = checks.find((c) => c.calId == calendarId);
      if (checkResult) checkResult.loading = true;
      else checks.push({ calId: calendarId, loading: true });
    });
    const { data: result } =
      (await checkCalendarHealth({
        calendarId: calendarId,
      })) || {};
    if (!result) return;
    if (!result.checkCalendarHealth.healthy)
      message.error(
        <>
          <span>Die Verbindung zum Kalender ist fehlgeschlagen!</span>
          <br />
          <small>
            Bitte probiere, den Kalender zu löschen und ihn neu zu verknüpfen.
          </small>
        </>
      );
    updateCalendarHealthChecks((checks) => {
      const checkResult = checks.find((c) => c.calId == calendarId);
      if (checkResult) {
        checkResult.loading = false;
        checkResult.healthy = result.checkCalendarHealth.healthy;
      } else
        checks.push({
          calId: calendarId,
          loading: false,
          healthy: result.checkCalendarHealth.healthy,
        });
    });
  };

  const onCalendarEnabledChange = async (
    calendarId: string,
    enabled: boolean
  ) => {
    updateCalendarsWithPendingEnabledChange((l) => {
      l.push(calendarId);
    });
    await setCalendarEnabled({
      calendarId: calendarId,
      enabled,
    });
    updateCalendarsWithPendingEnabledChange((l) =>
      l.filter((x) => x != calendarId)
    );
  };

  return (
    <List
      itemLayout="horizontal"
      loading={calendarsLoading}
      dataSource={calendars}
      locale={{ emptyText: "Du hast bisher keine Kalender verknüpft" }}
      renderItem={(cal) => {
        const healthCheckResult = calendarHealthChecks.find(
          (h) => h.calId == cal._id
        );

        const actions: React.ReactNode[] = [
          <Switch
            key="enable"
            size="small"
            loading={calendarsWithPendingEnabledChange.some(
              (p) => p == cal._id
            )}
            checked={cal.enabled}
            onChange={async (enabled) => {
              onCalendarEnabledChange(cal._id, enabled);
            }}
          />,
        ];

        if (showHealthCheckButtons)
          actions.push(
            <Tooltip
              key="check"
              title={healthCheckResult ? null : "Verknüpfung überprüfen"}
            >
              <Button
                size="small"
                loading={healthCheckResult?.loading}
                icon={getIconForHealthCheck(healthCheckResult)}
                type={
                  healthCheckResult && healthCheckResult.healthy
                    ? "primary"
                    : "default"
                }
                danger={
                  healthCheckResult &&
                  typeof healthCheckResult.healthy !== "undefined" &&
                  !healthCheckResult.healthy
                }
                onClick={async () => onHealthCheckClick(cal._id)}
              />
            </Tooltip>
          );

        if (showDeleteButtons)
          actions.push(
            <Popconfirm
              key="delete"
              title="Soll die Kalenderverknüpfung wirklich gelöscht werden?"
              onConfirm={async () => onDeleteClick(cal._id)}
              okText="Ja"
              cancelText="Abbrechen"
              placement="left"
            >
              <Button
                size="small"
                loading={calendarsBeingDeleted.some((c) => c == cal._id)}
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          );

        return (
          <List.Item actions={actions}>
            <List.Item.Meta
              avatar={
                <Avatar icon={getIconForCalendarProvider(cal.provider)} />
              }
              title={
                cal.enabled
                  ? cal.friendlyName
                  : `${cal.friendlyName} (deaktiviert)`
              }
              description={cal.usernameAtProvider}
            />
          </List.Item>
        );
      }}
    />
  );
};

export { CalendarList };

