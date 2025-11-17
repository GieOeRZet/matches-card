// Matches Cards Pack – version 1.0.00
// Auto-generated from dist/

// ===== FILE INCLUDED: dist/league-table-card-editor.js =====
// ============================================================================
//  League Table Card Editor – Premium Gradient Edition
//  - Pełna zgodność z YAML
//  - Tryby: gradient, premium, zebra, clear
//  - Premium: start_alpha / mid_alpha / end_alpha / pastel_pos
//  - Debounce 700 ms
// ============================================================================

class LeagueTableCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = {};
    this._debounce = null;
  }

  setConfig(config) {
    const defaults = {
      name: "Tabela ligowa",
      show_name: true,
      lite_mode: false,

      fill_mode: "gradient", // gradient | premium | zebra | clear

      gradient: {
        start: 35,
        end: 100,
        alpha_start: 0.0,
        alpha_end: 0.55,
      },

      premium: {
        start_alpha: 0.85,
        mid_alpha: 0.35,
        end_alpha: 0.0,
        pastel_pos: 15,
      },

      zebra_color: "#f0f0f0",
      zebra_alpha: 0.4,

      highlight: {
        top_count: 2,
        conf_count: 2,
        bottom_count: 3,
      },

      colors: {
        top: "#3ba55d",
        conf: "#468cd2",
        bottom: "#e23b3b",
      },

      font_size: {
        header: 0.8,
        row: 0.9,
        team: 1.0,
      },
    };

    this._config = {
      ...defaults,
      ...config,
      gradient: { ...defaults.gradient, ...(config.gradient || {}) },
      premium: { ...defaults.premium, ...(config.premium || {}) },
      highlight: { ...defaults.highlight, ...(config.highlight || {}) },
      colors: { ...defaults.colors, ...(config.colors || {}) },
      font_size: { ...defaults.font_size, ...(config.font_size || {}) },
    };

    this._render();
  }

  _scheduleApply() {
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

  _updateRoot(key, value) {
    this._config[key] = value;
    this._scheduleApply();
  }

  _updateNested(group, key, value) {
    this._config[group][key] = value;
    this._scheduleApply();
  }

  _render() {
    const c = this._config;

    this.shadowRoot.innerHTML = `
      <style>
        .group {
          margin: 12px 0;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.2);
        }
        .group summary {
          padding: 10px 12px;
          font-size: 1rem;
          cursor: pointer;
          background: rgba(255,255,255,0.05);
        }
        .group > div {
          padding: 12px 16px 14px 16px;
          display: grid;
          gap: 12px;
          grid-template-columns: 1fr 1fr;
        }

        label {
          display: flex;
          flex-direction: column;
          font-size: 0.9rem;
        }

        input[type="text"],
        input[type="number"],
        select {
          margin-top: 4px;
          padding: 6px;
          border-radius: 6px;
          border: 1px solid rgba(255,255,255,0.2);
          background: rgba(0,0,0,0.2);
          color: inherit;
        }

        input[type="color"] {
          margin-top: 4px;
          width: 40px;
          height: 28px;
          border: none;
          background: transparent;
        }

        .switch-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }
      </style>

      <!-- PODSTAWOWE -->
      <details class="group" open>
        <summary>Podstawowe</summary>
        <div>
          <label>
            Nazwa karty
            <input type="text" data-root="name" value="${c.name}">
          </label>

          <div class="switch-row">
            <ha-switch data-root="show_name" ${c.show_name ? "checked" : ""}></ha-switch>
            <span>Pokaż nagłówek</span>
          </div>

          <div class="switch-row">
            <ha-switch data-root="lite_mode" ${c.lite_mode ? "checked" : ""}></ha-switch>
            <span>Tryb LITE</span>
          </div>
        </div>
      </details>


      <!-- STYL WIERSZY -->
      <details class="group">
        <summary>Styl wierszy</summary>
        <div>

          <label>
            Tryb
            <select data-root="fill_mode">
              <option value="gradient" ${c.fill_mode === "gradient" ? "selected" : ""}>Gradient</option>
              <option value="premium" ${c.fill_mode === "premium" ? "selected" : ""}>Premium gradient</option>
              <option value="zebra" ${c.fill_mode === "zebra" ? "selected" : ""}>Zebra</option>
              <option value="clear" ${c.fill_mode === "clear" ? "selected" : ""}>Brak</option>
            </select>
          </label>

          ${
            c.fill_mode === "gradient"
              ? `
          <label>Start %
            <input type="number" min="0" max="100" data-group="gradient" data-key="start" value="${c.gradient.start}">
          </label>

          <label>Koniec %
            <input type="number" min="0" max="100" data-group="gradient" data-key="end" value="${c.gradient.end}">
          </label>

          <label>Alfa start
            <input type="number" min="0" max="1" step="0.05" data-group="gradient" data-key="alpha_start" value="${c.gradient.alpha_start}">
          </label>

          <label>Alfa koniec
            <input type="number" min="0" max="1" step="0.05" data-group="gradient" data-key="alpha_end" value="${c.gradient.alpha_end}">
          </label>
          `
              : ""
          }

          ${
            c.fill_mode === "premium"
              ? `
          <label>Moc startowa
            <input type="number" min="0" max="1" step="0.05" data-group="premium" data-key="start_alpha" value="${c.premium.start_alpha}">
          </label>

          <label>Moc środkowa
            <input type="number" min="0" max="1" step="0.05" data-group="premium" data-key="mid_alpha" value="${c.premium.mid_alpha}">
          </label>

          <label>Moc końcowa
            <input type="number" min="0" max="1" step="0.05" data-group="premium" data-key="end_alpha" value="${c.premium.end_alpha}">
          </label>

          <label>Pozycja pastelowa %
            <input type="number" min="0" max="100" step="1" data-group="premium" data-key="pastel_pos" value="${c.premium.pastel_pos}">
          </label>
          `
              : ""
          }

          ${
            c.fill_mode === "zebra"
              ? `
          <label>Kolor zebry
            <input type="color" data-root="zebra_color" value="${c.zebra_color}">
          </label>

          <label>Alfa
            <input type="number" min="0" max="1" step="0.05" data-root="zebra_alpha" value="${c.zebra_alpha}">
          </label>
          `
              : ""
          }
        </div>
      </details>


      <!-- STREFY KOLORÓW -->
      <details class="group">
        <summary>Strefy kolorystyczne</summary>
        <div>
          <label>TOP (LM)
            <input type="color" data-group="colors" data-key="top" value="${c.colors.top}">
          </label>

          <label>Conference (LKE)
            <input type="color" data-group="colors" data-key="conf" value="${c.colors.conf}">
          </label>

          <label>Spadek
            <input type="color" data-group="colors" data-key="bottom" value="${c.colors.bottom}">
          </label>

          <label>Liczba TOP
            <input type="number" min="0" max="10" data-group="highlight" data-key="top_count" value="${c.highlight.top_count}">
          </label>

          <label>Liczba Conference
            <input type="number" min="0" max="10" data-group="highlight" data-key="conf_count" value="${c.highlight.conf_count}">
          </label>

          <label>Liczba spadkowych
            <input type="number" min="0" max="10" data-group="highlight" data-key="bottom_count" value="${c.highlight.bottom_count}">
          </label>
        </div>
      </details>


      <!-- CZCIONKI -->
      <details class="group">
        <summary>Czcionki</summary>
        <div>
          <label>Nagłówek
            <input type="number" step="0.1" data-group="font_size" data-key="header" value="${c.font_size.header}">
          </label>

          <label>Wiersze
            <input type="number" step="0.1" data-group="font_size" data-key="row" value="${c.font_size.row}">
          </label>

          <label>Nazwy drużyn
            <input type="number" step="0.1" data-group="font_size" data-key="team" value="${c.font_size.team}">
          </label>
        </div>
      </details>
    `;

    this._attachListeners();
  }

  _attachListeners() {
    const root = this.shadowRoot;

    // ROOT
    root.querySelectorAll("[data-root]").forEach((el) => {
      const key = el.getAttribute("data-root");
      if (el.tagName.toLowerCase() === "ha-switch") {
        el.addEventListener("change", () => {
          this._updateRoot(key, el.checked);
        });
      } else {
        el.addEventListener("input", () => {
          const isNum = el.type === "number";
          const val = isNum ? Number(el.value) : el.value;
          this._updateRoot(key, val);
        });
      }
    });

    // NESTED
    root.querySelectorAll("[data-group][data-key]").forEach((el) => {
      const group = el.getAttribute("data-group");
      const key = el.getAttribute("data-key");

      if (el.tagName.toLowerCase() === "ha-switch") {
        el.addEventListener("change", () => {
          this._updateNested(group, key, el.checked);
        });
      } else {
        el.addEventListener("input", () => {
          const isNum = el.type === "number";
          const val = isNum ? Number(el.value) : el.value;
          this._updateNested(group, key, val);
        });
      }
    });
  }
}

