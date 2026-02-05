import { Box, Grid, styled } from "@mui/material";
import { useLocation } from "react-router-dom";
import { FC, ReactElement, useCallback } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";

import { getUserData } from "../../redux/reducers/authReducer";
import LogoWrapper from "./LogoWrapper";
import BreadcrumbsWrapper from "./BreadcrumbsWrapper";
import UserBlock from "./UserBlock";
import Button from "../Button/Button";
import { pages } from "../../lib/routeUtils";
import BrushIcon from "../Icons/BrushIcon";
import MonitorIcon from "../Icons/MonitorIcon";
import { getIsCustomViewEditMode } from "../../redux/reducers/customViewReducer";
import { updateIsCustomViewEditMode } from "../../redux/actions/customViewActions";
import { getCurrentRoute } from "../../lib/getCurrentRoute";

interface Props {
  openSideBar: boolean;
  handleToggleSideBar: () => void;
}

const Navigation: FC<Props> = ({ openSideBar, handleToggleSideBar }): ReactElement => {
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const userData = useSelector(getUserData);
  const isCustomViewEditMode = useSelector(getIsCustomViewEditMode);

  const currentRoute = getCurrentRoute(pathname);

  const handleButtonClick = useCallback(() => {
    dispatch(updateIsCustomViewEditMode(!isCustomViewEditMode));
  }, [isCustomViewEditMode]);

  return (
    <Wrapper gap={{ sm: "20px", md: 0 }} container wrap="nowrap" justifyContent="space-between">
      <LogoWrapper openSideBar={openSideBar} handleToggleSideBar={handleToggleSideBar} />
      <BreadcrumbsWrapper />
      <Box display="flex" alignItems="center" columnGap="16px">
        {currentRoute === pages.customView() && (
          <>
            <Button
              icon={isCustomViewEditMode ? <MonitorIcon /> : <BrushIcon />}
              color={isCustomViewEditMode ? "green" : "blue"}
              onClick={handleButtonClick}
            >
              {isCustomViewEditMode ? "Go to Live mode" : "Go to Edit mode"}
            </Button>
            <Box borderRight="1px solid #636363" height="32px" />
          </>
        )}
        <UserBlock title={`${userData["first-name"]} ${userData["last-name"]}`} />
      </Box>
    </Wrapper>
  );
};

const Wrapper = styled(Grid)(({ theme }) => ({
  position: "sticky",
  top: 0,
  zIndex: 2,
  backgroundColor: theme.palette.main[400],
  boxShadow: theme.palette.boxShadow.main,
  padding: "14px 24px",
  [theme.breakpoints.down("lg")]: {
    padding: "8px 16px",
  },
}));

export default Navigation;
