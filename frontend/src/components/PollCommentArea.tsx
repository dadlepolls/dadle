import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SaveOutlined
} from "@ant-design/icons";
import { ApolloError, useMutation } from "@apollo/client";
import { CREATE_OR_UPDATE_COMMENT } from "@operations/mutations/CreateOrUpdateComment";
import { DELETE_COMMENT } from "@operations/mutations/DeleteComment";
import { CreateOrUpdateComment } from "@operations/mutations/__generated__/CreateOrUpdateComment";
import { DeleteComment } from "@operations/mutations/__generated__/DeleteComment";
import { GetPollByLink_getPollByLink_comments } from "@operations/queries/__generated__/GetPollByLink";
import { Button, Card, Input, message, Space } from "antd";
import NProgress from "nprogress";
import React, { useEffect, useState } from "react";

type SaveCommentType = Partial<
  Pick<GetPollByLink_getPollByLink_comments, "_id">
> &
  Omit<GetPollByLink_getPollByLink_comments, "_id" | "__typename">;

const PollComment = ({
  comment,
  editable = false,
  onEditClick = () => {},
  onDeleteClick = () => {},
  onSaveClick = (_) => {},
  isSaving = false,
}: {
  comment: Partial<GetPollByLink_getPollByLink_comments>;
  editable?: boolean;
  onSaveClick?: (comment: SaveCommentType) => any;
  onEditClick?: () => any;
  onDeleteClick?: () => any;
  isSaving?: boolean;
}) => {
  const [by, setBy] = useState(comment.by || "");
  const [text, setText] = useState(comment.text || "");

  return (
    <Card
      size="small"
      title={
        editable ? (
          <Input
            type="text"
            placeholder="Name"
            value={by}
            onChange={(e) => setBy(e.target.value)}
          />
        ) : (
          comment.by
        )
      }
      style={{ marginBottom: 16 }}
      extra={
        editable ? (
          <Button
            size="small"
            type="primary"
            loading={isSaving}
            icon={<SaveOutlined />}
            onClick={() => onSaveClick({ ...comment, by, text })}
            style={{ marginLeft: 16 }}
          />
        ) : (
          <Space>
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => onEditClick()}
            />
            <Button
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => onDeleteClick()}
            />
          </Space>
        )
      }
    >
      {editable ? (
        <Input.TextArea
          placeholder="Kommentar..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          autoSize={true}
        />
      ) : (
        comment.text
      )}
    </Card>
  );
};

export const PollCommentArea = ({
  pollId,
  comments,
}: {
  pollId: string;
  comments: GetPollByLink_getPollByLink_comments[];
}) => {
  const [editableComment, setEditableComment] =
    useState<GetPollByLink_getPollByLink_comments | null>(null);
  const [commentBeingAdded, setCommentBeingAdded] =
    useState<SaveCommentType | null>(null);

  const [commentIsSaving, setCommentIsSaving] = useState(false);

  const [createOrUpdateCommentMutation] = useMutation<CreateOrUpdateComment>(
    CREATE_OR_UPDATE_COMMENT
  );
  const [deleteCommentMutation] = useMutation<DeleteComment>(DELETE_COMMENT);

  useEffect(() => {
    if (commentIsSaving) NProgress.start();
    else NProgress.done();
  }, [commentIsSaving]);

  const saveComment = async (comment: SaveCommentType) => {
    setCommentIsSaving(true);
    try {
      await createOrUpdateCommentMutation({
        variables: {
          pollId: pollId,
          comment: {
            ...comment,
            __typename: undefined,
          },
        },
      });
      message.success("Kommentar gespeichert!");
    } catch (ex) {
      let additionalMessage;
      if (ex instanceof ApolloError) {
        additionalMessage = (
          <>
            <br />
            <small>{ex.message}</small>
          </>
        );
      }
      message.error(
        <>
          <span>Speichern fehlgeschlagen!</span>
          {additionalMessage}
        </>
      );
    } finally {
      setCommentIsSaving(false);
    }
  };

  const deleteComment = async (commentId: string) => {
    NProgress.start();
    try {
      await deleteCommentMutation({
        variables: {
          pollId: pollId,
          commentId,
        },
        update(cache) {
          const normalizedId = cache.identify({
            id: commentId,
            __typename: "PollComment",
          });
          cache.evict({ id: normalizedId });
          cache.gc();
        },
      });
    } catch (ex) {
      let additionalMessage;
      if (ex instanceof ApolloError) {
        additionalMessage = (
          <>
            <br />
            <small>{ex.message}</small>
          </>
        );
      }
      message.error(
        <>
          <span>Löschen fehlgeschlagen!</span>
          {additionalMessage}
        </>
      );
    } finally {
      NProgress.done();
    }
  };

  return (
    <Card title="Kommentare" style={{ marginTop: 16 }}>
      {comments.map((c, idx) => (
        <PollComment
          key={idx}
          comment={c}
          onDeleteClick={() => deleteComment(c._id)}
          onEditClick={() => setEditableComment(c)}
          editable={editableComment?._id == c._id}
          onSaveClick={async (c) => {
            await saveComment(c);
            setEditableComment(null);
          }}
          isSaving={commentIsSaving}
        />
      ))}
      {commentBeingAdded ? (
        <PollComment
          comment={commentBeingAdded}
          editable={true}
          onSaveClick={async (c) => {
            await saveComment(c);
            setCommentBeingAdded(null);
          }}
          isSaving={commentIsSaving}
        />
      ) : (
        <div
          style={{
            marginBottom: 16,
            display: "flex",
            alignItems: "flex-end",
            flexDirection: "column",
          }}
        >
          <Button
            shape="round"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCommentBeingAdded({ by: "", text: "" })}
          >
            Neuer Kommentar
          </Button>
        </div>
      )}
    </Card>
  );
};
