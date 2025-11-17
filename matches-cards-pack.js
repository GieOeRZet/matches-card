// Matches Cards Pack – version 0.3.106
// Auto-generated from dist/

// ===== FILE INCLUDED: dist/league-table-card-editor.js =====
// ============================================================================
//  League Table Card – VISUAL EDITOR
//  Works with: LeagueTableCard (90minut)
//  Debounce: 700ms
// ============================================================================

class LeagueTableCardEditor extends HTMLElement {

  constructor() {
    super();
    this._config = {};
    this._debounceTimer = null;
    this.attachShadow({ mode: "open" });
  }

  setConfig(config) {
    this._config = JSON.parse(JSON.stringify(config));
    this.render();
  }

  set hass(hass) {
    this._hass = hass;
  }

  // Debounce write
  _debounceSave() {
    clearTimeout(this._debounceTimer);
    this._debounceTimer = setTimeout(() => {
      this._onChange();
    }, 700);
  }

  _onChange() {
    const event = new CustomEvent("config-changed", {
      detail: { config: this._config },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  _update(path, value) {
    const parts = path.split(".");
    let obj = this._config;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!obj[parts[i]]) obj[parts[i]] = {};
      obj = obj[parts[i]];
    }
    obj[parts[parts.length - 1]] = value;
    this._debounceSave();
  }

  render() {
    if (!this.shadowRoot) return;

    const cfg = this._config;

    this.shadowRoot.innerHTML = `
      <style>
        .section {
          border: 1px solid rgba(150,150,150,0.25);
          border-radius: 8px;
          margin: 12px 0;
          overflow: hidden;
        }
        .section-header {
          background: rgba(200,200,200,0.15);
          padding: 10px;
          font-weight: 600;
          cursor: pointer;
        }
        .section-body {
          padding: 12px;
        }
        .row {
          display: flex;
          align-items: center;
          margin: 8px 0;
        }
        .row label {
          flex: 1;
        }
        input[type="number"], input[type="text"], ha-textfield, ha-selector-color {
          flex: 1;
        }
      </style>

      <div class="section">
        <div class="section-header" id="sec-basic">⚽ Podstawowe</div>
        <div class="section-body" style="display:block">
          <div class="row">
            <label>Nazwa wyświetlana</label>
            <input type="text" value="${cfg.name ?? ""}"
              @input="${(e)=>this._update('name', e.target.value)}">
          </div>

          <div class="row">
            <label>Pokaż nazwę karty</label>
            <ha-switch
              ?checked="${cfg.show_name !== false}"
              @change="${(e)=>this._update('show_name', e.target.checked)}">
            </ha-switch>
          </div>

          <div class="row">
            <label>Tryb LITE</label>
            <ha-switch
              ?checked="${cfg.lite_mode === true}"
              @change="${(e)=>this._update('lite_mode', e.target.checked)}">
            </ha-switch>
          </div>

          <div class="row">
            <label>Pokaż trend</label>
            <ha-switch
              ?checked="${cfg.show_trend !== false}"
              @change="${(e)=>this._update('show_trend', e.target.checked)}">
            </ha-switch>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-header" id="sec-fonts">🔤 Czcionki</div>
        <div class="section-body" style="display:none">
          <div class="row">
            <label>Nagłówek (rem)</label>
            <input type="number" step="0.1" min="0.5"
              value="${cfg.font_size?.header ?? 0.8}"
              @input="${(e)=>this._update('font_size.header', Number(e.target.value))}">
          </div>
          <div class="row">
            <label>Wiersz (rem)</label>
            <input type="number" step="0.1" min="0.5"
              value="${cfg.font_size?.row ?? 0.9}"
              @input="${(e)=>this._update('font_size.row', Number(e.target.value))}">
          </div>
          <div class="row">
            <label>Drużyna (rem)</label>
            <input type="number" step="0.1" min="0.5"
              value="${cfg.font_size?.team ?? 1.0}"
              @input="${(e)=>this._update('font_size.team', Number(e.target.value))}">
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-header" id="sec-highlight">🎨 Wyróżnienia</div>
        <div class="section-body" style="display:none">

          <div class="row">
            <label>Top ile?</label>
            <input type="number" min="0" max="10"
              value="${cfg.highlight?.top_count ?? 3}"
              @input="${(e)=>this._update('highlight.top_count', Number(e.target.value))}">
          </div>

          <div class="row">
            <label>Spadkowe ile?</label>
            <input type="number" min="0" max="10"
              value="${cfg.highlight?.bottom_count ?? 3}"
              @input="${(e)=>this._update('highlight.bottom_count', Number(e.target.value))}">
          </div>

          <div class="row">
            <label>Kolor ulubionej</label>
            <ha-color-picker
              value="${cfg.highlight?.favorite_color ?? '#fff8e1'}"
              @color-changed="${(e)=>this._update('highlight.favorite_color', e.detail.value)}">
            </ha-color-picker>
          </div>

          <div class="row">
            <label>Kolor TOP</label>
            <ha-color-picker
              value="${cfg.highlight?.top_color ?? '#e8f5e9'}"
              @color-changed="${(e)=>this._update('highlight.top_color', e.detail.value)}">
            </ha-color-picker>
          </div>

          <div class="row">
            <label>Kolor DOŁU</label>
            <ha-color-picker
              value="${cfg.highlight?.bottom_color ?? '#ffebee'}"
              @color-changed="${(e)=>this._update('highlight.bottom_color', e.detail.value)}">
            </ha-color-picker>
          </div>
        </div>
      </div>
    `;

    // Sekcje rozwijane
    const toggle = (id) => {
      const body = this.shadowRoot.querySelector(`#${id}`).nextElementSibling;
      body.style.display = body.style.display === "none" ? "block" : "none";
    };

    this.shadowRoot.querySelector("#sec-basic")
      .addEventListener("click", () => toggle("sec-basic"));
    this.shadowRoot.querySelector("#sec-fonts")
      .addEventListener("click", () => toggle("sec-fonts"));
    this.shadowRoot.querySelector("#sec-highlight")
      .addEventListener("click", () => toggle("sec-highlight"));
  }
}

// Rejestracja edytora
customElements.define("league-table-card-editor", LeagueTableCardEditor);
// ===== FILE INCLUDED: dist/league-table-card.js =====
// ============================================================================
//  League Table Card (90minut) – v0.1.000
//  Author: GieOeRZet
//  Dane z sensora: attributes.table[], my_position, my_points, my_goal_diff
//  - Spójny layout z Matches Card
//  - Podświetlenie: TOP / dół / moja drużyna
//  - Ostatnia kolumna: TREND (opcjonalne pole "trend" w każdym wierszu)
//  - Tryb LITE: bez <ha-card>, samo <table>
// ============================================================================

class LeagueTableCard extends HTMLElement {
  setConfig(config) {
    if (!config.entity) {
      throw new Error(
        "Entity is required (np. sensor.90minut_gornik_zabrze_table)"
      );
    }

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

      highlight: {
        favorite: true,
        top_count: 3,
        bottom_count: 3,
        favorite_color: "#fff8e1", // delikatny żółty
        top_color: "#e8f5e9",      // delikatny zielony
        bottom_color: "#ffebee",   // delikatny czerwony
      },
    };

