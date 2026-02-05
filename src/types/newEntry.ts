export enum NewEntryFieldTypes {
  text = "text",
  select = "select",
}

export interface NewEntryField {
  type: NewEntryFieldTypes;
  name: string;
  label: string;
  placeholder: string;
  options?: string[];
}
