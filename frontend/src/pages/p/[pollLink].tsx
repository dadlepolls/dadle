import { EditOutlined, SaveOutlined } from "@ant-design/icons";
import { useQuery } from "@apollo/client";
import { ErrorPage } from "@components/ErrorPage";
import { LoadingCard } from "@components/LoadingCard";
import { PollCommentArea } from "@components/PollCommentArea";
import {
  PollResponses,
  TPartialParticipationWithId
} from "@components/PollDetailPage/PollResponses";
import { PollResponsesMobile } from "@components/PollDetailPage/PollResponsesMobile";
import { PollEditDialog } from "@components/PollEditDialog";
import { useWindowIsSm } from "@components/ResponsiveContext";
import { CREATE_OR_UPDATE_PARTICIPATION } from "@operations/mutations/CreateOrUpdateParticipation";
import { DELETE_PARTICIPATION } from "@operations/mutations/DeleteParticipation";
import {
  CreateOrUpdateParticipation,
  CreateOrUpdateParticipationVariables
} from "@operations/mutations/__generated__/CreateOrUpdateParticipation";
import {
  DeleteParticipation,
  DeleteParticipationVariables
} from "@operations/mutations/__generated__/DeleteParticipation";
import { GET_POLL_BY_LINK } from "@operations/queries/GetPollByLink";
import { GetPollByLink } from "@operations/queries/__generated__/GetPollByLink";
import { getUserDisplayname } from "@util/getUserDisplayname";
import { useStyledMutation } from "@util/mutationWrapper";
import { removeTypenameFromObject } from "@util/removeTypenameFromObject";
import { Button, Card, Descriptions, PageHeader, Tooltip } from "antd";
import moment from "moment";
import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useState } from "react";

const PollPage: NextPage = () => {
  const router = useRouter();
  const { pollLink } = router.query;
  const isSm = useWindowIsSm();

  const [isEditingPoll, setIsEditingPoll] = useState(false);

  const { error, loading, data } = useQuery<GetPollByLink>(GET_POLL_BY_LINK, {
    skip: !pollLink,
    variables: { pollLink },
  });
  const { getPollByLink: poll } = data || {};

  const createOrUpdateParticipationMutation = useStyledMutation<
    CreateOrUpdateParticipation,
    CreateOrUpdateParticipationVariables
  >(CREATE_OR_UPDATE_PARTICIPATION, { successMessage: "Antwort gespeichert!" });
  const saveParticipation = async (
    participation: TPartialParticipationWithId
  ) => {
    await createOrUpdateParticipationMutation({
      pollId: poll?._id ?? "",
      participation: {
        ...removeTypenameFromObject({ ...participation }),
        choices: participation.choices
          .map((n) => ({
            ...n,
            __typename: undefined,
          }))
          //filter options from an existing response that contains responses to options that have been deleted
          .filter((n) => poll?.options.some((o) => o._id == n.option)),
      },
    });
  };

  const deleteParticipationMutation = useStyledMutation<
    DeleteParticipation,
    DeleteParticipationVariables
  >(DELETE_PARTICIPATION, { successMessage: "Antwort gelöscht!" });
  const deleteParticipation = async (participationId: string) => {
    await deleteParticipationMutation(
      {
        pollId: poll?._id ?? "",
        participationId,
      },
      {
        update(cache) {
          const normalizedId = cache.identify({
            id: participationId,
            __typename: "PollParticipation",
          });
          cache.evict({ id: normalizedId });
          cache.gc();
        },
      }
    );
  };

  if (error) return <ErrorPage error={error} />;

  const PollResponseComponentByMedia = isSm
    ? PollResponsesMobile
    : PollResponses;

  return (
    <>
      <Head>
        <title>DadleX</title>
      </Head>
      {loading || !poll ? (
        <LoadingCard />
      ) : (
        <>
          <Head>
            <title>{poll?.title} | DadleX</title>
          </Head>
          <PageHeader
            ghost={false}
            onBack={() => router.back()}
            title={poll?.title}
            subTitle={poll?.author ? getUserDisplayname(poll.author) : null}
            style={{ marginBottom: "16px" }}
            extra={
              <Button
                hidden={isEditingPoll}
                onClick={() => setIsEditingPoll(true)}
                icon={<EditOutlined />}
              />
            }
          >
            <Descriptions size="small" column={isSm ? 1 : 3}>
              {poll.createdAt ? (
                <Descriptions.Item label="Umfrage erstellt">
                  <Tooltip
                    title={moment(poll.createdAt).format("DD.MM.YY HH:MM:SS")}
                  >
                    {moment(poll.createdAt).fromNow()}
                  </Tooltip>
                </Descriptions.Item>
              ) : null}
              {poll.updatedAt ? (
                <Descriptions.Item label="Letzte Änderung">
                  <Tooltip
                    title={moment(poll.updatedAt).format("DD.MM.YY HH:MM:SS")}
                  >
                    {moment(poll.updatedAt).fromNow()}
                  </Tooltip>
                </Descriptions.Item>
              ) : null}
            </Descriptions>

            {isEditingPoll ? (
              <PollEditDialog
                title="Umfrage bearbeiten"
                poll={poll}
                saveButtonIcon={<SaveOutlined />}
                saveButtonContent="Änderungen speichern"
                onSaveSuccess={() => setIsEditingPoll(false)}
              />
            ) : null}
          </PageHeader>
          <Card>
            <PollResponseComponentByMedia
              poll={poll}
              saveParticipationFunction={saveParticipation}
              deleteParticipationFunction={deleteParticipation}
            />
          </Card>
          <PollCommentArea pollId={poll._id} comments={poll.comments} />
        </>
      )}
    </>
  );
};

export default PollPage;
