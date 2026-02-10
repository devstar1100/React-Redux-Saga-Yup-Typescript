import { Link, Breadcrumbs as MuiBreadcrumbs, styled, Typography } from "@mui/material";
import IconRightArrow from "../Icons/IconRightArrow";

export type BreadcrumbItem = { label: string; to: string; onClick?: () => void };

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const Breadcrumbs = ({ items }: BreadcrumbsProps) => {
  return (
    <BreadcrumbsContainer separator={<IconRightArrow />} aria-label="breadcrumb">
      {items.map((item, index) =>
        index === items.length - 1 ? (
          <Typography color="textColor.lightWhite" key={index} variant="custom1">
            {item.label}
          </Typography>
        ) : (
          <Link underline="hover" key={index} color="inherit" href={`${item.to}`} onClick={item.onClick}>
            <Typography color="grey.200" variant="custom1">
              {item.label}
            </Typography>
          </Link>
        ),
      )}
    </BreadcrumbsContainer>
  );
};

const BreadcrumbsContainer = styled(MuiBreadcrumbs)({
  ".MuiBreadcrumbs-ol": {
    gap: "18px",
  },
});
