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
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";

const Home: NextPage = () => {
  const { t } = useTranslation("index");
  const router = useRouter();
  const { loading, data, error } =
    useQuery<GetPollsOverview>(GET_POLLS_OVERVIEW);

  if (error) return <ErrorPage error={error} />;

  const polls = data?.getPolls.map((p) => ({ ...p })) || [];

  return (
    <>
      <Head>
        <title>Dadle</title>
      </Head>
      <PollEditDialog
        title={t("create_new_poll")}
        key="dialog"
        saveButtonIcon={<PlusOutlined />}
        saveButtonContent={t("create_poll")}
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

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, [
        "common",
        "index",
        "polleditor",
      ])),
    },
  };
}

export default Home;
