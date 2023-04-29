import { GetPollByLink_getPollByLink_author } from "@operations/queries/__generated__/GetPollByLink";
import { getUserDisplayname } from "@util/getUserDisplayname";
import { Tooltip, Typography } from "antd";
import moment from "moment";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

const PollInfoTooltip = ({
  author,
  createdAt,
  updatedAt,
  children,
}: {
  author?: GetPollByLink_getPollByLink_author;
  createdAt?: Date;
  updatedAt?: Date;
  children: JSX.Element;
}) => {
  const { t } = useTranslation("pollpage");
  const authorDisplayname = useMemo(() => {
    const displayname = getUserDisplayname(author);
    if (!displayname) return undefined;
    return displayname;
  }, [author]);
  
  const createdAtComponents = useMemo(() => {
    //both author name and created at given, return "Created by AUTHOR x days ago"
    if (authorDisplayname && createdAt)
      return (
        <>
          <Tooltip title={moment(createdAt).format("DD.MM.YY HH:MM:SS")}>
            <Typography.Text>
              {t("poll_created_by")} {authorDisplayname}{" "}
              {moment(createdAt).fromNow()}
            </Typography.Text>
          </Tooltip>
          <br />
        </>
      );
    if (createdAt)
      return (
        <>
          <Tooltip title={moment(createdAt).format("DD.MM.YY HH:MM:SS")}>
            <Typography.Text>
              {t("poll_created_at")} {moment(createdAt).fromNow()}
            </Typography.Text>
          </Tooltip>
          <br />
        </>
      );
    return <></>;
  }, [authorDisplayname, createdAt]);

  return (
    <Tooltip
      placement="bottomRight"
      title={
        <>
          {createdAtComponents}
          {updatedAt ? (
            <Tooltip title={moment(updatedAt).format("DD.MM.YY HH:MM:SS")}>
              <Typography.Text>
                {t("poll_changed_at")}&nbsp;
                {moment(updatedAt).fromNow()}
              </Typography.Text>
            </Tooltip>
          ) : null}
        </>
      }
    >
      {children}
    </Tooltip>
  );
};

export { PollInfoTooltip };

