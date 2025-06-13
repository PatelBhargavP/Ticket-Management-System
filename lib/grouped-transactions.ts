import { ITransactionDetails } from "@/models/Transaction";


export enum ETimeRange {
    thisWeek = 'This Week',
    last3Weeks = 'Last 3 Weeks',
    last3Months = 'Last 3 Months',
    older = 'Older'
}

export const TimeGroupsOrder = [
    ETimeRange.thisWeek,
    ETimeRange.last3Weeks,
    ETimeRange.last3Months,
    ETimeRange.older
];

export type IGroupedTransactions = {
    [key in ETimeRange]?: ITransactionDetails[];
};

export function groupTransactionsByTimeRange(transactions: ITransactionDetails[]): IGroupedTransactions {
  const now = new Date();
  const startOfWeek = getStartOfWeek(now);
  const threeWeeksAgo = new Date(startOfWeek);
  threeWeeksAgo.setDate(startOfWeek.getDate() - 21);

  const threeMonthsAgo = new Date(now);
  threeMonthsAgo.setMonth(now.getMonth() - 3);

  const grouped: IGroupedTransactions = {};

  for (const tx of transactions) {
    const createdAt = new Date(tx.createdAt);

    if (createdAt >= startOfWeek) {
      grouped[ETimeRange.thisWeek] ? grouped[ETimeRange.thisWeek].push(tx) : grouped[ETimeRange.thisWeek] = [tx];
    } else if (createdAt >= threeWeeksAgo) {
      grouped[ETimeRange.last3Weeks] ? grouped[ETimeRange.last3Weeks].push(tx) : grouped[ETimeRange.last3Weeks] = [tx];
    } else if (createdAt >= threeMonthsAgo) {
      grouped[ETimeRange.last3Months] ? grouped[ETimeRange.last3Months].push(tx) : grouped[ETimeRange.last3Months] = [tx];
    } else {
      grouped[ETimeRange.older] ? grouped[ETimeRange.older].push(tx) : grouped[ETimeRange.older] = [tx];
    }
  }

  return grouped;
}

function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0 (Sun) - 6 (Sat)
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust to Monday
  return new Date(d.setDate(diff));
}
