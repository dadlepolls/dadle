import { DeleteOutlined } from "@ant-design/icons";
import { GetPollByLink_getPollByLink_options } from "@operations/queries/__generated__/GetPollByLink";
import { PollOptionType } from "__generated__/globalTypes";
import { Alert, Button, Form, Input, Segmented, Space, Tooltip } from "antd";
import { Rule } from "antd/lib/form";
import moment from "moment";
import "moment/locale/de";
import { useTranslation } from "next-i18next";
import { useMemo } from "react";
import {
  Event,
  Calendar as RBCalendar,
  SlotInfo,
  momentLocalizer,
  stringOrDate,
} from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";

interface PollOptionAsEvent extends Event {
  optionIndex: number;
  optionId?: string;
}

const localizer = momentLocalizer(moment);
const Calendar = withDragAndDrop<PollOptionAsEvent>(RBCalendar as any);

const OptionEditorCalendar = ({
  value = [],
  onChange = () => {},
  pollTitle,
}: {
  value?: Partial<GetPollByLink_getPollByLink_options>[];
  onChange?: (value: Partial<GetPollByLink_getPollByLink_options>[]) => any;
  pollTitle: string;
}) => {
  const { t } = useTranslation("polleditor");

  const mapValueToCalendarEvents = (
    value: Partial<GetPollByLink_getPollByLink_options>[]
  ) => {
    return value.map<PollOptionAsEvent>((o, idx) => ({
      optionIndex: idx,
      optionId: o._id,
      start: moment(o.from).toDate(),
      end: moment(
        o.type == PollOptionType.Date
          ? moment(o.from).hours(23).minutes(59).seconds(59)
          : o.to
      ).toDate(),
      title: pollTitle,
      allDay: o.type == PollOptionType.Date,
    }));
  };

  const isMidnight = (dt: Date | string) => {
    let date = moment(dt);
    return date.hours() === 0 && date.minutes() === 0 && date.seconds() === 0;
  };

  const getFirstDateOrDateTimeEvent = (
    v: Partial<GetPollByLink_getPollByLink_options>[]
  ) =>
    v.find(
      (o) => o.type == PollOptionType.Date || o.type == PollOptionType.DateTime
    );

  //this assumes that the entries are sorted
  const firstEventStart = useMemo(() => {
    const first = getFirstDateOrDateTimeEvent(value)
      ? moment(getFirstDateOrDateTimeEvent(value)?.from)
      : moment().set({ h: 8, m: 0 });
    if (isMidnight(first.toDate())) first.set({ h: 8, m: 0 });
    return first;
  }, [value]);

  const handleEventChange = (e: {
    event: PollOptionAsEvent;
    start: stringOrDate;
    end: stringOrDate;
    isAllDay: boolean;
  }) => {
    if (!moment(e.start).isSame(moment(e.end), "day")) {
      //prevent events from lasting longer than one day
      e.end = moment(e.start).hours(23).minutes(59).seconds(59).toDate();
    }
    if (e.isAllDay) {
      //assure that the event start date is always midnight of the very day when created as all-day event
      e.start = moment(e.start).hours(0).minutes(0).seconds(0).toDate();
    }
    const opts = [...value];
    opts[e.event.optionIndex] = {
      ...opts[e.event.optionIndex],
      from: e.start,
      to: e.isAllDay ? undefined : e.end,
      type: e.isAllDay ? PollOptionType.Date : PollOptionType.DateTime,
    };
    onChange(opts);
  };

  const handleEventCreate = (e: SlotInfo) => {
    const isAllDay = isMidnight(e.start) && isMidnight(e.end);
    const opts = [...value];
    opts.push({
      type: isAllDay ? PollOptionType.Date : PollOptionType.DateTime,
      from: e.start,
      to: isAllDay ? undefined : e.end,
    });
    onChange(opts);
  };

  return (
    <>
      <Alert
        type="info"
        showIcon
        description={t("calendar_option_delete_explanation")}
        style={{ marginBottom: 16 }}
      />
      <Calendar
        defaultDate={firstEventStart ? firstEventStart.toDate() : undefined}
        scrollToTime={firstEventStart ? firstEventStart.toDate() : undefined}
        defaultView="week"
        localizer={localizer}
        resizable
        style={{ height: 550, minWidth: 600 }}
        events={mapValueToCalendarEvents(value)}
        onEventDrop={handleEventChange}
        onEventResize={handleEventChange}
        onSelectSlot={handleEventCreate}
        onDoubleClickEvent={(e) => {
          const opts = [...value];
          opts.splice(e.optionIndex, 1);
          onChange(opts);
        }}
        selectable
        views={["week", "agenda"]}
        popup={true}
        messages={{
          agenda: t("calendar_overview"),
          week: t("calendar_weekview"),
          today: t("calendar_today"),
          next: t("calendar_nextweek"),
          previous: t("calendar_previousweek"),
        }}
        formats={{
          dayRangeHeaderFormat: (range, culture, localizer) => {
            return `${
              localizer?.format(range.start, "DD.MM.", culture || "de") || ""
            } - ${
              localizer?.format(range.end, "DD.MM.", culture || "de") || ""
            }`;
          },
          dayFormat: (date, culture, localizer) => {
            return localizer?.format(date, "dd (DD.)", culture || "de") || "";
          },
        }}
      />
    </>
  );
};

