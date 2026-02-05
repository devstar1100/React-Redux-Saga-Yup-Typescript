import { GridTemplateName } from "../types/customViews";

export const getGridTemplateTitleByName = (name: GridTemplateName): string =>
  ({
    [GridTemplateName.oneColumnGrid]: "Single grid",
    [GridTemplateName.twoColumnGrid]: "Two grid",
    [GridTemplateName.threeColumnGrid]: "Three grid",
    [GridTemplateName.fourColumnGrid]: "Four grid",
  }[name]);
