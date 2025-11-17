// ============================================================================
//  Matches Card Editor – v0.3.x
//  - Sekcje <details> (nie zwijają się same)
//  - Number inputy (ze strzałkami)
//  - Debounce 700 ms
//  - Pełna zgodność z konfiguracją karty (fonty, ikony, kolory, gradient, zebra, LITE)
//  - Pobiera wartości z YAML i odsyła je z powrotem (config-changed)
// ============================================================================

class MatchesCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = {};
    this._debounce = null;
  }

  // Domyślna konfiguracja – musi być spójna z MatchesCard.getStubConfig()
  _getDefaultConfig() {
    return {
      entity: "",
      name: "90minut Matches",
      show_name: true,
      show_logos: true,
      full_team_names: true,
      show_result_symbols: true,
      lite_mode: false,

      fill_mode: "gradient",

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
        start: 35,
        end: 100,
        alpha_start: 0.0,
        alpha_end: 0.55,
      },

      zebra_color: "#f0f0f0",
      zebra_alpha: 0.4,
    };
  }

  static get properties() {
    return {
      hass: {},
    };
  }

  set hass(hass) {
    this._hass = hass;
  }

  // -----------------------------
  // Deep merge config + defaults
  // -----------------------------
  _deepMerge(target, defaults) {
    for (const k in defaults) {
      const dv = defaults[k];
      if (dv !== null && typeof dv === "object" && !Array.isArray(dv)) {
        if (!target[k] || typeof target[k] !== "object") {
          target[k] = {};
        }
        this._deepMerge(target[k], dv);
      } else if (target[k] === undefined) {
        target[k] = dv;
      }
    }
    return target;
  }

  // HA wywołuje setConfig z aktualnym YAML; my dokładamy domyślne wartości
  setConfig(config) {
    const defaults = this._getDefaultConfig();
    const incoming = JSON.parse(JSON.stringify(config || {}));
    this._config = this._deepMerge(incoming, defaults);
    this._render();
  }

  // --------------------------
  // Aktualizacja konfiguracji
  // --------------------------
  _update(key, value, opts = {}) {
    this._config = {
      ...this._config,
      [key]: value,
    };

    // Na zmianę trybu (fill_mode) musimy prze-renderować edytor,
    // żeby pojawiły się odpowiednie pola.
    if (opts.rerender) {
      this._render();
    }

    clearTimeout(this._debounce);
    if (opts.immediate) {
      this._apply();
    } else {
      this._debounce = setTimeout(() => this._apply(), 700);
    }
  }

  _updateNested(objKey, field, newVal, opts = {}) {
    const obj = {
      ...(this._config[objKey] || {}),
      [field]: newVal,
    };
    this._update(objKey, obj, opts);
  }

  _apply() {
    const event = new CustomEvent("config-changed", {
      detail: { config: this._config },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  // --------------------------
  // Rendering
  // --------------------------
  _render() {
    if (!this.shadowRoot) return;

    const c = this._config;

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
          grid-template-columns: 1fr 1fr;
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

        .switch-row {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 10px;
          font-size: 0.9rem;
        }

        .switch-row span {
          opacity: 0.9;
        }

        details[open] > summary::marker,
        details[open] > summary::-webkit-details-marker {
          color: var(--primary-color);
        }
      </style>

      <!-- PODSTAWOWE -->
      <details class="group" open>
        <summary>Podstawowe</summary>
        <div>
          <label>
            Nazwa karty
            <input id="mc_name" type="text" value="${c.name ?? ""}">
          </label>

          <div class="switch-row">
            <ha-switch id="mc_show_logos" ${c.show_logos !== false ? "checked" : ""}></ha-switch>
            <span>Pokaż herby</span>
          </div>

          <div class="switch-row">
            <ha-switch id="mc_full_team_names" ${c.full_team_names !== false ? "checked" : ""}></ha-switch>
            <span>Pełne nazwy</span>
          </div>

          <div class="switch-row">
            <ha-switch id="mc_show_result_symbols" ${c.show_result_symbols !== false ? "checked" : ""}></ha-switch>
            <span>Pokaż symbole W/R/P</span>
          </div>

          <div class="switch-row">
            <ha-switch id="mc_lite_mode" ${c.lite_mode === true ? "checked" : ""}></ha-switch>
            <span>Tryb LITE (bez ha-card)</span>
          </div>
        </div>
      </details>

      <!-- WYPEŁNIENIE -->
      <details class="group">
        <summary>Styl wypełnienia</summary>
        <div>
          <label>
            Tryb wypełnienia
            <select id="mc_fill_mode">
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
              <input id="mc_grad_start" type="number" min="0" max="100"
                     value="${c.gradient?.start ?? 35}">
            </label>

            <label>
              Koniec gradientu (%)
              <input id="mc_grad_end" type="number" min="0" max="100"
                     value="${c.gradient?.end ?? 100}">
            </label>

            <label>
              Alfa start
              <input id="mc_grad_alpha_start" type="number" min="0" max="1" step="0.05"
                     value="${c.gradient?.alpha_start ?? 0}">
            </label>

            <label>
              Alfa koniec
              <input id="mc_grad_alpha_end" type="number" min="0" max="1" step="0.05"
                     value="${c.gradient?.alpha_end ?? 0.55}">
            </label>
          `
              : ""
          }

          ${
            c.fill_mode === "zebra"
              ? `
            <label>
              Kolor zebry
              <input id="mc_zebra_color" type="color"
                     value="${c.zebra_color ?? "#f0f0f0"}">
            </label>

            <label>
              Alfa zebry
              <input id="mc_zebra_alpha" type="number" min="0" max="1" step="0.05"
                     value="${c.zebra_alpha ?? 0.4}">
            </label>
          `
              : ""
          }
        </div>
      </details>

      <!-- CZCIONKI -->
      <details class="group">
        <summary>Rozmiary czcionek</summary>
        <div>
          <label>
            Data
            <input id="mc_font_date" type="number" step="0.1"
                   value="${c.font_size?.date ?? 0.9}">
          </label>

          <label>
            Status (KONIEC / godzina)
            <input id="mc_font_status" type="number" step="0.1"
                   value="${c.font_size?.status ?? 0.8}">
          </label>

          <label>
            Drużyny
            <input id="mc_font_teams" type="number" step="0.1"
                   value="${c.font_size?.teams ?? 1.0}">
          </label>

          <label>
            Wynik
            <input id="mc_font_score" type="number" step="0.1"
                   value="${c.font_size?.score ?? 1.0}">
          </label>
        </div>
      </details>

      <!-- IKONY -->
      <details class="group">
        <summary>Rozmiary ikon</summary>
        <div>
          <label>
            Liga (logo)
            <input id="mc_icon_league" type="number" min="10" max="60"
                   value="${c.icon_size?.league ?? 26}">
          </label>

          <label>
            Herby
            <input id="mc_icon_crest" type="number" min="10" max="60"
                   value="${c.icon_size?.crest ?? 24}">
          </label>

          <label>
            Symbol W/R/P
            <input id="mc_icon_result" type="number" min="10" max="60"
                   value="${c.icon_size?.result ?? 26}">
          </label>
        </div>
      </details>

      <!-- KOLORY W/R/P -->
      <details class="group">
        <summary>Kolory W / R / P</summary>
        <div>
          <label>
            Wygrana (W)
            <input id="mc_color_win" type="color"
                   value="${c.colors?.win ?? "#3ba55d"}">
          </label>

          <label>
            Remis (R)
            <input id="mc_color_draw" type="color"
                   value="${c.colors?.draw ?? "#468cd2"}">
          </label>

          <label>
            Porażka (P)
            <input id="mc_color_loss" type="color"
                   value="${c.colors?.loss ?? "#e23b3b"}">
          </label>
        </div>
      </details>
    `;

    this._attachListeners();
  }

  // --------------------------
  // Podpinanie listenerów
  // --------------------------
  _attachListeners() {
    const root = this.shadowRoot;
    if (!root) return;

    const byId = (id) => root.getElementById(id);

    // Podstawowe
    const nameEl = byId("mc_name");
    if (nameEl) {
      nameEl.addEventListener("input", (e) =>
        this._update("name", e.target.value)
      );
    }

    const showLogosEl = byId("mc_show_logos");
    if (showLogosEl) {
      showLogosEl.addEventListener("change", (e) =>
        this._update("show_logos", e.target.checked)
      );
    }

    const fullNamesEl = byId("mc_full_team_names");
    if (fullNamesEl) {
      fullNamesEl.addEventListener("change", (e) =>
        this._update("full_team_names", e.target.checked)
      );
    }

    const showResEl = byId("mc_show_result_symbols");
    if (showResEl) {
      showResEl.addEventListener("change", (e) =>
        this._update("show_result_symbols", e.target.checked)
      );
    }

    const liteEl = byId("mc_lite_mode");
    if (liteEl) {
      liteEl.addEventListener("change", (e) =>
        this._update("lite_mode", e.target.checked)
      );
    }

    // Fill mode
    const fillModeEl = byId("mc_fill_mode");
    if (fillModeEl) {
      fillModeEl.addEventListener("change", (e) =>
        this._update("fill_mode", e.target.value, { rerender: true })
      );
    }

    // Gradient
    const gradStart = byId("mc_grad_start");
    if (gradStart) {
      gradStart.addEventListener("input", (e) =>
        this._updateNested("gradient", "start", Number(e.target.value) || 0)
      );
    }

    const gradEnd = byId("mc_grad_end");
    if (gradEnd) {
      gradEnd.addEventListener("input", (e) =>
        this._updateNested("gradient", "end", Number(e.target.value) || 0)
      );
    }

    const gradAlphaStart = byId("mc_grad_alpha_start");
    if (gradAlphaStart) {
      gradAlphaStart.addEventListener("input", (e) =>
        this._updateNested("gradient", "alpha_start", Number(e.target.value) || 0)
      );
    }

    const gradAlphaEnd = byId("mc_grad_alpha_end");
    if (gradAlphaEnd) {
      gradAlphaEnd.addEventListener("input", (e) =>
        this._updateNested("gradient", "alpha_end", Number(e.target.value) || 0)
      );
    }

    // Zebra
    const zebraColor = byId("mc_zebra_color");
    if (zebraColor) {
      zebraColor.addEventListener("input", (e) =>
        this._update("zebra_color", e.target.value)
      );
    }

    const zebraAlpha = byId("mc_zebra_alpha");
    if (zebraAlpha) {
      zebraAlpha.addEventListener("input", (e) =>
        this._update("zebra_alpha", Number(e.target.value) || 0)
      );
    }

    // Font sizes
    const fDate = byId("mc_font_date");
    if (fDate) {
      fDate.addEventListener("input", (e) =>
        this._updateNested("font_size", "date", Number(e.target.value) || 0)
      );
    }

    const fStatus = byId("mc_font_status");
    if (fStatus) {
      fStatus.addEventListener("input", (e) =>
        this._updateNested("font_size", "status", Number(e.target.value) || 0)
      );
    }

    const fTeams = byId("mc_font_teams");
    if (fTeams) {
      fTeams.addEventListener("input", (e) =>
        this._updateNested("font_size", "teams", Number(e.target.value) || 0)
      );
    }

    const fScore = byId("mc_font_score");
    if (fScore) {
      fScore.addEventListener("input", (e) =>
        this._updateNested("font_size", "score", Number(e.target.value) || 0)
      );
    }

    // Icon sizes
    const iLeague = byId("mc_icon_league");
    if (iLeague) {
      iLeague.addEventListener("input", (e) =>
        this._updateNested("icon_size", "league", Number(e.target.value) || 0)
      );
    }

    const iCrest = byId("mc_icon_crest");
    if (iCrest) {
      iCrest.addEventListener("input", (e) =>
        this._updateNested("icon_size", "crest", Number(e.target.value) || 0)
      );
    }

    const iResult = byId("mc_icon_result");
    if (iResult) {
      iResult.addEventListener("input", (e) =>
        this._updateNested("icon_size", "result", Number(e.target.value) || 0)
      );
    }

    // Colors W/R/P
    const cWin = byId("mc_color_win");
    if (cWin) {
      cWin.addEventListener("input", (e) =>
        this._updateNested("colors", "win", e.target.value)
      );
    }

    const cDraw = byId("mc_color_draw");
    if (cDraw) {
      cDraw.addEventListener("input", (e) =>
        this._updateNested("colors", "draw", e.target.value)
      );
    }

    const cLoss = byId("mc_color_loss");
    if (cLoss) {
      cLoss.addEventListener("input", (e) =>
        this._updateNested("colors", "loss", e.target.value)
      );
    }
  }
}

customElements.define("matches-card-editor", MatchesCardEditor);