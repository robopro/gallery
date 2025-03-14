export const basePagesUrl = "https://robopro.github.io/";

export const getRepoUrl = (projectName: string, external = false) => {
  if (external) {
    return `https://github.com/robopro/${projectName}`;
  } else {
    return `https://github.com/robopro/gallery/tree/main/projects/${projectName}`;
  }
};

export const getInternalProjectUrl = (projectName: string) => {
  return `projects/${projectName}/${projectName}.html`;
};

export const getReadmeUrl = (projectName: string, external = false) => {
  if (external) {
    return `https://raw.githubusercontent.com/robopro/${projectName}/main/README.md`;
  } else {
    return `projects/${projectName}/README.md`;
  }
};
