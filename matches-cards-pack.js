// Matches Cards Pack – version 0.3.200
// Auto-generated from dist/

// ===== FILE INCLUDED: dist/league-table-card-editor.js =====
// ============================================================================
//  League Table Card Editor (90minut)
//  - Vanilla JS (bez lit)
//  - Sekcje: Podstawowe / Styl wierszy / Podświetlenia / Czcionki
//  - Debounce dla pól liczbowych/tekstowych (~700 ms)
// ============================================================================

class LeagueTableCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = {};
    this._debounce = null;
  }

  // ------------------------------------------------
  //  HA wywołuje setConfig z aktualnym YAML-em
  // ------------------------------------------------
  setConfig(config) {
    const cfg = config || {};

    const defaults = {
      name: "Tabela ligowa",
      show_name: true,
      lite_mode: false,
      show_trend: true,
      fill_mode: "gradient", // gradient / zebra / clear
      font_size: {
        header: 0.8,
        row: 0.9,
        team: 1.0,
      },
      highlight: {
        favorite: true,
        top_count: 2,
        bottom_count: 3,
        top_color: "#3ba55d",    // LM
        conf_color: "#468cd2",   // LK
        bottom_color: "#e23b3b", // spadek
        alpha_start: 0.0,
        alpha_end: 0.55,
      },
      zebra_color: "#f0f0f0",
      zebra_alpha: 0.4,
    };

    // Głębokie scalanie z domyślnymi
    this._config = {
      ...defaults,
      ...cfg,
      font_size: { ...defaults.font_size, ...(cfg.font_size || {}) },
      highlight: { ...defaults.highlight, ...(cfg.highlight || {}) },
    };

    if (typeof this._config.fill_mode !== "string") {
      this._config.fill_mode = "gradient";
    }

    this._render();
  }

  // ------------------------------------------------
  //  Debounce + wysyłanie config-changed
  // ------------------------------------------------
  _scheduleApply(immediate = false) {
    if (immediate) {
      clearTimeout(this._debounce);
      this._apply();
      return;
    }

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

  // ------------------------------------------------
  //  Aktualizacje configu
  // ------------------------------------------------
  _updateRoot(key, value, immediate = false) {
    this._config = {
      ...this._config,
      [key]: value,
    };
    this._scheduleApply(immediate);
  }

  _updateNested(group, key, value, immediate = false) {
    const nested = { ...(this._config[group] || {}) };
    nested[key] = value;
    this._config = {
      ...this._config,
      [group]: nested,
    };
    this._scheduleApply(immediate);
  }

  // ------------------------------------------------
  //  Render UI
  // ------------------------------------------------
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

        input[type="number"],
        input[type="text"],
        select {
          margin-top: 4px;
          padding: 4px 6px;
          border-radius: 6px;
          border: 1px solid rgba(255,255,255,0.20);
          background: rgba(0,0,0,0.2);
          color: inherit;
        }

        input[type="color"] {
          margin-top: 4px;
          width: 40px;
          height: 28px;
          padding: 0;
          border: none;
          background: transparent;
        }

        .switch-row {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.9rem;
        }

        .switch-row span {
          opacity: 0.9;
        }

        .legend-hint {
          font-size: 0.8rem;
          opacity: 0.7;
          grid-column: 1 / -1;
          margin-top: 4px;
        }
      </style>

      <!-- PODSTAWOWE -->
      <details class="group" open>
        <summary>Podstawowe</summary>
        <div>
          <label>
            Nazwa karty
            <input type="text"
                   data-root-key="name"
                   value="${c.name ?? ""}">
          </label>

          <div class="switch-row">
            <ha-switch data-root-key="show_name" ${c.show_name !== false ? "checked" : ""}></ha-switch>
            <span>Pokaż nagłówek</span>
          </div>

          <div class="switch-row">
            <ha-switch data-root-key="lite_mode" ${c.lite_mode === true ? "checked" : ""}></ha-switch>
            <span>Tryb LITE (bez tła ha-card)</span>
          </div>

          <div class="switch-row">
            <ha-switch data-root-key="show_trend" ${c.show_trend !== false ? "checked" : ""}></ha-switch>
            <span>Pokaż kolumnę trendu</span>
          </div>
        </div>
      </details>

      <!-- STYL WIERSZY -->
      <details class="group">
        <summary>Styl wierszy (wypełnienie)</summary>
        <div>
          <label>
            Tryb wypełnienia
            <select data-root-key="fill_mode">
              <option value="gradient" ${c.fill_mode === "gradient" ? "selected" : ""}>Gradient</option>
              <option value="zebra" ${c.fill_mode === "zebra" ? "selected" : ""}>Zebra</option>
              <option value="clear" ${c.fill_mode === "clear" ? "selected" : ""}>Brak</option>
            </select>
          </label>

          ${c.fill_mode === "gradient" ? `
            <label>
              Start gradientu (%)
              <input type="number" min="0" max="100"
                     data-group="highlight" data-key="start"
                     value="${c.highlight?.start ?? 35}">
            </label>

            <label>
              Koniec gradientu (%)
              <input type="number" min="0" max="100"
                     data-group="highlight" data-key="end"
                     value="${c.highlight?.end ?? 100}">
            </label>

            <label>
              Alfa start
              <input type="number" min="0" max="1" step="0.05"
                     data-group="highlight" data-key="alpha_start"
                     value="${c.highlight?.alpha_start ?? 0}">
            </label>

            <label>
              Alfa koniec
              <input type="number" min="0" max="1" step="0.05"
                     data-group="highlight" data-key="alpha_end"
                     value="${c.highlight?.alpha_end ?? 0.55}">
            </label>
          ` : ""}

          ${c.fill_mode === "zebra" ? `
            <label>
              Kolor wierszy parzystych
              <input type="color"
                     data-root-key="zebra_color"
                     value="${c.zebra_color ?? "#f0f0f0"}">
            </label>

            <label>
              Alfa zebry
              <input type="number" min="0" max="1" step="0.05"
                     data-root-key="zebra_alpha"
                     value="${c.zebra_alpha ?? 0.4}">
            </label>
          ` : ""}
        </div>
      </details>

      <!-- PODŚWIETLENIA (STREFY) -->
      <details class="group">
        <summary>Strefy: LM / Liga Konferencji / Spadek</summary>
        <div>
          <div class="switch-row">
            <ha-switch data-group="highlight" data-key="favorite" ${c.highlight?.favorite !== false ? "checked" : ""}></ha-switch>
            <span>Pogrub moją drużynę</span>
          </div>

          <label>
            Drużyn w strefie "Liga Mistrzów"
            <input type="number" min="0" max="10"
                   data-group="highlight" data-key="top_count"
                   value="${c.highlight?.top_count ?? 2}">
          </label>

          <label>
            Drużyn w strefie spadkowej
            <input type="number" min="0" max="10"
                   data-group="highlight" data-key="bottom_count"
                   value="${c.highlight?.bottom_count ?? 3}">
          </label>

          <label>
            Kolor: "Liga Mistrzów"
            <input type="color"
                   data-group="highlight" data-key="top_color"
                   value="${c.highlight?.top_color ?? "#3ba55d"}">
          </label>

          <label>
            Kolor: "Liga Konferencji"
            <input type="color"
                   data-group="highlight" data-key="conf_color"
                   value="${c.highlight?.conf_color ?? "#468cd2"}">
          </label>

          <label>
            Kolor: "Spadek"
            <input type="color"
                   data-group="highlight" data-key="bottom_color"
                   value="${c.highlight?.bottom_color ?? "#e23b3b"}">
          </label>

          <div class="legend-hint">
            Legenda na dole tabeli korzysta z powyższych kolorów.
          </div>
        </div>
      </details>

      <!-- CZCIONKI -->
      <details class="group">
        <summary>Rozmiary czcionek</summary>
        <div>
          <label>
            Nagłówek tabeli
            <input type="number" step="0.1"
                   data-group="font_size" data-key="header"
                   value="${c.font_size?.header ?? 0.8}">
          </label>

          <label>
            Wiersze
            <input type="number" step="0.1"
                   data-group="font_size" data-key="row"
                   value="${c.font_size?.row ?? 0.9}">
          </label>

          <label>
            Nazwy drużyn
            <input type="number" step="0.1"
                   data-group="font_size" data-key="team"
                   value="${c.font_size?.team ?? 1.0}">
          </label>
        </div>
      </details>
    `;

    this._attachListeners();
  }

  // ------------------------------------------------
  //  Listeners po wstrzyknięciu HTML
  // ------------------------------------------------
  _attachListeners() {
    const root = this.shadowRoot;
    if (!root) return;

    // Top-level pola tekstowe/numeryczne/select
    root.querySelectorAll("input[data-root-key], select[data-root-key]").forEach((el) => {
      const key = el.getAttribute("data-root-key");
      if (!key) return;

      if (el.tagName.toLowerCase() === "ha-switch") {
        // u mnie i tak nie wejdzie, bo ha-switch ma osobny handler niżej
        return;
      }

      const isNumber = el.getAttribute("type") === "number";

      const handler = (evt) => {
        let val = isNumber ? Number(el.value) : el.value;
        if (isNumber && Number.isNaN(val)) {
          val = 0;
        }
        this._updateRoot(key, val, false);
      };

      el.addEventListener("input", handler);
    });

    // Top-level ha-switch
    root.querySelectorAll("ha-switch[data-root-key]").forEach((sw) => {
      const key = sw.getAttribute("data-root-key");
      if (!key) return;

      sw.addEventListener("change", () => {
        this._updateRoot(key, sw.checked, true);
      });
    });

    // Pólka zagnieżdżone (font_size, highlight, itp.)
    root.querySelectorAll("input[data-group][data-key], select[data-group][data-key]").forEach((el) => {
      const group = el.getAttribute("data-group");
      const key = el.getAttribute("data-key");
      if (!group || !key) return;

      const tag = el.tagName.toLowerCase();
      const isSwitch = tag === "ha-switch";
      const isNumber = el.getAttribute("type") === "number";

      if (isSwitch) {
        el.addEventListener("change", () => {
          this._updateNested(group, key, el.checked, true);
        });
      } else {
        const handler = () => {
          let val = isNumber ? Number(el.value) : el.value;
          if (isNumber && Number.isNaN(val)) {
            val = 0;
          }
          this._updateNested(group, key, val, false);
        };
        el.addEventListener("input", handler);
      }
    });
  }
}

customElements.define("league-table-card-editor", LeagueTableCardEditor);
// ===== FILE INCLUDED: dist/league-table-card.js =====
// ============================================================================
//  League Table Card (90minut) – v0.1.100
//  - Gradient / Zebra jak w Matches Card
//  - Domyślne kolory jak w meczach:
//      top  (LM)   => #3ba55d
//      conf (LKE)  => #468cd2
//      bottom (sp) => #e23b3b
//  - Moja drużyna: pogrubiona nazwa (bez specjalnego tła)
//  - Legenda na dole (kolorowy kwadracik + opis)
//  - Tryb LITE (bez ha-card, samo <table> + legenda)
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

      // Gradient / Zebra – analogicznie do Matches Card
      fill_mode: "gradient", // 'gradient' | 'zebra' | 'clear'
      gradient: {
        start: 35,
        end: 100,
        alpha_start: 0.0,
        alpha_end: 0.55,
      },
      zebra_color: "#f0f0f0",
      zebra_alpha: 0.4,

      // Pozycje i kolory (LM / LKE / Spadek)
      highlight: {
        top_count: 2,
        conf_count: 2,
        bottom_count: 3,
      },

      colors: {
        top: "#3ba55d", // Liga Mistrzów
        conf: "#468cd2", // Liga Konferencji
        bottom: "#e23b3b", // Spadek
      },
    };

    this.config = {
      ...defaults,
      ...config,
      gradient: { ...defaults.gradient, ...(config.gradient || {}) },
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

    const myPosAttr = stateObj.attributes.my_position;
    this._myPosition =
      myPosAttr != null && myPosAttr !== ""
        ? parseInt(myPosAttr, 10)
        : null;

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
          vertical-align: middle;
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

        .ltc-team-name {
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .ltc-team-fav {
          font-weight: 700;
        }

        .ltc-legend {
          margin-top: 10px;
          padding-top: 6px;
          border-top: 1px solid rgba(0,0,0,0.08);
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          font-size: 0.8rem;
          align-items: center;
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
      .map((row, index) =>
        this._renderRow(row, index, totalTeams)
      )
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
          <span class="ltc-legend-box" style="background:${cfg.colors.top};"></span>
          <span>Liga Mistrzów</span>
        </div>
        <div class="ltc-legend-item">
          <span class="ltc-legend-box" style="background:${cfg.colors.conf};"></span>
          <span>Liga Konferencji</span>
        </div>
        <div class="ltc-legend-item">
          <span class="ltc-legend-box" style="background:${cfg.colors.bottom};"></span>
          <span>Spadek</span>
        </div>
      </div>
    `;

    const tableHTML = `
      <div class="ltc-card">
        <table class="ltc-table">
          ${headerHTML}
          <tbody>
            ${rowsHTML}
          </tbody>
        </table>
        ${legendHTML}
      </div>
    `;

    if (cfg.lite_mode) {
      this.innerHTML = `${style}${tableHTML}`;
      return;
    }

    const cardName =
      cfg.show_name === false
        ? ""
        : cfg.name ||
          stateObj.attributes.friendly_name ||
          "Tabela ligowa";

    this.innerHTML = `
      ${style}
      <ha-card ${cardName ? `header="${cardName}"` : ""}>
        ${tableHTML}
      </ha-card>
    `;
  }

  _renderRow(row, index, totalTeams) {
    const cfg = this.config;
    const pos =
      row.position != null && row.position !== ""
        ? parseInt(row.position, 10)
        : null;

    const classification = this._classifyPosition(pos, totalTeams);
    const rowStyle = this._rowBackgroundStyle(
      classification,
      index
    );

    const matches = row.matches ?? "-";
    const points = row.points ?? "-";
    const goals = row.goals ?? "-";

    let diff = row.diff;
    let diffStr = "-";
    if (diff !== undefined && diff !== null && diff !== "") {
      const n =
        typeof diff === "number" ? diff : parseInt(diff, 10);
      if (!isNaN(n)) {
        diffStr = (n > 0 ? "+" : "") + n;
      } else {
        diffStr = String(diff);
      }
    }

    const teamName = row.team || "";

    const isFavorite =
      this._myPosition != null &&
      pos != null &&
      pos === this._myPosition;

    const teamClass = isFavorite
      ? "ltc-team-name ltc-team-fav"
      : "ltc-team-name";

    return `
      <tr style="${rowStyle}">
        <td class="ltc-col-pos">
          ${pos != null && !isNaN(pos) ? pos : ""}
        </td>
        <td class="ltc-col-team">
          <span class="${teamClass}">${teamName}</span>
        </td>
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

    // TOP – Liga Mistrzów
    if (pos >= 1 && pos <= h.top_count) return "top";

    // Conference – Liga Konferencji
    if (
      pos > h.top_count &&
      pos <= h.top_count + h.conf_count
    ) {
      return "conf";
    }

    // Bottom – Spadek
    if (
      h.bottom_count > 0 &&
      pos > totalTeams - h.bottom_count
    ) {
      return "bottom";
    }

    return null;
  }

  _rowBackgroundStyle(classification, index) {
    const cfg = this.config;

    let style = "";

    if (cfg.fill_mode === "gradient" && classification) {
      const col = cfg.colors[classification];
      const g = cfg.gradient;
      style += `
        background: linear-gradient(to right,
          rgba(0,0,0,0) 0%,
          ${this._rgba(col, g.alpha_start)} ${g.start}%,
          ${this._rgba(col, g.alpha_end)} ${g.end}%,
          rgba(0,0,0,0) 100%
        );
      `;
      // delikatny lewy pasek w tym samym kolorze
      style += `border-left: 3px solid ${col};`;
      return style;
    }

    if (cfg.fill_mode === "zebra") {
      if (index % 2 === 1) {
        style += `background-color:${this._rgba(
          cfg.zebra_color,
          cfg.zebra_alpha
        )};`;
      }
      if (classification) {
        const col = cfg.colors[classification];
        style += `border-left: 3px solid ${col};`;
      }
      return style;
    }

    // clear – bez tła, ale można zostawić pasek z boku
    if (classification) {
      const col = cfg.colors[classification];
      style += `border-left: 3px solid ${col};`;
    }

    return style;
  }

  _rgba(hex, alpha) {
    if (!hex) return `rgba(0,0,0,${alpha})`;
    const h = hex.replace("#", "");
    if (h.length !== 6) return `rgba(0,0,0,${alpha})`;
    const r = parseInt(h.substr(0, 2), 16);
    const g = parseInt(h.substr(2, 2), 16);
    const b = parseInt(h.substr(4, 2), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  static getConfigElement() {
    return document.createElement("league-table-card-editor");
  }

  static getStubConfig() {
    // Od razu po dodaniu karty YAML będzie pełny
    return {
      entity: "sensor.90minut_gornik_zabrze_table",
      name: "Tabela ligowa",
      show_name: true,
      lite_mode: false,
      fill_mode: "gradient",
      gradient: {
        start: 35,
        end: 100,
        alpha_start: 0.0,
        alpha_end: 0.55,
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
//  Matches Card Editor – YAML sync, debounce, pełna konfiguracja
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

      lite_mode: false,
    };
  }

  // głębokie łączenie
  _mergeDeep(base, extra) {
    const out = {};
    const keys = new Set([...Object.keys(base), ...Object.keys(extra || {})]);
    keys.forEach((k) => {
      const bv = base[k];
      const ev = extra ? extra[k] : undefined;
      if (typeof bv === "object" && !Array.isArray(bv)) {
        out[k] = this._mergeDeep(bv, ev || {});
      } else {
        out[k] = ev !== undefined ? ev : bv;
      }
    });
    return out;
  }

  setConfig(config) {
    const merged = this._mergeDeep(MatchesCardEditor.defaultConfig, config || {});
    if (config && config.entity) merged.entity = config.entity;
    this._config = merged;
    this._render();
  }

  // helper pobierania wartości
  _getPath(path) {
    return path.split(".").reduce((o, k) => (o ? o[k] : undefined), this._config);
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
        .group{margin:12px 0;border:1px solid rgba(255,255,255,0.1);border-radius:8px;}
        .group summary{padding:10px 12px;background:rgba(255,255,255,0.05);cursor:pointer;}
        .group div{padding:10px 16px 16px;display:grid;grid-template-columns:1fr 1fr;gap:12px;}
        label{display:flex;flex-direction:column;font-size:0.9rem;}
        input[type="text"],input[type="number"],select{
          padding:6px;background:#0003;border:1px solid #fff2;border-radius:6px;color:inherit;
        }
        input[type="color"]{width:40px;height:26px;border:none;background:transparent;}
        .row{display:flex;align-items:center;gap:10px;}
      </style>

      <!-- PODSTAWOWE -->
      <details id="basic" class="group" ${prev.basic ? "open" : ""}>
        <summary>Podstawowe</summary>
        <div>
          <label>Nazwa karty
            <input type="text" data-path="name" value="${c.name}">
          </label>

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

      <!-- STYL -->
      <details id="fill" class="group" ${prev.fill ? "open" : ""}>
        <summary>Styl wypełnienia</summary>
        <div>
          <label>Tryb
            <select data-path="fill_mode">
              <option value="gradient" ${c.fill_mode === "gradient" ? "selected" : ""}>Gradient</option>
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
        if (type === "number") v = Number(v);
        this._updatePath(path, v);
      });
    });

    // select
    root.querySelectorAll("select[data-path]").forEach((sel) => {
      sel.addEventListener("change", (ev) => {
        this._updatePath(sel.getAttribute("data-path"), ev.target.value);
        this._render(); // przeładować sekcję odpowiednią
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
//  Matches Card (90minut) – v0.3.XXX (YAML + EDITOR SYNC, FIXED LAYOUT)
//  - Pełen model domyślny
//  - YAML i edytor synchronizowane w obie strony
//  - Layout zgodny z ustaleniami (data + godzina/KONIEC)
// ============================================================================

class MatchesCard extends HTMLElement {
  // ------------------------------
  //  DOMYŚLNA KONFIGURACJA
  // ------------------------------
  static get defaultConfig() {
    return {
      name: "90minut Matches",
      show_name: true,
      show_logos: true,
      full_team_names: true,
      show_result_symbols: true,

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

      lite_mode: false,
    };
  }

  // prosty deep merge
  _mergeDeep(base, extra) {
    const out = Array.isArray(base) ? [] : {};
    const keys = new Set([...Object.keys(base || {}), ...Object.keys(extra || {})]);
    keys.forEach((k) => {
      const bv = base ? base[k] : undefined;
      const ev = extra ? extra[k] : undefined;
      if (
        bv &&
        ev &&
        typeof bv === "object" &&
        !Array.isArray(bv) &&
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

  // ------------------------------
  // CONFIG
  // ------------------------------
  setConfig(config) {
    if (!config || !config.entity) {
      throw new Error("Entity is required (np. sensor.90minut_gornik_zabrze_matches)");
    }

    const merged = this._mergeDeep(MatchesCard.defaultConfig, config);
    merged.entity = config.entity;
    this.config = merged;
  }

  // ------------------------------
  // RENDER
  // ------------------------------
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
        }

        .crest-cell { gap:3px; }
        .league-cell { padding-right:12px; }

        .team-cell { text-align:left; padding-left:8px; }
        .team-row { line-height:1.3em; }

        .score-cell {
          display:flex;
          flex-direction:column;
          justify-content:center;
          align-items:center;
          line-height:1.3em;
        }

        .result-cell { text-align:center; }
        .result-circle {
          border-radius:50%;
          width:${this.config.icon_size.result}px;
          height:${this.config.icon_size.result}px;
          display:flex;
          align-items:center;
          justify-content:center;
          color:#fff; font-weight:bold; margin:auto;
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

  // ------------------------------
  // RENDER JEDNEGO MECZU
  // ------------------------------
  _row(m) {
    // DATA + GODZINA / KONIEC
    let dateStr = "";
    let timeStr = "";

    if (m.date) {
      const raw = String(m.date);
      const dt = new Date(raw.replace(" ", "T"));
      if (!isNaN(dt.getTime())) {
        dateStr = dt.toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit", year: "numeric" });
        timeStr = dt.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });
      } else {
        const [d, t] = raw.split(" ");
        dateStr = d || "";
        timeStr = t || "";
      }
    }

    const bottomLine = m.finished ? "KONIEC" : timeStr;

    // NAZWY
    const full = this.config.full_team_names !== false;
    const home = full ? m.home : this._short(m.home);
    const away = full ? m.away : this._short(m.away);

    // WYNIK
    const [hs, as] = (m.score || "-").split("-");
    const homeClass = m.result === "win" ? "bold" : m.result === "loss" ? "dim" : "";
    const awayClass = m.result === "loss" ? "bold" : m.result === "win" ? "dim" : "";

    return `
      <tr style="${this._gradient(m)}">

        <td style="width:10%; text-align:center;">
          <div style="font-size:${this.config.font_size.date}rem">${dateStr}</div>
          <div style="font-size:${this.config.font_size.status}rem">${bottomLine}</div>
        </td>

        <td class="league-cell" style="width:10%; text-align:center;">
          ${this._league(m.league)}
        </td>

        ${
          this.config.show_logos
            ? `<td class="crest-cell dual-cell" style="width:10%;">
                 <img src="${m.logo_home}" height="${this.config.icon_size.crest}">
                 <img src="${m.logo_away}" height="${this.config.icon_size.crest}">
               </td>`
            : ""
        }

        <td class="team-cell">
          <div class="team-row ${homeClass}" style="font-size:${this.config.font_size.teams}rem">${home}</div>
          <div class="team-row ${awayClass}" style="font-size:${this.config.font_size.teams}rem">${away}</div>
        </td>

        <td class="score-cell" style="width:10%;">
          <div class="${homeClass}" style="font-size:${this.config.font_size.score}rem">${hs}</div>
          <div class="${awayClass}" style="font-size:${this.config.font_size.score}rem">${as}</div>
        </td>

        <td class="result-cell" style="width:8%;">
          ${
            this.config.show_result_symbols && m.result
              ? `<div class="result-circle" style="background:${this.config.colors[m.result]}">
                   ${m.result.charAt(0).toUpperCase()}
                 </div>`
              : ""
          }
        </td>

      </tr>
    `;
  }

  _short(name) {
    if (!name) return "";
    return name.split(" ").filter(Boolean)[0];
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
      code === "L" ? "ekstraklasa.png" :
      code === "PP" ? "puchar.png" : null;

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

  // ------------------------------
  // EDYTOR + STUB CONFIG
  // ------------------------------
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
