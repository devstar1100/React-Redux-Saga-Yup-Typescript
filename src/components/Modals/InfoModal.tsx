import { Grid, Typography, styled } from "@mui/material";

import InfoIcon from "../Icons/InfoIcon";
import CrossIcon from "../Icons/CrossIcon";
import SmallModalWrapper, { SmallModalWrapperProps } from "../SmallModalWrapper/SmallModalWrapper";

type Props = SmallModalWrapperProps & {
  title: string;
  description: string;
};

const InfoModal = ({ title, description, isActive, onClose }: Props) => (
  <SmallModalWrapper isActive={isActive} onClose={onClose}>
    <Grid minWidth="14px">
      <InfoIcon />
    </Grid>
    <Content>
      <Typography component="h6" variant="h6" color="grey.100">
        {title}
      </Typography>
      <Typography component="p" variant="body1" color="grey.100">
        {description}
      </Typography>
    </Content>
    <div onClick={onClose}>
      <CrossIcon />
    </div>
  </SmallModalWrapper>
);

const Content = styled(Grid)(() => ({
  display: "flex",
  flexDirection: "column",
  rowGap: "4px",
  width: "154px",
}));

export default InfoModal;
