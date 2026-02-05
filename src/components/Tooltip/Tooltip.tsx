import * as React from "react";
import { TooltipProps, Tooltip as MuiTooltip, styled } from "@mui/material";

const Tooltip = ({ ...props }: TooltipProps) => <StyledTooltip {...props} />;

const StyledTooltip = styled(({ className, ...props }: TooltipProps) => (
  <MuiTooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  "& .MuiTooltip-tooltip": {
    backgroundColor: theme.palette.grey[100],
    color: "#000",
    fontSize: "13px",
    lineHeight: "18px",
    fontWeight: "400",
    maxWidth: "100%",
    padding: "2px 10px",
    borderRadius: "4px",
    marginBottom: "0 !important",
  },
}));

export default Tooltip;
