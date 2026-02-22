import React, { FC, ReactElement, ReactNode } from "react";
import { alpha, Box, Grid, Typography, styled } from "@mui/material";
import { TreeItem as MuiTreeItem, treeItemClasses, TreeItemProps } from "@mui/lab";
import BrushIcon from "../../../components/Icons/BrushIcon";

export interface TreeItemData {
  id: string;
  title: string;
  icon?: ReactNode;
  description?: string;
  children?: TreeItemData[];
  nonEditable?: boolean;
  hideEditButton?: boolean;
  onDoubleClick: (event: React.MouseEvent<HTMLLIElement, MouseEvent>, item: TreeItemData) => void;
}

const TreeItem: FC<TreeItemData> = (parentProps): ReactElement => {
  return (
    <StyledTreeItem
      nodeId={parentProps.id}
      key={parentProps.id}
      label={
        <Row container wrap="nowrap" alignItems="center" gap="8px" paddingLeft="10px">
          {parentProps?.icon}
          <Grid container justifyContent="space-between" maxWidth="470px">
            <Typography variant="body2" color="textColor.lightGray">
              {parentProps.title}
            </Typography>
            {parentProps?.description && (
              <Typography variant="body2" color="textColor.lightGray">
                {parentProps?.description}
              </Typography>
            )}
          </Grid>
          {!parentProps.nonEditable && !parentProps.children?.length && !parentProps.hideEditButton && (
            <IconWrapper onClick={(e: any) => (e.stopPropagation(), parentProps.onDoubleClick(e, parentProps))}>
              <BrushIcon />
            </IconWrapper>
          )}
        </Row>
      }
      onDoubleClick={parentProps.hideEditButton ? (e) => parentProps.onDoubleClick(e, parentProps) : undefined}
    >
      {(parentProps.children || []).map((child) => (
        <TreeItem
          {...child}
          key={child.id}
          hideEditButton={parentProps.hideEditButton}
          onDoubleClick={parentProps.onDoubleClick}
        />
      ))}
    </StyledTreeItem>
  );
};

const StyledTreeItem = styled((props: TreeItemProps) => <MuiTreeItem {...props} />)(({ theme }) => ({
  "& .Mui-selected, .Mui-focused, ::hover, .Mui-expanded,": {
    background: "none !important",
  },
  "& .MuiTreeItem-content": {
    padding: 0,
    marginBottom: "7px",
  },
  "& .MuiTreeItem-content.Mui-selected": {
    background: "none !important",
  },
  "& .MuiTreeItem-label": {
    padding: 0,
  },
  [`& .${treeItemClasses.iconContainer}`]: {
    "& .close": {
      opacity: 0.3,
    },
  },
  [`& .${treeItemClasses.group}`]: {
    marginLeft: "7px",
    paddingLeft: "25px",
    borderLeft: `1px solid ${alpha(theme.palette.textColor.main, 0.4)}`,
  },
}));

const Row = styled(Grid)({
  "&:hover > :last-child": {
    opacity: 1,
    visibility: "visible",
  },
});

const IconWrapper = styled(Box)({
  opacity: 0,
  visibility: "hidden",
  transition: "opacity 0.3s, visibility 0.3s",

  "& > svg": { width: "16px", height: "16px" },
});

export default TreeItem;
