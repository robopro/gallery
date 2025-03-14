import { Project } from "../types";

export class PortfolioNavigation extends HTMLElement {
  #list: HTMLElement;
  #projects: Project[];

  constructor(projects?: Project[]) {
    super();

    this.#projects = projects ?? [];

    const shadow = this.attachShadow({ mode: "open" });

    const style = document.createElement("style");
    shadow.appendChild(style);
    style.innerHTML = `
      nav button:hover,
      nav button:focus {
        color: #036;
        background-color: #fff;
        text-decoration: underline;
      }
      nav button:active {
        color: #fff;
        background-color: #024;
        text-decoration: underline;
      }
      nav [aria-current=page] {
        background-color: #bbb;
        color: #000;
        border-bottom: .25em solid #444;
      }
      ul {
        margin: 0;
        padding: 0;
        display: table-row;
        background-color: #036;
        color: #fff;
      }
      li:not(:last-child) {
        margin-bottom: 10px;
      }
    `;

    const nav = document.createElement("nav");
    shadow.appendChild(nav);

    const list = document.createElement("ul");
    nav.appendChild(list);
    this.#list = list;
  }

  connectedCallback() {
    this.#buildMenu();
  }

  disconnectedCallback() {
    // TODO Store buttons in list and loop over? Can additionally create addEventListeners and removeEventListeners functions
    this.#list.childNodes.forEach((listItem) =>
      listItem.firstChild?.removeEventListener("click", this.#onProjectClick),
    );
  }

  #buildMenu = () => {
    this.#projects.forEach((project, index) => {
      const listItem = document.createElement("li");
      this.#list.appendChild(listItem);

      const button = document.createElement("button");
      listItem.appendChild(button);
      button.type = "button";
      button.value = `${index}`;
      button.innerHTML = project.title;
      button.addEventListener("click", this.#onProjectClick);
    });
  };

  #onProjectClick = (event: Event) => {
    if (event.currentTarget instanceof HTMLButtonElement) {
      const index = parseInt(event.currentTarget.value);

      if (!isNaN(index)) {
        const project = this.#projects[index];

        if (project) {
          this.dispatchEvent(new CustomEvent("portfolio-navigation", { detail: project }));
        }
      }
    }
  };
}

customElements.define("portfolio-navigation", PortfolioNavigation);
