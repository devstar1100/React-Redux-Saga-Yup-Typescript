import { Grid, styled, Typography, TypographyProps } from "@mui/material";
import { FC, ReactElement } from "react";
import { GridProps } from "@mui/material/Grid/Grid";
import { preventForwardProps } from "../../lib/preventForwardProps";

interface IControlIcon {
  icon: ReactElement;
  title: string;
  active?: boolean;
  onClick: () => void;
  smallVariant?: boolean;
}

const ControlIcon: FC<IControlIcon> = ({
  icon,
  title,
  active = false,
  onClick,
  smallVariant = false,
}): ReactElement => {
  return (
    <Wrapper
      isActive={active}
      onClick={active ? onClick : undefined}
      container
      width="fit-content"
      gap="10px"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
    >
      <IconWrapper container justifyContent="center" alignItems="center" isActive={active} smallVariant={smallVariant}>
        {icon}
      </IconWrapper>
      <Title variant={smallVariant ? "subtitle1" : "body2"} isActive={active} fontWeight="700">
        {title}
      </Title>
    </Wrapper>
  );
};
const Wrapper = styled<FC<GridProps & { isActive?: boolean }>>(
  Grid,
  preventForwardProps(["isActive"]),
)(({ isActive }) => ({
  cursor: isActive ? "pointer" : "not-allowed",
  opacity: isActive ? 1 : 0.4,
}));

const IconWrapper = styled<FC<GridProps & { isActive?: boolean; smallVariant?: boolean }>>(
  Grid,
  preventForwardProps(["isActive", "smallVariant"]),
)(({ theme, isActive, smallVariant }) => ({
  height: "auto",
  width: "fit-content",
  backgroundColor: isActive ? theme.palette.blue[400] : theme.palette.additional[300],
  borderRadius: theme.borderRadius.md,
  padding: "8px",
  svg: {
    fill: isActive ? theme.palette.additional[200] : theme.palette.additional[800],
    width: smallVariant ? "32px" : "48px",
    height: smallVariant ? "32px" : "48px",
  },
  [theme.breakpoints.down(1430)]: {
    svg: {
      width: "32px",
      height: "32px",
    },
  },
  [theme.breakpoints.up("xl")]: {
    svg: {
      width: "48px",
      height: "48px",
    },
  },
}));

const Title = styled<FC<TypographyProps & { isActive?: boolean }>>(
  Typography,
  preventForwardProps(["isActive"]),
)(({ theme, isActive }) => ({
  color: isActive ? theme.palette.textColor.light : theme.palette.textColor.main,
  [theme.breakpoints.up("xl")]: {
    fontSize: theme.typography.body2.fontSize,
    lineHeight: theme.typography.body2.lineHeight,
  },
}));

export default ControlIcon;
