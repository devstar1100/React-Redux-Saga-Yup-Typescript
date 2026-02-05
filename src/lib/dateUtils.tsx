import { format, isValid } from "date-fns";
export const formatDate = (date: string | undefined, pattern: string): string => {
  if (!date) return "";
  const newDate = new Date(date);
  if (isValid(newDate)) {
    return format(newDate, pattern);
  } else {
    console.warn("Attempting to format invalid Date object");
    return "INVALID_DATE";
  }
};

export const timePattern = "yyyy-MM-dd HH:mm:ss.SSS"; //20th October 7:30 AM
export const timePattern2 = "yyyy-MM-dd HH:mm"; //20th October 7:30