customElements.define("league-table-card-editor", LeagueTableCardEditor);

// ===== FILE INCLUDED: dist/league-table-card.js =====
// ============================================================================
//  League Table Card (90minut) – v0.2.000
//  + Premium Gradient (Sofascore-style)
//  + Linia 3px z lewej (jak Matches Card)
// ============================================================================

class LeagueTableCard extends HTMLElement {
  setConfig(config) {
    if (!config.entity) {
      throw new Error("Entity is required (np. sensor.90minut_gornik_zabrze_table)");
    }

    const defaults = {
      name: "Tabela ligowa",
      show_name: true,
      lite_mode: false,

      fill_mode: "gradient", // gradient | premium | zebra | clear

      gradient: {
        start: 35,
        end: 100,
        alpha_start: 0.0,
        alpha_end: 0.55,
      },

      // PREMIUM GRADIENT – nowość
      premium: {
        start_alpha: 0.85,
        mid_alpha: 0.35,
        end_alpha: 0.0,
        pastel_pos: 15,
      },

      zebra_color: "#f0f0f0",
      zebra_alpha: 0.4,

      highlight: {
        top_count: 2,
        conf_count: 2,
        bottom_count: 3,
      },

      colors: {
        top: "#3ba55d",
        conf: "#468cd2",
        bottom: "#e23b3b",
      },
    };

    this.config = {
      ...defaults,
      ...config,
      gradient: { ...defaults.gradient, ...(config.gradient || {}) },
      premium: { ...defaults.premium, ...(config.premium || {}) },
      highlight: { ...defaults.highlight, ...(config.highlight || {}) },
      colors: { ...defaults.colors, ...(config.colors || {}) },
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

    const myPos = parseInt(stateObj.attributes.my_position || "", 10);
    this._myPosition = !isNaN(myPos) ? myPos : null;

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
          font-size: 0.9rem;
          text-align: center;
          white-space: nowrap;
        }
        .ltc-table th {
          font-weight: 600;
          font-size: 0.8rem;
          opacity: 0.8;
        }
        .ltc-col-pos   { width: 8%;  text-align: right; }
        .ltc-col-team  { text-align: left; }
        .ltc-col-m     { width: 8%;  }
        .ltc-col-pkt   { width: 10%; font-weight: 600; }
        .ltc-col-goals { width: 14%; }
        .ltc-col-diff  { width: 10%; }

        .ltc-team-name { overflow: hidden; text-overflow: ellipsis; }
        .ltc-team-fav  { font-weight: 700; }

        .ltc-legend {
          margin-top: 10px;
          padding-top: 6px;
          border-top: 1px solid rgba(0,0,0,0.08);
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          font-size: 0.8rem;
        }
        .ltc-legend-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .ltc-legend-box {
          width: 12px;
          height: 12px;
          border-radius: 3px;
          border: 1px solid rgba(0,0,0,0.25);
        }
      </style>
    `;

    const rowsHTML = table
      .map((row, index) => this._renderRow(row, index, totalTeams))
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
        </tr>
      </thead>
    `;

    const legendHTML = `
      <div class="ltc-legend">
        <div class="ltc-legend-item">
          <span class="ltc-legend-box" style="background:${cfg.colors.top}"></span> Liga Mistrzów
        </div>
        <div class="ltc-legend-item">
          <span class="ltc-legend-box" style="background:${cfg.colors.conf}"></span> Liga Konferencji
        </div>
        <div class="ltc-legend-item">
          <span class="ltc-legend-box" style="background:${cfg.colors.bottom}"></span> Spadek
        </div>
      </div>
    `;

    const tableHTML = `
      <div class="ltc-card">
        <table class="ltc-table">
          ${headerHTML}
          <tbody>${rowsHTML}</tbody>
        </table>
        ${legendHTML}
      </div>
    `;

    if (cfg.lite_mode) {
      this.innerHTML = `${style}${tableHTML}`;
      return;
    }

    const cardName = cfg.show_name ? (cfg.name || "Tabela ligowa") : "";

    this.innerHTML = `
      ${style}
      <ha-card ${cardName ? `header="${cardName}"` : ""}>
        ${tableHTML}
      </ha-card>
    `;
  }

