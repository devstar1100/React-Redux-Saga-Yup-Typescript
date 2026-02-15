import { Collapse, Grid, Typography, styled, CollapseProps, useTheme } from "@mui/material";
import { FC, ReactElement, useEffect, useState } from "react";
import { CollapseArrowUp } from "../Icons/CollapseArrowUp";
import { CollapseArrowDown } from "../Icons/CollapseArrowDown";
import { NavLink } from "react-router-dom";
import { GridProps } from "@mui/material/Grid/Grid";
import { preventForwardProps } from "../../lib/preventForwardProps";
import { useSelector } from "react-redux";
import { getSidebarItemsState } from "../../redux/reducers/appReducer";
import { useDispatch } from "react-redux";
import { updateSidebarItemsState } from "../../redux/actions/appActions";

interface ISubItem {
  subItem?: {
    id: string;
    title: string;
    link: string;
    isDisabled?: boolean;
    isSelected?: boolean;
  }[];
}

interface ICollapseItem extends ISubItem {
  id: string;
  title: string;
  icon?: ReactElement;
  link?: string;
  openSideBar: boolean;
  isDisabled?: boolean;
  isSelected?: boolean;
  handleToggleSideBar: (e: boolean) => void;
}

const CollapseItem: FC<ICollapseItem> = ({
  id,
  title,
  link,
  icon,
  subItem,
  openSideBar,
  isDisabled,
  isSelected = false,
  handleToggleSideBar,
}): ReactElement => {
  const dispatch = useDispatch();
  const theme = useTheme();

  const sidebarItemsState = useSelector(getSidebarItemsState);

  const open = !!sidebarItemsState[id];

  const setOpen = (nextValue: boolean) => dispatch(updateSidebarItemsState({ [id]: nextValue }));

  useEffect(() => {
    if (!openSideBar && open) {
      setOpen(false);
    }
  }, [openSideBar]);

  const handleClick = () => {
    if (isDisabled) return;

    setOpen(!open);
    if (!openSideBar) {
      handleToggleSideBar(true);
    }
  };

  return (
    <CollapseContainer container className="sideBarItemTitle" open={open} subItem={!!subItem} openSideBar={openSideBar}>
      {link ? (
        <NavLink to={link} style={{ width: "100%" }}>
          <TitleWrapper
            alignItems="center"
            gap={{ sm: "12px", lg: "18px" }}
            wrap="nowrap"
            container
            open={open}
            isSelected={isSelected}
          >
            <Wrapper container alignItems="center" gap={{ sm: "12px", lg: "18px" }}>
              {icon}
              <Typography variant="body1" fontWeight="700" whiteSpace="nowrap" display={openSideBar ? "flex" : "none"}>
                {title}
              </Typography>
            </Wrapper>
            {subItem && (
              <Grid container width="fit-content" height="auto" display={openSideBar ? "flex" : "none"}>
                {open ? <CollapseArrowUp /> : <CollapseArrowDown />}
              </Grid>
            )}
          </TitleWrapper>
        </NavLink>
      ) : (
        <TitleWrapper
          className="collapseWrapper"
          alignItems="center"
          gap={{ sm: "12px", lg: "18px" }}
          wrap="nowrap"
          onClick={handleClick}
          container
          open={open}
          subItem={!!subItem}
          openSideBar={openSideBar}
          isDisabled={isDisabled}
          isSelected={isSelected}
        >
          <Wrapper container alignItems="center" gap={{ sm: "12px", lg: "18px" }} open={open}>
            {icon}
            <Typography variant="body1" fontWeight="700" whiteSpace="nowrap" display={openSideBar ? "flex" : "none"}>
              {title}
            </Typography>
          </Wrapper>
          {subItem && (
            <Grid container width="fit-content" height="auto" display={openSideBar ? "flex" : "none"}>
              {open ? <CollapseArrowUp /> : <CollapseArrowDown />}
            </Grid>
          )}
        </TitleWrapper>
      )}

      {subItem && (
        <SubItemWrapper in={open} timeout="auto" open={open} openSideBar={openSideBar}>
          {subItem.map(({ title, link, isDisabled = false, isSelected, id }) =>
            !isDisabled ? (
              <NavLink key={id} to={link} className={isSelected ? "active" : ""}>
                <SubItem container>
                  <Typography variant="body2" color="main.200" whiteSpace="nowrap">
                    {title}
                  </Typography>
                </SubItem>
              </NavLink>
            ) : (
              <div key={id}>
                <SubItem container sx={{ ":hover p": { color: `${theme.palette.grey[300]} !important` } }}>
                  <Typography variant="body2" color="grey.300" whiteSpace="nowrap" sx={{ cursor: "not-allowed" }}>
                    {title}
                  </Typography>
                </SubItem>
              </div>
            ),
          )}
        </SubItemWrapper>
      )}
    </CollapseContainer>
  );
};

