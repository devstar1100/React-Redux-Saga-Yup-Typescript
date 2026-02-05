export interface ConfigurationFile {
  "configuration-name": string;
  "simulation-user-config-id": number;
  "user-config-file-name": string;
  "simulation-id": number;
  "simulation-name": string;
  "simulation-owner-name": string;
  "default-initial-conditions-name": string;
  "initial-conditions-overide-name": string;
  "scenario-file-id": number | string;
  "scenario-file-name": string;
  "pod-identifier": string;
  "pod-deployment-file-name": string;
  "pod-deployment-namespace": string;
  "containers-repository-path": string;
  "creation-date": string;
  "last-update-date": string;
  "path-to-documentation": string;
}

export enum ListUnitAction {
  add = "add",
  edit = "edit",
  delete = "delete",
  verify = "verify",
  clone = "clone",
}
