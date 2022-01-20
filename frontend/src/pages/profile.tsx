import {
  GoogleOutlined,
  LinkOutlined,
  SaveOutlined,
  WindowsOutlined
} from "@ant-design/icons";
import { useAuth } from "@components/AuthContext";
import { CalendarList } from "@components/CalendarList";
import { FreshlyAddedCalendarModal } from "@components/FreshlyAddedCalendarModal";
import { LoadingCard } from "@components/LoadingCard";
import { useMobileComponentsPrefered } from "@components/ResponsiveContext";
import { UPDATE_NAME } from "@operations/mutations/UpdateName";
import {
  UpdateName,
  UpdateNameVariables
} from "@operations/mutations/__generated__/UpdateName";
import { useStyledMutation } from "@util/mutationWrapper";
import {
  Button,
  Card,
  Descriptions,
  Dropdown,
  Input,
  Menu,
  message,
  Space,
  Tooltip,
  Typography
} from "antd";
import * as ls from "local-storage";
import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useState } from "react";

const Profile: NextPage = () => {
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
      message.error("Verknüpfen des Kalenders fehlgeschlagen!");
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
      successMessage: "Name aktualisiert!",
    }
  );

  if (!user) {
    if (router.isReady && !authLoading) router.push("/");
    return <LoadingCard />;
  }

  return (
    <>
      <Head>
        <title>Mein Profil | DadleX</title>
      </Head>
      <Space direction="vertical">
        <Card title="Profilinformationen">
          <Typography.Title
            level={3}
          >{`Howdy, ${user.name}!`}</Typography.Title>
          <Descriptions column={mobileDisplay ? 1 : 3}>
            <Descriptions.Item label="Name beim Anmeldedienst">
              <Tooltip
                title={`Eindeutige ID beim Anmeldedienst: ${user.idAtProvider}`}
              >
                {user.nameAtProvider}
              </Tooltip>
            </Descriptions.Item>
            <Descriptions.Item label="Email" span={mobileDisplay ? 1 : 2}>
              {user.mail}
            </Descriptions.Item>
            <Descriptions.Item label="Anzeigename">
              <Input.Group>
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
              </Input.Group>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card
          title="Meine verknüpften Kalender"
          className="card-extra-responsive"
          extra={
            <Dropdown
              overlay={
                <Menu
                  onClick={(c) =>
                    window.location.assign(
                      `/backend/cal/${c.key}/add?token=${token}`
                    )
                  }
                >
                  <Menu.Item key="microsoft" icon={<WindowsOutlined />}>
                    Microsoft 365&reg;-Kalender
                  </Menu.Item>
                  <Menu.Item key="google" icon={<GoogleOutlined />}>
                    Google-Kalender
                  </Menu.Item>
                </Menu>
              }
            >
              <Button icon={<LinkOutlined />}>Kalender verknüpfen</Button>
            </Dropdown>
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

export default Profile;
