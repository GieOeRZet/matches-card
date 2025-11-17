// ============================================================================
//  Matches Card Editor – FULL LIVE-BINDING, DEBOUNCE, SEKCJE, INPUT-NUMBERS
// ============================================================================

class MatchesCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = {};
    this._debounce = null;
  }

  setConfig(config) {
    this._config = JSON.parse(JSON.stringify(config || {}));
    this.render();
  }

  // -----------------------------------------
  //  Emit config-changed (with debounce)
  // -----------------------------------------
  _update(path, value) {
    let target = this._config;

    // obsługa obiektów zagnieżdżonych (font_size.xxx, gradient.xxx itp.)
    if (path.includes(".")) {
      const parts = path.split(".");
      for (let i = 0; i < parts.length - 1; i++) {
        if (!target[parts[i]]) target[parts[i]] = {};
        target = target[parts[i]];
      }
      target[parts.at(-1)] = value;
    } else {
      this._config[path] = value;
    }

    clearTimeout(this._debounce);
    this._debounce = setTimeout(() => {
      this.dispatchEvent(
        new CustomEvent("config-changed", {
          detail: { config: this._config },
          bubbles: true,
          composed: true,
        })
      );
    }, 700);
  }

  // -----------------------------------------
  // Helpers
  // -----------------------------------------
  _numInput(path, label, value, min = null, max = null, step = 1) {
    return `
      <label>
        ${label}
        <input type="number"
               value="${value}"
               ${min !== null ? `min="${min}"` : ""}
               ${max !== null ? `max="${max}"` : ""}
               step="${step}"
               data-path="${path}">
      </label>
    `;
  }

  _colorInput(path, label, value) {
    return `
      <label>
        ${label}
        <input type="color"
               value="${value}"
               data-path="${path}">
      </label>
    `;
  }

  _switch(path, label, checked) {
    return `
      <label class="switch-row">
        <span>${label}</span>
        <ha-switch data-path="${path}" ?checked="${checked}"></ha-switch>
      </label>
    `;
  }

  // -----------------------------------------
  // RENDER
  // -----------------------------------------
  render() {
    const c = this._config;

    this.shadowRoot.innerHTML = `
      <style>
        .group {
          margin: 12px 0;
          border-radius: 8px;
          border: 1px solid rgba(150,150,150,0.25);
          overflow: hidden;
        }
        summary {
          padding: 10px 12px;
          cursor: pointer;
          background: rgba(255,255,255,0.05);
        }
        .inner {
          padding: 14px 18px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }
        label {
          display: flex;
          flex-direction: column;
          font-size: 0.82rem;
        }
        .switch-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        input[type="number"],
        select {
          padding: 6px;
          border-radius: 6px;
          border: 1px solid rgba(255,255,255,0.25);
          background: rgba(0,0,0,0.15);
          color: inherit;
        }
        input[type="color"] {
          width: 38px;
          height: 28px;
          padding: 0;
          border: none;
          background: transparent;
        }
      </style>

      <!-- PODSTAWOWE -->
      <details class="group" open>
        <summary>Podstawowe</summary>
        <div class="inner">

          <label>
            Nazwa karty
            <input type="text" data-path="name" value="${c.name ?? ""}">
          </label>

          ${this._switch("show_logos", "Pokaż herby", c.show_logos !== false)}
          ${this._switch("full_team_names", "Pełne nazwy", c.full_team_names !== false)}
          ${this._switch("show_result_symbols", "Pokaż W/D/L", c.show_result_symbols !== false)}
          ${this._switch("lite_mode", "Tryb LITE", c.lite_mode === true)}

        </div>
      </details>

      <!-- FILL MODE -->
      <details class="group">
        <summary>Styl wypełnienia</summary>
        <div class="inner">

          <label>
            Tryb
            <select data-path="fill_mode">
              <option value="gradient" ${c.fill_mode === "gradient" ? "selected" : ""}>Gradient</option>
              <option value="zebra" ${c.fill_mode === "zebra" ? "selected" : ""}>Zebra</option>
              <option value="clear" ${c.fill_mode === "clear" ? "selected" : ""}>Brak</option>
            </select>
          </label>

          ${c.fill_mode === "gradient" ? `
            ${this._numInput("gradient.start", "Start (%)", c.gradient?.start ?? 35, 0, 100)}
            ${this._numInput("gradient.end", "Koniec (%)", c.gradient?.end ?? 100, 0, 100)}
            ${this._numInput("gradient.alpha_start", "Alfa start", c.gradient?.alpha_start ?? 0, 0, 1, 0.05)}
            ${this._numInput("gradient.alpha_end", "Alfa koniec", c.gradient?.alpha_end ?? 0.55, 0, 1, 0.05)}
          ` : ""}

          ${c.fill_mode === "zebra" ? `
            ${this._colorInput("zebra_color", "Kolor zebry", c.zebra_color ?? "#f0f0f0")}
            ${this._numInput("zebra_alpha", "Alfa zebry", c.zebra_alpha ?? 0.4, 0, 1, 0.05)}
          ` : ""}
        </div>
      </details>

      <!-- FONT SIZES -->
      <details class="group">
        <summary>Rozmiary czcionek</summary>
        <div class="inner">
          ${this._numInput("font_size.date", "Data", c.font_size?.date ?? 0.9, 0.1, 3, 0.1)}
          ${this._numInput("font_size.status", "Status", c.font_size?.status ?? 0.8, 0.1, 3, 0.1)}
          ${this._numInput("font_size.teams", "Nazwy drużyn", c.font_size?.teams ?? 1.0, 0.1, 3, 0.1)}
          ${this._numInput("font_size.score", "Wynik", c.font_size?.score ?? 1.0, 0.1, 3, 0.1)}
        </div>
      </details>

      <!-- IKONY -->
      <details class="group">
        <summary>Rozmiary ikon</summary>
        <div class="inner">
          ${this._numInput("icon_size.league", "Liga", c.icon_size?.league ?? 26, 10, 60)}
          ${this._numInput("icon_size.crest", "Herby", c.icon_size?.crest ?? 24, 10, 60)}
          ${this._numInput("icon_size.result", "W/D/L", c.icon_size?.result ?? 26, 10, 60)}
        </div>
      </details>

      <!-- KOLORY -->
      <details class="group">
        <summary>Kolory wyników</summary>
        <div class="inner">
          ${this._colorInput("colors.win", "Wygrana (W)", c.colors?.win ?? "#3ba55d")}
          ${this._colorInput("colors.draw", "Remis (D)", c.colors?.draw ?? "#468cd2")}
          ${this._colorInput("colors.loss", "Porażka (L)", c.colors?.loss ?? "#e23b3b")}
        </div>
      </details>
    `;

    // binduję wszystkie inputy
    this._bindAll();
  }

  // -----------------------------------------
  // Bind handlers
  // -----------------------------------------
  _bindAll() {
    this.shadowRoot.querySelectorAll("input, select, ha-switch").forEach(el => {
      el.addEventListener("input", () => {
        const path = el.dataset.path;
        if (!path) return;

        const value =
          el.type === "number" ? Number(el.value) :
          el.tagName === "HA-SWITCH" ? el.checked :
          el.value;

        this._update(path, value);
      });
    });
  }
}

customElements.define("matches-card-editor", MatchesCardEditor);