// Matches Cards Pack – version 0.3.108
// Auto-generated from dist/

// ===== FILE INCLUDED: dist/league-table-card-editor.js =====
// ============================================================================
//  League Table Card – FULL EDITOR v0.1.100
// ============================================================================

class LeagueTableCardEditor extends HTMLElement {
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

  // -----------------------------------------------------
  // UPDATE + DEBOUNCE
  // -----------------------------------------------------
  _update(path, value) {
    const cfg = JSON.parse(JSON.stringify(this._config));

    // Ustawiamy w configu głębokie pola
    const parts = path.split(".");
    let obj = cfg;
    while (parts.length > 1) {
      const p = parts.shift();
      if (!obj[p]) obj[p] = {};
      obj = obj[p];
    }
    obj[parts[0]] = value;

    this._config = cfg;

    clearTimeout(this._debounce);
    this._debounce = setTimeout(() => this._apply(), 700);
  }

  _apply() {
    const ev = new CustomEvent("config-changed", {
      detail: { config: this._config },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(ev);
  }

  // -----------------------------------------------------
  // RENDER
  // -----------------------------------------------------
  render() {
    if (!this.shadowRoot) return;
    const c = this._config;
    const hl = c.highlight || {};

    this.shadowRoot.innerHTML = `
      <style>
        .group {
          margin: 12px 0;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.15);
          overflow: hidden;
        }

        summary {
          padding: 10px 12px;
          cursor: pointer;
          font-size: 1rem;
          background: rgba(255,255,255,0.05);
        }

        .content {
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
        select,
        input[type="text"] {
          padding: 4px 6px;
          border-radius: 6px;
          border: 1px solid rgba(255,255,255,0.20);
          background: rgba(0,0,0,0.2);
          color: inherit;
        }

        input[type="color"] {
          padding: 0;
          width: 40px;
          height: 28px;
          border: none;
          background: transparent;
          cursor: pointer;
        }

        .switch {
          display: flex;
          align-items: center;
          gap: 10px;
        }
      </style>

      <!-- PODSTAWOWE -->
      <details class="group" open>
        <summary>Podstawowe</summary>
        <div class="content">
          <label>
            Nazwa karty
            <input type="text"
              value="${c.name ?? ""}"
              @input="${e => this._update("name", e.target.value)}">
          </label>

          <label class="switch">
            <ha-switch
              ?checked="${c.show_name !== false}"
              @change="${e => this._update("show_name", e.target.checked)}">
            </ha-switch>
            Pokaż nagłówek
          </label>

          <label class="switch">
            <ha-switch
              ?checked="${c.show_trend !== false}"
              @change="${e => this._update("show_trend", e.target.checked)}">
            </ha-switch>
            Pokaż kolumnę trendu
          </label>

          <label class="switch">
            <ha-switch
              ?checked="${c.lite_mode === true}"
              @change="${e => this._update("lite_mode", e.target.checked)}">
            </ha-switch>
            Tryb LITE
          </label>
        </div>
      </details>

      <!-- ROZMIARY CZCIONEK -->
      <details class="group">
        <summary>Rozmiary czcionek</summary>
        <div class="content">
          <label>
            Nagłówek
            <input type="number" step="0.1"
              value="${c.font_size?.header ?? 0.8}"
              @input="${e => this._update("font_size.header", Number(e.target.value))}">
          </label>

          <label>
            Wiersz
            <input type="number" step="0.1"
              value="${c.font_size?.row ?? 0.9}"
              @input="${e => this._update("font_size.row", Number(e.target.value))}">
          </label>

          <label>
            Drużyna
            <input type="number" step="0.1"
              value="${c.font_size?.team ?? 1.0}"
              @input="${e => this._update("font_size.team", Number(e.target.value))}">
          </label>
        </div>
      </details>

      <!-- POZYCJE KLUCZOWE -->
      <details class="group">
        <summary>Konfiguracja pozycji</summary>
        <div class="content">

          <label>
            Top (LM) – ile miejsc
            <input type="number" min="0"
              value="${hl.top_count ?? 2}"
              @input="${e => this._update("highlight.top_count", Number(e.target.value))}">
          </label>

          <label>
            Europa (LK/LE) – ile miejsc
            <input type="number" min="0"
              value="${hl.eu_count ?? 2}"
              @input="${e => this._update("highlight.eu_count", Number(e.target.value))}">
          </label>

          <label>
            Spadek – ile miejsc
            <input type="number" min="0"
              value="${hl.bottom_count ?? 3}"
              @input="${e => this._update("highlight.bottom_count", Number(e.target.value))}">
          </label>

        </div>
      </details>

      <!-- KOLORY PODŚWIETLEŃ -->
      <details class="group">
        <summary>Kolory podświetleń (z ALFĄ)</summary>
        <div class="content">

          <!-- MOJA DRUŻYNA -->
          <label>
            Moja drużyna – kolor
            <input type="color"
              value="${hl.favorite_color ?? "#ffffff"}"
              @input="${e => this._update("highlight.favorite_color", e.target.value)}">
          </label>

          <label>
            Alfa
            <input type="number" min="0" max="1" step="0.05"
              value="${hl.favorite_alpha ?? 0.55}"
              @input="${e => this._update("highlight.favorite_alpha", Number(e.target.value))}">
          </label>

          <!-- TOP miejsca -->
          <label>
            Top – kolor
            <input type="color"
              value="${hl.top_color ?? "#3ba55d"}"
              @input="${e => this._update("highlight.top_color", e.target.value)}">
          </label>

          <label>
            Alfa
            <input type="number" min="0" max="1" step="0.05"
              value="${hl.top_alpha ?? 0.55}"
              @input="${e => this._update("highlight.top_alpha", Number(e.target.value))}">
          </label>

          <!-- EUROPEJSKIE -->
          <label>
            Europa – kolor
            <input type="color"
              value="${hl.eu_color ?? "#468cd2"}"
              @input="${e => this._update("highlight.eu_color", e.target.value)}">
          </label>

          <label>
            Alfa
            <input type="number" min="0" max="1" step="0.05"
              value="${hl.eu_alpha ?? 0.55}"
              @input="${e => this._update("highlight.eu_alpha", Number(e.target.value))}">
          </label>

          <!-- SPADKOWE -->
          <label>
            Spadek – kolor
            <input type="color"
              value="${hl.bottom_color ?? "#e23b3b"}"
              @input="${e => this._update("highlight.bottom_color", e.target.value)}">
          </label>

          <label>
            Alfa
            <input type="number" min="0" max="1" step="0.05"
              value="${hl.bottom_alpha ?? 0.55}"
              @input="${e => this._update("highlight.bottom_alpha", Number(e.target.value))}">
          </label>

        </div>
      </details>
    `;
  }
}

customElements.define("league-table-card-editor", LeagueTableCardEditor);
// ===== FILE INCLUDED: dist/league-table-card.js =====
// ============================================================================
//  League Table Card (90minut) – v0.1.100
//  Author: GieOeRZet
//  Dane z sensora: attributes.table[], my_position, my_points, my_goal_diff
//  - Spójny layout z Matches Card
//  - Podświetlenie: TOP / Liga Konferencji / dół / moja drużyna
//  - Ostatnia kolumna: TREND (opcjonalne pole "trend" w każdym wierszu)
//  - Tryb LITE: bez <ha-card>, samo <table>
//  - Kolory + ALFA konfigurowalne, domyślna alfa = 0.55 (jak w karcie meczów)
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

        // ILE MIEJSC:
        top_count: 2,    // Top2 = "Liga Mistrzów"
        eu_count: 2,     // 3–4 = "Liga Konferencji"
        bottom_count: 3, // 3 ostatnie = "Spadek"

        // KOLORY (bez powiązania z kartą meczową, ale stylistycznie podobne)
        favorite_color: "#ffffff", // biały, będzie z alfą
        top_color: "#3ba55d",      // zielony (jak win)
        eu_color: "#468cd2",       // niebieski (jak draw)
        bottom_color: "#e23b3b",   // czerwony (jak loss)

        // ALFY – ustawione tak jak końcowa alfa w gradientach meczowych
        favorite_alpha: 0.55,
        top_alpha: 0.55,
        eu_alpha: 0.55,
        bottom_alpha: 0.55,
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

  // -------------------------------------------------
  // RENDER
  // -------------------------------------------------
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
    const hl = cfg.highlight;

    // Wyliczamy REALNE kolory z alfą
    const favBg = this._withAlpha(hl.favorite_color, hl.favorite_alpha);
    const topBg = this._withAlpha(hl.top_color, hl.top_alpha);
    const euBg = this._withAlpha(hl.eu_color, hl.eu_alpha);
    const bottomBg = this._withAlpha(hl.bottom_color, hl.bottom_alpha);

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
        .ltc-col-team  {
          text-align: left;
          font-size: ${cfg.font_size.team}rem;
        }
        .ltc-col-m     { width: 8%;  }
        .ltc-col-pkt   { width: 10%; font-weight: 600; }
        .ltc-col-goals { width: 14%; }
        .ltc-col-diff  { width: 10%; }
        .ltc-col-trend { width: 10%; }

        .ltc-row-favorite {
          background-color: ${favBg};
        }
        .ltc-row-top {
          background-color: ${topBg};
        }
        .ltc-row-eu {
          background-color: ${euBg};
        }
        .ltc-row-bottom {
          background-color: ${bottomBg};
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

        .ltc-legend {
          margin-top: 6px;
          font-size: 0.75rem;
          opacity: 0.85;
          display: flex;
          flex-wrap: wrap;
          gap: 8px 16px;
          align-items: center;
        }
        .ltc-legend-item {
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .ltc-legend-box {
          width: 10px;
          height: 10px;
          border-radius: 2px;
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
      <div class="ltc-card">
        <table class="ltc-table">
          ${headerHTML}
          <tbody>
            ${rowsHTML}
          </tbody>
        </table>
        ${this._renderLegend(topBg, euBg, bottomBg)}
      </div>
    `;

    if (this.config.lite_mode) {
      this.innerHTML = `
        ${style}
        ${tableHTML}
      `;
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

  // -------------------------------------------------
  // POJEDYNCZY WIERSZ
  // -------------------------------------------------
  _renderRow(row, myPosition, totalTeams) {
    const cfg = this.config;
    const hl = cfg.highlight;

    const pos = row.position ? parseInt(row.position, 10) : null;

    const isFavorite =
      hl.favorite && myPosition != null && pos === myPosition;

    const isTop =
      hl.top_count > 0 &&
      pos != null &&
      pos >= 1 &&
      pos <= hl.top_count;

    const isEU =
      hl.eu_count > 0 &&
      pos != null &&
      pos > hl.top_count &&
      pos <= hl.top_count + hl.eu_count;

    const isBottom =
      hl.bottom_count > 0 &&
      pos != null &&
      totalTeams > 0 &&
      pos > totalTeams - hl.bottom_count;

    let rowClass = "";
    if (isFavorite) {
      rowClass = "ltc-row-favorite";
    } else if (isTop) {
      rowClass = "ltc-row-top";
    } else if (isEU) {
      rowClass = "ltc-row-eu";
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

  // -------------------------------------------------
  // LEGENDA (Top2 / 3–4 / spadek)
  // -------------------------------------------------
  _renderLegend(topBg, euBg, bottomBg) {
    return `
      <div class="ltc-legend">
        <div class="ltc-legend-item">
          <span class="ltc-legend-box" style="background:${topBg};"></span>
          <span>Top 2 – Liga Mistrzów</span>
        </div>
        <div class="ltc-legend-item">
          <span class="ltc-legend-box" style="background:${euBg};"></span>
          <span>3–4 – Liga Konferencji</span>
        </div>
        <div class="ltc-legend-item">
          <span class="ltc-legend-box" style="background:${bottomBg};"></span>
          <span>3 ostatnie – Spadek</span>
        </div>
      </div>
    `;
  }

  // -------------------------------------------------
  // HELPERY
  // -------------------------------------------------
  _withAlpha(hex, alpha) {
    const a =
      typeof alpha === "number" && alpha >= 0 && alpha <= 1 ? alpha : 0.55;
    const h = (hex || "").replace("#", "");
    if (h.length !== 6) return `rgba(0,0,0,${a})`;

    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);

    if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
      return `rgba(0,0,0,${a})`;
    }

    return `rgba(${r},${g},${b},${a})`;
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
// ===== FILE INCLUDED: dist/matches-card.js =====
// ============================================================================
//  Matches Card (90minut) – v0.3.000 + FIXED STATUS (no undefined)
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
          gap:3px;
        }

        .league-cell {
          padding-right:12px;
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

  _row(m) {
    const [homeScore, awayScore] = (m.score || "-").split("-");

    const homeBold = m.result === "win" ? "bold" : m.result === "loss" ? "dim" : "";
    const awayBold = m.result === "loss" ? "bold" : m.result === "win" ? "dim" : "";

    return `
      <tr style="${this._gradient(m)}">

        <!-- DATA -->
        <td style="width:10%; text-align:center;">
          <div style="font-size:${this.config.font_size.date}rem">${m.date}</div>
          <div style="font-size:${this.config.font_size.status}rem">${m.status ?? ""}</div>
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

        <!-- SYMBOL W/P/R -->
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
