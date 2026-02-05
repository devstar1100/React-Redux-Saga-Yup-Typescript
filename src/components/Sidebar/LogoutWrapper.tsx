import { FC, MouseEvent } from "react";
import { Grid, styled, Typography } from "@mui/material";
import { useDispatch } from "react-redux";

import { logOutServer } from "../../redux/actions/authActions";
import LogoutIcon from "../Icons/LogoutIcon";

interface Props {
  openSideBar: boolean;
}
const LogoutWrapper: FC<Props> = ({ openSideBar }) => {
  const dispatch = useDispatch();

  const handleLogout = (e: MouseEvent<HTMLDivElement>) => {
    dispatch(logOutServer());
  };

  return (
    <Wrapper onClick={handleLogout} alignItems="center" container gap="19px">
      <LogoutIcon />
      <Typography variant="body1" color="textColor.main" display={openSideBar ? "flex" : "none"}>
        Logout
      </Typography>
    </Wrapper>
  );
};

const Wrapper = styled(Grid)(({ theme }) => ({
  cursor: "pointer",
  padding: "25px 22px 51px 22px",

  [theme.breakpoints.down("lg")]: {
    padding: "16px",
  },
  "@media(max-height: 700px)": {
    padding: "20px 22px",
  },
}));

export default LogoutWrapper;
