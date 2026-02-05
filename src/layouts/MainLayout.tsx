import { Grid, styled } from "@mui/material";
import { FC, ReactElement, ReactNode } from "react";

interface Props {
  children: ReactNode | ReactNode[];
}

const MainLayout: FC<Props> = ({ children, ...props }): ReactElement => (
  <Background>
    <Wrapper minWidth="700px" margin="0 auto" {...props}>
      {children}
    </Wrapper>
  </Background>
);

const Wrapper = styled(Grid)(({ theme }) => ({
  backgroundColor: theme.palette.additional[900],
}));

const Background = styled(Grid)(({ theme }) => ({
  backgroundColor: theme.palette.additional[900],
}));

export default MainLayout;
