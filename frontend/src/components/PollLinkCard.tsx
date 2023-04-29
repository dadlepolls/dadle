import { GetPollsOverview_getPolls } from "@operations/queries/__generated__/GetPollsOverview";
import { getUserDisplayname } from "@util/getUserDisplayname";
import { Card, Tooltip, Typography } from "antd";
import moment from "moment";
import { useTranslation } from "next-i18next";
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
  const { t } = useTranslation();

  return (
    <Card
      {...props}
      style={{ marginTop: "16px", cursor: "pointer" }}
      size="small"
      onClick={() => router.push(`/p/${poll.link}`)}
      hoverable
    >
      <Typography.Text strong={true}>
        <Link href={`/p/${poll.link}`}>{poll.title}</Link>
      </Typography.Text>
      {poll.author.user || poll.author.anonName ? (
        <small>
          &nbsp; {t("poll_by_name", { name: getUserDisplayname(poll.author) })}
        </small>
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

