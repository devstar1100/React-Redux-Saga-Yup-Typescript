import { Typography, styled } from "@mui/material";

export const ActiveFilter = styled(Typography)<{ withClose?: boolean }>(({ theme, withClose = true }) => ({
  padding: `7px ${withClose ? "36px" : "16px"} 7px 16px`,
  backgroundColor: theme.palette.additional[700],
  borderRadius: "20px",
  position: "relative",
}));

export const CloseBtn = styled("div")(({ theme }) => ({
  width: "9px",
  height: "9px",
  position: "absolute",
  right: "10px",
  top: "8px",
  cursor: "pointer",

  "&:before, &:after": {
    content: "''",
    width: "2px",
    height: "9px",
    borderRadius: "2px",
    backgroundColor: theme.palette.main[400],
    display: "block",
    position: "absolute",
  },

  "&:before": {
    transform: "rotate(45deg)",
    top: "5px",
  },

  "&:after": {
    transform: "rotate(-45deg)",
    top: "5px",
  },
}));
