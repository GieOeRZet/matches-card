// Matches Cards Pack – version 0.3.111
// Auto-generated from dist/

// ===== FILE INCLUDED: dist/league-table-card-editor.js =====
// ============================================================================
//  League Table Card Editor – FIXED (value binding + alpha colors + debounce)
// ============================================================================

class LeagueTableCardEditor extends HTMLElement {

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = {};
    this._debounce = null;
  }

  setConfig(config) {
    this._config = JSON.parse(JSON.stringify(config));
    this.render();
  }

  _debounceUpdate(key, value) {
    this._config[key] = value;

    clearTimeout(this._debounce);
    this._debounce = setTimeout(() => {
      this.dispatchEvent(
        new CustomEvent("config-changed", {
          detail: { config: this._config }
        })
      );
    }, 700);
  }

  render() {
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
        label { font-size: 0.85rem; display:flex; flex-direction:column; }
        input[type="number"], input[type="text"] {
          padding: 4px 6px;
          border-radius: 6px;
          border: 1px solid rgba(255,255,255,0.20);
          background: rgba(0,0,0,0.2);
          color: inherit;
        }
        input[type="color"] {
          width:40px;
          height:28px;
          padding:0;
          border:none;
          background:transparent;
        }
      </style>

      <!-- PODSTAWOWE -->
      <details class="group" open>
        <summary>Podstawowe</summary>
        <div>
          <label>
            Nazwa karty
            <input id="name" type="text" value="${c.name ?? ''}">
          </label>

          <label>
            Tryb LITE
            <ha-switch id="lite_mode" ?checked="${c.lite_mode === true}"></ha-switch>
          </label>

          <label>
            Pokaz trend
            <ha-switch id="show_trend" ?checked="${c.show_trend !== false}"></ha-switch>
          </label>
        </div>
      </details>

      <!-- PODŚWIETLENIA -->
      <details class="group" open>
        <summary>Podświetlenia</summary>
        <div>
          <label>
            TOP – kolor
            <input id="top_color" type="color" value="${c.highlight?.top_color ?? '#00ff00'}">
          </label>

          <label>
            TOP – alfa
            <input id="top_alpha" type="number" min="0" max="1" step="0.05"
                   value="${c.highlight?.top_alpha ?? 0.35}">
          </label>

          <label>
            MIEJSCA 3–4 – kolor
            <input id="mid_color" type="color" value="${c.highlight?.mid_color ?? '#468cd2'}">
          </label>

          <label>
            MIEJSCA 3–4 – alfa
            <input id="mid_alpha" type="number" min="0" max="1" step="0.05"
                   value="${c.highlight?.mid_alpha ?? 0.35}">
          </label>

          <label>
            SPADKOWE – kolor
            <input id="bottom_color" type="color" value="${c.highlight?.bottom_color ?? '#e23b3b'}">
          </label>

          <label>
            SPADKOWE – alfa
            <input id="bottom_alpha" type="number" min="0" max="1" step="0.05"
                   value="${c.highlight?.bottom_alpha ?? 0.35}">
          </label>

          <label>
            Moja drużyna – kolor
            <input id="favorite_color" type="color"
                   value="${c.highlight?.favorite_color ?? '#ffffff'}">
          </label>

          <label>
            Moja drużyna – alfa
            <input id="favorite_alpha" type="number" min="0" max="1" step="0.05"
                   value="${c.highlight?.favorite_alpha ?? 0.35}">
          </label>
        </div>
      </details>
    `;

    // =====================================
    //  BIND INPUTS → CONFIG
    // =====================================
    const bind = (id, key, group = null) => {
      const el = this.shadowRoot.getElementById(id);
      if (!el) return;

      const handler = (e) => {
        const value =
          el.type === "number" ? Number(e.target.value)
          : el.type === "color" ? e.target.value
          : el.checked ?? e.target.value;

        if (group) {
          this._config[group][key] = value;
          this._debounceUpdate(group, { ...this._config[group] });
        } else {
          this._debounceUpdate(key, value);
        }
      };

      el.addEventListener("input", handler);
      el.addEventListener("change", handler);
    };

    // BASIC
    bind("name", "name");
    bind("lite_mode", "lite_mode");
    bind("show_trend", "show_trend");

    // HIGHLIGHT (z alfach)
    bind("top_color", "top_color", "highlight");
    bind("top_alpha", "top_alpha", "highlight");

    bind("mid_color", "mid_color", "highlight");
    bind("mid_alpha", "mid_alpha", "highlight");

    bind("bottom_color", "bottom_color", "highlight");
    bind("bottom_alpha", "bottom_alpha", "highlight");

    bind("favorite_color", "favorite_color", "highlight");
    bind("favorite_alpha", "favorite_alpha", "highlight");
  }

  static getConfigElement() { return this; }
  static getStubConfig() { return {}; }
}

customElements.define("league-table-card-editor", LeagueTableCardEditor);
// ===== FILE INCLUDED: dist/league-table-card.js =====
// ============================================================================
//  League Table Card (90minut) – v0.1.000 (no trend)
// ============================================================================

class LeagueTableCard extends HTMLElement {

  setConfig(config) {
    if (!config.entity)
      throw new Error("Entity is required (np. sensor.90minut_table)");

    this.config = {
      name: "Tabela ligowa",
      show_name: true,
      lite_mode: false,

      font_size: {
        header: 0.8,
        row: 0.9,
        team: 1.0,
      },

      highlight: {
        favorite: true,
        top_count: 2,
        conference_count: 2,
        bottom_count: 3,
        favorite_color: "rgba(255,255,255,0.35)",
        top_color: "rgba(59,165,93,0.35)",
        conf_color: "rgba(70,140,210,0.35)",
        bottom_color: "rgba(226,59,59,0.35)"
      },

      ...config
    };

    this.entityId = this.config.entity;
  }

  set hass(hass) {
    this._hass = hass;
    const stateObj = hass.states[this.entityId];

    if (!stateObj) {
      this.innerHTML = "<ha-card>Encja nie istnieje.</ha-card>";
      return;
    }

    const table = stateObj.attributes.table || [];
    const total = table.length;
    const myPos = parseInt(stateObj.attributes.my_position, 10);

    const cfg = this.config;

    const style = `
      <style>
        table {
          width:100%;
          border-collapse:collapse;
          font-family: Arial, sans-serif;
        }

        th, td {
          padding:4px 6px;
          border-bottom:1px solid rgba(0,0,0,0.1);
          text-align:center;
          white-space:nowrap;
        }

        th {
          font-size:${cfg.font_size.header}rem;
          opacity:0.75;
        }

        .team-col {
          text-align:left;
          font-size:${cfg.font_size.team}rem;
        }

        .fav { background:${cfg.highlight.favorite_color}; }
        .top { background:${cfg.highlight.top_color}; }
        .conf { background:${cfg.highlight.conf_color}; }
        .bot { background:${cfg.highlight.bottom_color}; }

        .legend {
          margin-top:10px;
          display:flex;
          gap:14px;
          align-items:center;
          font-size:0.85rem;
          opacity:0.8;
        }
        .legend-box {
          width:14px;
          height:14px;
          border-radius:4px;
          display:inline-block;
        }
      </style>
    `;

    const rows = table.map(row => {
      const pos = parseInt(row.position, 10);

      let cls = "";
      if (cfg.highlight.favorite && pos === myPos) cls = "fav";
      else if (pos <= cfg.highlight.top_count) cls = "top";
      else if (pos > cfg.highlight.top_count && pos <= cfg.highlight.top_count + cfg.highlight.conference_count) cls = "conf";
      else if (pos > total - cfg.highlight.bottom_count) cls = "bot";

      return `
        <tr class="${cls}">
          <td>${pos}</td>
          <td class="team-col">${row.team}</td>
          <td>${row.matches}</td>
          <td>${row.points}</td>
          <td>${row.goals}</td>
          <td>${row.diff >= 0 ? "+" + row.diff : row.diff}</td>
        </tr>
      `;
    }).join("");

    const legend = `
      <div class="legend">
        <span class="legend-box" style="background:${cfg.highlight.top_color}"></span> TOP 2 (Liga Mistrzów)
        <span class="legend-box" style="background:${cfg.highlight.conf_color}"></span> 3–4 (Liga Konferencji)
        <span class="legend-box" style="background:${cfg.highlight.bottom_color}"></span> Spadek (ostatnie 3)
      </div>
    `;

    const header = this.config.show_name ? `header="${this.config.name}"` : "";

    if (this.config.lite_mode) {
      this.innerHTML = `${style}<table><tbody>${rows}</tbody></table>${legend}`;
      return;
    }

    this.innerHTML = `
      ${style}
      <ha-card ${header}>
        <table>
          <thead>
            <tr>
              <th>Poz</th>
              <th>Drużyna</th>
              <th>M</th>
              <th>Pkt</th>
              <th>Bramki</th>
              <th>+/-</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        ${legend}
      </ha-card>
    `;
  }
}

customElements.define("league-table-card", LeagueTableCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "league-table-card",
  name: "League Table Card (90minut)",
  description: "Tabela ligowa bez trendu"
});
// ===== FILE INCLUDED: dist/matches-card-editor.js =====
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
// ===== FILE INCLUDED: dist/matches-card.js =====
// ============================================================================
//  Matches Card (90minut) – Stable Rebuild (layout 0.3.000 preserved)
//  WITH:
//   - fixed date/time column
//   - fixed score alignment
//   - separate W/D/L column
//   - spacing fixes
//   - LITE mode
//   - FULL default YAML + bidirectional sync (deep merge)
// ============================================================================

class MatchesCard extends HTMLElement {

  // --------------------------------------------------------------------------
  // DEFAULT CONFIG returned also into YAML on card creation
  // --------------------------------------------------------------------------
  static getStubConfig() {
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
        score: 1.0
      },

      icon_size: {
        league: 26,
        crest: 24,
        result: 26
      },

      colors: {
        win: "#3ba55d",
        draw: "#468cd2",
        loss: "#e23b3b"
      },

      gradient: {
        start: 35,
        end: 100,
        alpha_start: 0.0,
        alpha_end: 0.55
      },

      zebra_color: "#f0f0f0",
      zebra_alpha: 0.4
    };
  }

  // --------------------------------------------------------------------------
  // DEEP MERGE – **critical fix** so config from editor/YAML syncs both ways
  // --------------------------------------------------------------------------
  static _deepMerge(target, defaults) {
    for (const k in defaults) {
      if (defaults[k] !== null && typeof defaults[k] === "object" && !Array.isArray(defaults[k])) {
        if (!target[k]) target[k] = {};
        this._deepMerge(target[k], defaults[k]);
      } else {
        if (target[k] === undefined) target[k] = defaults[k];
      }
    }
    return target;
  }

  // --------------------------------------------------------------------------
  // CONFIG SETTER
  // --------------------------------------------------------------------------
  setConfig(config) {
    const defaults = MatchesCard.getStubConfig();
    this.config = MatchesCard._deepMerge(JSON.parse(JSON.stringify(config)), defaults);
  }

  // --------------------------------------------------------------------------
  // MAIN RENDER LOOP
  // --------------------------------------------------------------------------
  set hass(hass) {
    this._hass = hass;

    const entity = hass.states[this.config.entity];
    if (!entity) {
      this.innerHTML = "<ha-card>Encja nie istnieje.</ha-card>";
      return;
    }

    const matches = entity.attributes.matches || [];

    const zebraCSS =
      this.config.fill_mode === "zebra"
        ? `tr:nth-child(even){background-color:${this._rgba(this.config.zebra_color, this.config.zebra_alpha)};}`
        : "";

    const style = `
      <style>
        ha-card {
          padding:10px 0;
          font-family: Arial, sans-serif;
        }

        table {
          width:100%;
          border-collapse:collapse;
        }

        tr {
          border-bottom:1px solid rgba(0,0,0,0.1);
        }

        td {
          padding:4px 6px;
          vertical-align:middle;
        }

        .dual-cell {
          display:flex;
          flex-direction:column;
          justify-content:center;
          align-items:center;
        }

        .crest-cell {
          gap:3px; /* minimalny odstęp między herbami */
        }

        .league-cell {
          padding-right:12px; /* odstęp od herbów */
        }

        .team-cell {
          text-align:left;
          padding-left:8px;
        }

        .team-row {
          line-height:1.3em;
        }

        .score-cell {
          display:flex;
          flex-direction:column;
          justify-content:center;
          align-items:center;
          line-height:1.3em;
        }

        .result-cell {
          text-align:center;
        }

        .result-circle {
          border-radius:50%;
          width:${this.config.icon_size.result}px;
          height:${this.config.icon_size.result}px;
          display:flex;
          align-items:center;
          justify-content:center;
          color:#fff;
          font-weight:bold;
          margin:auto;
        }

        ${zebraCSS}
      </style>
    `;

    const rows = matches.map(m => this._row(m)).join("");

    if (this.config.lite_mode) {
      this.innerHTML = `${style}<table>${rows}</table>`;
      return;
    }

    const header = this.config.show_name ? `header="${this.config.name}"` : "";

    this.innerHTML = `
      ${style}
      <ha-card ${header}>
        <table>${rows}</table>
      </ha-card>
    `;
  }

  // --------------------------------------------------------------------------
  // RENDER ONE MATCH ROW
  // --------------------------------------------------------------------------
  _row(m) {

    // -----------------------------
    // DATE + TIME / KONIEC (FIX)
    // -----------------------------
    const dt = m.date || ""; // "2025-10-05 20:15"
    const [day, tm] = dt.split(" "); // ["2025-10-05", "20:15"]

    const statusText =
      m.finished === true
        ? "KONIEC"
        : (tm || "");

    const [homeScore, awayScore] = (m.score || "-").split("-");

    const homeBold = m.result === "win" ? "bold" : m.result === "loss" ? "dim" : "";
    const awayBold = m.result === "loss" ? "bold" : m.result === "win" ? "dim" : "";

    return `
      <tr style="${this._gradient(m)}">

        <!-- DATA -->
        <td style="width:10%; text-align:center;">
          <div style="font-size:${this.config.font_size.date}rem">${day}</div>
          <div style="font-size:${this.config.font_size.status}rem">${statusText}</div>
        </td>

        <!-- LIGA -->
        <td class="league-cell" style="width:10%; text-align:center;">
          ${this._league(m.league)}
        </td>

        <!-- HERBY -->
        ${this.config.show_logos ? `
          <td class="crest-cell dual-cell" style="width:10%;">
            <img src="${m.logo_home}" height="${this.config.icon_size.crest}" />
            <img src="${m.logo_away}" height="${this.config.icon_size.crest}" />
          </td>
        ` : ""}

        <!-- DRUŻYNY -->
        <td class="team-cell">
          <div class="team-row ${homeBold}" style="font-size:${this.config.font_size.teams}rem">${m.home}</div>
          <div class="team-row ${awayBold}" style="font-size:${this.config.font_size.teams}rem">${m.away}</div>
        </td>

        <!-- WYNIK -->
        <td class="score-cell" style="width:10%;">
          <div class="${homeBold}" style="font-size:${this.config.font_size.score}rem">${homeScore}</div>
          <div class="${awayBold}" style="font-size:${this.config.font_size.score}rem">${awayScore}</div>
        </td>

        <!-- W/D/L -->
        <td class="result-cell" style="width:8%;">
          ${this.config.show_result_symbols && m.result ? `
            <div class="result-circle" style="background:${this.config.colors[m.result]}">
              ${m.result.charAt(0).toUpperCase()}
            </div>
          ` : ""}
        </td>

      </tr>
    `;
  }

  // --------------------------------------------------------------------------
  // LEAGUE ICON
  // --------------------------------------------------------------------------
  _league(code) {
    const file =
      code === "L"  ? "ekstraklasa.png" :
      code === "PP" ? "puchar.png" :
      null;

    if (!file) return `<div>${code}</div>`;

    return `<img src="https://raw.githubusercontent.com/GieOeRZet/matches-card/main/logo/${file}"
                height="${this.config.icon_size.league}" />`;
  }

  // --------------------------------------------------------------------------
  // GRADIENT GENERATOR
  // --------------------------------------------------------------------------
  _gradient(m) {
    if (this.config.fill_mode !== "gradient" || !m.result) return "";

    const c = this.config.colors[m.result];
    const g = this.config.gradient;

    return `
      background: linear-gradient(to right,
        rgba(0,0,0,0) 0%,
        ${this._rgba(c, g.alpha_start)} ${g.start}%,
        ${this._rgba(c, g.alpha_end)} ${g.end}%,
        rgba(0,0,0,0) 100%
      );
    `;
  }

  // --------------------------------------------------------------------------
  // HEX → RGBA
  // --------------------------------------------------------------------------
  _rgba(hex, alpha) {
    const h = hex.replace("#", "");
    const r = parseInt(h.substr(0,2),16);
    const g = parseInt(h.substr(2,2),16);
    const b = parseInt(h.substr(4,2),16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  // --------------------------------------------------------------------------
  // LINK TO EDITOR
  // --------------------------------------------------------------------------
  static getConfigElement() {
    return document.createElement("matches-card-editor");
  }

  getCardSize() {
    return 6;
  }
}

customElements.define("matches-card", MatchesCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "matches-card",
  name: "Matches Card (90minut)",
  description: "Karta pokazująca mecze z sensora 90minut.pl"
});
