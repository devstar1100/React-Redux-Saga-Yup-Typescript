import { BreadcrumbItem } from "../components/Breadcrumbs";
import { pages } from "./routeUtils";

export const editBatchBreadcrums: BreadcrumbItem[] = [
  { label: "Monte Carlo Batches", to: pages.monteCarloBatch() },
  { label: "Edit Batch", to: "" },
];
export const addBatchBreadcrums: BreadcrumbItem[] = [
  { label: "Monte Carlo Batches", to: pages.monteCarloBatch() },
  { label: "Create Batch", to: "" },
];
