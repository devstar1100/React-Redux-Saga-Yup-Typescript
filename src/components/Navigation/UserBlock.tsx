import { Grid, Typography } from "@mui/material";
import Avatar from "../Avatar/Avatar";
import { FC, ReactElement } from "react";

interface IUserBlock {
  title: string;
}

const UserBlock: FC<IUserBlock> = ({ title }): ReactElement => (
  <Grid
    gap={{ sm: "12px", md: "24px" }}
    container
    wrap="nowrap"
    justifyContent="center"
    alignItems="center"
    width="fit-content"
  >
    <Typography variant="body2" color="textColor.light" whiteSpace="nowrap">
      {title}
    </Typography>
    <Avatar latter={title[0]} />
  </Grid>
);

export default UserBlock;
