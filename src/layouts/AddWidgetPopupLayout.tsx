import React from "react";
import { Box, BoxProps, Grid, GridProps, styled } from "@mui/material";
import Button from "../components/Button";

interface Props {
  title: string;
  isOpen: boolean;
  onConfirm: () => void;
  onDecline: () => void;
  children: React.ReactNode;
}

const AddWidgetPopupLayout = ({ title, isOpen, onConfirm, onDecline, children }: Props) => {
  return (
    <>
      <Wrapper isOpen={isOpen}>
        <Column>
          <Header>{title}</Header>
          <Content>{children}</Content>
          <Footer>
            <Button sx={{ minWidth: "82px", width: "82px" }} color="transparent" onClick={onDecline}>
              Cancel
            </Button>
            <Button sx={{ minWidth: "109px", width: "109px" }} color="blue" onClick={onConfirm}>
              Save
            </Button>
          </Footer>
        </Column>
      </Wrapper>
      <Darkener isOpen={isOpen} onClick={onDecline} />
    </>
  );
};

const Wrapper = styled(({ isOpen, ...rest }: GridProps & Pick<Props, "isOpen">) => <Grid {...rest} />)(
  ({ isOpen }) => ({
    opacity: +isOpen,
    visibility: isOpen ? "visible" : "hidden",
    transition: "0.3s opacity, 0.3s visibility",
    position: "fixed",
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
    zIndex: isOpen ? 100 : "auto",
    width: "1600px",
    maxWidth: "90%",
    maxHeight: "95%",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  }),
);

const Column = styled(Grid)(({ theme }) => ({
  background: theme.palette.grey[600],
  borderRadius: "10px",
  cursor: "default",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  width: "100%",
  height: "100%",
}));

const Header = styled(Box)(({ theme }) => ({
  background: theme.palette.grey[700],
  padding: "23px 24px",
  border: "1px solid #1F1F22",
  color: theme.palette.white,
  fontFamily: "Inter",
  fontSize: "16px",
  fontStyle: "normal",
  fontWeight: 600,
  lineHeight: "140%",
}));

const Content = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: "16px 24px 24px 24px",
  overflow: "hidden auto",
}));

const Footer = styled(Box)(({ theme }) => ({
  background: theme.palette.grey[700],
  padding: "16px 24px",
  border: "1px solid #1F1F22",
  color: theme.palette.white,
  fontFamily: "Inter",
  fontSize: "16px",
  fontStyle: "normal",
  fontWeight: 600,
  lineHeight: "140%",
  boxShadow: "0px -4px 4px 0px rgba(93, 79, 79, 0.05)",
  display: "flex",
  justifyContent: "flex-end",
  columnGap: "12px",
}));

const Darkener = styled(({ isOpen, ...rest }: BoxProps & Pick<Props, "isOpen">) => <Box {...rest} />)(({ isOpen }) => ({
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  zIndex: 99,
  background: "rgba(79, 79, 79, 0.50)",
  transition: "0.3s opacity, 0.3s visibility",
  opacity: +isOpen,
  visibility: isOpen ? "visible" : "hidden",
}));

export default AddWidgetPopupLayout;