const OptionEditorArbitrary = ({
  value = [],
  onChange = () => {},
}: {
  value?: Partial<GetPollByLink_getPollByLink_options>[];
  onChange?: (value: Partial<GetPollByLink_getPollByLink_options>[]) => any;
}) => {
  const { t } = useTranslation("polleditor");
  return (
    <>
      {[...value, {}].map((o, idx, arr) => (
        <Space.Compact key={idx} style={{ width: "100%", marginTop: 4 }}>
          <Input
            type="text"
            style={{ width: "calc(100% - 32px)" }}
            placeholder={
              idx == arr.length - 1 ? t("option_add") : t("option_placeholder")
            }
            value={o.title || ""}
            onChange={(e) => {
              const opts = [...value];
              opts[idx] = {
                ...opts[idx],
                type: PollOptionType.Arbitrary,
                title: e.target.value,
              };
              onChange(opts);
            }}
          />
          {idx < arr.length - 1 ? (
            <Button
              icon={<DeleteOutlined />}
              onClick={() => {
                const opts = [...value];
                opts.splice(idx, 1);
                onChange(opts);
              }}
            />
          ) : null}
        </Space.Compact>
      ))}
    </>
  );
};

export enum OptionEditorType {
  Arbitrary,
  Calendar,
}

const OptionEditorTypeSelector = ({
  value,
  onChange = () => {},
  typeChangeDisabled,
}: {
  value?: OptionEditorType;
  onChange?: (o: OptionEditorType) => any;
  typeChangeDisabled?: boolean;
}) => {
  const { t } = useTranslation("polleditor");
  return (
    <Tooltip
      title={
        typeChangeDisabled ? (
          <>
            {t("type_change_disabled_error")}
            <br />
            {t("type_change_disabled_hint")}
          </>
        ) : null
      }
    >
      <Segmented
        disabled={typeChangeDisabled}
        value={value}
        options={[
          { value: OptionEditorType.Calendar, label: t("type_calendar") },
          { value: OptionEditorType.Arbitrary, label: t("type_arbitrary") },
        ]}
        onChange={(e) => onChange(e as OptionEditorType)}
      />
    </Tooltip>
  );
};

export const OptionEditor = ({
  options,
  pollTitle,
}: {
  options?: GetPollByLink_getPollByLink_options[];
  pollTitle: string;
}) => {
  const { t } = useTranslation("polleditor");
  /* disabled type change in case there are any options specified */
  const typeChangeDisabled = options && options.length > 0;

  const optionsValidatorRules: Rule[] = [
    {
      validator: (
        _,
        val: Partial<GetPollByLink_getPollByLink_options>[] = []
      ) => {
        if (val.some((v) => v.type == PollOptionType.Arbitrary && !v.title))
          return Promise.reject(new Error(t("option_name_required_error")));
        if (val.length == 0)
          return Promise.reject(new Error(t("option_none_given_error")));
        return Promise.resolve();
      },
    },
  ];

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
        overflowX: "auto",
      }}
    >
      <Form.Item noStyle name="editorType">
        <OptionEditorTypeSelector typeChangeDisabled={typeChangeDisabled} />
      </Form.Item>
      <div style={{ width: "100%", overflowX: "auto" }}>
        <div
          style={{
            width: "100%",
            marginTop: 16,
          }}
        >
          <Form.Item dependencies={["editorType"]} noStyle>
            {({ getFieldValue }) => {
              const editorType = getFieldValue("editorType");
              if (editorType == OptionEditorType.Arbitrary)
                return (
                  <Form.Item name="options" rules={optionsValidatorRules}>
                    <OptionEditorArbitrary />
                  </Form.Item>
                );
              else if (editorType == OptionEditorType.Calendar)
                return (
                  <Form.Item name="options" rules={optionsValidatorRules}>
                    <OptionEditorCalendar pollTitle={pollTitle} />
                  </Form.Item>
                );
              else
                return (
                  <Form.Item name="options" rules={optionsValidatorRules}>
                    <input type="hidden" />
                  </Form.Item>
                );
            }}
          </Form.Item>
        </div>
      </div>
    </div>
  );
};
