import { Box, BoxProps, Grid, GridProps, styled } from "@mui/material";

export enum SmallModalType {
  local = "local",
  fullScreen = "fullScreen",
}

interface Props {
  children: React.ReactNode | React.ReactNode[];
  variant?: SmallModalType;
  additionalStyles?: React.CSSProperties;
  isActive: boolean;
  onClose: () => void;
}

export type SmallModalWrapperProps = Omit<Props, "children" | "variant">;

const SmallModalWrapper = ({
  children,
  variant = SmallModalType.local,
  additionalStyles = {},
  isActive,
  onClose,
}: Props) => (
  <>
    <Wrapper isActive={isActive} additionalStyles={additionalStyles}>
      {children}
    </Wrapper>
    <Darkener isActive={isActive} variant={variant} onClick={onClose} />
  </>
);

const Wrapper = styled(
  ({ isActive, additionalStyles, ...rest }: GridProps & Pick<Props, "isActive" | "additionalStyles">) => (
    <Grid {...rest} />
  ),
)(({ theme, isActive, additionalStyles }) => ({
  display: "flex",
  flexDirection: "row",
  alignItems: "flexStart",
  padding: "16px",
  gap: "6px",
  background: theme.palette.grey[600],
  borderRadius: "8px",
  border: `1px solid ${theme.palette.grey[400]}`,
  opacity: +isActive,
  visibility: isActive ? "visible" : "hidden",
  transition: "0.3s opacity, 0.3s visibility",
  position: "relative",
  zIndex: isActive ? 101 : "auto",
  cursor: "default",
  ...additionalStyles,
}));

const Darkener = styled(
  ({ variant, isActive, ...rest }: BoxProps & Pick<Props, "isActive"> & { variant: SmallModalType }) => (
    <Box {...rest} />
  ),
)(({ variant, isActive }) => ({
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  zIndex: 100,
  background: variant === SmallModalType.local ? "transparent" : "rgba(9, 9, 9, 0.6)",
  transition: "0.3s opacity, 0.3s visibility",
  opacity: +isActive,
  visibility: isActive ? "visible" : "hidden",
}));

export default SmallModalWrapper;
