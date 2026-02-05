import { ModelType, SystemType } from "../types/simulations";

interface Params {
  systemsList: SystemType[];
  modelsList: ModelType[];
}

export const getMapSystemModelsList = ({ systemsList, modelsList }: Params): { [system: string]: string[] } => {
  const mapSystemModelsNamesList = systemsList.reduce(
    (acc, curr) => ({
      ...acc,
      [curr["system-type-name"]]: modelsList
        .filter((model) => model["model-type-name"].split("/")[0] === curr["system-type-name"])
        .map((model) => model["model-type-name"]),
    }),
    {},
  );

  return mapSystemModelsNamesList;
};
