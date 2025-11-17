// ============================================================================
//  Matches Card Editor – vanilla HTMLElement, debounce, pełne bindowanie
//  Dostosowany do karty Matches Card (90minut) v0.3.050
// ============================================================================

class MatchesCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = {};
    this._debounce = null;
  }

  // Domyślna konfiguracja spójna z kartą
  _defaultConfig() {
    return {
      name: "90minut Matches",
      show_name: true,
      show_logos: true,
      full_team_names: true,
      show_result_symbols: true,

      fill_mode: "gradient", // "gradient" | "zebra" | "clear"

      font_size: {
        date: 0.9,
        status: 0.8,
        teams: 1.0,
        score: 1.0,
      },

      icon_size: {
        league: 26,
        crest: 24,
        result: 26,
      },

      colors: {
        win: "#3ba55d",
        draw: "#468cd2",
        loss: "#e23b3b",
      },

      gradient: {
        alpha_start: 0.0,
        alpha_end: 0.55,
        start: 35,
        end: 100,
      },

      zebra_color: "#f0f0f0",
      zebra_alpha: 0.4,

      lite_mode: false,
    };
  }

  setConfig(config) {
    const defaults = this._defaultConfig();

    // głębokie łączenie, żeby zawsze mieć komplet wartości
    this._config = {
      ...defaults,
      ...config,
      font_size: {
        ...defaults.font_size,
        ...(config.font_size || {}),
      },
      icon_size: {
        ...defaults.icon_size,
        ...(config.icon_size || {}),
      },
      colors: {
        ...defaults.colors,
        ...(config.colors || {}),
      },
      gradient: {
        ...defaults.gradient,
        ...(config.gradient || {}),
      },
      zebra_color: config.zebra_color ?? defaults.zebra_color,
      zebra_alpha:
        typeof config.zebra_alpha === "number"
          ? config.zebra_alpha
          : defaults.zebra_alpha,
      lite_mode:
        typeof config.lite_mode === "boolean"
          ? config.lite_mode
          : defaults.lite_mode,
    };

    this._render();
  }

  set hass(hass) {
    this._hass = hass;
  }

  // --------------------------------------
  //  DEBOUNCE + UPDATE
  // --------------------------------------
  _scheduleApply() {
    if (this._debounce) {
      clearTimeout(this._debounce);
    }
    this._debounce = setTimeout(() => this._apply(), 700);
  }

  _apply() {
    const event = new CustomEvent("config-changed", {
      detail: { config: this._config },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  _updateRoot(key, value) {
    this._config = {
      ...this._config,
      [key]: value,
    };
    this._scheduleApply();
  }

  _updateNested(group, key, value) {
    const current = this._config[group] || {};
    this._config = {
      ...this._config,
      [group]: {
        ...current,
        [key]: value,
      },
    };
    this._scheduleApply();
  }

  // HTML-escape do wartości inputów
  _esc(v) {
    if (v === undefined || v === null) return "";
    return String(v)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  // --------------------------------------
  //  RENDER
  // --------------------------------------
  _render() {
    if (!this.shadowRoot) return;

    const c = this._config || this._defaultConfig();
    const esc = (v) => this._esc(v);

    // zapamiętaj, które sekcje były otwarte
    const prevOpen = {};
    this.shadowRoot
      .querySelectorAll("details[data-section]")
      .forEach((d) => {
        prevOpen[d.dataset.section] = d.open;
      });

    const basicOpen =
      prevOpen.basic !== undefined ? prevOpen.basic : true; // pierwsza domyślnie otwarta
    const fillOpen = prevOpen.fill || false;
    const fontsOpen = prevOpen.fonts || false;
    const iconsOpen = prevOpen.icons || false;
    const colorsOpen = prevOpen.colors || false;

    this.shadowRoot.innerHTML = `
      <style>
        .group {
          margin: 12px 0;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.15);
          overflow: hidden;
        }

        .group summary {
          padding: 10px 12px;
          font-size: 1rem;
          cursor: pointer;
          background: rgba(255,255,255,0.05);
        }

        .group > div {
          padding: 10px 16px 18px 16px;
          display: grid;
          grid-template-columns: repeat(2, minmax(0,1fr));
          gap: 12px;
        }

        label {
          display: flex;
          flex-direction: column;
          font-size: 0.85rem;
          opacity: 0.9;
        }

        input[type="text"],
        input[type="number"],
        select {
          padding: 4px 6px;
          border-radius: 6px;
          border: 1px solid rgba(255,255,255,0.20);
          background: rgba(0,0,0,0.2);
          color: inherit;
          font: inherit;
        }

        input[type="color"] {
          width: 40px;
          height: 28px;
          padding: 0;
          border: none;
          background: transparent;
        }

        .switch {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.9rem;
        }

        .switch ha-switch {
          --mdc-theme-secondary: var(--primary-color);
        }
      </style>

      <!-- PODSTAWOWE -->
      <details class="group" data-section="basic" ${basicOpen ? "open" : ""}>
        <summary>Podstawowe</summary>
        <div>
          <label>
            Nazwa karty
            <input id="mc-name" type="text" value="${esc(c.name)}">
          </label>

          <div class="switch">
            <ha-switch id="mc-show-logos" ${c.show_logos !== false ? "checked" : ""}></ha-switch>
            <span>Pokaż herby</span>
          </div>

          <div class="switch">
            <ha-switch id="mc-full-names" ${c.full_team_names !== false ? "checked" : ""}></ha-switch>
            <span>Pełne nazwy drużyn</span>
          </div>

          <div class="switch">
            <ha-switch id="mc-show-result-symbols" ${c.show_result_symbols !== false ? "checked" : ""}></ha-switch>
            <span>Pokaż symbole W/R/P</span>
          </div>

          <div class="switch">
            <ha-switch id="mc-lite-mode" ${c.lite_mode === true ? "checked" : ""}></ha-switch>
            <span>Tryb LITE (bez ha-card)</span>
          </div>
        </div>
      </details>

      <!-- STYL WYPEŁNIENIA -->
      <details class="group" data-section="fill" ${fillOpen ? "open" : ""}>
        <summary>Styl wypełnienia</summary>
        <div>
          <label>
            Tryb
            <select id="mc-fill-mode">
              <option value="gradient" ${c.fill_mode === "gradient" ? "selected" : ""}>Gradient</option>
              <option value="zebra" ${c.fill_mode === "zebra" ? "selected" : ""}>Zebra</option>
              <option value="clear" ${c.fill_mode === "clear" ? "selected" : ""}>Brak</option>
            </select>
          </label>

          ${
            c.fill_mode === "gradient"
              ? `
          <label>
            Start gradientu (%)
            <input id="mc-grad-start" type="number" min="0" max="100"
                   value="${Number(c.gradient?.start ?? 35)}">
          </label>

          <label>
            Koniec gradientu (%)
            <input id="mc-grad-end" type="number" min="0" max="100"
                   value="${Number(c.gradient?.end ?? 100)}">
          </label>

          <label>
            Alfa start (0–1)
            <input id="mc-grad-alpha-start" type="number" min="0" max="1" step="0.05"
                   value="${Number(c.gradient?.alpha_start ?? 0)}">
          </label>

          <label>
            Alfa koniec (0–1)
            <input id="mc-grad-alpha-end" type="number" min="0" max="1" step="0.05"
                   value="${Number(c.gradient?.alpha_end ?? 0.55)}">
          </label>
              `
              : ""
          }

          ${
            c.fill_mode === "zebra"
              ? `
          <label>
            Kolor zebry
            <input id="mc-zebra-color" type="color"
                   value="${esc(c.zebra_color ?? "#f0f0f0")}">
          </label>

          <label>
            Alfa zebry (0–1)
            <input id="mc-zebra-alpha" type="number" min="0" max="1" step="0.05"
                   value="${Number(c.zebra_alpha ?? 0.4)}">
          </label>
              `
              : ""
          }
        </div>
      </details>

      <!-- ROZMIARY CZCIONEK -->
      <details class="group" data-section="fonts" ${fontsOpen ? "open" : ""}>
        <summary>Rozmiary czcionek</summary>
        <div>
          <label>
            Data
            <input id="mc-font-date" type="number" step="0.1"
                   value="${Number(c.font_size?.date ?? 0.9)}">
          </label>

          <label>
            Status (KONIEC, godzina)
            <input id="mc-font-status" type="number" step="0.1"
                   value="${Number(c.font_size?.status ?? 0.8)}">
          </label>

          <label>
            Nazwy drużyn
            <input id="mc-font-teams" type="number" step="0.1"
                   value="${Number(c.font_size?.teams ?? 1.0)}">
          </label>

          <label>
            Wyniki
            <input id="mc-font-score" type="number" step="0.1"
                   value="${Number(c.font_size?.score ?? 1.0)}">
          </label>
        </div>
      </details>

      <!-- ROZMIARY IKON -->
      <details class="group" data-section="icons" ${iconsOpen ? "open" : ""}>
        <summary>Rozmiary ikon</summary>
        <div>
          <label>
            Ikona ligi
            <input id="mc-icon-league" type="number" min="10" max="60"
                   value="${Number(c.icon_size?.league ?? 26)}">
          </label>

          <label>
            Herby drużyn
            <input id="mc-icon-crest" type="number" min="10" max="60"
                   value="${Number(c.icon_size?.crest ?? 24)}">
          </label>

          <label>
            Ikony W/R/P
            <input id="mc-icon-result" type="number" min="10" max="60"
                   value="${Number(c.icon_size?.result ?? 26)}">
          </label>
        </div>
      </details>

      <!-- KOLORY W / R / P -->
      <details class="group" data-section="colors" ${colorsOpen ? "open" : ""}>
        <summary>Kolory wyników</summary>
        <div>
          <label>
            Wygrana (W)
            <input id="mc-color-win" type="color"
                   value="${esc(c.colors?.win ?? "#3ba55d")}">
          </label>

          <label>
            Remis (R)
            <input id="mc-color-draw" type="color"
                   value="${esc(c.colors?.draw ?? "#468cd2")}">
          </label>

          <label>
            Porażka (P)
            <input id="mc-color-loss" type="color"
                   value="${esc(c.colors?.loss ?? "#e23b3b")}">
          </label>
        </div>
      </details>
    `;

    // przywróć stan open po wstrzyknięciu HTML
    this.shadowRoot
      .querySelectorAll("details[data-section]")
      .forEach((d) => {
        const id = d.dataset.section;
        if (prevOpen[id] !== undefined) d.open = prevOpen[id];
      });

    this._attachListeners();
  }

  // --------------------------------------
  //  LISTENERY
  // --------------------------------------
  _attachListeners() {
    const root = this.shadowRoot;
    if (!root) return;

    // Nazwa
    const nameInput = root.getElementById("mc-name");
    if (nameInput) {
      nameInput.addEventListener("input", (e) =>
        this._updateRoot("name", e.target.value)
      );
    }

    // Switches
    const swShowLogos = root.getElementById("mc-show-logos");
    if (swShowLogos) {
      swShowLogos.addEventListener("change", (e) =>
        this._updateRoot("show_logos", e.target.checked)
      );
    }

    const swFullNames = root.getElementById("mc-full-names");
    if (swFullNames) {
      swFullNames.addEventListener("change", (e) =>
        this._updateRoot("full_team_names", e.target.checked)
      );
    }

    const swShowResultSymbols = root.getElementById("mc-show-result-symbols");
    if (swShowResultSymbols) {
      swShowResultSymbols.addEventListener("change", (e) =>
        this._updateRoot("show_result_symbols", e.target.checked)
      );
    }

    const swLiteMode = root.getElementById("mc-lite-mode");
    if (swLiteMode) {
      swLiteMode.addEventListener("change", (e) =>
        this._updateRoot("lite_mode", e.target.checked)
      );
    }

    // Fill mode
    const fillMode = root.getElementById("mc-fill-mode");
    if (fillMode) {
      fillMode.addEventListener("change", (e) => {
        this._updateRoot("fill_mode", e.target.value);
      });
    }

    // Gradient inputs
    const gradStart = root.getElementById("mc-grad-start");
    if (gradStart) {
      gradStart.addEventListener("input", (e) =>
        this._updateNested("gradient", "start", Number(e.target.value))
      );
    }

    const gradEnd = root.getElementById("mc-grad-end");
    if (gradEnd) {
      gradEnd.addEventListener("input", (e) =>
        this._updateNested("gradient", "end", Number(e.target.value))
      );
    }

    const gradAlphaStart = root.getElementById("mc-grad-alpha-start");
    if (gradAlphaStart) {
      gradAlphaStart.addEventListener("input", (e) =>
        this._updateNested(
          "gradient",
          "alpha_start",
          Number(e.target.value)
        )
      );
    }

    const gradAlphaEnd = root.getElementById("mc-grad-alpha-end");
    if (gradAlphaEnd) {
      gradAlphaEnd.addEventListener("input", (e) =>
        this._updateNested("gradient", "alpha_end", Number(e.target.value))
      );
    }

    // Zebra
    const zebraColor = root.getElementById("mc-zebra-color");
    if (zebraColor) {
      zebraColor.addEventListener("input", (e) =>
        this._updateRoot("zebra_color", e.target.value)
      );
    }

    const zebraAlpha = root.getElementById("mc-zebra-alpha");
    if (zebraAlpha) {
      zebraAlpha.addEventListener("input", (e) =>
        this._updateRoot("zebra_alpha", Number(e.target.value))
      );
    }

    // Font sizes
    const fontDate = root.getElementById("mc-font-date");
    if (fontDate) {
      fontDate.addEventListener("input", (e) =>
        this._updateNested("font_size", "date", Number(e.target.value))
      );
    }

    const fontStatus = root.getElementById("mc-font-status");
    if (fontStatus) {
      fontStatus.addEventListener("input", (e) =>
        this._updateNested("font_size", "status", Number(e.target.value))
      );
    }

    const fontTeams = root.getElementById("mc-font-teams");
    if (fontTeams) {
      fontTeams.addEventListener("input", (e) =>
        this._updateNested("font_size", "teams", Number(e.target.value))
      );
    }

    const fontScore = root.getElementById("mc-font-score");
    if (fontScore) {
      fontScore.addEventListener("input", (e) =>
        this._updateNested("font_size", "score", Number(e.target.value))
      );
    }

    // Icon sizes
    const iconLeague = root.getElementById("mc-icon-league");
    if (iconLeague) {
      iconLeague.addEventListener("input", (e) =>
        this._updateNested("icon_size", "league", Number(e.target.value))
      );
    }

    const iconCrest = root.getElementById("mc-icon-crest");
    if (iconCrest) {
      iconCrest.addEventListener("input", (e) =>
        this._updateNested("icon_size", "crest", Number(e.target.value))
      );
    }

    const iconResult = root.getElementById("mc-icon-result");
    if (iconResult) {
      iconResult.addEventListener("input", (e) =>
        this._updateNested("icon_size", "result", Number(e.target.value))
      );
    }

    // Colors W/D/L
    const colWin = root.getElementById("mc-color-win");
    if (colWin) {
      colWin.addEventListener("input", (e) =>
        this._updateNested("colors", "win", e.target.value)
      );
    }

    const colDraw = root.getElementById("mc-color-draw");
    if (colDraw) {
      colDraw.addEventListener("input", (e) =>
        this._updateNested("colors", "draw", e.target.value)
      );
    }

    const colLoss = root.getElementById("mc-color-loss");
    if (colLoss) {
      colLoss.addEventListener("input", (e) =>
        this._updateNested("colors", "loss", e.target.value)
      );
    }
  }

  // HA czasem to wywołuje, ale tu nie używamy
  static get styles() {
    return window.HAUIUtils?.styles ?? "";
  }
}

if (!customElements.get("matches-card-editor")) {
  customElements.define("matches-card-editor", MatchesCardEditor);
}