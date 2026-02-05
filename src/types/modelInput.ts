export interface IModelInput {
  "model-input-id": number;
  "model-output-id": number;
  "source-model-id": number;
  "source-model-path": string;
  "target-model-id": number;
  "target-model-path": string;
  "simulation-name": string;
  "input-structure-name": string;
  "input-alias": string;
  "message-type": number;
  "input-rule": number;
  "data-exchange-criteria": number;
  "specific-source-model-index": number;
  "specific-source-system-index": number;
  "specific-target-model-index": number;
  "specific-target-system-index": number;
  "generic-model-output-identifier": string;
  "creation-date": string;
  "last-update-date": string;
}

export interface IModel {
  "creation-date": string;
  "execution-group-order": number;
  "hardware-model": number;
  "has-formal-interfaces": boolean;
  "high-level-model": number;
  "input-data-age": number;
  "last-update-date": string;
  "model-alias": string;
  "model-class-name": string;
  "model-frequency": number;
  "model-full-path": string;
  "model-full-path-with-instances": string;
  "model-id": number;
  "number-of-child-models": number;
  "number-of-input-messages": number;
  "number-of-output-messages": number;
  "number-of-steps-per-tick": number;
  "parent-system-id": number;
  plurality: number;
  "simulation-name": string;
  "system-or-model-type": number;
}