  _renderRow(row, index, totalTeams) {
    const cfg = this.config;

    const pos = parseInt(row.position || "", 10);
    const classification = this._classifyPosition(pos, totalTeams);

    const style = this._rowBackgroundStyle(classification, index);

    const team = row.team || "";
    const matches = row.matches ?? "-";
    const points = row.points ?? "-";
    const goals = row.goals ?? "-";

    let diffStr = "-";
    if (row.diff || row.diff === 0) {
      const d = parseInt(row.diff);
      diffStr = isNaN(d) ? row.diff : (d > 0 ? "+" + d : "" + d);
    }

    const favClass =
      pos === this._myPosition ? "ltc-team-name ltc-team-fav" : "ltc-team-name";

    return `
      <tr style="${style}">
        <td class="ltc-col-pos">${isNaN(pos) ? "" : pos}</td>
        <td class="ltc-col-team"><span class="${favClass}">${team}</span></td>
        <td class="ltc-col-m">${matches}</td>
        <td class="ltc-col-pkt">${points}</td>
        <td class="ltc-col-goals">${goals}</td>
        <td class="ltc-col-diff">${diffStr}</td>
      </tr>
    `;
  }

  _classifyPosition(pos, totalTeams) {
    const h = this.config.highlight;
    if (!pos || !totalTeams) return null;

    if (pos <= h.top_count) return "top";
    if (pos <= h.top_count + h.conf_count) return "conf";
    if (pos > totalTeams - h.bottom_count) return "bottom";
    return null;
  }

