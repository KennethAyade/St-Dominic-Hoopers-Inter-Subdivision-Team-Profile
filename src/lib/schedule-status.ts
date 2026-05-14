import { MatchStatus } from "../generated/prisma/client";

export type ScheduleStatusValue = (typeof MatchStatus)[keyof typeof MatchStatus];

type ScheduleResultFields = {
  status: ScheduleStatusValue;
  homeScore?: number | null;
  opponentScore?: number | null;
  resultText?: string | null;
};

export function hasRecordedScheduleResult(schedule: Omit<ScheduleResultFields, "status">) {
  return (
    (schedule.homeScore !== null && schedule.homeScore !== undefined) ||
    (schedule.opponentScore !== null && schedule.opponentScore !== undefined) ||
    Boolean(schedule.resultText?.trim())
  );
}

export function getEffectiveScheduleStatus(schedule: ScheduleResultFields): ScheduleStatusValue {
  if (
    (schedule.status === MatchStatus.SCHEDULED || schedule.status === MatchStatus.ONGOING) &&
    hasRecordedScheduleResult(schedule)
  ) {
    return MatchStatus.COMPLETED;
  }

  return schedule.status;
}

export function isUpcomingSchedule(schedule: ScheduleResultFields) {
  return (
    (schedule.status === MatchStatus.SCHEDULED ||
      schedule.status === MatchStatus.ONGOING ||
      schedule.status === MatchStatus.POSTPONED) &&
    !hasRecordedScheduleResult(schedule)
  );
}

export function isClosedSchedule(schedule: ScheduleResultFields) {
  return (
    schedule.status === MatchStatus.COMPLETED ||
    schedule.status === MatchStatus.CANCELLED ||
    ((schedule.status === MatchStatus.SCHEDULED || schedule.status === MatchStatus.ONGOING) &&
      hasRecordedScheduleResult(schedule))
  );
}
