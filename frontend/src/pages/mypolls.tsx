import { useQuery } from "@apollo/client";
import { useAuth } from "@components/AuthContext";
import { ErrorPage } from "@components/ErrorPage";
import { LoadingCard } from "@components/LoadingCard";
import { Poll } from "@components/PollComponent/Poll";
import { PollLinkCard } from "@components/PollLinkCard";
import { GET_MY_POLLS } from "@operations/queries/GetMyPolls";
import { GetMyPolls } from "@operations/queries/__generated__/GetMyPolls";
import { convertQueriedPoll } from "@util/convertQueriedPoll";
import { Card, Empty, Popover, Typography } from "antd";
import moment from "moment";
import { NextPage } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Head from "next/head";
import { useRouter } from "next/router";

const MyPolls: NextPage = () => {
  const { t } = useTranslation("mypolls");
  const { user } = useAuth();
  const router = useRouter();

  const { loading, error, data } = useQuery<GetMyPolls>(GET_MY_POLLS, {
    skip: !user,
    fetchPolicy: "network-only",
    nextFetchPolicy: "network-only",
  });

  if (!user) return <ErrorPage error={t("auth_required_error")} />;
  if (error) return <ErrorPage error={error} />;
  if (loading) return <LoadingCard />;

  const polls = data?.getMyPolls.map((p) => ({ ...p })) || [];

  return (
    <>
      <Head>
        <title>{t("title")} | DadleX</title>
      </Head>
      <Card title={t("title")}>
        <Typography.Paragraph>{t("explanation")}</Typography.Paragraph>
        {!polls?.length ? (
          <Empty description={t("no_participations")} />
        ) : (
          polls
            .sort((b, a) => moment(a.updatedAt).diff(moment(b.updatedAt)))
            .map((p, idx) => (
              <Popover
                key={idx}
                placement="bottom"
                overlayStyle={{ maxWidth: "70%" }}
                autoAdjustOverflow={false}
                content={<Poll poll={convertQueriedPoll(p, user)} readOnly />}
              >
                <PollLinkCard poll={p} router={router} />
              </Popover>
            ))
        )}
      </Card>
    </>
  );
};

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, [
        "common",
        "mypolls",
        "pollresponses",
      ])),
    },
  };
}

export default MyPolls;
