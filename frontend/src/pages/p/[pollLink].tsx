import { DeleteOutlined, EditOutlined, SaveOutlined } from "@ant-design/icons";
import { useQuery } from "@apollo/client";
import { useAuth } from "@components/AuthContext";
import { ErrorPage } from "@components/ErrorPage";
import { LoadingCard } from "@components/LoadingCard";
import { PollCommentArea } from "@components/PollCommentArea";
import {
  PollResponses,
  TPartialParticipationWithId
} from "@components/PollDetailPage/PollResponses";
import { PollResponsesMobile } from "@components/PollDetailPage/PollResponsesMobile";
import { PollEditDialog } from "@components/PollEditDialog";
import { useMobileComponentsPrefered } from "@components/ResponsiveContext";
import { CREATE_OR_UPDATE_PARTICIPATION } from "@operations/mutations/CreateOrUpdateParticipation";
import { DELETE_PARTICIPATION } from "@operations/mutations/DeleteParticipation";
import { DELETE_POLL } from "@operations/mutations/DeletePoll";
import {
  CreateOrUpdateParticipation,
  CreateOrUpdateParticipationVariables
} from "@operations/mutations/__generated__/CreateOrUpdateParticipation";
import {
  DeleteParticipation,
  DeleteParticipationVariables
} from "@operations/mutations/__generated__/DeleteParticipation";
import {
  DeletePoll,
  DeletePollVariables
} from "@operations/mutations/__generated__/DeletePoll";
import { GET_POLL_AVAILABILITY_HINTS } from "@operations/queries/GetPollAvailabilityHints";
import { GET_POLL_BY_LINK } from "@operations/queries/GetPollByLink";
import { GetPollAvailabilityHints } from "@operations/queries/__generated__/GetPollAvailabilityHints";
import {
  GetPollByLink,
  GetPollByLink_getPollByLink
} from "@operations/queries/__generated__/GetPollByLink";
import { getUserDisplayname } from "@util/getUserDisplayname";
import { useStyledMutation } from "@util/mutationWrapper";
import { removeTypenameFromObject } from "@util/removeTypenameFromObject";
import {
  Button,
  Card,
  Descriptions,
  message,
  PageHeader,
  Popconfirm,
  Space,
  Tooltip
} from "antd";
import moment from "moment";
import { NextPage } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { PollOptionType } from "__generated__/globalTypes";

const sortPollOptions = (poll: GetPollByLink_getPollByLink) => {
  const { options: originalOptions, ...pollData } = poll;
  const options = [...(originalOptions || [])].sort((a, b) => {
    if (
      a.type == PollOptionType.Arbitrary &&
      b.type == PollOptionType.Arbitrary
    )
      return 0;
    if (a.type == PollOptionType.Arbitrary) return -1;
    if (b.type == PollOptionType.Arbitrary) return 1;
    if (!a.from || !b.from) return 0;
    return moment(a.from).diff(moment(b.from));
  });
  return { ...pollData, options };
};

const PollPage: NextPage = () => {
  const router = useRouter();
  const { pollLink } = router.query;
  const mobileDisplay = useMobileComponentsPrefered();
  const { user } = useAuth();

  const [isEditingPoll, setIsEditingPoll] = useState(false);

  const { error, loading, data } = useQuery<GetPollByLink>(GET_POLL_BY_LINK, {
    skip: !pollLink,
    variables: { pollLink },
  });
  const poll = data?.getPollByLink
    ? sortPollOptions(data.getPollByLink)
    : undefined;

  //query availability hints separately so that main display won't be blocked by slow query
  const { data: availabilityHintData } = useQuery<GetPollAvailabilityHints>(
    GET_POLL_AVAILABILITY_HINTS,
    {
      skip: !pollLink || !user,
      variables: { pollLink },
      fetchPolicy: "network-only",
      nextFetchPolicy: "network-only",
      onError: (error) =>
        message.error(
          "Abrufen der Verfügbarkeit fehlgeschlagen: " + error.message
        ),
    }
  );

  const deletePollMutation = useStyledMutation<DeletePoll, DeletePollVariables>(
    DELETE_POLL,
    {
      successMessage: "Umfrage erfolgreich gelöscht!",
      errorMessage: "Umfrage konnte nicht gelöscht werden!",
    }
  );
  const deletePoll = async () => {
    if (!poll?._id) return;
    await deletePollMutation(
      { pollId: poll._id },
      {
        update(cache) {
          const normalizedId = cache.identify({
            id: poll._id,
            __typename: "Poll",
          });
          cache.evict({ id: normalizedId });
          cache.gc();
        },
      }
    );
    router.replace("/");
  };

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

  const PollResponseComponentByMedia = mobileDisplay
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
              !poll.author.user?._id || poll.author.user._id == user?._id ? (
                <Space>
                  <Button
                    hidden={isEditingPoll}
                    onClick={() => setIsEditingPoll(true)}
                    icon={<EditOutlined />}
                  />
                  <Popconfirm
                    title="Soll die Umfrage wirklich gelöscht werden?"
                    okText="Ja"
                    cancelText="Abbrechen"
                    placement="bottomLeft"
                    onConfirm={() => deletePoll()}
                  >
                    <Button icon={<DeleteOutlined />} hidden={isEditingPoll} />
                  </Popconfirm>
                </Space>
              ) : null
            }
          >
            <Descriptions size="small" column={mobileDisplay ? 1 : 3}>
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
                allowLinkEditing={false}
                saveButtonIcon={<SaveOutlined />}
                saveButtonContent="Änderungen speichern"
                onSaveSuccess={() => setIsEditingPoll(false)}
              />
            ) : null}
          </PageHeader>
          <Card>
            <PollResponseComponentByMedia
              poll={{
                ...poll,
                availabilityHints:
                  availabilityHintData?.getPollByLink?.availabilityHints,
              }}
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

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "pollpage"])),
    },
  };
}

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: "blocking",
  };
}

export default PollPage;
