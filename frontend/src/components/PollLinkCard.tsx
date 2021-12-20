import { GetPollsOverview_getPolls } from "@operations/queries/__generated__/GetPollsOverview";
import { getUserDisplayname } from "@util/getUserDisplayname";
import { Card, Tooltip, Typography } from "antd";
import moment from "moment";
import Link from "next/link";
import { NextRouter } from "next/router";

const PollLinkCard = ({
  router,
  poll,
  ...props //necessary, so that PollLinkCard cann be wrapped in an antd Popover
}: {
  router: NextRouter;
  poll: GetPollsOverview_getPolls;
}): JSX.Element => {
  return (
    <Card
      style={{ marginTop: "16px", cursor: "pointer" }}
      size="small"
      onClick={() => router.push(`/p/${poll.link}`)}
      hoverable
      {...props}
    >
      <Typography.Text strong={true}>
        <Link href={`/p/${poll.link}`}>{poll.title}</Link>
      </Typography.Text>
      {poll.author.user || poll.author.anonName ? (
        <small>&nbsp; von {getUserDisplayname(poll.author)}</small>
      ) : null}
      {poll.updatedAt ? (
        <Tooltip title={moment(poll.updatedAt).format("DD.MM.YY HH:MM")}>
          <Typography.Text style={{ float: "right" }}>
            {moment(poll.updatedAt).fromNow()}
          </Typography.Text>
        </Tooltip>
      ) : null}
    </Card>
  );
};

export { PollLinkCard };

