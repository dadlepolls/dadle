import {
  IPollOption,
  PollOptionType,
  TAccumulatedChoicesPerOption
} from "./PollTypes";

const OptionTitle = ({
  option,
  badgeContent,
}: {
  option: IPollOption;
  badgeContent?: string;
}) => {
  const content = [];

  const from = option.from ? new Date(option.from) : null;
  const to = option.to ? new Date(option.to) : null;

  const padToTwoDigits = (n?: number) => String(n).padStart(2, "0");

  if (
    option.type == PollOptionType.Date ||
    option.type == PollOptionType.DateTime
  ) {
    content.push(
      <span key="weekday" className="pollpage--participation-option-weekday">
        {from?.toLocaleDateString(undefined, { weekday: "short" })}
      </span>
    );
    content.push(
      <span key="day" className="pollpage--participation-option-day">
        {from?.getDate()}
      </span>
    );
    content.push(
      <span key="month" className="pollpage--participation-option-month">
        {from?.toLocaleDateString(undefined, { month: "short" })}
      </span>
    );
  }
  if (option.type == PollOptionType.DateTime) {
    content.push(
      <span key="times" className="pollpage--participation-option-times">
        <span>
          {padToTwoDigits(from?.getHours())}
          <sup>{padToTwoDigits(from?.getMinutes())}</sup>
        </span>
        <span>
          {padToTwoDigits(to?.getHours())}
          <sup>{padToTwoDigits(to?.getMinutes())}</sup>
        </span>
      </span>
    );
  }
  if (option.type == PollOptionType.Arbitrary) {
    content.push(<span key="arb">{option.title}</span>);
  }

  return (
    <div className="pollpage--participation-option">
      {badgeContent ? (
        <span className="pollpage--participation-option-badge">
          {badgeContent}
        </span>
      ) : null}
      {content}
    </div>
  );
};

const OptionsRow = ({
  options,
  choiceCountPerOption = {},
}: {
  options: IPollOption[];
  choiceCountPerOption?: TAccumulatedChoicesPerOption;
}) => {
  return (
    <div className="pollpage--participation-option-row">
      {options.map((o, idx) => (
        <OptionTitle
          option={o}
          key={idx}
          badgeContent={
            choiceCountPerOption[o._id]?.Yes.length
              ? String(choiceCountPerOption[o._id]?.Yes.length)
              : undefined
          }
        />
      ))}
    </div>
  );
};

export { OptionsRow };

