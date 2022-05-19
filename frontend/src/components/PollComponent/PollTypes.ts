enum PollOptionType {
  Arbitrary = "Arbitrary",
  Date = "Date",
  DateTime = "DateTime",
}

enum YesNoMaybe {
  Maybe = "Maybe",
  No = "No",
  Yes = "Yes",
}

enum EventStatus {
  Confirmed = "Confirmed",
  Free = "Free",
  Tentative = "Tentative",
}

interface IPollAuthorUser {
  _id: string;
  name: string;
}

interface IPollUserOrAnon {
  anonName: string | null;
  user: IPollAuthorUser | null;
}

interface IPollOption {
  _id: string;
  type: PollOptionType;
  from: any | null;
  to: any | null;
  title: string | null;
}

interface IPollChoice {
  choice: YesNoMaybe;
  /**
   * references the ID of a PollOption of this very Poll
   */
  option: string;
}

interface IPollParticipation {
  _id: string;
  allowEdit: boolean;
  allowNameEdit: boolean;
  participantName: string;
  choices: IPollChoice[];
}

interface IPoll {
  options: IPollOption[];
  participations: IPollParticipation[];
}

interface IAvailabilityHintOverlappingEvent {
  title: string;
  status: EventStatus;
}

interface IAvailabilityHint {
  option: string;
  overlappingEvents: IAvailabilityHintOverlappingEvent[];
}

interface IPollWithAvailabilityHint extends IPoll {
  availabilityHints: IAvailabilityHint[];
}

type TPollWithOptionalAvailabilityHint = IPoll &
  Partial<IPollWithAvailabilityHint>;

type TPollParticipationWithOptionalId = Omit<IPollParticipation, "_id"> &
  Partial<Pick<IPollParticipation, "_id">>;

type TAccumulatedChoicesPerOption = Record<
  string,
  { yes: number; no: number; maybe: number }
>;

export { EventStatus, PollOptionType, YesNoMaybe };
export type {
  TAccumulatedChoicesPerOption,
  IAvailabilityHint,
  IAvailabilityHintOverlappingEvent,
  IPoll,
  IPollWithAvailabilityHint,
  TPollWithOptionalAvailabilityHint,
  IPollAuthorUser,
  IPollChoice,
  IPollOption,
  IPollParticipation,
  TPollParticipationWithOptionalId,
  IPollUserOrAnon,
};
