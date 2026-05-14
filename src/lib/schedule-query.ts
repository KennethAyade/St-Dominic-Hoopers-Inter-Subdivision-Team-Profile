import { MatchStatus, type Prisma } from "../generated/prisma/client";

export const RECORDED_RESULT_MATCH_WHERE = {
  OR: [
    { homeScore: { not: null } },
    { opponentScore: { not: null } },
    {
      AND: [{ resultText: { not: null } }, { resultText: { not: "" } }],
    },
  ],
} satisfies Prisma.MatchScheduleWhereInput;

export const UPCOMING_MATCHES_WHERE = {
  status: { in: [MatchStatus.SCHEDULED, MatchStatus.ONGOING, MatchStatus.POSTPONED] },
  NOT: RECORDED_RESULT_MATCH_WHERE,
} satisfies Prisma.MatchScheduleWhereInput;

export const RESULT_OR_COMPLETED_MATCHES_WHERE = {
  OR: [
    { status: MatchStatus.COMPLETED },
    {
      AND: [
        { status: { in: [MatchStatus.SCHEDULED, MatchStatus.ONGOING] } },
        RECORDED_RESULT_MATCH_WHERE,
      ],
    },
  ],
} satisfies Prisma.MatchScheduleWhereInput;

export const CLOSED_MATCHES_WHERE = {
  OR: [RESULT_OR_COMPLETED_MATCHES_WHERE, { status: MatchStatus.CANCELLED }],
} satisfies Prisma.MatchScheduleWhereInput;
