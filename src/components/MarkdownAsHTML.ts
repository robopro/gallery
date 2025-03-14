export class MarkdownAsHTML extends HTMLElement {
  #container: HTMLDivElement;
  #markdown: string;
  #converter?: unknown;

  static observedAttributes = ["markdown"];

  constructor(markdown = "") {
    super();

    try {
      // @ts-ignore: Imported through CDN in index.html, and I'm too lazy to fix esbuild imports
      this.#converter = new showdown.Converter();
    } catch (error) {
      console.error("Markdown ~ constructor", error);
    }

    this.#markdown = markdown;

    const style = document.createElement("style");
    style.innerHTML = `
      #markdown-container {
        display: flex;
        flex-direction: column;
        align-items: center;
      }
    `;

    const container = document.createElement("div");
    container.id = "markdown-container";
    this.#container = container;

    const shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(style);
    shadow.appendChild(container);
    this.renderHTML();
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (newValue !== oldValue && name === "markdown") {
      this.markdown = newValue;
    }
  }

  renderHTML = () => {
    while (this.#container.firstChild) {
      this.#container.firstChild.remove();
    }

    if (this.#converter) {
      // @ts-ignore: Imported through CDN in index.html, and I'm too lazy to fix esbuild imports
      const html = this.#converter.makeHtml(this.#markdown);
      this.#container.innerHTML = html;
    } else {
      this.#container.textContent = this.#markdown;
    }
  };

  set markdown(markdown: string) {
    this.#markdown = markdown;
    this.renderHTML();
  }
}

customElements.define("markdown-as-html", MarkdownAsHTML);
