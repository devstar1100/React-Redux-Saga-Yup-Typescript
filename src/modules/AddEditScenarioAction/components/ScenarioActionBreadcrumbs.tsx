import * as React from "react";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import { styled } from "@mui/material";
import IconRightArrow from "../../../components/Icons/IconRightArrow";
import { useNavigate, useParams } from "react-router";
import { pages } from "../../../lib/routeUtils";
import { getSimDependantPageFullLink } from "../../../lib/simulationConfigurationUtils";

interface Props {
  actionName: string;
  simulationId: number;
  sessionId: number;
}

const ScenarioBreadcrumbs = ({ actionName, simulationId, sessionId }: Props) => {
  const navigate = useNavigate();
  const { listId } = useParams();

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    event.preventDefault();
    navigate(
      `${getSimDependantPageFullLink({ baseRoute: pages.scenarioActions(), simulationId, sessionId })}/${listId}`,
    );
  };

  return (
    <BreadcrumbsContainer separator={<IconRightArrow />} aria-label="breadcrumb">
      <Link underline="hover" key="1" color="inherit" href="/IT/work_folder/space-saas/public" onClick={handleClick}>
        <Typography color="grey.200" variant="custom1">
          Scenario actions
        </Typography>
      </Link>
      <Typography key="2" color="textColor.lightWhite" variant="custom1">
        {actionName} scenario action
      </Typography>
    </BreadcrumbsContainer>
  );
};

const BreadcrumbsContainer = styled(Breadcrumbs)({
  ".MuiBreadcrumbs-ol": {
    gap: "18px",
  },
});

export default ScenarioBreadcrumbs;
