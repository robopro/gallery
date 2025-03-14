import { Project } from "../types";
import { getReadmeUrl, getRepoUrl } from "../utils";
import { EmbeddedProject } from "./EmbeddedProject";
import { MarkdownAsHTML } from "./MarkdownAsHTML";
import { RepoFrame } from "./RepoFrame";

export class PortfolioPiece extends HTMLElement {
  #heading: HTMLHeadingElement;
  #nav: HTMLElement;
  #repoLink: HTMLAnchorElement;
  #readmeButton: HTMLButtonElement;
  #demoButton: HTMLButtonElement;
  #contentContainer: HTMLDivElement;
  #demoContainer: HTMLDivElement;
  #readme: MarkdownAsHTML;
  #project?: Project;

  constructor(project?: Project) {
    super();

    this.#project = project;

    const style = document.createElement("style");
    style.innerHTML = `
      :host {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
      }
      h1 {
        margin: 0;
      }
      nav {
        display: flex;
        justify-content: center;
        gap: 10px;
      }
      a {
        padding: 5px;
        border: 1px solid black;
        border-radius: 5px;
        background-color: lighgrey;
        text-decoration: none;
        color: black;
      }
      button {
      
      }
      .content-container {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
      } 
      .demo-container {
        width: 100%;
        height: 100%;
      }
      iframe {
        width: 100%;
        height: 100%;
      }
      .hidden {
        display: none;
      }
    `;

    const heading = document.createElement("h1");
    this.#heading = heading;

    const nav = document.createElement("nav");
    this.#nav = nav;

    const repoLink = document.createElement("a");
    repoLink.textContent = "Github";
    repoLink.target = "_blank";
    repoLink.href = "#";
    this.#repoLink = repoLink;

    const readmeButton = document.createElement("button");
    readmeButton.type = "button";
    readmeButton.textContent = "Readme";
    this.#readmeButton = readmeButton;

    const demoButton = document.createElement("button");
    demoButton.type = "button";
    demoButton.textContent = "Demo";
    this.#demoButton = demoButton;

    nav.appendChild(this.#repoLink);
    nav.appendChild(this.#readmeButton);
    nav.appendChild(this.#demoButton);

    const markdown = new MarkdownAsHTML();
    this.#readme = markdown;

    const demoContainer = document.createElement("div");
    demoContainer.classList.add("demo-container");
    this.#demoContainer = demoContainer;

    const contentContainer = document.createElement("div");
    contentContainer.classList.add("content-container");
    this.#contentContainer = contentContainer;
    contentContainer.appendChild(markdown);
    contentContainer.appendChild(demoContainer);

    const shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(style);
    // shadow.appendChild(heading);
    shadow.appendChild(nav);
    shadow.appendChild(contentContainer);
    this.#buildProject();
  }

  connectedCallback() {
    this.#readmeButton.addEventListener("click", this.#onReadmeClick);
    this.#demoButton.addEventListener("click", this.#onDemoClick);
  }

  disconnectedCallback() {
    this.#readmeButton.removeEventListener("click", this.#onReadmeClick);
    this.#demoButton.removeEventListener("click", this.#onDemoClick);
  }

  #buildProject = async () => {
    console.info("buildProject");
    this.#reset();

    if (this.#project) {
      const { title, projectName, external, hideMenu } = this.#project;

      this.#heading.textContent = title;
      if (!hideMenu) {
        this.#nav.classList.remove("hidden");
        this.#repoLink.href = getRepoUrl(projectName);

        if (external) {
          const repoFrame = new RepoFrame(projectName);
          this.#demoContainer.appendChild(repoFrame);
        } else {
          const embeddedProject = new EmbeddedProject(projectName);
          this.#demoContainer.appendChild(embeddedProject);
        }
      }
      this.#contentContainer.classList.remove("hidden");
      this.#demoContainer.classList.add("hidden");

      const readme = await this.#fetchReadme();
      this.#readme.markdown = readme;
    }
  };

  #reset = () => {
    this.#heading.textContent = "";
    this.#nav.classList.add("hidden");
    this.#contentContainer.classList.add("hidden");
    this.#readme.classList.remove("hidden");
    this.#demoContainer.classList.add("hidden");
    this.#repoLink.href = "#";

    while (this.#demoContainer.firstChild) {
      this.#demoContainer.firstChild.remove();
    }
  };

  #fetchReadme = async () => {
    if (this.#project) {
      try {
        const readmeUrl = getReadmeUrl(this.#project.projectName, this.#project.external);
        const response = await fetch(readmeUrl);

        if (response.ok) {
          return await response.text();
        } else {
          throw new Error(`HTTP error, status = ${response.status}`);
        }
      } catch (error) {
        console.error(error);

        if (error instanceof Error) {
          return error.message;
        } else {
          return "Unknown error - See console for details";
        }
      }
    }
    return "No project selected";
  };

  #onReadmeClick = () => {
    this.#readme.classList.remove("hidden");
    this.#demoContainer.classList.add("hidden");
  };

  #onDemoClick = () => {
    this.#readme.classList.add("hidden");
    this.#demoContainer.classList.remove("hidden");
  };

  set project(project: Project) {
    this.#project = project;
    this.#buildProject();
  }
}

customElements.define("portfolio-piece", PortfolioPiece);
