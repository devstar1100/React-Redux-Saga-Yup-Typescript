import { Grid, styled } from "@mui/material";

import SmallModalWrapper, { SmallModalWrapperProps } from "../SmallModalWrapper";
import { ActionsList } from "../../types/actions";

type Props = SmallModalWrapperProps & {
  actionsList: ActionsList;
};

const ActionsModal = ({ actionsList, isActive, onClose }: Props) => (
  <SmallModalWrapper isActive={isActive} onClose={onClose}>
    <ActionsWrapper>
      {actionsList.map(({ icon, title, handlerFunc }) => (
        <ActionBlock key={title} onClick={() => (handlerFunc(), onClose())}>
          {icon}
          {title}
        </ActionBlock>
      ))}
    </ActionsWrapper>
  </SmallModalWrapper>
);

const ActionsWrapper = styled(Grid)(() => ({
  display: "flex",
  flexDirection: "column",
  rowGap: "4px",
  minWidth: "140px",
}));

const ActionBlock = styled(Grid)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  columnGap: "10px",
  padding: "10px 6px",
  color: theme.palette.grey[100],
  fontFamily: "Inter",
  fontStyle: "normal",
  fontWeight: 400,
  fontSize: "13px",
  lineHeight: "140%",
  borderRadius: "5px",
  cursor: "pointer",

  "& svg": {
    width: "14px",
  },

  "&:hover": {
    backgroundColor: theme.palette.grey[500],
    color: theme.palette.grey[50],
  },
}));

export default ActionsModal;
