import { useMemo } from "react";
import { SimulationEnumType } from "../types/simulations";

interface Props {
  enumerators: SimulationEnumType[];
  enumType: string;
  excludeValues?: string[];
}

const useGetEnumeratorOptions = ({ enumerators, enumType, excludeValues = [] }: Props) => {
  const { simulationEnumType, simulationEnumTypeOptions } = useMemo(() => {
    const simulationEnumType = enumerators?.find((enumerator) => enumerator["enum-type"] === enumType);
    const allOptions = simulationEnumType?.["enum-values"].map((value) => value["enum-value-string"]) || [];
    const simulationEnumTypeOptions = allOptions.filter((option) => !excludeValues.includes(option));

    return { simulationEnumType, simulationEnumTypeOptions };
  }, [enumerators, excludeValues]);

  return [simulationEnumType, simulationEnumTypeOptions] as const;
};

export default useGetEnumeratorOptions;