  _rowBackgroundStyle(classification, index) {
    const cfg = this.config;

    if (!classification) return "";

    const c = this.config.colors[classification];

    if (cfg.fill_mode === "premium")
      return this._premiumGradient(c);

    if (cfg.fill_mode === "gradient")
      return this._classicGradient(c);

    if (cfg.fill_mode === "zebra")
      return index % 2 === 1
        ? `background:${this._rgba(cfg.zebra_color, cfg.zebra_alpha)};border-left:3px solid ${c}`
        : `border-left:3px solid ${c}`;

    return `border-left:3px solid ${c}`;
  }

  _classicGradient(color) {
    const g = this.config.gradient;
    return `
      background: linear-gradient(to right,
        rgba(0,0,0,0) 0%,
        ${this._rgba(color, g.alpha_start)} ${g.start}%,
        ${this._rgba(color, g.alpha_end)} ${g.end}%,
        rgba(0,0,0,0) 100%
      );
      border-left:3px solid ${color};
    `;
  }

  _premiumGradient(color) {
    const p = this.config.premium;
    return `
      background: linear-gradient(to right,
        ${this._rgba(color, p.start_alpha)} 0%,
        ${this._rgba(color, p.mid_alpha)} ${p.pastel_pos}%,
        ${this._rgba(color, p.end_alpha)} 100%
      );
      border-left:3px solid ${color};
    `;
  }

  _rgba(hex, a) {
    const h = hex.replace("#", "");
    const r = parseInt(h.substring(0,2),16);
    const g = parseInt(h.substring(2,4),16);
    const b = parseInt(h.substring(4,6),16);
    return `rgba(${r},${g},${b},${a})`;
  }

  static getConfigElement() {
    return document.createElement("league-table-card-editor");
  }

  static getStubConfig() {
    const cfg = {
      entity: "",
      fill_mode: "gradient",
    };
    return cfg;
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
  description: "Tabela ligowa z sensora 90minut.pl (premium gradient ready)",
});

// ===== FILE INCLUDED: dist/matches-card-editor.js =====
// ============================================================================
//  Matches Card Editor – YAML sync, debounce, pełna konfiguracja + PREMIUM
// ============================================================================

class MatchesCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = {};
    this._debounce = null;
  }

  static get defaultConfig() {
    return {
      name: "90minut Matches",
      show_name: true,
      show_logos: true,
      full_team_names: true,
      show_result_symbols: true,

      fill_mode: "gradient", // gradient | premium | zebra | clear

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

      // PREMIUM GRADIENT – ustawienia domyślne (soft)
      premium: {
        start_alpha: 0.85,
        mid_alpha: 0.35,
        end_alpha: 0.0,
        pastel_pos: 15,
      },

      zebra_color: "#f0f0f0",
      zebra_alpha: 0.4,

      lite_mode: false,
    };
  }

  // głębokie łączenie
  _mergeDeep(base, extra) {
    const out = {};
    const keys = new Set([
      ...Object.keys(base || {}),
      ...Object.keys(extra || {}),
    ]);

    keys.forEach((k) => {
      const bv = base ? base[k] : undefined;
      const ev = extra ? extra[k] : undefined;

      if (
        bv &&
        typeof bv === "object" &&
        !Array.isArray(bv) &&
        ev &&
        typeof ev === "object" &&
        !Array.isArray(ev)
      ) {
        out[k] = this._mergeDeep(bv, ev);
      } else if (ev !== undefined) {
        out[k] = ev;
      } else {
        out[k] = bv;
      }
    });

    return out;
  }

  setConfig(config) {
    const merged = this._mergeDeep(
      MatchesCardEditor.defaultConfig,
      config || {}
    );
    if (config && config.entity) merged.entity = config.entity;
    this._config = merged;
    this._render();
  }

  // helper pobierania wartości
  _getPath(path) {
    return path
      .split(".")
      .reduce((o, k) => (o ? o[k] : undefined), this._config);
  }

  // helper ustawiania wartości
  _updatePath(path, value) {
    const obj = JSON.parse(JSON.stringify(this._config));
    const parts = path.split(".");
    let ref = obj;

    for (let i = 0; i < parts.length - 1; i++) {
      if (!ref[parts[i]] || typeof ref[parts[i]] !== "object") {
        ref[parts[i]] = {};
      }
      ref = ref[parts[i]];
    }
    ref[parts[parts.length - 1]] = value;

    this._config = obj;

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

  // ------------------------------
  // render
  // ------------------------------
  _render() {
    const c = this._config;
    const root = this.shadowRoot;

    const prev = {
      basic: root.querySelector("#basic")?.open ?? true,
      fill: root.querySelector("#fill")?.open ?? false,
      fonts: root.querySelector("#fonts")?.open ?? false,
      icons: root.querySelector("#icons")?.open ?? false,
      colors: root.querySelector("#colors")?.open ?? false,
    };

    root.innerHTML = `
      <style>
        .group {
          margin:12px 0;
          border:1px solid rgba(255,255,255,0.1);
          border-radius:8px;
        }
        .group summary {
          padding:10px 12px;
          background:rgba(255,255,255,0.05);
          cursor:pointer;
        }
        .group div {
          padding:10px 16px 16px;
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:12px;
        }
        label {
          display:flex;
          flex-direction:column;
          font-size:0.9rem;
        }
        input[type="text"],
        input[type="number"],
        select {
          padding:6px;
          background:#0003;
          border:1px solid #fff2;
          border-radius:6px;
          color:inherit;
        }
        input[type="color"] {
          width:40px;
          height:26px;
          border:none;
          background:transparent;
        }
        .row {
          display:flex;
          align-items:center;
          gap:10px;
        }
      </style>

      <!-- PODSTAWOWE -->
      <details id="basic" class="group" ${prev.basic ? "open" : ""}>
        <summary>Podstawowe</summary>
        <div>
          <label>Nazwa karty
            <input type="text" data-path="name" value="${c.name}">
          </label>

          <div class="row">
            <span>Pokaż nazwę</span>
            <ha-switch data-path="show_name"></ha-switch>
          </div>

          <div class="row">
            <span>Pokaż herby</span>
            <ha-switch data-path="show_logos"></ha-switch>
          </div>

          <div class="row">
            <span>Pełne nazwy</span>
            <ha-switch data-path="full_team_names"></ha-switch>
          </div>

          <div class="row">
            <span>Pokaż W/D/L</span>
            <ha-switch data-path="show_result_symbols"></ha-switch>
          </div>

          <div class="row">
            <span>Tryb LITE</span>
            <ha-switch data-path="lite_mode"></ha-switch>
          </div>
        </div>
      </details>

      <!-- STYL WYPEŁNIENIA -->
      <details id="fill" class="group" ${prev.fill ? "open" : ""}>
        <summary>Styl wypełnienia</summary>
        <div>
          <label>Tryb
            <select data-path="fill_mode">
              <option value="gradient" ${c.fill_mode === "gradient" ? "selected" : ""}>Gradient</option>
              <option value="premium" ${c.fill_mode === "premium" ? "selected" : ""}>Premium gradient</option>
              <option value="zebra" ${c.fill_mode === "zebra" ? "selected" : ""}>Zebra</option>
              <option value="clear" ${c.fill_mode === "clear" ? "selected" : ""}>Brak</option>
            </select>
          </label>

          ${
            c.fill_mode === "gradient"
              ? `
              <label>Start %
                <input type="number" data-type="number" data-path="gradient.start" value="${c.gradient.start}">
              </label>

              <label>Koniec %
                <input type="number" data-type="number" data-path="gradient.end" value="${c.gradient.end}">
              </label>

              <label>Alfa start
                <input type="number" data-type="number" step="0.05" data-path="gradient.alpha_start" value="${c.gradient.alpha_start}">
              </label>

              <label>Alfa koniec
                <input type="number" data-type="number" step="0.05" data-path="gradient.alpha_end" value="${c.gradient.alpha_end}">
              </label>
            `
              : ""
          }

          ${
            c.fill_mode === "premium"
              ? `
              <label>Moc startowa (alfa)
                <input type="number" data-type="number" step="0.05" min="0" max="1"
                  data-path="premium.start_alpha"
                  value="${c.premium?.start_alpha ?? 0.85}">
              </label>

              <label>Moc środkowa (alfa)
                <input type="number" data-type="number" step="0.05" min="0" max="1"
                  data-path="premium.mid_alpha"
                  value="${c.premium?.mid_alpha ?? 0.35}">
              </label>

              <label>Moc końcowa (alfa)
                <input type="number" data-type="number" step="0.05" min="0" max="1"
                  data-path="premium.end_alpha"
                  value="${c.premium?.end_alpha ?? 0.0}">
              </label>

              <label>Pozycja pastelowa %
                <input type="number" data-type="number" step="1" min="0" max="100"
                  data-path="premium.pastel_pos"
                  value="${c.premium?.pastel_pos ?? 15}">
              </label>
            `
              : ""
          }

          ${
            c.fill_mode === "zebra"
              ? `
              <label>Kolor zebry
                <input type="color" data-path="zebra_color" value="${c.zebra_color}">
              </label>

              <label>Alfa
                <input type="number" data-type="number" step="0.05" data-path="zebra_alpha" value="${c.zebra_alpha}">
              </label>
            `
              : ""
          }
        </div>
      </details>

      <!-- CZCIONKI -->
      <details id="fonts" class="group" ${prev.fonts ? "open" : ""}>
        <summary>Rozmiary czcionek</summary>
        <div>
          <label>Data
            <input type="number" step="0.1" data-path="font_size.date" data-type="number" value="${c.font_size.date}">
          </label>
          <label>Status / godzina
            <input type="number" step="0.1" data-path="font_size.status" data-type="number" value="${c.font_size.status}">
          </label>
          <label>Drużyny
            <input type="number" step="0.1" data-path="font_size.teams" data-type="number" value="${c.font_size.teams}">
          </label>
          <label>Wynik
            <input type="number" step="0.1" data-path="font_size.score" data-type="number" value="${c.font_size.score}">
          </label>
        </div>
      </details>

      <!-- IKONY -->
      <details id="icons" class="group" ${prev.icons ? "open" : ""}>
        <summary>Rozmiary ikon</summary>
        <div>
          <label>Liga
            <input type="number" data-path="icon_size.league" data-type="number" value="${c.icon_size.league}">
          </label>
          <label>Herby
            <input type="number" data-path="icon_size.crest" data-type="number" value="${c.icon_size.crest}">
          </label>
          <label>W/D/L
            <input type="number" data-path="icon_size.result" data-type="number" value="${c.icon_size.result}">
          </label>
        </div>
      </details>

      <!-- KOLORY -->
      <details id="colors" class="group" ${prev.colors ? "open" : ""}>
        <summary>Kolory W/D/L</summary>
        <div>
          <label>Wygrana
            <input type="color" data-path="colors.win" value="${c.colors.win}">
          </label>
          <label>Remis
            <input type="color" data-path="colors.draw" value="${c.colors.draw}">
          </label>
          <label>Porażka
            <input type="color" data-path="colors.loss" value="${c.colors.loss}">
          </label>
        </div>
      </details>
    `;

    this._attachEvents();
  }

  // ------------------------------
  // eventy
  // ------------------------------
  _attachEvents() {
    const root = this.shadowRoot;

    // inputy
    root.querySelectorAll("input[data-path]").forEach((el) => {
      const path = el.getAttribute("data-path");
      const type = el.getAttribute("data-type");

      el.addEventListener("input", (ev) => {
        let v = ev.target.value;
        if (type === "number") {
          v = Number(v);
        }
        this._updatePath(path, v);
      });
    });

    // select
    root.querySelectorAll("select[data-path]").forEach((sel) => {
      sel.addEventListener("change", (ev) => {
        this._updatePath(sel.getAttribute("data-path"), ev.target.value);
        this._render(); // przeładować, żeby pokazać odpowiednie pola
      });
    });

    // ha-switch
    root.querySelectorAll("ha-switch[data-path]").forEach((sw) => {
      const path = sw.getAttribute("data-path");
      sw.checked = !!this._getPath(path);
      sw.addEventListener("change", (ev) => {
        this._updatePath(path, ev.target.checked);
      });
    });
  }

  set hass(hass) {
    this._hass = hass;
  }
}

