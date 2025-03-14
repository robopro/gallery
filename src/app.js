"use strict";
(() => {
  // src/components/PortfolioNavigation.ts
  var PortfolioNavigation = class extends HTMLElement {
    #list;
    #projects;
    constructor(projects2) {
      super();
      this.#projects = projects2 ?? [];
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
      this.#list.childNodes.forEach(
        (listItem) => listItem.firstChild?.removeEventListener("click", this.#onProjectClick)
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
    #onProjectClick = (event) => {
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
  };
  customElements.define("portfolio-navigation", PortfolioNavigation);

  // src/utils.ts
  var basePagesUrl = "https://robopro.github.io/";
  var getRepoUrl = (projectName, external = false) => {
    if (external) {
      return `https://github.com/robopro/${projectName}`;
    } else {
      return `https://github.com/robopro/gallery/tree/main/projects/${projectName}`;
    }
  };
  var getInternalProjectUrl = (projectName) => {
    return `projects/${projectName}/${projectName}.html`;
  };
  var getReadmeUrl = (projectName, external = false) => {
    if (external) {
      return `https://raw.githubusercontent.com/robopro/${projectName}/main/README.md`;
    } else {
      return `projects/${projectName}/README.md`;
    }
  };

  // src/components/EmbeddedProject.ts
  var EmbeddedProject = class extends HTMLElement {
    #container;
    #projectname;
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
    attributeChangedCallback(name, oldValue, newValue) {
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
    set projectname(projectname) {
      this.#projectname = projectname;
      this.setInnerHTML;
    }
  };
  customElements.define("embedded-project", EmbeddedProject);

  // src/components/MarkdownAsHTML.ts
  var MarkdownAsHTML = class extends HTMLElement {
    #container;
    #markdown;
    #converter;
    static observedAttributes = ["markdown"];
    constructor(markdown = "") {
      super();
      try {
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
    attributeChangedCallback(name, oldValue, newValue) {
      if (newValue !== oldValue && name === "markdown") {
        this.markdown = newValue;
      }
    }
    renderHTML = () => {
      while (this.#container.firstChild) {
        this.#container.firstChild.remove();
      }
      if (this.#converter) {
        const html = this.#converter.makeHtml(this.#markdown);
        this.#container.innerHTML = html;
      } else {
        this.#container.textContent = this.#markdown;
      }
    };
    set markdown(markdown) {
      this.#markdown = markdown;
      this.renderHTML();
    }
  };
  customElements.define("markdown-as-html", MarkdownAsHTML);

  // src/components/RepoFrame.ts
  var RepoFrame = class extends HTMLElement {
    #iframe;
    #projectName;
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
    attributeChangedCallback(name, oldValue, newValue) {
      if (name === "projectname" && newValue !== oldValue) {
        this.projectName = newValue;
      }
    }
    #setIframeSource = () => {
      this.#iframe.src = `${basePagesUrl}${this.#projectName}`;
    };
    set projectName(projectName) {
      this.#projectName = projectName;
      this.#setIframeSource();
    }
  };
  customElements.define("repo-frame", RepoFrame);

  // src/components/PortfolioPiece.ts
  var PortfolioPiece = class extends HTMLElement {
    #heading;
    #nav;
    #repoLink;
    #readmeButton;
    #demoButton;
    #contentContainer;
    #demoContainer;
    #readme;
    #project;
    constructor(project) {
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
    set project(project) {
      this.#project = project;
      this.#buildProject();
    }
  };
  customElements.define("portfolio-piece", PortfolioPiece);

  // src/types.ts
  var isProject = (obj) => typeof obj === "object" && obj !== null && "title" in obj && typeof obj.title === "string" && "projectName" in obj && typeof obj.projectName === "string" && (!("external" in obj) || typeof obj.external === "boolean" || typeof obj.external === "undefined");

  // projects/projects.ts
  var projects = [
    {
      title: "About Me",
      projectName: "AboutMe",
      hideMenu: true
    },
    {
      title: "Perspective",
      projectName: "perspective"
    },
    {
      title: "PederPong2.0",
      projectName: "pederpong",
      external: true
    }
  ];
  var projects_default = projects;

  // src/app.ts
  new EventSource("/esbuild").addEventListener("change", () => {
    location.reload();
  });
  var initApp = async () => {
    const root = document.getElementById("root");
    if (root) {
      const navigation = new PortfolioNavigation(projects_default);
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
      if (projects_default[0]) {
        portfolioPiece.project = projects_default[0];
      }
    }
  };
  initApp();
})();
