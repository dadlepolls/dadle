import {
  GoogleOutlined,
  LinkOutlined,
  SaveOutlined,
  WindowsOutlined,
} from "@ant-design/icons";
import { useAuth } from "@components/AuthContext";
import { CalendarList } from "@components/CalendarList";
import { FreshlyAddedCalendarModal } from "@components/FreshlyAddedCalendarModal";
import { LoadingCard } from "@components/LoadingCard";
import { useMobileComponentsPrefered } from "@components/ResponsiveContext";
import { UPDATE_NAME } from "@operations/mutations/UpdateName";
import {
  UpdateName,
  UpdateNameVariables,
} from "@operations/mutations/__generated__/UpdateName";
import { useStyledMutation } from "@util/mutationWrapper";
import {
  Button,
  Card,
  Descriptions,
  Dropdown,
  Input,
  Menu,
  Space,
  Tooltip,
  Typography,
  message,
} from "antd";
import * as ls from "local-storage";
import { NextPage } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Head from "next/head";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { static_config } from "src/static_config";

const Profile: NextPage = () => {
  const { t } = useTranslation("profile");
  const router = useRouter();
  const { user, authLoading, token } = useAuth();
  const mobileDisplay = useMobileComponentsPrefered();

  const [name, setName] = useState("");
  const [nameIsEdited, setNameIsEdited] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [freshlyAddedCalendars, setFreshlyAddedCalendars] = useState<string[]>(
    []
  );

  const removeQueryParams = useCallback(
    () => router.replace("/profile", undefined, { shallow: true }),
    [router]
  );

  useEffect(() => {
    if (user) setName(user.name);
    return () => {};
  }, [user, user?.name]);

  useEffect(() => {
    //check if there was a failure while adding calendar, show message
    if (router.isReady && router.query.calendarAddFailure) {
      message.error(t("calendar_linking_failed"));
      removeQueryParams();
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, router.query.calendarAddFailure]);

  useEffect(() => {
    //show dialog for freshly added calendars
    if (!router.isReady) return;
    try {
      if (!router.query.freshlyAddedCalendars) return;
      const parsedCals = JSON.parse(String(router.query.freshlyAddedCalendars));
      if (!Array.isArray(parsedCals)) return;
      if (!parsedCals.length) return;
      setFreshlyAddedCalendars(parsedCals);
    } catch (_) {
      //eslint-disable-next-lint no-empty
    } finally {
      removeQueryParams();
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, router.query.freshlyAddedCalendars]);

  const updateName = useStyledMutation<UpdateName, UpdateNameVariables>(
    UPDATE_NAME,
    {
      statusCallbackFunction: setIsSaving,
      onSuccess: () => {
        setNameIsEdited(false);
        ls.set("username", name);
      },
      successMessage: t("username_saved"),
    }
  );

  if (!user) {
    if (router.isReady && !authLoading) router.push("/");
    return <LoadingCard />;
  }

  return (
    <>
      <Head>
        <title>{t("title")} | Dadle</title>
      </Head>
      <Space direction="vertical">
        <Card title={t("information")}>
          <Typography.Title
            level={3}
          >{`Howdy, ${user.name}!`}</Typography.Title>
          <Descriptions column={mobileDisplay ? 1 : 3}>
            <Descriptions.Item label={t("provider_name")}>
              <Tooltip title={t("provider_id", { id: user.idAtProvider })}>
                {user.nameAtProvider}
              </Tooltip>
            </Descriptions.Item>
            <Descriptions.Item label={t("email")} span={mobileDisplay ? 1 : 2}>
              {user.mail}
            </Descriptions.Item>
            <Descriptions.Item label={t("displayname")}>
              <Space.Compact style={{ width: "100%" }}>
                <Input
                  value={name}
                  style={{ width: "calc(100% - 32px)" }}
                  onChange={(e) => {
                    if (!nameIsEdited) setNameIsEdited(true);
                    setName(e.target.value);
                  }}
                  onPressEnter={() => {
                    if (nameIsEdited) updateName({ name });
                  }}
                />
                {nameIsEdited ? (
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    loading={isSaving}
                    onClick={() =>
                      updateName({
                        name,
                      })
                    }
                  />
                ) : null}
              </Space.Compact>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card
          title={t("linked_calendars")}
          className="card-extra-responsive"
          extra={
            static_config.calMsEnabled || static_config.calGoogleEnabled ? (
              <Dropdown
                overlay={
                  <Menu
                    onClick={(c) =>
                      window.location.assign(
                        `/backend/cal/${c.key}/add?token=${token}`
                      )
                    }
                  >
                    {static_config.calMsEnabled ? (
                      <Menu.Item key="microsoft" icon={<WindowsOutlined />}>
                        {t("cal_microsoft")}
                      </Menu.Item>
                    ) : null}
                    {static_config.calGoogleEnabled ? (
                      <Menu.Item key="google" icon={<GoogleOutlined />}>
                        {t("cal_google")}
                      </Menu.Item>
                    ) : null}
                  </Menu>
                }
              >
                <Button icon={<LinkOutlined />}>
                  {t("link_calendar_action")}
                </Button>
              </Dropdown>
            ) : null
          }
        >
          <style jsx global>
            {`
              .card-extra-responsive .ant-card-head-title {
                text-overflow: initial;
                overflow: initial;
              }
              .card-extra-responsive .ant-card-head-wrapper {
                flex-wrap: wrap;
              }
            `}
          </style>
          <CalendarList />
          <FreshlyAddedCalendarModal
            freshlyAddedCalendars={freshlyAddedCalendars}
            onDone={() => setFreshlyAddedCalendars([])}
          />
        </Card>
      </Space>
    </>
  );
};

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "profile"])),
    },
  };
}

export default Profile;
