import { useEffect } from "react";
import { useSelector } from "react-redux";
import { Outlet, useNavigate } from "react-router-dom";
import { getIsHydrated } from "../../redux/reducers/appReducer";
import { getIsAuthorized } from "../../redux/reducers/authReducer";

const NotAuthorizedOnlyRoute = () => {
  const isAuthorized = useSelector(getIsAuthorized);
  const isHydrated = useSelector(getIsHydrated);

  const navigate = useNavigate();

  useEffect(() => {
    if (isHydrated && isAuthorized) {
      navigate("/simulations");
    }
  }, [isAuthorized, isHydrated]);
  return <Outlet />;
};

export default NotAuthorizedOnlyRoute;