if (!customElements.get("matches-card-editor")) {
  customElements.define("matches-card-editor", MatchesCardEditor);
}

// ===== FILE INCLUDED: dist/matches-card.js =====
// ============================================================================
//  Matches Card (90minut) – v0.3.XXX (Premium Gradient + Editor Sync)
// ============================================================================

class MatchesCard extends HTMLElement {
  static get defaultConfig() {
    return {
      name: "90minut Matches",
      show_name: true,
      show_logos: true,
      full_team_names: true,
      show_result_symbols: true,

      fill_mode: "gradient", // gradient | premium | zebra | clear

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

      // NEW — PREMIUM GRADIENT (SOFASCORE-STYLE)
      premium: {
        start_alpha: 0.85,
        mid_alpha: 0.35,
        end_alpha: 0.0,
        pastel_pos: 15,
      },

      zebra_color: "#f0f0f0",
      zebra_alpha: 0.4,

      lite_mode: false,
    };
  }

  _mergeDeep(base, extra) {
    const out = Array.isArray(base) ? [] : {};
    const keys = new Set([...Object.keys(base || {}), ...Object.keys(extra || {})]);
    keys.forEach((k) => {
      const bv = base ? base[k] : undefined;
      const ev = extra ? extra[k] : undefined;
      if (
        bv && ev &&
        typeof bv === "object" &&
        !Array.isArray(bv) &&
        typeof ev === "object" &&
        !Array.isArray(ev)
      ) out[k] = this._mergeDeep(bv, ev);
      else if (ev !== undefined) out[k] = ev;
      else out[k] = bv;
    });
    return out;
  }