    this.config = {
      ...defaults,
      ...config,
      font_size: { ...defaults.font_size, ...(config.font_size || {}) },
      highlight: { ...defaults.highlight, ...(config.highlight || {}) },
    };

    this.entityId = config.entity;
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  _render() {
    if (!this._hass || !this.entityId) return;

    const stateObj = this._hass.states[this.entityId];
    if (!stateObj) {
      this.innerHTML = "<ha-card>Błąd: encja nie istnieje.</ha-card>";
      return;
    }

    const table = stateObj.attributes.table || [];
    const totalTeams = table.length || 0;
    const myPosAttr = stateObj.attributes.my_position;
    const myPosition = myPosAttr != null ? parseInt(myPosAttr, 10) : null;

    const cfg = this.config;

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
          border-bottom: 1px solid rgba(0,0,0,0.08);
          font-size: ${cfg.font_size.row}rem;
          text-align: center;
          vertical-align: middle;
          white-space: nowrap;
        }
        .ltc-table th {
          font-weight: 600;
          font-size: ${cfg.font_size.header}rem;
          opacity: 0.8;
        }
        .ltc-col-pos   { width: 10%; text-align: right; }
        .ltc-col-team  { text-align: left; font-size: ${cfg.font_size.team}rem; }
        .ltc-col-m     { width: 8%;  }
        .ltc-col-pkt   { width: 10%; font-weight: 600; }
        .ltc-col-goals { width: 14%; }
        .ltc-col-diff  { width: 10%; }
        .ltc-col-trend { width: 10%; }

