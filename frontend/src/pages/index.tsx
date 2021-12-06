import { PlusOutlined } from "@ant-design/icons";
import { useQuery } from "@apollo/client";
import { ErrorPage } from "@components/ErrorPage";
import { LoadingCard } from "@components/LoadingCard";
import { PollEditDialog } from "@components/PollEditDialog";
import { GET_POLLS_OVERVIEW } from "@operations/queries/GetPollsOverview";
import { GetPollsOverview } from "@operations/queries/__generated__/GetPollsOverview";
import { Card, Tooltip, Typography } from "antd";
import moment from "moment";
import type { NextPage } from "next";
import { useRouter } from "next/dist/client/router";
import Head from "next/head";
import Link from "next/link";
import React from "react";

const Home: NextPage = () => {
  const router = useRouter();

  const { loading, data, error } =
    useQuery<GetPollsOverview>(GET_POLLS_OVERVIEW);

  if (error) return <ErrorPage error={error} />;

  const polls = data?.getPolls.map((p) => ({ ...p })) || [];

  return (
    <>
      <Head>
        <title>DadleX</title>
      </Head>
      <PollEditDialog
        title="Neue Umfrage erstellen"
        key="dialog"
        saveButtonIcon={<PlusOutlined />}
        saveButtonContent="Umfrage erstellen"
        onSaveSuccess={(p) => router.push(`/p/${p?.link}`)}
      />
      {loading ? <LoadingCard /> : null}
      {polls
        .sort((b, a) => moment(a.updatedAt).diff(moment(b.updatedAt)))
        .map((poll, idx) => (
          <Card
            key={idx}
            style={{ marginTop: "16px", cursor: "pointer" }}
            size="small"
            onClick={() => router.push(`/p/${poll.link}`)}
          >
            <Typography.Text strong={true}>
              <Link key={idx} href={`/p/${poll.link}`}>
                {poll.title}
              </Link>
            </Typography.Text>
            <small>&nbsp; von {poll.author}</small>
            {poll.updatedAt ? (
              <Tooltip title={moment(poll.updatedAt).format("DD.MM.YY HH:MM")}>
                <Typography.Text style={{ float: "right" }}>
                  {moment(poll.updatedAt).fromNow()}
                </Typography.Text>
              </Tooltip>
            ) : null}
          </Card>
        ))}
    </>
  );
};

export default Home;
