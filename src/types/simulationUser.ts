export interface SimulationUser {
  "user-id": string;
  "first-name": string;
  "last-name": string;
  "full-name": string;
  "user-name": string;
  "user-role": string;
  "user-status": string;
  email: string;
  "max-number-of-sessions": number;
  "max-number-of-processes": number;
  "creation-date": string;
  "last-update-date": string;
  "last-login-date": string;
  "number-of-successful-logins": number;
  "number-of-failed-logins": number;
  "associated-projects": string[];
}

export enum SimulationUserStatus {
  active = "active",
  inactive = "inactive",
}
