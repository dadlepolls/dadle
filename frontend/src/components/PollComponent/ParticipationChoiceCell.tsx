import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  QuestionCircleOutlined
} from "@ant-design/icons";
import { Checkbox, Popover } from "antd";
import { useTranslation } from "next-i18next";
import React from "react";
import { YesNoMaybe } from "./PollTypes";
import { mapChoiceToColorVariable } from "./util";

const ParticipationChoiceCell = ({
  editable = false,
  choice,
  suggestionWhenEmpty,
  overlappingEvents,
  onClick = () => {},
}: {
  editable?: boolean;
  choice?: YesNoMaybe;
  suggestionWhenEmpty?: YesNoMaybe;
  overlappingEvents?: string[];
  onClick?: () => any;
}) => {
  const { t } = useTranslation("pollresponses");
  const mapChoiceToIcon = (c?: YesNoMaybe, editable: boolean = false) => {
    switch (c) {
      case YesNoMaybe.Yes:
        return <CheckCircleOutlined />;
      case YesNoMaybe.No:
        return <CloseCircleOutlined />;
      case YesNoMaybe.Maybe:
        return <QuestionCircleOutlined />;
      default:
        return editable ? <Checkbox /> : <></>;
    }
  };

  return (
    <Popover
      visible={overlappingEvents?.length && editable ? undefined : false} //hide when there is no hint
      title={t("calendar_overlapping_events")}
      placement="bottom"
      content={<span>{overlappingEvents?.join(", ")}</span>}
    >
      <div
        className={`${editable ? "pollpage--option-choice-editable" : ""}`}
        style={{
          backgroundColor: `var(${mapChoiceToColorVariable(
            choice,
            editable ? suggestionWhenEmpty : undefined
          )})`,
        }}
        onClick={(e) => {
          e.preventDefault();
          editable ? onClick() : null;
        }}
        onMouseDown={
          (e) =>
            e.preventDefault() /* prevent selecting text on page when double-clicking fast */
        }
      >
        {mapChoiceToIcon(choice, editable)}
      </div>
    </Popover>
  );
};

export { ParticipationChoiceCell };

