import { styled } from "@mui/material";
import { FC, ReactElement, ReactNode } from "react";

interface Props {
  children: ReactNode | ReactNode[];
}

const FillLayout: FC<Props> = ({ children, ...props }): ReactElement => <Wrapper {...props}>{children}</Wrapper>;

const Wrapper = styled("div")(({ theme }) => ({
  position: "relative",
  // overflow: "hidden", I hope it does not break anything :O
  backgroundColor: theme.palette.additional[800],
  borderRadius: theme.borderRadius.md,
  border: `1px solid ${theme.palette.additional[700]}`,
  width: "100%",
  height: "fit-content",
}));

export default FillLayout;
