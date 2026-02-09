import * as React from "react";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import { styled } from "@mui/material";
import IconRightArrow from "../../../components/Icons/IconRightArrow";
import { pages } from "../../../lib/routeUtils";

function handleClick(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
  console.info("You clicked a breadcrumb.");
}

interface Props {
  actionName: string;
}

const MonteCarloBatchBreadcrumbs = ({ actionName }: Props) => {
  return (
    <BreadcrumbsContainer separator={<IconRightArrow />} aria-label="breadcrumb">
      <Link underline="hover" key="1" color="inherit" href={`${pages.monteCarloBatch()}`} onClick={handleClick}>
        <Typography color="grey.200" variant="custom1">
          MonteCarloBatch
        </Typography>
      </Link>
      <Typography key="2" color="textColor.lightWhite" variant="custom1">
        {actionName} Batch
      </Typography>
    </BreadcrumbsContainer>
  );
};

const BreadcrumbsContainer = styled(Breadcrumbs)({
  ".MuiBreadcrumbs-ol": {
    gap: "18px",
  },
});

export default MonteCarloBatchBreadcrumbs;
