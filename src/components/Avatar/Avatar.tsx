import { Avatar as MUIAvatar, styled, Typography } from "@mui/material";
import { FC, ReactElement } from "react";

interface IAvatar {
  latter?: string;
  avatar?: string;
}

const Avatar: FC<IAvatar> = ({ latter, avatar }): ReactElement => (
  <AvatarWrapper src={avatar}>
    <Typography variant="body2" color="yellow.100">
      {latter}
    </Typography>
  </AvatarWrapper>
);

const AvatarWrapper = styled(MUIAvatar)(({ theme }) => ({
  backgroundColor: theme.palette.violet[400],
}));
export default Avatar;
