import { SaveOutlined } from "@ant-design/icons";
import { useAuth } from "@components/AuthContext";
import { CalendarList } from "@components/CalendarList";
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
  Input,
  Space,
  Tooltip,
  Typography
} from "antd";
import * as ls from "local-storage";
import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

const Profile: NextPage = () => {
  const router = useRouter();
  const { user, authLoading } = useAuth();
  const mobileDisplay = useMobileComponentsPrefered();

  const [name, setName] = useState("");
  const [nameIsEdited, setNameIsEdited] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) setName(user.name);
    return () => {};
  }, [user?.name]);

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
        <Card title="Meine verknüpften Kalender">
          <CalendarList />
        </Card>
      </Space>
    </>
  );
};

export default Profile;
