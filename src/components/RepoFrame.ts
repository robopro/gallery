import { basePagesUrl } from "../utils";

export class RepoFrame extends HTMLElement {
  #iframe: HTMLIFrameElement;
  #projectName: string;

  static observedAttributes = ["projectname"];

  constructor(projectName = "") {
    super();

    this.#projectName = projectName;

    const style = document.createElement("style");
    style.innerHTML = `
      iframe {
        width: 100%;
        height: 100%;
      }
    `;

    const iframe = document.createElement("iframe");
    this.#iframe = iframe;

    const shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(style);
    shadow.appendChild(iframe);

    this.#setIframeSource();
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === "projectname" && newValue !== oldValue) {
      this.projectName = newValue;
    }
  }

  #setIframeSource = () => {
    this.#iframe.src = `${basePagesUrl}${this.#projectName}`;
  };

  set projectName(projectName: string) {
    this.#projectName = projectName;
    this.#setIframeSource();
  }
}

customElements.define("repo-frame", RepoFrame);