const Wrapper = styled<FC<GridProps & { open?: boolean }>>(
  Grid,
  preventForwardProps(["open"]),
)(({ theme, open }) => ({
  svg: {
    path: {
      stroke: open ? theme.palette.main[50] : theme.palette.main[100],
      circle: {
        stroke: open ? theme.palette.main[50] : theme.palette.main[100],
      },
    },
    rect: {
      stroke: open ? theme.palette.main[50] : theme.palette.main[100],
      circle: {
        stroke: open ? theme.palette.main[50] : theme.palette.main[100],
      },
    },
  },
  ":hover": {
    svg: {
      path: {
        stroke: theme.palette.main[50],
        circle: {
          stroke: theme.palette.main[50],
        },
      },
      rect: {
        stroke: theme.palette.main[50],
        circle: {
          stroke: theme.palette.main[50],
        },
      },
    },
  },
}));

const CollapseContainer = styled<FC<GridProps & { open?: boolean; subItem?: boolean; openSideBar?: boolean }>>(
  Grid,
  preventForwardProps(["open", "subItem", "openSideBar"]),
)(({ theme, open, subItem, openSideBar }) => ({
  backgroundColor: "transparent",
  borderTop: open && subItem ? "1px solid transparent" : `1px solid ${theme.palette.additional[700]}`,
  padding: "8px 0",
  ":hover": {
    borderTop: "1px solid transparent",
  },
  width: !openSideBar && open ? "62px !important" : "100% !important",
  maxWidth: "100%",
  [theme.breakpoints.down("xl")]: {
    maxWidth: openSideBar ? "250px" : "fit-content",
  },
}));

const TitleWrapper = styled<
  FC<
    GridProps & { open?: boolean; subItem?: boolean; openSideBar?: boolean; isDisabled?: boolean; isSelected: boolean }
  >
>(
  Grid,
  preventForwardProps(["open", "subItem", "openSideBar", "isSelected", "isDisabled"]),
)(({ theme, open, subItem, openSideBar, isDisabled, isSelected }) => ({
  cursor: "pointer",
  padding: openSideBar ? "12px 14px" : "10px 14px",
  [theme.breakpoints.down("xl")]: {
    padding: "12px 6px 12px 14px",
  },
  "@media(max-height: 700px)": {
    padding: "6px 6px 6px 14px",
  },
  p: {
    color: !isDisabled
      ? open || isSelected
        ? theme.palette.main[50]
        : theme.palette.main[100]
      : theme.palette.additional[300],
  },
  textShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
  backgroundColor: (open && subItem) || isSelected ? theme.palette.additional[700] : "transparent",
  borderRadius: open || isSelected ? theme.borderRadius.sm : 0,
  ":hover": !isDisabled
    ? {
        backgroundColor: theme.palette.additional[700],
        borderRadius: theme.borderRadius.sm,
        p: {
          color: theme.palette.main[50],
        },
      }
    : {
        cursor: "not-allowed",
        svg: {
          path: {
            stroke: theme.palette.additional[300],
            circle: {
              stroke: theme.palette.additional[300],
            },
          },
        },
      },
  "& svg": isDisabled
    ? {
        path: {
          stroke: theme.palette.additional[300],
          circle: {
            stroke: theme.palette.additional[300],
          },
        },
      }
    : {},
  [theme.breakpoints.down("lg")]: {
    padding: "6px",
  },
}));

const SubItemWrapper = styled<FC<CollapseProps & { open?: boolean; subItem?: boolean; openSideBar?: boolean }>>(
  Collapse,
  preventForwardProps(["open", "openSideBar"]),
)(({ theme, openSideBar }) => {
  return {
    width: openSideBar ? "100%" : "0px",
    backgroundColor: "transparent",
    position: "relative",

    "&::after": {
      position: "absolute",
      content: '" "',
      top: "10px",
      left: "26px",
      width: "1px",
      height: "calc(100% - 30px)",
      opacity: 0.3,
      background: theme.palette.additional[200],
    },
    "& a.active div p": {
      color: theme.palette.main[50],
      fontWeight: 600,
    },
  };
});

const SubItem = styled(Grid)(({ theme }) => ({
  padding: "10px 60px",
  borderRadius: theme.borderRadius.sm,
  ":hover p": {
    color: theme.palette.textColor.light,
  },
  position: "relative",
  "&::after": {
    position: "absolute",
    content: '" "',
    top: "50%",
    left: "26px",
    width: "24px",
    height: "1px",
    opacity: 0.3,
    background: theme.palette.additional[200],
  },
}));

export default CollapseItem;
