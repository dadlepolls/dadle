import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SaveOutlined
} from "@ant-design/icons";
import { CREATE_OR_UPDATE_COMMENT } from "@operations/mutations/CreateOrUpdateComment";
import { DELETE_COMMENT } from "@operations/mutations/DeleteComment";
import {
  CreateOrUpdateComment,
  CreateOrUpdateCommentVariables
} from "@operations/mutations/__generated__/CreateOrUpdateComment";
import {
  DeleteComment,
  DeleteCommentVariables
} from "@operations/mutations/__generated__/DeleteComment";
import { GetPollByLink_getPollByLink_comments } from "@operations/queries/__generated__/GetPollByLink";
import { useStyledMutation } from "@util/mutationWrapper";
import { removeTypenameFromObject } from "@util/removeTypenameFromObject";
import { Button, Card, Input, Space } from "antd";
import * as ls from "local-storage";
import React, { useState } from "react";

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

  const createOrUpdateCommentMutation = useStyledMutation<
    CreateOrUpdateComment,
    CreateOrUpdateCommentVariables
  >(CREATE_OR_UPDATE_COMMENT, {
    statusCallbackFunction: setCommentIsSaving,
    successMessage: "Kommentar gespeichert!",
  });
  const saveComment = async (comment: SaveCommentType) => {
    await createOrUpdateCommentMutation({
      pollId,
      comment: removeTypenameFromObject({ ...comment }),
    });
  };

  const deleteCommentMutation = useStyledMutation<
    DeleteComment,
    DeleteCommentVariables
  >(DELETE_COMMENT, {
    successMessage: "Kommentar gelöscht!",
    errorMessage: "Löschen fehlgeschlagen!",
  });
  const deleteComment = async (commentId: string) => {
    await deleteCommentMutation(
      { pollId, commentId },
      {
        update(cache) {
          const normalizedId = cache.identify({
            id: commentId,
            __typename: "PollComment",
          });
          cache.evict({ id: normalizedId });
          cache.gc();
        },
      }
    );
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
            ls.set("username", c.by);
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
            onClick={() =>
              setCommentBeingAdded({ by: ls.get<string>("username"), text: "" })
            }
          >
            Neuer Kommentar
          </Button>
        </div>
      )}
    </Card>
  );
};
