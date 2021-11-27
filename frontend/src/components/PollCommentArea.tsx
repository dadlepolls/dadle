import { GetPollByLink_getPollByLink_comments } from "@operations/queries/__generated__/GetPollByLink";
import { Card } from "antd";
import React from "react";

export const PollCommentArea = ({
  pollId,
  comments,
}: {
  pollId: string;
  comments: GetPollByLink_getPollByLink_comments[];
}) => {
  return (
    <Card title="Kommentare" style={{ marginTop: 16 }}>
      {comments.map((c, idx) => (
        <Card size="small" title={c.by} key={idx} style={{ marginBottom: 16 }}>
          {c.text}
        </Card>
      ))}
    </Card>
  );
};
