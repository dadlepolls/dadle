import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  GoogleOutlined,
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
import { useInitiallySorted } from "@util/initiallySorted";
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
import { useTranslation } from "next-i18next";
import React, { useMemo } from "react";
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
    case "google":
      return <GoogleOutlined />;
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
  const { t } = useTranslation("profile");
  const { loading: calendarsLoading, data: calendarsData } =
    useQuery<GetMyCalendars>(GET_MY_CALENDARS);
  const calendarsDataSorted = useInitiallySorted(
    calendarsData?.getMyCalendars,
    calendarsLoading || !calendarsData?.getMyCalendars,
    (a, b) => {
      if (a.enabled && !b.enabled) return -1;
      if (!a.enabled && b.enabled) return 1;
      return 0;
    }
  );
  const calendars = useMemo(
    () => calendarsDataSorted.filter((c) => filter(c._id)),
    [calendarsDataSorted, filter]
  );

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
  >(DELETE_CALENDAR, { successMessage: t("cal_deleted") });

  const [calendarHealthChecks, updateCalendarHealthChecks] = useImmer<
    TCalendarHealthCheck[]
  >([]);
  const checkCalendarHealth = useStyledMutation<
    CheckCalendarHealth,
    CheckCalendarHealthVariables
  >(CHECK_CALENDAR_HEALTH, { successMessage: null });

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

    let healthyResult: boolean;
    try {
      const fetchResponse = await checkCalendarHealth({
        calendarId: calendarId,
      });
      if (!fetchResponse || !fetchResponse.data) throw new Error();
      healthyResult = fetchResponse.data.checkCalendarHealth.healthy ?? false;
    } catch (_) {
      healthyResult = false;
    }

    if (!healthyResult)
      message.error(
        <>
          <span>{t("cal_healthcheck_failed_title")}</span>
          <br />
          <small>{t("cal_healthcheck_failed_description")}</small>
        </>
      );
    updateCalendarHealthChecks((checks) => {
      const checkResult = checks.find((c) => c.calId == calendarId);
      if (checkResult) {
        checkResult.loading = false;
        checkResult.healthy = healthyResult;
      } else
        checks.push({
          calId: calendarId,
          loading: false,
          healthy: healthyResult,
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
      locale={{ emptyText: t("cal_none_linked") }}
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
              title={
                healthCheckResult ? null : t("cal_healthcheck_action")
              }
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
              title={t("cal_delete_confirmation")}
              onConfirm={async () => onDeleteClick(cal._id)}
              okText={t("cal_delete_confirm")}
              cancelText={t("cal_delete_cancel")}
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
                  : t("cal_deactivated_title", {
                      name: cal.friendlyName,
                    })
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

