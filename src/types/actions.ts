export interface Action {
  icon?: React.ReactNode;
  title: string;
  handlerFunc: () => void;
}

export type ActionsList = Action[];
