import projects from "../projects/projects";

export type Project = (typeof projects)[number];

export const isProject = (obj: unknown): obj is Project =>
  typeof obj === "object" &&
  obj !== null &&
  "title" in obj &&
  typeof obj.title === "string" &&
  "projectName" in obj &&
  typeof obj.projectName === "string" &&
  (!("external" in obj) ||
    typeof obj.external === "boolean" ||
    typeof obj.external === "undefined");

export const isProjectArray = (obj: unknown): obj is Project[] =>
  Array.isArray(obj) && obj.every(isProject);
