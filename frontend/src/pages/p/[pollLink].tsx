import { useQuery } from "@apollo/client";
import { GET_POLL_BY_LINK } from "@operations/queries/GetPollByLink";
import { GetPollByLink } from "@operations/queries/__generated__/GetPollByLink";
import { Descriptions, PageHeader } from "antd";
import { NextPage } from "next";
import { useRouter } from "next/dist/client/router";

const PollPage: NextPage = () => {
  const router = useRouter();
  const { pollLink } = router.query;

  const { error, loading, data } = useQuery<GetPollByLink>(GET_POLL_BY_LINK, {
    skip: !pollLink,
    variables: { pollLink },
  });

  if (loading) return <div>loading...</div>;
  if (error) return <div>An Error occured: {JSON.stringify(error)}</div>;

  const { getPollByLink: poll } = data || {};

  return (
    <>
      <PageHeader
        ghost={false}
        onBack={() => router.back()}
        title={poll?.title}
        subTitle={poll?.author}
      >
        <Descriptions size="small" column={3}>
          <Descriptions.Item label="Created">tbd</Descriptions.Item>
        </Descriptions>
      </PageHeader>
    </>
  );
};

export default PollPage;
