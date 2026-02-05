import { Dispatch, SetStateAction, useState } from "react";
import { Filter } from "../components/Tables/CheckboxTable/CheckboxTable";
import { FilterVariant, FilterVariants } from "../modules/ConfigurationView/ConfigurationFilesList";

interface Props {
  tableColIndex: number;
  initialValues?: FilterVariant[];
}

type ReturnType = [Filter, FilterVariants, Dispatch<SetStateAction<Filter>>, Dispatch<SetStateAction<FilterVariants>>];

const useTableFilter = ({ tableColIndex, initialValues }: Props): ReturnType => {
  const [filter, setFilter] = useState<Filter>({ index: tableColIndex, filters: [] });
  const [variants, setVariants] = useState<FilterVariants>({
    values: initialValues || [],
  });

  return [filter, variants, setFilter, setVariants];
};

export default useTableFilter;
