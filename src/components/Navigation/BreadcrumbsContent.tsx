import { Typography } from "@mui/material";
import React from "react";
import { Link } from "react-router-dom";

interface Props {
  route: string;
  pagesNavText: Record<string, string[]>;
}

const BreadcrumbsContent = ({ route, pagesNavText }: Props) => (
  <>
    <Link to="/">
      <Typography variant="body1" fontWeight="700" color="textColor.light" pr="5px">
        {pagesNavText?.[route]?.[0]}
      </Typography>
      <Typography variant="body1" color="textColor.light">
        {pagesNavText?.[route]?.[1]}
      </Typography>
    </Link>
    <Link to="/">
      <Typography variant="body1" fontWeight="700" color="textColor.light">
        {pagesNavText?.[route]?.[2]}
      </Typography>
    </Link>
  </>
);

export default React.memo(BreadcrumbsContent, (prev, next) => {
  if (JSON.stringify(prev.pagesNavText) !== JSON.stringify(next.pagesNavText)) {
    return false;
  }
  if (prev.route !== next.route) {
    return false;
  }
  return true;
});
