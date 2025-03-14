import { getInternalProjectUrl } from "../utils";

export class EmbeddedProject extends HTMLElement {
  #container: HTMLDivElement;
  #projectname: string;

  static observedAttributes = ["projectname"];

  constructor(projectname = "") {
    super();

    this.#projectname = projectname;

    const container = document.createElement("div");
    this.#container = container;

    const shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(container);

    this.setInnerHTML();
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === "projectname" && newValue !== oldValue) {
      this.projectname = newValue;
    }
  }

  setInnerHTML = async () => {
    while (this.#container.firstChild) {
      this.#container.firstChild.remove();
    }

    const html = await this.#fetchProject();
    this.#container.innerHTML = html;
  };

  #fetchProject = async () => {
    if (this.#projectname) {
      try {
        const url = getInternalProjectUrl(this.#projectname);
        const response = await fetch(url);

        if (response.ok) {
          return await response.text();
        } else {
          throw new Error(`HTTP error, status = ${response.status}`);
        }
      } catch (error) {
        console.error(error);

        if (error instanceof Error) {
          return `<p>${error.message}</p>`;
        } else {
          return "<p>Unknown error - See console for details.</p>";
        }
      }
    }
    return "";
  };

  set projectname(projectname: string) {
    this.#projectname = projectname;
    this.setInnerHTML;
  }
}

customElements.define("embedded-project", EmbeddedProject);
