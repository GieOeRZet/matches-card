// Matches Cards Pack – version 0.3.107
// Auto-generated from dist/

// ===== FILE INCLUDED: dist/league-table-card-editor.js =====
// ============================================================================
//  League Table Card Editor – v0.1.100
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

  // -------------------------------------------------------
  // deep update
  // -------------------------------------------------------
  _update(path, value) {
    const keys = path.split(".");
    let obj = this._config;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!obj[keys[i]]) obj[keys[i]] = {};
      obj = obj[keys[i]];
    }

    obj[keys[keys.length - 1]] = value;

    clearTimeout(this._debounce);
    this._debounce = setTimeout(() => this._apply(), 700);
  }

  _apply() {
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: this._config },
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
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
          cursor: pointer;
          background: rgba(255,255,255,0.06);
          font-size: 1rem;
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
          opacity: 0.85;
        }

        input[type="number"],
        input[type="color"],
        input[type="text"] {
          padding: 4px 6px;
          border-radius: 6px;
          border: 1px solid rgba(255,255,255,0.20);
          background: rgba(0,0,0,0.2);
          color: inherit;
        }

        .switch {
          display: flex;
          align-items: center;
          gap: 10px;
        }
      </style>

      <!-- BASIC -->
      <details class="group" open>
        <summary>Podstawowe</summary>
        <div>
          <label>
            Nazwa
            <input type="text"
                   value="${c.name ?? ''}"
                   @input="${e => this._update('name', e.target.value)}">
          </label>

          <label class="switch">
            <ha-switch
              ?checked="${c.show_name !== false}"
              @change="${e => this._update('show_name', e.target.checked)}">
            </ha-switch>
            Pokaż nazwę
          </label>

          <label class="switch">
            <ha-switch
              ?checked="${c.lite_mode === true}"
              @change="${e => this._update('lite_mode', e.target.checked)}">
            </ha-switch>
            Tryb LITE
          </label>

          <label class="switch">
            <ha-switch
              ?checked="${c.show_trend !== false}"
              @change="${e => this._update('show_trend', e.target.checked)}">
            </ha-switch>
            Pokaż trend
          </label>
        </div>
      </details>

      <!-- FONT SIZES -->
      <details class="group">
        <summary>Rozmiary czcionek</summary>
        <div>
          <label>
            Nagłówek
            <input type="number" step="0.1"
                   value="${c.font_size?.header ?? 0.8}"
                   @input="${e => this._update('font_size.header', Number(e.target.value))}">
          </label>

          <label>
            Wiersze
            <input type="number" step="0.1"
                   value="${c.font_size?.row ?? 0.9}"
                   @input="${e => this._update('font_size.row', Number(e.target.value))}">
          </label>

          <label>
            Drużyna
            <input type="number" step="0.1"
                   value="${c.font_size?.team ?? 1.0}"
                   @input="${e => this._update('font_size.team', Number(e.target.value))}">
          </label>
        </div>
      </details>

      <!-- COLORS -->
      <details class="group">
        <summary>Kolory stref</summary>
        <div>
          <label>
            Liga Mistrzów
            <input type="color"
                   value="${c.colors?.top ?? "#3ba55d"}"
                   @input="${e => this._update('colors.top', e.target.value)}">
          </label>

          <label>
            Liga Konferencji
            <input type="color"
                   value="${c.colors?.conference ?? "#468cd2"}"
                   @input="${e => this._update('colors.conference', e.target.value)}">
          </label>

          <label>
            Spadek
            <input type="color"
                   value="${c.colors?.bottom ?? "#e23b3b"}"
                   @input="${e => this._update('colors.bottom', e.target.value)}">
          </label>

          <label>
            Moja drużyna
            <input type="color"
                   value="${c.colors?.favorite ?? "#fff7c2"}"
                   @input="${e => this._update('colors.favorite', e.target.value)}">
          </label>
        </div>
      </details>

      <!-- HIGHLIGHT -->
      <details class="group">
        <summary>Strefy pozycji</summary>
        <div>
          <label>
            TOP (LM)
            <input type="number" min="1" max="10"
                   value="${c.highlight?.top_count ?? 2}"
                   @input="${e => this._update('highlight.top_count', Number(e.target.value))}">
          </label>

          <label>
            Konferencje
            <input type="number" min="0" max="10"
                   value="${c.highlight?.conference_count ?? 2}"
                   @input="${e => this._update('highlight.conference_count', Number(e.target.value))}">
          </label>

          <label>
            Spadek
            <input type="number" min="1" max="10"
                   value="${c.highlight?.bottom_count ?? 3}"
                   @input="${e => this._update('highlight.bottom_count', Number(e.target.value))}">
          </label>
        </div>
      </details>
    `;
  }
}

customElements.define("league-table-card-editor", LeagueTableCardEditor);
// ===== FILE INCLUDED: dist/league-table-card.js =====
// ============================================================================
//  League Table Card (90minut) – v0.1.100 (stable)
//  Author: GieOeRZet
// ============================================================================

class LeagueTableCard extends HTMLElement {
  setConfig(config) {
    const defaults = {
      name: "Tabela ligowa",
      show_name: true,
      lite_mode: false,
      show_trend: true,

      font_size: {
        header: 0.8,
        row: 0.9,
        team: 1.0,
      },

      // zgodne stylistycznie z Matches Card
      colors: {
        top: "#3ba55d",      // green (win)
        conference: "#468cd2", // blue (draw)
        bottom: "#e23b3b",     // red (loss)
        favorite: "#fff7c2",   // light gold
      },

      highlight: {
        top_count: 2,
        conference_count: 2,
        bottom_count: 3,
      },
    };

    this.config = {
      ...defaults,
      ...config,
      font_size: { ...defaults.font_size, ...(config.font_size || {}) },
      colors: { ...defaults.colors, ...(config.colors || {}) },
      highlight: { ...defaults.highlight, ...(config.highlight || {}) },
    };

    this.entityId = this.config.entity;
    if (this._hass) this._render();
  }

  set hass(hass) {
    this._hass = hass;
    if (this.config) this._render();
  }

  // -------------------------------------------------------
  // RENDER
  // -------------------------------------------------------
  _render() {
    const hass = this._hass;
    const cfg = this.config;

    if (!hass || !this.entityId) return;

    const stateObj = hass.states[this.entityId];
    if (!stateObj) {
      this.innerHTML = `<ha-card>Błąd: encja nie istnieje.</ha-card>`;
      return;
    }

    const table = stateObj.attributes.table || [];
    const totalTeams = table.length || 0;
    const myPosAttr = stateObj.attributes.my_position;
    const myPosition = myPosAttr != null ? parseInt(myPosAttr, 10) : null;

    const style = `
      <style>
        .ltc-card {
          font-family: "Sofascore Sans", Arial, sans-serif;
        }

        table.ltc-table {
          width: 100%;
          border-collapse: collapse;
        }

        .ltc-table th,
        .ltc-table td {
          padding: 4px 6px;
          border-bottom: 1px solid rgba(255,255,255,0.12);
          font-size: ${cfg.font_size.row}rem;
          text-align: center;
          vertical-align: middle;
          white-space: nowrap;
        }

        .ltc-table th {
          font-weight: 600;
          font-size: ${cfg.font_size.header}rem;
          opacity: 0.85;
        }

        .ltc-col-pos   { width: 10%; text-align: right; }
        .ltc-col-team  { text-align: left; font-size: ${cfg.font_size.team}rem; }
        .ltc-col-m     { width: 8%;  }
        .ltc-col-pkt   { width: 10%; font-weight: 600; }
        .ltc-col-goals { width: 14%; }
        .ltc-col-diff  { width: 10%; }
        .ltc-col-trend { width: 10%; }

        /* Highlight colors */
        .ltc-row-favorite {
          background-color: ${cfg.colors.favorite};
        }
        .ltc-row-top {
          background-color: ${cfg.colors.top};
        }
        .ltc-row-conf {
          background-color: ${cfg.colors.conference};
        }
        .ltc-row-bottom {
          background-color: ${cfg.colors.bottom};
        }

        .ltc-team-name {
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .ltc-trend-up   { color: #2e7d32; }
        .ltc-trend-down { color: #c62828; }
        .ltc-trend-same { color: #808080; }

        /* LEGEND */
        .ltc-legend {
          display:flex;
          gap:18px;
          margin-top:10px;
          padding:4px 6px;
          font-size:0.8rem;
          opacity:0.9;
        }
        .ltc-leg-item {
          display:flex;
          align-items:center;
          gap:6px;
        }
        .ltc-leg-box {
          width:14px;
          height:14px;
          border-radius:3px;
        }
      </style>
    `;

    // ROWS
    const rows = table.map((row) =>
      this._renderRow(row, myPosition, totalTeams)
    ).join("");

    // HEADER
    const header = `
      <thead>
        <tr>
          <th class="ltc-col-pos">Poz</th>
          <th class="ltc-col-team">Drużyna</th>
          <th class="ltc-col-m">M</th>
          <th class="ltc-col-pkt">Pkt</th>
          <th class="ltc-col-goals">Bramki</th>
          <th class="ltc-col-diff">+/-</th>
          ${cfg.show_trend ? `<th class="ltc-col-trend">Trend</th>` : ""}
        </tr>
      </thead>
    `;

    const legend = `
      <div class="ltc-legend">
        <div class="ltc-leg-item">
          <div class="ltc-leg-box" style="background:${cfg.colors.top}"></div>
          Liga Mistrzów
        </div>

        <div class="ltc-leg-item">
          <div class="ltc-leg-box" style="background:${cfg.colors.conference}"></div>
          Liga Konferencji
        </div>

        <div class="ltc-leg-item">
          <div class="ltc-leg-box" style="background:${cfg.colors.bottom}"></div>
          Spadek
        </div>
      </div>
    `;

    const tableHTML = `
      ${style}
      <div class="ltc-card">
        <table class="ltc-table">
          ${header}
          <tbody>${rows}</tbody>
        </table>
        ${legend}
      </div>
    `;

    if (cfg.lite_mode) {
      this.innerHTML = tableHTML;
      return;
    }

    const cardName =
      cfg.show_name === false
        ? ""
        : cfg.name || stateObj.attributes.friendly_name || "Tabela ligowa";

    this.innerHTML = `
      ${style}
      <ha-card ${cardName ? `header="${cardName}"` : ""}>
        ${tableHTML}
      </ha-card>
    `;
  }

  // -------------------------------------------------------
  // ROW RENDER
  // -------------------------------------------------------
  _renderRow(row, myPosition, totalTeams) {
    const cfg = this.config;
    const pos = parseInt(row.position, 10);

    const isFav = myPosition && pos === myPosition;
    const isTop = pos >= 1 && pos <= cfg.highlight.top_count;
    const isConf =
      pos > cfg.highlight.top_count &&
      pos <= cfg.highlight.top_count + cfg.highlight.conference_count;

    const isBottom =
      pos > totalTeams - cfg.highlight.bottom_count;

    let cls = "";
    if (isFav) cls = "ltc-row-favorite";
    else if (isTop) cls = "ltc-row-top";
    else if (isConf) cls = "ltc-row-conf";
    else if (isBottom) cls = "ltc-row-bottom";

    const diff = row.diff;
    const diffStr =
      diff !== undefined && diff !== null && diff !== ""
        ? (diff > 0 ? `+${diff}` : diff)
        : "-";

    return `
      <tr class="${cls}">
        <td class="ltc-col-pos">${pos}</td>
        <td class="ltc-col-team"><span class="ltc-team-name">${row.team}</span></td>
        <td class="ltc-col-m">${row.matches}</td>
        <td class="ltc-col-pkt">${row.points}</td>
        <td class="ltc-col-goals">${row.goals}</td>
        <td class="ltc-col-diff">${diffStr}</td>
        ${
          this.config.show_trend
            ? `<td class="ltc-col-trend">${this._trend(row.trend)}</td>`
            : ""
        }
      </tr>
    `;
  }

  _trend(t) {
    if (!t) return "";
    t = String(t).trim().toLowerCase();
    if (["up", "+", "↑"].includes(t)) return `<span class="ltc-trend-up">▲</span>`;
    if (["down", "-", "↓"].includes(t)) return `<span class="ltc-trend-down">▼</span>`;
    return `<span class="ltc-trend-same">━</span>`;
  }

  static getConfigElement() {
    return document.createElement("league-table-card-editor");
  }

  static getStubConfig() {
    return { entity: "sensor.90minut_gornik_zabrze_table" };
  }

  getCardSize() {
    return 5;
  }
}

customElements.define("league-table-card", LeagueTableCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "league-table-card",
  name: "League Table Card (90minut)",
  description: "Tabela ligowa 90minut.pl – kolorowe strefy, legenda, tryb LITE",
});
// ===== FILE INCLUDED: dist/matches-card-editor.js =====
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
// ===== FILE INCLUDED: dist/matches-card.js =====
// ============================================================================
//  Matches Card (90minut) – v0.3.000 + FIXED LAYOUT (W/P/R, wyniki, odstępy)
// ============================================================================

class MatchesCard extends HTMLElement {

  setConfig(config) {
    if (!config.entity) {
      throw new Error("Entity is required");
    }

    this.config = {
      name: "90minut Matches",
      show_name: true,
      show_logos: true,
      full_team_names: true,
      show_result_symbols: true,

      fill_mode: config.fill_mode || "gradient",

      font_size: {
        date: config.font_size?.date ?? 0.9,
        status: config.font_size?.status ?? 0.8,
        teams: config.font_size?.teams ?? 1.0,
        score: config.font_size?.score ?? 1.0,
      },

      icon_size: {
        league: config.icon_size?.league ?? 26,
        crest: config.icon_size?.crest ?? 24,
        result: config.icon_size?.result ?? 26,
      },

      colors: {
        win: config.colors?.win ?? "#3ba55d",
        draw: config.colors?.draw ?? "#468cd2",
        loss: config.colors?.loss ?? "#e23b3b"
      },

      gradient: {
        start: config.gradient?.start ?? 35,
        end:   config.gradient?.end   ?? 100,
        alpha_start: config.gradient?.alpha_start ?? 0.0,
        alpha_end:   config.gradient?.alpha_end   ?? 0.55
      },

      zebra_color: config.zebra_color ?? "#f0f0f0",
      zebra_alpha: config.zebra_alpha ?? 0.4,

      lite_mode: config.lite_mode ?? false,

      ...config
    };
  }

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
          padding-right:12px; /* większy odstęp od herbów */
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
          line-height:1.3em;  /* aby wynik był w tej samej linii co drużyny */
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

  _row(m) {
    const [homeScore, awayScore] = (m.score || "-").split("-");

    const homeBold = m.result === "win" ? "bold" : m.result === "loss" ? "dim" : "";
    const awayBold = m.result === "loss" ? "bold" : m.result === "win" ? "dim" : "";

    return `
      <tr style="${this._gradient(m)}">

        <!-- DATA -->
        <td style="width:10%; text-align:center;">
          <div style="font-size:${this.config.font_size.date}rem">${m.date}</div>
          <div style="font-size:${this.config.font_size.status}rem">${m.status}</div>
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

        <!-- WYNIK – osobna pionowa sekcja wyrównana do drużyn -->
        <td class="score-cell" style="width:10%;">
          <div class="${homeBold}" style="font-size:${this.config.font_size.score}rem">${homeScore}</div>
          <div class="${awayBold}" style="font-size:${this.config.font_size.score}rem">${awayScore}</div>
        </td>

        <!-- W/P/R – OSOBNA KOLUMNA -->
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

  _league(code) {
    const file =
      code === "L"  ? "ekstraklasa.png" :
      code === "PP" ? "puchar.png" :
      null;

    if (!file) return `<div>${code}</div>`;

    return `<img src="https://raw.githubusercontent.com/GieOeRZet/matches-card/main/logo/${file}"
                height="${this.config.icon_size.league}" />`;
  }

  _rgba(hex, alpha) {
    const h = hex.replace("#", "");
    const r = parseInt(h.substr(0,2),16);
    const g = parseInt(h.substr(2,2),16);
    const b = parseInt(h.substr(4,2),16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  static getConfigElement() { return document.createElement("matches-card-editor"); }
  static getStubConfig() { return { entity: "" }; }
}

customElements.define("matches-card", MatchesCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "matches-card",
  name: "Matches Card (90minut)",
  description: "Karta pokazująca mecze z sensora 90minut.pl"
});
