import { PlusOutlined } from "@ant-design/icons";
import { useQuery } from "@apollo/client";
import { ErrorPage } from "@components/ErrorPage";
import { LoadingCard } from "@components/LoadingCard";
import { PollEditDialog } from "@components/PollEditDialog";
import { PollLinkCard } from "@components/PollLinkCard";
import { GET_POLLS_OVERVIEW } from "@operations/queries/GetPollsOverview";
import { GetPollsOverview } from "@operations/queries/__generated__/GetPollsOverview";
import moment from "moment";
import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
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
          <PollLinkCard key={idx} poll={poll} router={router} />
        ))}
    </>
  );
};

export default Home;
