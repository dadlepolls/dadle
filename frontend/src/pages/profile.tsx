import { SaveOutlined } from "@ant-design/icons";
import { useQuery } from "@apollo/client";
import { useAuth } from "@components/AuthContext";
import { LoadingCard } from "@components/LoadingCard";
import { useMobileComponentsPrefered } from "@components/ResponsiveContext";
import { UPDATE_NAME } from "@operations/mutations/UpdateName";
import {
  UpdateName,
  UpdateNameVariables
} from "@operations/mutations/__generated__/UpdateName";
import { GET_MY_CALENDARS } from "@operations/queries/GetMyCalendars";
import { GetMyCalendars } from "@operations/queries/__generated__/GetMyCalendars";
import { useStyledMutation } from "@util/mutationWrapper";
import {
  Button,
  Card,
  Descriptions,
  Empty,
  Input,
  Space,
  Tooltip,
  Typography
} from "antd";
import * as ls from "local-storage";
import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useState } from "react";

const Profile: NextPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const mobileDisplay = useMobileComponentsPrefered();

  const [name, setName] = useState(user?.name ?? "");
  const [nameIsEdited, setNameIsEdited] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { loading: calendarsLoading, data: calendarsData } =
    useQuery<GetMyCalendars>(GET_MY_CALENDARS);

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
    if (router.isReady) router.push("/");
    return <LoadingCard />;
  }

  const { getMyCalendars: calendars } = calendarsData || {};

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
            <Descriptions.Item
              label="Anmeldedienst"
              style={{ textTransform: "capitalize" }}
            >
              {user.provider}
            </Descriptions.Item>
            <Descriptions.Item label="Name beim Anmeldedienst">
              <Tooltip
                title={`Eindeutige ID beim Anmeldedienst: ${user.idAtProvider}`}
              >
                {user.nameAtProvider}
              </Tooltip>
            </Descriptions.Item>
            <Descriptions.Item label="Email">{user.mail}</Descriptions.Item>
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
        {calendarsLoading ? (
          <LoadingCard title="Lade Kalender..." />
        ) : (
          <Card title="Meine verknüpften Kalender">
            {calendars?.length ? (
              <Space direction="vertical">
                {calendars.map((c, idx) => (
                  <Card key={idx} size="small" title={c.friendlyName}>
                    <ul>
                      <li>Aktiviert: {c.enabled ? "Ja" : "Nein"}</li>
                      <li>
                        Anbieter:{" "}
                        <span style={{ textTransform: "capitalize" }}>
                          {c.provider}
                        </span>
                      </li>
                      <li>Nutzername beim Anbieter: {c.usernameAtProvider}</li>
                    </ul>
                  </Card>
                ))}
              </Space>
            ) : (
              <Empty description="Du hast bisher keine Kalender verknüpft" />
            )}
          </Card>
        )}
      </Space>
    </>
  );
};

export default Profile;
