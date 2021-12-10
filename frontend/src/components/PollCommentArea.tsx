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
import { getUserDisplayname } from "@util/getUserDisplayname";
import { useStyledMutation } from "@util/mutationWrapper";
import { removeTypenameFromObject } from "@util/removeTypenameFromObject";
import { Button, Card, Input, Space } from "antd";
import * as ls from "local-storage";
import React, { useState } from "react";
import { PollCommentInput } from "__generated__/globalTypes";
import { useAuth } from "./AuthContext";

const PollComment = ({
  comment,
  editable = false,
  onEditClick = () => {},
  onDeleteClick = () => {},
  onSaveClick = (_) => {},
  isSaving = false,
  showEditButton = true,
  showDeleteButton = true,
  canEditName = true,
  authorNameHint,
}: {
  comment: Partial<GetPollByLink_getPollByLink_comments>;
  editable?: boolean;
  onSaveClick?: (props: {
    _id?: string;
    text: string;
    authorName?: string;
  }) => any;
  onEditClick?: () => any;
  onDeleteClick?: () => any;
  isSaving?: boolean;
  canEditName?: boolean;
  showEditButton?: boolean;
  showDeleteButton?: boolean;
  authorNameHint?: string;
}) => {
  const [by, setBy] = useState(
    canEditName
      ? getUserDisplayname(comment.author) ?? authorNameHint ?? ""
      : undefined
  );
  const [text, setText] = useState(comment.text || "");

  return (
    <Card
      size="small"
      title={
        editable && canEditName ? (
          <Input
            type="text"
            placeholder="Name"
            value={by || ""}
            onChange={(e) => setBy(e.target.value)}
          />
        ) : (
          getUserDisplayname(comment.author) ?? authorNameHint
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
            onClick={() =>
              onSaveClick({
                _id: comment._id,
                text,
                authorName: canEditName ? by : undefined,
              })
            }
            style={{ marginLeft: 16 }}
          />
        ) : (
          <Space>
            {showEditButton ? (
              <Button
                size="small"
                icon={<EditOutlined />}
                onClick={() => onEditClick()}
              />
            ) : null}
            {showDeleteButton ? (
              <Button
                size="small"
                icon={<DeleteOutlined />}
                onClick={() => onDeleteClick()}
              />
            ) : null}
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
  const { user, isAuthenticated } = useAuth();
  const [editableComment, setEditableComment] =
    useState<GetPollByLink_getPollByLink_comments | null>(null);
  const [commentBeingAdded, setCommentBeingAdded] =
    useState<PollCommentInput | null>(null);

  const [commentIsSaving, setCommentIsSaving] = useState(false);

  const createOrUpdateCommentMutation = useStyledMutation<
    CreateOrUpdateComment,
    CreateOrUpdateCommentVariables
  >(CREATE_OR_UPDATE_COMMENT, {
    statusCallbackFunction: setCommentIsSaving,
    successMessage: "Kommentar gespeichert!",
  });
  const saveComment = async (comment: PollCommentInput) => {
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
          showEditButton={!c.author.user?._id || c.author.user._id == user?._id}
          showDeleteButton={
            !!c.author.anonName || c.author.user?._id == user?._id
          }
          canEditName={!c.author.user?._id}
          onSaveClick={async (c) => {
            await saveComment({
              _id: c._id,
              text: c.text,
              anonName: c.authorName,
            });
            setEditableComment(null);
          }}
          isSaving={commentIsSaving}
        />
      ))}
      {commentBeingAdded ? (
        <PollComment
          comment={{
            ...commentBeingAdded,
            _id: undefined,
          }}
          editable={true}
          canEditName={!user?._id}
          authorNameHint={user?.name ?? ls.get<string>("username")}
          onSaveClick={async (c) => {
            ls.set("username", c.authorName);
            await saveComment({
              text: c.text,
              anonName: isAuthenticated ? null : c.authorName,
            });
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
            onClick={() => setCommentBeingAdded({ text: "" })}
          >
            Neuer Kommentar
          </Button>
        </div>
      )}
    </Card>
  );
};