  setConfig(config) {
    if (!config || !config.entity)
      throw new Error("Entity is required");

    const merged = this._mergeDeep(MatchesCard.defaultConfig, config);
    merged.entity = config.entity;
    this.config = merged;
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
      table { width:100%; border-collapse:collapse; }
      tr { border-bottom:1px solid rgba(0,0,0,0.1); }
      td { padding:4px 6px; vertical-align:middle; }

      .dual-cell {
        display:flex;
        flex-direction:column;
        justify-content:center;
        align-items:center;
        gap:4px;
      }

      .crest-box {
        background: rgba(255,255,255,1);
        border-radius: 10px;
        padding: 4px;
        display:flex;
        align-items:center;
        justify-content:center;
        box-shadow: 0 0 3px rgba(0,0,0,0.2);
      }

      .team-cell { text-align:left; padding-left:8px; }
      .team-row { line-height:1.3em; }

      .score-cell {
        display:flex;
        flex-direction:column;
        justify-content:center;
        align-items:center;
        line-height:1.3em;
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

    const rows = matches.map((m) => this._row(m)).join("");

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
    let dateStr = "", timeStr = "";

    if (m.date) {
      const dt = new Date(m.date.replace(" ", "T"));
      if (!isNaN(dt.getTime())) {
        dateStr = dt.toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit", year: "numeric" });
        timeStr = dt.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });
      }
    }

    const bottomLine = m.finished ? "KONIEC" : timeStr;
    const full = this.config.full_team_names !== false;

