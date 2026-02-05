import { ModelType, SystemType } from "../types/simulations";

type Params = Omit<SystemType, "system-type-id"> &
  Omit<ModelType, "model-type-id"> & {
    "system-index": number;
    "model-index": number;
  };

export const formEventTargetModel = (params: Params) => {
  if (Object.values(params).some((value) => !value && !(typeof value === "number" && !Number.isNaN(value)))) return "";

  const systemPart =
    params["system-quantity"] > 1
      ? `${params["system-type-name"]}[${params["system-index"]}]`
      : `${params["system-type-name"]}`;
  const [_s, model] = params["model-type-name"].split("/");
  const modelPart = params["model-quantity"] > 1 ? `${model}[${params["model-index"]}]` : `${model}`;

  return `${systemPart}/${modelPart}`;
};
