import Logo from "../Icons/Logo";
import { Grid, styled } from "@mui/material";
import VerticalGrayLine from "../Lines/VerticalGrayLine";
import SideBarCloseIcon from "../Icons/SideBarCloseIcon";
import SideBarOpenIcon from "../Icons/SideBarOpenIcon";
import { FC, ReactElement } from "react";

interface Props {
  openSideBar: boolean;
  handleToggleSideBar: () => void;
}

const LogoWrapper: FC<Props> = ({ openSideBar, handleToggleSideBar }): ReactElement => (
  <Grid
    gap={{ sm: "10px", lg: "16px" }}
    container
    wrap="nowrap"
    justifyContent="center"
    alignItems="center"
    width="fit-content"
  >
    <IconWrapper container alignItems="center" justifyContent="center" onClick={handleToggleSideBar}>
      {openSideBar ? <SideBarCloseIcon /> : <SideBarOpenIcon />}
    </IconWrapper>
    <VerticalGrayLine />
    <a href="\">
      <Logo />
    </a>
  </Grid>
);

const IconWrapper = styled(Grid)({
  cursor: "pointer",
});

export default LogoWrapper;
