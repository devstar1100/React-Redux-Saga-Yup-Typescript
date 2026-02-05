export interface ModelOutputData {
  "default-model-output-structure-prefix": string;
  "model-outputs": IModelOutput[];
  "relevant-input-rules": unknown[];
  "source-model-plurality": number;
  "source-system-plurality": number;
  "target-model-plurality": number;
  "target-system-plurality": number;
}

export interface IModelOutput {
  "last-update-date": string;
  "creation-date": string;
  "message-type": number;
  "model-class-name": string;
  "model-full-path": string;
  "model-id": number;
  "model-output-id": number;
  "number-of-model-using-as-input": number;
  "generic-model-output-identifier": string;
  "output-alias": string;
  "output-structure-name": string;
  "output-suffix": string;
  "simulation-name": string;
  "default-model-output-structure-prefix": string;
  "path-to-documentation"?: string;
}
