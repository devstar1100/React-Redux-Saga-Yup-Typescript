export interface ValueWithAdornment {
  title?: string;
  adornemnt: React.ReactNode;
  adornmentPosition: "start" | "end";
}

export type EntryValue = string | number | Date | React.ReactNode | ValueWithAdornment;

export interface EntryType {
  id?: number;
  [key: string]: EntryValue;
}

export interface TableProps {
  heading: EntryType;
  data: EntryType[];
  isLoading?: boolean;
}
