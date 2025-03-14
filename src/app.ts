import { PortfolioNavigation } from "./components/PortfolioNavigation";
import { PortfolioPiece } from "./components/PortfolioPiece";
import { isProject } from "./types";
import projects from "../projects/projects";

// TODO Remove when building?
new EventSource("/esbuild").addEventListener("change", () => {
  location.reload();
});

const initApp = async () => {
  const root = document.getElementById("root");

  if (root) {
    const navigation = new PortfolioNavigation(projects);
    root.appendChild(navigation);

    const portfolioPiece = new PortfolioPiece();
    root.appendChild(portfolioPiece);

    navigation.addEventListener("portfolio-navigation", (event) => {
      if (event instanceof CustomEvent) {
        if (isProject(event.detail)) {
          portfolioPiece.project = event.detail;
        }
      }
    });

    if (projects[0]) {
      portfolioPiece.project = projects[0];
    }
  }
};

initApp();
