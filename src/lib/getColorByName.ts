import { Palette, Theme } from "@mui/material";
import { DataSetColor } from "../types/customViews";

export const getColorByName = (color: DataSetColor, theme: Theme) => {
  const parts = color.split("-");

  if (parts.length === 1) return theme.palette[color as keyof Palette];
  return theme.palette[parts.slice(0, parts.length - 1).join("") as keyof Palette][Number(parts.slice(-1).pop())];
};