    const home = full ? m.home : this._short(m.home);
    const away = full ? m.away : this._short(m.away);

    const [hs, as] = (m.score || "-").split("-");

    return `
    <tr style="${this._computeRowBackground(m)}">

      <td style="width:10%;text-align:center;">
        <div style="font-size:${this.config.font_size.date}rem">${dateStr}</div>
        <div style="font-size:${this.config.font_size.status}rem">${bottomLine}</div>
      </td>

      <td style="width:10%;text-align:center;">
        ${this._league(m.league)}
      </td>

      ${
        this.config.show_logos
          ? `<td class="dual-cell" style="width:10%;">
              <div class="crest-box">
                <img src="${m.logo_home}" height="${this.config.icon_size.crest}">
              </div>
              <div class="crest-box">
                <img src="${m.logo_away}" height="${this.config.icon_size.crest}">
              </div>
            </td>`
          : ""
      }

      <td class="team-cell">
        <div class="team-row">${home}</div>
        <div class="team-row">${away}</div>
      </td>

      <td class="score-cell" style="width:10%;">
        <div style="font-size:${this.config.font_size.score}rem">${hs}</div>
        <div style="font-size:${this.config.font_size.score}rem">${as}</div>
      </td>

      <td style="width:8%; text-align:center;">
        ${
          this.config.show_result_symbols && m.result
            ? `<div class="result-circle" style="background:${this.config.colors[m.result]}">
                 ${m.result.charAt(0).toUpperCase()}
               </div>`
            : ""
        }
      </td>

    </tr>`;
  }

  // -------------------------------------------------------
  // BACKGROUND SELECTOR (normal, premium, zebra, none)
  // -------------------------------------------------------
  _computeRowBackground(m) {
    if (!m.result) return "";

    if (this.config.fill_mode === "premium")
      return this._premiumGradient(m);

    if (this.config.fill_mode === "gradient")
      return this._classicGradient(m);

    if (this.config.fill_mode === "zebra")
      return ""; // zebra handled by CSS

    return "";
  }

  // CLASSIC GRADIENT + LEFT LINE
  _classicGradient(m) {
    const c = this.config.colors[m.result];
    const g = this.config.gradient;

    return `
      background: linear-gradient(to right,
        rgba(0,0,0,0) 0%,
        ${this._rgba(c, g.alpha_start)} ${g.start}%,
        ${this._rgba(c, g.alpha_end)} ${g.end}%,
        rgba(0,0,0,0) 100%
      );
      border-left: 3px solid ${c};
    `;
  }

  // PREMIUM GRADIENT (Sofascore-style)
  _premiumGradient(m) {
    const c = this.config.colors[m.result];
    const p = this.config.premium;

    return `
      background: linear-gradient(to right,
        ${this._rgba(c, p.start_alpha)} 0%,
        ${this._rgba(c, p.mid_alpha)} ${p.pastel_pos}%,
        ${this._rgba(c, p.end_alpha)} 100%
      );
      border-left: 3px solid ${c};
    `;
  }

  _short(name) {
    if (!name) return "";
    return name.split(" ")[0];
  }

  _league(code) {
    const file =
      code === "L" ? "ekstraklasa.png" :
      code === "PP" ? "puchar.png" :
      null;

    if (!file) return `<div>${code}</div>`;

    return `<img src="https://raw.githubusercontent.com/GieOeRZet/matches-card/main/logo/${file}"
                height="${this.config.icon_size.league}">`;
  }

  _rgba(hex, a) {
    const h = hex.replace("#", "");
    const r = parseInt(h.substr(0,2),16);
    const g = parseInt(h.substr(2,2),16);
    const b = parseInt(h.substr(4,2),16);
    return `rgba(${r},${g},${b},${a})`;
  }

  static getConfigElement() {
    return document.createElement("matches-card-editor");
  }

  static getStubConfig() {
    const cfg = JSON.parse(JSON.stringify(MatchesCard.defaultConfig));
    cfg.entity = "";
    return cfg;
  }

  getCardSize() {
    return 6;
  }
}

if (!customElements.get("matches-card")) {
  customElements.define("matches-card", MatchesCard);
}

window.customCards = window.customCards || [];
window.customCards.push({
  type: "matches-card",
  name: "Matches Card (90minut)",
  description: "Karta pokazująca mecze z sensora 90minut.pl",
});

