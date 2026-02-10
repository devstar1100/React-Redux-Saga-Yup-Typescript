import { Link, Breadcrumbs as MuiBreadcrumbs, styled, Typography } from "@mui/material";
import IconRightArrow from "../Icons/IconRightArrow";

export type BreadcrumbItem = { label: string; to: string };

interface BreadcrumbsProps {
  allItems: BreadcrumbItem[];
  currentLabel: string;
  onClick?: () => void;
}

const Breadcrumbs = ({ allItems, currentLabel, onClick }: BreadcrumbsProps) => {
  const items: BreadcrumbItem[] = [];
  for (const item of allItems) {
    items.push(item);
    if (item.label === currentLabel) break;
  }

  return (
    <BreadcrumbsContainer separator={<IconRightArrow />} aria-label="breadcrumb">
      {items.map((item, index) =>
        index === items.length - 1 ? (
          <Typography color="textColor.lightWhite" key={index} variant="custom1">
            {item.label}
          </Typography>
        ) : (
          <Link underline="hover" key={index} color="inherit" href={`${item.to}`} onClick={onClick}>
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

export default Breadcrumbs;
