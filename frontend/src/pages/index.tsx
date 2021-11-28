import { useQuery } from "@apollo/client";
import { PollEditDialog } from "@components/PollEditDialog";
import { GET_POLLS_OVERVIEW } from "@operations/queries/GetPollsOverview";
import { GetPollsOverview } from "@operations/queries/__generated__/GetPollsOverview";
import { Card, Typography } from "antd";
import type { NextPage } from "next";
import { useRouter } from "next/dist/client/router";
import Head from "next/head";
import Link from "next/link";

const Home: NextPage = () => {
  const router = useRouter();

  const { loading, data, error } =
    useQuery<GetPollsOverview>(GET_POLLS_OVERVIEW);
  if (loading) return <div>loading...</div>;
  if (error) return <div>An Error occured: {JSON.stringify(error)}</div>;

  return (
    <>
      <Head>
        <title>DadleX</title>
      </Head>
      <PollEditDialog key="dialog" />
      {data?.getPolls.map((poll, idx) => (
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
          <small>&nbsp; by {poll.author}</small>
        </Card>
      ))}
    </>
  );
};

export default Home;
