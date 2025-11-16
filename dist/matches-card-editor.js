class MatchesCardEditor extends HTMLElement {

  constructor() {
    super();
    this._config = {};
    this._updateTimeout = null;
    this.attachShadow({ mode: "open" });
  }

  setConfig(config) {
    this._config = JSON.parse(JSON.stringify(config || {}));
    this.render();
  }

  set hass(hass) {
    this._hass = hass;
  }

  // Debounce — 700ms
  _debounceSave() {
    clearTimeout(this._updateTimeout);
    this._updateTimeout = setTimeout(() => {
      const event = new CustomEvent("config-changed", {
        detail: { config: this._config },
        bubbles: true,
        composed: true,
      });
      this.dispatchEvent(event);
    }, 700);
  }

  _inputChanged(ev, path) {
    const value = ev.target.type === "number"
      ? Number(ev.target.value)
      : ev.target.value;

    let ref = this._config;
    const parts = path.split(".");

    while (parts.length > 1) {
      const p = parts.shift();
      if (!ref[p]) ref[p] = {};
      ref = ref[p];
    }
    ref[parts[0]] = value;

    this._debounceSave();
  }

  _toggleChanged(ev, path) {
    let ref = this._config;
    const parts = path.split(".");

    while (parts.length > 1) {
      const p = parts.shift();
      if (!ref[p]) ref[p] = {};
      ref = ref[p];
    }

    ref[parts[0]] = ev.target.checked;
    this._debounceSave();
  }

  _renderSwitch(title, path) {
    const val = this._get(path);
    return `
      <ha-formfield label="${title}">
        <ha-switch .checked=${val === true}
          @change=${(ev) => this._toggleChanged(ev, path)}>
        </ha-switch>
      </ha-formfield>
    `;
  }

  _renderNumber(title, path, min = 0, max = 999, step = 1) {
    const val = this._get(path);
    return `
      <div class="form-row">
        <label>${title}</label>
        <ha-textfield
          type="number"
          min="${min}"
          max="${max}"
          step="${step}"
          .value="${val}"
          @input=${(ev) => this._inputChanged(ev, path)}
        ></ha-textfield>
      </div>
    `;
  }

  _renderColor(title, path) {
    const val = this._get(path);
    return `
      <div class="form-row">
        <label>${title}</label>
        <input type="color" class="color-input"
          .value="${val}"
          @input=${(ev) => this._inputChanged(ev, path)}>
      </div>
    `;
  }

  _renderSection(title, content) {
    return `
      <ha-expansion-panel>
        <span slot="header">${title}</span>
        <div class="section-body">
          ${content}
        </div>
      </ha-expansion-panel>
    `;
  }

  _get(path) {
    const parts = path.split(".");
    let ref = this._config;
    for (const p of parts) {
      ref = ref?.[p];
    }
    return ref;
  }

  render() {
    if (!this.shadowRoot) return;

    this.shadowRoot.innerHTML = `
      <style>
        .section-body {
          padding: 12px 6px 14px 6px;
        }
        .form-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 0;
        }
        .form-row label {
          color: var(--primary-text-color);
          font-size: 15px;
        }
        ha-textfield {
          width: 110px;
        }
        input.color-input {
          width: 60px !important;
          height: 32px !important;
          border: none;
          border-radius: 6px;
        }
      </style>

      <ha-card>
        ${this._renderSection("Ogólne", `
          ${this._renderSwitch("Pokaż nazwę", "show_name")}
          ${this._renderSwitch("Tryb LITE", "lite_mode")}
        `)}

        ${this._renderSection("Drużyny / Herby", `
          ${this._renderSwitch("Pokaż herby", "show_logos")}
          ${this._renderSwitch("Pełne nazwy", "full_team_names")}
          ${this._renderNumber("Ikona liga (px)", "icon_size.league", 10, 100, 1)}
          ${this._renderNumber("Herb (px)", "icon_size.crest", 10, 100, 1)}
          ${this._renderNumber("Symbol W/P/R (px)", "icon_size.result", 10, 120, 1)}
        `)}

        ${this._renderSection("Wyniki W/P/R", `
          ${this._renderSwitch("Pokaż symbole W/P/R", "show_result_symbols")}
          ${this._renderColor("Kolor WYGRANA", "colors.win")}
          ${this._renderColor("Kolor REMIS", "colors.draw")}
          ${this._renderColor("Kolor PORAŻKA", "colors.loss")}
        `)}

        ${this._renderSection("Gradient", `
          ${this._renderNumber("Start (%)", "gradient.start", 0, 100, 1)}
          ${this._renderNumber("Koniec (%)", "gradient.end", 0, 100, 1)}
          ${this._renderNumber("Alfa Start", "gradient.alpha_start", 0, 1, 0.01)}
          ${this._renderNumber("Alfa Koniec", "gradient.alpha_end", 0, 1, 0.01)}
        `)}

        ${this._renderSection("Zebra", `
          ${this._renderColor("Kolor zebry", "zebra_color")}
          ${this._renderNumber("Alfa zebry", "zebra_alpha", 0, 1, 0.01)}
        `)}

        ${this._renderSection("Czcionki", `
          ${this._renderNumber("Data (rem)", "font_size.date", 0.1, 5, 0.05)}
          ${this._renderNumber("Status (rem)", "font_size.status", 0.1, 5, 0.05)}
          ${this._renderNumber("Drużyny (rem)", "font_size.teams", 0.1, 5, 0.05)}
          ${this._renderNumber("Wynik (rem)", "font_size.score", 0.1, 5, 0.05)}
        `)}
      </ha-card>
    `;
  }
}

customElements.define("matches-card-editor", MatchesCardEditor);