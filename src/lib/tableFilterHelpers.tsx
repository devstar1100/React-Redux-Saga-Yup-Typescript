import { Filter } from "../components/Tables/CheckboxTable/CheckboxTable";
import { Dispatch, SetStateAction } from "react";
import { ActiveFilter, CloseBtn } from "../components/Tables/CheckboxTable/components/ActiveFilter";

export const getSelectedFilters = (filtersList: Filter, setFiltersList?: Dispatch<SetStateAction<Filter>>) => {
  return filtersList.filters.map((filter, index) => (
    <ActiveFilter key={index} withClose={!!setFiltersList}>
      {filter}
      {setFiltersList && (
        <CloseBtn
          onClick={() =>
            setFiltersList({
              ...filtersList,
              filters: [...filtersList.filters].filter((statusFilter) => statusFilter !== filter) as string[],
            })
          }
        />
      )}
    </ActiveFilter>
  ));
};

export const hasAnyLength = (...arrays: Filter[]) => {
  return arrays.some((array) => array.filters.length);
};
