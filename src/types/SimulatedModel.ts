export interface SimulatedModel {
  "model-full-path-with-instances": string;
  "model-full-path": string;
  "simulation-name": string;
  "execution-group-order": number;
  "model-frequency": number;
  "number-of-input-messages": string;
  "number-of-output-messages": string;
  "simulated-model-id": string;
  "model-class-name": string;
  "model-id": number;
  "creation-date": string;
  "hardware-model": number;
  "hardware-interface-type": number;
  "has-formal-interfaces": boolean;
  "high-level-model": number;
  "input-data-age": number;
  "model-source"?: number;
  "number-of-steps-per-tick": number;
  "parent-system-id": number;
  plurality: number;
  "system-or-model-type": number;
  "model-alias": string;
  "last-update-date": string;
  "path-to-documentation"?: string;
}
