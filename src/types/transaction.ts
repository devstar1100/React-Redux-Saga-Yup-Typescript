import { EntryType } from "./table";

export interface IRow {
  id: number;
  heading: EntryType;
  data: EntryType;
  details?: string;
  isLoading?: boolean;
  turboTX: boolean;
}

export enum TransactionMonitoringState {
  onchain = "Onchain",
  pending = "Pending",
  rolledback = "Rolledback",
  rejected = "Rejected",
}

export enum TransactionEventsListeningState {
  active = "Active",
  paused = "Paused",
  deleted = "Deleted",
}

export interface RowData {
  submitTime: Date;
  state: TransactionMonitoringState;
  txHash: string;
  project: string;
  block: string;
  confirmations: number;
  webhook: string;
}

export interface HeadingData {
  submitTime: string;
  state: string;
  txHash: string;
  project: string;
  block: string;
  confirmations: string;
  webhook: string;
}

type Row = Omit<IRow, "data" | "heading"> & { data: RowData; heading: HeadingData };

export type RowType = IRow & Row;
