import { DeleteOutlined, EditOutlined, SaveOutlined } from "@ant-design/icons";
import { useQuery } from "@apollo/client";
import { useAuth } from "@components/AuthContext";
import { ErrorPage } from "@components/ErrorPage";
import { LoadingCard } from "@components/LoadingCard";
import { PollCommentArea } from "@components/PollCommentArea";
import { Poll } from "@components/PollComponent/Poll";
import { PollResponsesMobile } from "@components/PollComponent/PollMobile";
import { TPollParticipationWithOptionalId } from "@components/PollComponent/PollTypes";
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
import { convertQueriedPoll } from "@util/convertQueriedPoll";
import { getUserDisplayname } from "@util/getUserDisplayname";
import { useStyledMutation } from "@util/mutationWrapper";
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
import * as ls from "local-storage";
import moment from "moment";
import { NextPage } from "next";
import { useTranslation } from "next-i18next";
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
  const { t } = useTranslation("pollpage");
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
          t("availability_hint_fetch_failed", { message: error.message })
        ),
    }
  );

  const deletePollMutation = useStyledMutation<DeletePoll, DeletePollVariables>(
    DELETE_POLL,
    {
      successMessage: t("poll_delete_success"),
      errorMessage: t("poll_delete_error"),
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
  >(CREATE_OR_UPDATE_PARTICIPATION, {
    successMessage: t("participation_saved"),
  });
  const saveParticipation = async (
    participation: TPollParticipationWithOptionalId
  ) => {
    await createOrUpdateParticipationMutation({
      pollId: poll?._id ?? "",
      participation: {
        _id: participation._id,
        anonName: participation.allowNameEdit
          ? participation.participantName
          : null,
        choices: participation.choices
          .map((n) => ({
            ...n,
            __typename: undefined,
          }))
          //filter options from an existing response that contains responses to non-existing options
          .filter((n) => poll?.options.some((o) => o._id == n.option)),
      },
    });
  };

  const deleteParticipationMutation = useStyledMutation<
    DeleteParticipation,
    DeleteParticipationVariables
  >(DELETE_PARTICIPATION, { successMessage: t("participation_deleted") });
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
    : Poll;

  return (
    <>
      <Head>
        <title>Dadle</title>
      </Head>
      {loading || !poll ? (
        <LoadingCard />
      ) : (
        <>
          <Head>
            <title>{poll?.title} | Dadle</title>
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
                    title={t("poll_delete_confirmation")}
                    okText={t("poll_delete_confirmation_yes")}
                    cancelText={t("poll_delete_confirmation_no")}
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
                <Descriptions.Item label={t("poll_created_at")}>
                  <Tooltip
                    title={moment(poll.createdAt).format("DD.MM.YY HH:MM:SS")}
                  >
                    {moment(poll.createdAt).fromNow()}
                  </Tooltip>
                </Descriptions.Item>
              ) : null}
              {poll.updatedAt ? (
                <Descriptions.Item label={t("poll_changed_at")}>
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
                title={t("poll_edit")}
                poll={poll}
                allowLinkEditing={false}
                saveButtonIcon={<SaveOutlined />}
                saveButtonContent={t("poll_save_changes")}
                onSaveSuccess={() => setIsEditingPoll(false)}
              />
            ) : null}
          </PageHeader>
          <Card>
            <PollResponseComponentByMedia
              poll={convertQueriedPoll(
                poll,
                user,
                availabilityHintData?.getPollByLink?.availabilityHints
              )}
              saveParticipationFunction={saveParticipation}
              deleteParticipationFunction={deleteParticipation}
              allowNameEditForNewParticipation={!user?._id}
              nameHint={user?.name ?? ls.get("username")}
              onNameHintChange={(name) => ls.set("username", name)}
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
      ...(await serverSideTranslations(locale, [
        "common",
        "pollpage",
        "pollresponses",
        "pollcomments",
        "polleditor",
      ])),
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