        .ltc-row-favorite {
          background-color: ${cfg.highlight.favorite_color};
        }
        .ltc-row-top {
          background-color: ${cfg.highlight.top_color};
        }
        .ltc-row-bottom {
          background-color: ${cfg.highlight.bottom_color};
        }

        .ltc-team-name {
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .ltc-trend-up {
          color: var(--success-color, #2e7d32);
        }
        .ltc-trend-down {
          color: var(--error-color, #c62828);
        }
        .ltc-trend-same {
          color: var(--secondary-text-color, #808080);
        }
      </style>
    `;

    const rowsHTML = table
      .map((row) => this._renderRow(row, myPosition, totalTeams))
      .join("");

    const headerHTML = `
      <thead>
        <tr>
          <th class="ltc-col-pos">Poz</th>
          <th class="ltc-col-team">Drużyna</th>
          <th class="ltc-col-m">M</th>
          <th class="ltc-col-pkt">Pkt</th>
          <th class="ltc-col-goals">Bramki</th>
          <th class="ltc-col-diff">+/-</th>
          ${
            this.config.show_trend
              ? `<th class="ltc-col-trend">Trend</th>`
              : ""
          }
        </tr>
      </thead>
    `;

    const tableHTML = `
      ${style}
      <div class="ltc-card">
        <table class="ltc-table">
          ${headerHTML}
          <tbody>
            ${rowsHTML}
          </tbody>
        </table>
      </div>
    `;

    if (this.config.lite_mode) {
      this.innerHTML = tableHTML;
      return;
    }

    const cardName =
      this.config.show_name === false
        ? ""
        : this.config.name ||
          stateObj.attributes.friendly_name ||
          "Tabela ligowa";

    this.innerHTML = `
      ${style}
      <ha-card ${cardName ? `header="${cardName}"` : ""}>
        ${tableHTML}
      </ha-card>
    `;
  }

  _renderRow(row, myPosition, totalTeams) {
    const cfg = this.config;
    const pos = row.position ? parseInt(row.position, 10) : null;

    const isFavorite =
      cfg.highlight.favorite && myPosition != null && pos === myPosition;
    const isTop =
      cfg.highlight.top_count > 0 &&
      pos != null &&
      pos >= 1 &&
      pos <= cfg.highlight.top_count;
    const isBottom =
      cfg.highlight.bottom_count > 0 &&
      pos != null &&
      totalTeams > 0 &&
      pos > totalTeams - cfg.highlight.bottom_count;

    let rowClass = "";
    if (isFavorite) {
      rowClass = "ltc-row-favorite";
    } else if (isTop) {
      rowClass = "ltc-row-top";
    } else if (isBottom) {
      rowClass = "ltc-row-bottom";
    }

    const matches = row.matches ?? "-";
    const points = row.points ?? "-";
    const goals = row.goals ?? "-";

    let diff = row.diff;
    let diffStr = "-";
    if (diff !== undefined && diff !== null && diff !== "") {
      const n = typeof diff === "number" ? diff : parseInt(diff, 10);
      if (!isNaN(n)) {
        diffStr = (n > 0 ? "+" : "") + n;
      } else {
        diffStr = String(diff);
      }
    }

    const teamName = row.team || "";

    let trendHTML = "";
    if (cfg.show_trend) {
      trendHTML = this._renderTrend(row.trend);
    }

    return `
      <tr class="${rowClass}">
        <td class="ltc-col-pos">${pos != null && !isNaN(pos) ? pos : ""}</td>
        <td class="ltc-col-team">
          <span class="ltc-team-name">${teamName}</span>
        </td>
        <td class="ltc-col-m">${matches}</td>
        <td class="ltc-col-pkt">${points}</td>
        <td class="ltc-col-goals">${goals}</td>
        <td class="ltc-col-diff">${diffStr}</td>
        ${
          cfg.show_trend
            ? `<td class="ltc-col-trend">${trendHTML}</td>`
            : ""
        }
      </tr>
    `;
  }

  _renderTrend(trend) {
    if (!trend) return "";

    const t = String(trend).toLowerCase().trim();

    if (t === "up" || t === "+" || t === "↑" || t === "▲") {
      return `<span class="ltc-trend-up">▲</span>`;
    }
    if (t === "down" || t === "-" || t === "↓" || t === "▼") {
      return `<span class="ltc-trend-down">▼</span>`;
    }
    if (t === "same" || t === "0" || t === "=" || t === "→") {
      return `<span class="ltc-trend-same">━</span>`;
    }

    return `<span>${trend}</span>`;
  }

  static getConfigElement() {
    return document.createElement("league-table-card-editor");
  }

  static getStubConfig() {
    return {
      entity: "sensor.90minut_gornik_zabrze_table",
    };
  }

  getCardSize() {
    return 5;
  }
}

if (!customElements.get("league-table-card")) {
  customElements.define("league-table-card", LeagueTableCard);
}

window.customCards = window.customCards || [];
window.customCards.push({
  type: "league-table-card",
  name: "League Table Card (90minut)",
  description: "Tabela ligowa na podstawie sensora 90minut.pl",
});

// ===== FILE INCLUDED: dist/matches-card-editor.js =====
// ============================================================================
//  Matches Card Editor – accordion, numeric inputs, debounce, stable UI
// ============================================================================

class MatchesCardEditor extends HTMLElement {

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

  // --------------------------------------
  //  Helper: update config with debounce
  // --------------------------------------
  _update(key, value) {
    this._config = {
      ...this._config,
      [key]: value
    };

    clearTimeout(this._debounce);
    this._debounce = setTimeout(() => this._apply(), 700);
  }

  _apply() {
    const event = new CustomEvent("config-changed", {
      detail: { config: this._config },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(event);
  }

  // --------------------------------------
  //  Rendering
  // --------------------------------------
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

        label {
          display: flex;
          flex-direction: column;
          font-size: 0.85rem;
          opacity: 0.85;
        }

        input[type="number"] {
          padding: 4px 6px;
          border-radius: 6px;
          border: 1px solid rgba(255,255,255,0.20);
          background: rgba(0,0,0,0.2);
          color: inherit;
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
        }
      </style>

      <!-- NAME + BASIC OPTIONS -->
      <details class="group" open>
        <summary>Podstawowe</summary>
        <div>
          <label>
            Nazwa karty
            <input type="text"
                   value="${c.name ?? ''}"
                   @input="${e => this._update('name', e.target.value)}">
          </label>

          <label class="switch">
            <ha-switch
              ?checked="${c.show_logos !== false}"
              @change="${e => this._update('show_logos', e.target.checked)}">
            </ha-switch>
            Pokaż herby
          </label>

          <label class="switch">
            <ha-switch
              ?checked="${c.full_team_names !== false}"
              @change="${e => this._update('full_team_names', e.target.checked)}">
            </ha-switch>
            Pełne nazwy
          </label>

          <label class="switch">
            <ha-switch
              ?checked="${c.show_result_symbols !== false}"
              @change="${e => this._update('show_result_symbols', e.target.checked)}">
            </ha-switch>
            Pokaż W/D/L
          </label>

          <label class="switch">
            <ha-switch
              ?checked="${c.lite_mode === true}"
              @change="${e => this._update('lite_mode', e.target.checked)}">
            </ha-switch>
            Tryb LITE
          </label>
        </div>
      </details>

      <!-- FILL MODE -->
      <details class="group">
        <summary>Styl wypełnienia</summary>
        <div>
          <label>
            Tryb
            <select @change="${e => this._update('fill_mode', e.target.value)}">
              <option value="gradient" ${c.fill_mode === "gradient" ? "selected" : ""}>Gradient</option>
              <option value="zebra" ${c.fill_mode === "zebra" ? "selected" : ""}>Zebra</option>
              <option value="clear" ${c.fill_mode === "clear" ? "selected" : ""}>Brak</option>
            </select>
          </label>

          ${c.fill_mode === "gradient" ? `
            <label>
              Start (%)
              <input type="number" min="0" max="100" value="${c.gradient?.start ?? 35}"
                     @input="${e => this._update('gradient', {...c.gradient, start: Number(e.target.value)})}">
            </label>

            <label>
              Koniec (%)
              <input type="number" min="0" max="100" value="${c.gradient?.end ?? 100}"
                     @input="${e => this._update('gradient', {...c.gradient, end: Number(e.target.value)})}">
            </label>

            <label>
              Alfa start
              <input type="number" min="0" max="1" step="0.05"
                     value="${c.gradient?.alpha_start ?? 0}"
                     @input="${e => this._update('gradient', {...c.gradient, alpha_start: Number(e.target.value)})}">
            </label>

            <label>
              Alfa koniec
              <input type="number" min="0" max="1" step="0.05"
                     value="${c.gradient?.alpha_end ?? 0.55}"
                     @input="${e => this._update('gradient', {...c.gradient, alpha_end: Number(e.target.value)})}">
            </label>
          ` : ""}

          ${c.fill_mode === "zebra" ? `
            <label>
              Kolor zebry
              <input type="color"
                     value="${c.zebra_color ?? "#f0f0f0"}"
                     @input="${e => this._update('zebra_color', e.target.value)}">
            </label>

            <label>
              Alfa zebry
              <input type="number" min="0" max="1" step="0.05"
                     value="${c.zebra_alpha ?? 0.4}"
                     @input="${e => this._update('zebra_alpha', Number(e.target.value))}">
            </label>
          ` : ""}
        </div>
      </details>

      <!-- FONTS -->
      <details class="group">
        <summary>Rozmiary czcionek</summary>
        <div>
          <label>
            Data
            <input type="number" step="0.1" value="${c.font_size?.date ?? 0.9}"
                   @input="${e => this._update('font_size', {...c.font_size, date: Number(e.target.value)})}">
          </label>

          <label>
            Status
            <input type="number" step="0.1" value="${c.font_size?.status ?? 0.8}"
                   @input="${e => this._update('font_size', {...c.font_size, status: Number(e.target.value)})}">
          </label>

          <label>
            Drużyny
            <input type="number" step="0.1" value="${c.font_size?.teams ?? 1.0}"
                   @input="${e => this._update('font_size', {...c.font_size, teams: Number(e.target.value)})}">
          </label>

          <label>
            Wynik
            <input type="number" step="0.1" value="${c.font_size?.score ?? 1.0}"
                   @input="${e => this._update('font_size', {...c.font_size, score: Number(e.target.value)})}">
          </label>
        </div>
      </details>

      <!-- ICON SIZES -->
      <details class="group">
        <summary>Rozmiary ikon</summary>
        <div>
          <label>
            Liga
            <input type="number" min="10" max="60"
                   value="${c.icon_size?.league ?? 26}"
                   @input="${e => this._update('icon_size', {...c.icon_size, league: Number(e.target.value)})}">
          </label>

          <label>
            Herby
            <input type="number" min="10" max="60"
                   value="${c.icon_size?.crest ?? 24}"
                   @input="${e => this._update('icon_size', {...c.icon_size, crest: Number(e.target.value)})}">
          </label>

          <label>
            W/D/L
            <input type="number" min="10" max="60"
                   value="${c.icon_size?.result ?? 26}"
                   @input="${e => this._update('icon_size', {...c.icon_size, result: Number(e.target.value)})}">
          </label>
        </div>
      </details>

      <!-- COLORS -->
      <details class="group">
        <summary>Kolory W / D / L</summary>
        <div>
          <label>
            Wygrana (W)
            <input type="color"
                   value="${c.colors?.win ?? "#3ba55d"}"
                   @input="${e => this._update('colors', {...c.colors, win: e.target.value})}">
          </label>

          <label>
            Remis (D)
            <input type="color"
                   value="${c.colors?.draw ?? "#468cd2"}"
                   @input="${e => this._update('colors', {...c.colors, draw: e.target.value})}">
          </label>

          <label>
            Porażka (L)
            <input type="color"
                   value="${c.colors?.loss ?? "#e23b3b"}"
                   @input="${e => this._update('colors', {...c.colors, loss: e.target.value})}">
          </label>
        </div>
      </details>
    `;
  }

  static get styles() {
    return window.HAUIUtils?.styles ?? "";
  }
}

customElements.define("matches-card-editor", MatchesCardEditor);
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
