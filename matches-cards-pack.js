// Matches Cards Pack – version 0.3.101
// Auto-generated from dist/ folder

// ========== FILE: dist/matches-card-editor.js ==========
// ============================================================================
//  Matches Card Editor – v0.3.051 (pełny, nowoczesny, kompatybilny)
//  Obsługuje wszystkie pola YAML + debounce 700 ms + odczyt wartości
// ============================================================================

(function () {
  const DEFAULT_CONFIG = {
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

  const deepMerge = (target, source) => {
    if (!source) return target;
    Object.keys(source).forEach((key) => {
      const sv = source[key];
      if (sv && typeof sv === "object" && !Array.isArray(sv)) {
        if (!target[key] || typeof target[key] !== "object") {
          target[key] = {};
        }
        deepMerge(target[key], sv);
      } else {
        target[key] = sv;
      }
    });
    return target;
  };

  class MatchesCardEditor extends HTMLElement {
    constructor() {
      super();
      this._config = {};
      this._debouncers = {};
    }

    setConfig(config) {
      this._config = config || {};
      this._render();
    }

    set hass(hass) {
      this._hass = hass;
    }

    _effectiveConfig() {
      const base = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
      return deepMerge(base, this._config || {});
    }

    _dispatchConfig(config) {
      const ev = new Event("config-changed", {
        bubbles: true,
        composed: true,
      });
      ev.detail = { config };
      this.dispatchEvent(ev);
    }

    _updatePath(path, value) {
      const cfg = JSON.parse(JSON.stringify(this._config || {}));
      const keys = Array.isArray(path) ? path : String(path).split(".");
      let obj = cfg;
      for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        if (!obj[k] || typeof obj[k] !== "object") {
          obj[k] = {};
        }
        obj = obj[k];
      }
      obj[keys[keys.length - 1]] = value;
      this._config = cfg;
      this._dispatchConfig(cfg);
    }

    _debouncedUpdate(path, value) {
      const key = Array.isArray(path) ? path.join(".") : String(path);
      if (this._debouncers[key]) {
        clearTimeout(this._debouncers[key]);
      }
      this._debouncers[key] = setTimeout(() => {
        this._updatePath(path, value);
      }, 700);
    }

    _bindInput(selector, path, parser = (v) => v, debounced = true) {
      const el = this.querySelector(selector);
      if (!el) return;
      el.addEventListener("input", (ev) => {
        const v = parser(ev.target.value);
        if (debounced) this._debouncedUpdate(path, v);
        else this._updatePath(path, v);
      });
    }

    _bindCheckbox(selector, path) {
      const el = this.querySelector(selector);
      if (!el) return;
      el.addEventListener("change", (ev) => {
        this._updatePath(path, ev.target.checked);
      });
    }

    _render() {
      const cfg = this._effectiveConfig();

      this.innerHTML = `
        <style>
          .mc-editor {
            padding: 16px;
            font-family: var(--paper-font-body1_-_font-family, inherit);
          }
          .mc-section {
            margin-bottom: 20px;
            padding-bottom: 12px;
            border-bottom: 1px solid var(--divider-color, #ccc);
          }
          .mc-section:last-of-type {
            border-bottom: none;
          }
          .mc-section h3 {
            margin: 0 0 10px;
            font-size: 1.05rem;
            font-weight: 600;
          }
          .mc-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 10px 18px;
          }
          .mc-field {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }
          .mc-field label {
            font-size: 0.85rem;
            opacity: 0.9;
          }
          .mc-checkbox {
            width: 16px;
            height: 16px;
          }
          .mc-input,
          .mc-number,
          .mc-select {
            width: 100%;
            padding: 4px 6px;
            border-radius: 4px;
            border: 1px solid var(--divider-color, #aaa);
            background: var(--card-background-color, #fff);
            color: var(--primary-text-color, #000);
          }
          .mc-number {
            text-align: right;
          }
          .mc-color {
            width: 48px;
            height: 28px;
            border-radius: 4px;
            border: 1px solid var(--divider-color, #aaa);
          }
          .mc-note {
            font-size: 0.75rem;
            opacity: 0.7;
          }
        </style>

        <div class="mc-editor">

          <!-- PODSTAWY -->
          <div class="mc-section">
            <h3>Podstawy</h3>
            <div class="mc-grid">
              <div class="mc-field">
                <label>Encja sensora</label>
                <input id="mc-entity" class="mc-input" value="${cfg.entity || ""}">
              </div>

              <div class="mc-field">
                <label>Nazwa karty (header)</label>
                <input id="mc-name" class="mc-input" value="${cfg.name}">
              </div>

              <div class="mc-field">
                <label>
                  <input id="mc-show-name" class="mc-checkbox" type="checkbox"
                    ${cfg.show_name ? "checked" : ""}>
                  Pokaż nazwę karty
                </label>
              </div>

              <div class="mc-field">
                <label>
                  <input id="mc-show-logos" class="mc-checkbox" type="checkbox"
                    ${cfg.show_logos ? "checked" : ""}>
                  Pokaż herby drużyn
                </label>
              </div>

              <div class="mc-field">
                <label>
                  <input id="mc-full-names" class="mc-checkbox" type="checkbox"
                    ${cfg.full_team_names ? "checked" : ""}>
                  Pełne nazwy drużyn
                </label>
              </div>

              <div class="mc-field">
                <label>
                  <input id="mc-show-result-symbols" class="mc-checkbox" type="checkbox"
                    ${cfg.show_result_symbols ? "checked" : ""}>
                  Pokaż symbole W/P/R
                </label>
              </div>

              <div class="mc-field">
                <label>
                  <input id="mc-lite-mode" class="mc-checkbox" type="checkbox"
                    ${cfg.lite_mode ? "checked" : ""}>
                  Tryb LITE (bez tła ha-card)
                </label>
              </div>
            </div>
          </div>

          <!-- TRYB WYPEŁNIENIA -->
          <div class="mc-section">
            <h3>Tryb wypełnienia tła</h3>
            <div class="mc-grid">
              <div class="mc-field">
                <label>Tryb</label>
                <select id="mc-fill-mode" class="mc-select">
                  <option value="gradient" ${cfg.fill_mode === "gradient" ? "selected" : ""}>
                    Gradient (kolor wyniku meczu)
                  </option>
                  <option value="zebra" ${cfg.fill_mode === "zebra" ? "selected" : ""}>
                    Zebra (naprzemienne wiersze)
                  </option>
                </select>
              </div>
            </div>

            <div class="mc-grid" style="margin-top:12px;">

              <!-- GRADIENT -->
              <div class="mc-field">
                <label>Gradient – start (%)</label>
                <input id="mc-grad-start" class="mc-number" type="number"
                  min="0" max="100" step="1" value="${cfg.gradient.start}">
              </div>

              <div class="mc-field">
                <label>Gradient – koniec (%)</label>
                <input id="mc-grad-end" class="mc-number" type="number"
                  min="0" max="100" step="1" value="${cfg.gradient.end}">
              </div>

              <div class="mc-field">
                <label>Gradient – alfa początkowa</label>
                <input id="mc-grad-alpha-start" class="mc-number" type="number"
                  min="0" max="1" step="0.05" value="${cfg.gradient.alpha_start}">
              </div>

              <div class="mc-field">
                <label>Gradient – alfa końcowa</label>
                <input id="mc-grad-alpha-end" class="mc-number" type="number"
                  min="0" max="1" step="0.05" value="${cfg.gradient.alpha_end}">
              </div>

              <!-- ZEBRA -->
              <div class="mc-field">
                <label>Zebra – kolor</label>
                <input id="mc-zebra-color" class="mc-color" type="color" value="${cfg.zebra_color}">
              </div>

              <div class="mc-field">
                <label>Zebra – alfa</label>
                <input id="mc-zebra-alpha" class="mc-number" type="number"
                  min="0" max="1" step="0.05" value="${cfg.zebra_alpha}">
              </div>
            </div>
          </div>

          <!-- CZCIONKI -->
          <div class="mc-section">
            <h3>Czcionki</h3>
            <div class="mc-grid">

              <div class="mc-field">
                <label>Data – font-size (rem)</label>
                <input id="mc-font-date" class="mc-number" type="number"
                  step="0.1" value="${cfg.font_size.date}">
              </div>

              <div class="mc-field">
                <label>Status/KONIEC – font-size (rem)</label>
                <input id="mc-font-status" class="mc-number" type="number"
                  step="0.1" value="${cfg.font_size.status}">
              </div>

              <div class="mc-field">
                <label>Nazwy drużyn – font-size (rem)</label>
                <input id="mc-font-teams" class="mc-number" type="number"
                  step="0.1" value="${cfg.font_size.teams}">
              </div>

              <div class="mc-field">
                <label>Wynik – font-size (rem)</label>
                <input id="mc-font-score" class="mc-number" type="number"
                  step="0.1" value="${cfg.font_size.score}">
              </div>

            </div>
          </div>

          <!-- IKONY / KOLORY -->
          <div class="mc-section">
            <h3>Ikony i kolory</h3>
            <div class="mc-grid">

              <div class="mc-field">
                <label>Logo ligi – wysokość (px)</label>
                <input id="mc-icon-league" class="mc-number" type="number"
                  min="8" max="64" step="1" value="${cfg.icon_size.league}">
              </div>

              <div class="mc-field">
                <label>Herby – wysokość (px)</label>
                <input id="mc-icon-crest" class="mc-number" type="number"
                  min="8" max="64" step="1" value="${cfg.icon_size.crest}">
              </div>

              <div class="mc-field">
                <label>Ikony W/P/R – rozmiar (px)</label>
                <input id="mc-icon-result" class="mc-number" type="number"
                  min="8" max="64" step="1" value="${cfg.icon_size.result}">
              </div>

              <div class="mc-field">
                <label>Kolor WYGRANA (W)</label>
                <input id="mc-color-win" class="mc-color" type="color" value="${cfg.colors.win}">
              </div>

              <div class="mc-field">
                <label>Kolor REMIS (R)</label>
                <input id="mc-color-draw" class="mc-color" type="color" value="${cfg.colors.draw}">
              </div>

              <div class="mc-field">
                <label>Kolor PORAŻKA (P)</label>
                <input id="mc-color-loss" class="mc-color" type="color" value="${cfg.colors.loss}">
              </div>

            </div>
          </div>

        </div>
      `;

      // 🌐 POWIĄZANIA (inputy, checkboksy, select)

      // podstawy
      this._bindInput("#mc-entity", "entity", (v) => v);
      this._bindInput("#mc-name", "name", (v) => v);

      this._bindCheckbox("#mc-show-name", "show_name");
      this._bindCheckbox("#mc-show-logos", "show_logos");
      this._bindCheckbox("#mc-full-names", "full_team_names");
      this._bindCheckbox("#mc-show-result-symbols", "show_result_symbols");
      this._bindCheckbox("#mc-lite-mode", "lite_mode");

      // fill_mode
      const fillMode = this.querySelector("#mc-fill-mode");
      if (fillMode) {
        fillMode.addEventListener("change", (ev) => {
          this._updatePath("fill_mode", ev.target.value);
        });
      }

      // gradient
      this._bindInput(
        "#mc-grad-start",
        "gradient.start",
        (v) => parseInt(v || "0", 10)
      );
      this._bindInput(
        "#mc-grad-end",
        "gradient.end",
        (v) => parseInt(v || "0", 10)
      );
      this._bindInput(
        "#mc-grad-alpha-start",
        "gradient.alpha_start",
        (v) => parseFloat(v || "0")
      );
      this._bindInput(
        "#mc-grad-alpha-end",
        "gradient.alpha_end",
        (v) => parseFloat(v || "0")
      );

      // zebra
      this._bindInput("#mc-zebra-color", "zebra_color", (v) => v);
      this._bindInput(
        "#mc-zebra-alpha",
        "zebra_alpha",
        (v) => parseFloat(v || "0")
      );

      // fonty
      this._bindInput(
        "#mc-font-date",
        "font_size.date",
        (v) => parseFloat(v || "0")
      );
      this._bindInput(
        "#mc-font-status",
        "font_size.status",
        (v) => parseFloat(v || "0")
      );
      this._bindInput(
        "#mc-font-teams",
        "font_size.teams",
        (v) => parseFloat(v || "0")
      );
      this._bindInput(
        "#mc-font-score",
        "font_size.score",
        (v) => parseFloat(v || "0")
      );

      // ikony
      this._bindInput(
        "#mc-icon-league",
        "icon_size.league",
        (v) => parseInt(v || "0", 10)
      );
      this._bindInput(
        "#mc-icon-crest",
        "icon_size.crest",
        (v) => parseInt(v || "0", 10)
      );
      this._bindInput(
        "#mc-icon-result",
        "icon_size.result",
        (v) => parseInt(v || "0", 10)
      );

      // kolory W/P/R
      this._bindInput("#mc-color-win", "colors.win", (v) => v);
      this._bindInput("#mc-color-draw", "colors.draw", (v) => v);
      this._bindInput("#mc-color-loss", "colors.loss", (v) => v);
    }
  }

  if (!customElements.get("matches-card-editor")) {
    customElements.define("matches-card-editor", MatchesCardEditor);
  }
})();
// ========== FILE: dist/matches-card.js ==========
// ============================================================================
//  Matches Card (90minut) – v0.3.051
//  Author: GieOeRZet
//
//  Bazuje na 0.3.022 + poprawki:
//   1) Herby – równomierne rozłożenie w pionie (dual-cell, space-between)
//   2) Większy odstęp między logo ligi a herbami
//   3) Wynik w dwóch wierszach (jak nazwy drużyn), wyrównany wizualnie
//   4) Kolumna wyników W/P/R spójna z layoutem (flex, centrowanie)
//   5) Tryb lite_mode – całkowite usunięcie ha-card, zostaje tylko tabela
// ============================================================================

(function () {
  const DEFAULT_CONFIG = {
    name: "90minut Matches",
    show_name: true,
    show_logos: true,
    full_team_names: true,
    show_result_symbols: true,
    lite_mode: false,

    fill_mode: "gradient", // "gradient" | "zebra"

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

  const deepMerge = (target, source) => {
    if (!source) return target;
    Object.keys(source).forEach((key) => {
      const sv = source[key];
      if (sv && typeof sv === "object" && !Array.isArray(sv)) {
        if (!target[key] || typeof target[key] !== "object") {
          target[key] = {};
        }
        deepMerge(target[key], sv);
      } else {
        target[key] = sv;
      }
    });
    return target;
  };

  class MatchesCard extends HTMLElement {
    setConfig(config) {
      if (!config.entity) {
        throw new Error(
          "Entity is required (np. sensor.90minut_gornik_zabrze_matches)"
        );
      }

      // głęboka kopia domyślnej konfiguracji + merge z YAML
      this.config = deepMerge(
        JSON.parse(JSON.stringify(DEFAULT_CONFIG)),
        config || {}
      );
    }

    set hass(hass) {
      this._hass = hass;
      this._render();
    }

    _render() {
      if (!this._hass || !this.config) return;

      const state = this._hass.states[this.config.entity];
      if (!state) {
        this.innerHTML = "<ha-card>Encja nie istnieje.</ha-card>";
        return;
      }

      const matches = state.attributes.matches || [];

      const zebraCSS =
        this.config.fill_mode === "zebra"
          ? `tr:nth-child(even){background-color:${this._rgba(
              this.config.zebra_color,
              this.config.zebra_alpha
            )};}`
          : "";

      const style = `
        <style>
          ha-card {
            padding: 10px 0;
            font-family: "Sofascore Sans", Arial, sans-serif;
          }
          table { width: 100%; border-collapse: collapse; }
          td { text-align:center; vertical-align:middle; padding:2px 3px; }
          tr { border-bottom:1px solid rgba(0,0,0,0.1); }

          .dual-cell {
            display:flex;
            flex-direction:column;
            justify-content:space-between;   /* ZMIANA 1: równe odstępy góra/dół */
            align-items:center;
            height:100%;
            padding:2px 0;
          }

          .crest-cell {
            padding-left: 6px;              /* ZMIANA 2: większy odstęp od logo ligi */
          }

          .team-cell {
            text-align:left;
            padding-left:8px;
          }
          .team-row {
            display:flex;
            align-items:center;
            justify-content:flex-start;
            line-height:1.3em;
          }

          .score-cell {
            display:flex;                    /* ZMIANA 3: wynik jak nazwy drużyn */
            flex-direction:column;
            justify-content:space-between;
            align-items:center;
            height:100%;
            padding:2px 0;
          }
          .score-row {
            line-height:1.3em;
          }

          .result-cell {
            display:flex;                    /* ZMIANA 4: spójny layout kolumny W/P/R */
            align-items:center;
            justify-content:center;
            height:100%;
          }

          .bold { font-weight:600; }
          .dim  { opacity:0.8; }

          .result-circle {
            border-radius:50%;
            width:${this.config.icon_size.result}px;
            height:${this.config.icon_size.result}px;
            color:white;
            display:flex;
            justify-content:center;
            align-items:center;
            font-weight:bold;
            margin:0 auto;
          }

          ${zebraCSS}
        </style>
      `;

      const rows = matches.map((m) => this._row(m)).join("");

      // ZMIANA 5 – tryb lite: całkowicie bez ha-card
      if (this.config.lite_mode) {
        while (this.firstChild) this.removeChild(this.firstChild);
        const wrapper = document.createElement("div");
        wrapper.innerHTML = `${style}<table>${rows}</table>`;
        this.appendChild(wrapper);
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
      const rawDate = m.date ? m.date.replace(" ", "T") : null;
      const d = rawDate ? new Date(rawDate) : null;

      const dateStr = d
        ? d.toLocaleDateString("pl-PL", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
        : "-";

      const timeStr = m.finished
        ? "KONIEC"
        : d
        ? d.toLocaleTimeString("pl-PL", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "";

      const full = this.config.full_team_names;
      const home = full ? m.home : m.home?.split(" ")[0];
      const away = full ? m.away : m.away?.split(" ")[0];

      const [hs, as] = (m.score || "-").split("-");

      const league = this._leagueIcon(m.league);
      const grad = this._gradCSS(m.result);

      const hb =
        m.result === "win" ? "bold" : m.result === "loss" ? "dim" : "";
      const ab =
        m.result === "loss" ? "bold" : m.result === "win" ? "dim" : "";

      return `
        <tr style="${grad}">
          <!-- DATA / STATUS -->
          <td style="width:10%;">
            <div style="font-size:${this.config.font_size.date}rem;">${dateStr}</div>
            <div style="font-size:${this.config.font_size.status}rem;">${timeStr}</div>
          </td>

          <!-- LIGA -->
          <td style="width:10%;">
            ${
              league
                ? `<img src="${league}" height="${this.config.icon_size.league}">`
                : `<div style="font-size:0.9em;opacity:0.8;">${m.league}</div>`
            }
          </td>

          <!-- HERBY -->
          ${
            this.config.show_logos
              ? `
          <td class="dual-cell crest-cell" style="width:10%;">
            <img
              src="${m.logo_home}"
              height="${this.config.icon_size.crest}"
              style="background:white;border-radius:6px;padding:2px;"
            >
            <img
              src="${m.logo_away}"
              height="${this.config.icon_size.crest}"
              style="background:white;border-radius:6px;padding:2px;"
            >
          </td>`
              : ""
          }

          <!-- NAZWY DRUŻYN -->
          <td class="team-cell">
            <div class="team-row ${hb}" style="font-size:${this.config.font_size.teams}rem;">
              ${home}
            </div>
            <div class="team-row ${ab}" style="font-size:${this.config.font_size.teams}rem;">
              ${away}
            </div>
          </td>

          <!-- WYNIK: jak nazwy (ZMIANA 3) -->
          <td class="score-cell" style="width:10%;">
            <div class="score-row ${hb}" style="font-size:${this.config.font_size.score}rem;">
              ${hs}
            </div>
            <div class="score-row ${ab}" style="font-size:${this.config.font_size.score}rem;">
              ${as}
            </div>
          </td>

          <!-- KÓŁKO W/P/R -->
          <td class="result-cell" style="width:8%;">
            ${
              this.config.show_result_symbols && m.result
                ? `<div class="result-circle" style="background-color:${this.config.colors[m.result]}">
                     ${m.result.charAt(0).toUpperCase()}
                   </div>`
                : ""
            }
          </td>
        </tr>
      `;
    }

    _rgba(hex, a) {
      const h = (hex || "").replace("#", "");
      if (h.length !== 6) return `rgba(0,0,0,${a})`;
      const r = parseInt(h.substring(0, 2), 16);
      const g = parseInt(h.substring(2, 4), 16);
      const b = parseInt(h.substring(4, 6), 16);
      return `rgba(${r},${g},${b},${a})`;
    }

    _gradCSS(result) {
      if (!result || this.config.fill_mode !== "gradient") return "";
      const col = this.config.colors[result];
      const g = this.config.gradient || {};
      const start = typeof g.start === "number" ? g.start : 35;
      const end = typeof g.end === "number" ? g.end : 100;
      const aStart =
        typeof g.alpha_start === "number" ? g.alpha_start : 0.0;
      const aEnd = typeof g.alpha_end === "number" ? g.alpha_end : 0.55;

      return `background: linear-gradient(to right,
        rgba(0,0,0,0) 0%,
        ${this._rgba(col, aStart)} ${start}%,
        ${this._rgba(col, aEnd)} ${end}%,
        rgba(0,0,0,0) 100%
      );`;
    }

    _leagueIcon(code) {
      if (!code) return null;
      const file =
        code === "L"
          ? "ekstraklasa.png"
          : code === "PP"
          ? "puchar.png"
          : null;
      if (!file) return null;

      // tylko GitHub – jeśli obrazka brak, pokaż tekst ligi
      return `https://raw.githubusercontent.com/GieOeRZet/matches-card/main/logo/${file}`;
    }

    static getConfigElement() {
      return document.createElement("matches-card-editor");
    }

    static getStubConfig() {
      return {
        entity: "sensor.90minut_gornik_zabrze_matches",
      };
    }

    getCardSize() {
      return 6;
    }
  }

  if (!customElements.get("matches-card")) {
    customElements.define("matches-card", MatchesCard);
  }

  window.customCards = window.customCards || [];
  if (!window.customCards.find((c) => c.type === "matches-card")) {
    window.customCards.push({
      type: "matches-card",
      name: "Matches Card (90minut)",
      description: "Karta pokazująca mecze z sensora 90minut.pl (v0.3.051)",
    });
  }
})();
// ========== JSON INCLUDED: dist/hacs.json ==========
{
  "name": "Matches Card (90minut)",
  "filename": "matches-card.js",
  "content_in_root": true,
  "country": "PL",
  "homeassistant": "2023.5.0",
  "category": "plugin",
  "render_readme": true
}
// ========== JSON INCLUDED: dist/league-table-card-editor.json ==========
// ============================================================================
//  League Table Card Editor – v0.1.000
//  - Powiązany z league-table-card
//  - Debounce ~700 ms dla inputów
//  - Sekcje: Podstawy, Czcionki, Podświetlenia
// ============================================================================

(function () {
  const DEFAULT_CONFIG = {
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
      favorite_color: "#fff8e1",
      top_color: "#e8f5e9",
      bottom_color: "#ffebee",
    },
  };

  const deepMerge = (target, source) => {
    if (!source) return target;
    Object.keys(source).forEach((key) => {
      const sv = source[key];
      if (sv && typeof sv === "object" && !Array.isArray(sv)) {
        if (!target[key] || typeof target[key] !== "object") {
          target[key] = {};
        }
        deepMerge(target[key], sv);
      } else {
        target[key] = sv;
      }
    });
    return target;
  };

  class LeagueTableCardEditor extends HTMLElement {
    constructor() {
      super();
      this._config = {};
      this._debouncers = {};
    }

    setConfig(config) {
      this._config = config || {};
      this._render();
    }

    set hass(hass) {
      this._hass = hass;
    }

    _effectiveConfig() {
      const base = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
      return deepMerge(base, this._config || {});
    }

    _dispatchConfig(config) {
      const ev = new Event("config-changed", {
        bubbles: true,
        composed: true,
      });
      ev.detail = { config };
      this.dispatchEvent(ev);
    }

    _updatePath(path, value) {
      const cfg = JSON.parse(JSON.stringify(this._config || {}));
      const keys = Array.isArray(path) ? path : String(path).split(".");
      let obj = cfg;
      for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        if (!obj[k] || typeof obj[k] !== "object") {
          obj[k] = {};
        }
        obj = obj[k];
      }
      obj[keys[keys.length - 1]] = value;
      this._config = cfg;
      this._dispatchConfig(cfg);
    }

    _debouncedUpdate(path, value) {
      const key = Array.isArray(path) ? path.join(".") : String(path);
      if (this._debouncers[key]) {
        clearTimeout(this._debouncers[key]);
      }
      this._debouncers[key] = setTimeout(() => {
        this._updatePath(path, value);
      }, 700);
    }

    _bindInput(selector, path, parser = (v) => v, debounced = true) {
      const el = this.querySelector(selector);
      if (!el) return;
      el.addEventListener("input", (ev) => {
        const v = parser(ev.target.value);
        if (debounced) this._debouncedUpdate(path, v);
        else this._updatePath(path, v);
      });
    }

    _bindCheckbox(selector, path) {
      const el = this.querySelector(selector);
      if (!el) return;
      el.addEventListener("change", (ev) => {
        this._updatePath(path, ev.target.checked);
      });
    }

    _render() {
      const cfg = this._effectiveConfig();

      this.innerHTML = `
        <style>
          .ltce-root {
            padding: 16px;
            font-family: var(--paper-font-body1_-_font-family, inherit);
          }
          .ltce-section {
            margin-bottom: 20px;
            padding-bottom: 12px;
            border-bottom: 1px solid var(--divider-color, #ccc);
          }
          .ltce-section:last-of-type {
            border-bottom: none;
          }
          .ltce-section h3 {
            margin: 0 0 10px;
            font-size: 1.05rem;
            font-weight: 600;
          }
          .ltce-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 10px 18px;
          }
          .ltce-field {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }
          .ltce-field label {
            font-size: 0.85rem;
            opacity: 0.9;
          }
          .ltce-checkbox {
            width: 16px;
            height: 16px;
          }
          .ltce-input,
          .ltce-number,
          .ltce-select {
            width: 100%;
            padding: 4px 6px;
            border-radius: 4px;
            border: 1px solid var(--divider-color, #aaa);
            background: var(--card-background-color, #fff);
            color: var(--primary-text-color, #000);
          }
          .ltce-number {
            text-align: right;
          }
          .ltce-color {
            width: 48px;
            height: 28px;
            border-radius: 4px;
            border: 1px solid var(--divider-color, #aaa);
          }
          .ltce-note {
            font-size: 0.75rem;
            opacity: 0.7;
          }
        </style>

        <div class="ltce-root">

          <!-- PODSTAWY -->
          <div class="ltce-section">
            <h3>Podstawy</h3>
            <div class="ltce-grid">

              <div class="ltce-field">
                <label>Encja sensora</label>
                <input id="ltce-entity" class="ltce-input" value="${cfg.entity || ""}">
              </div>

              <div class="ltce-field">
                <label>Nazwa karty (header)</label>
                <input id="ltce-name" class="ltce-input" value="${cfg.name}">
              </div>

              <div class="ltce-field">
                <label>
                  <input id="ltce-show-name" class="ltce-checkbox" type="checkbox"
                    ${cfg.show_name ? "checked" : ""}>
                  Pokaż nazwę karty
                </label>
              </div>

              <div class="ltce-field">
                <label>
                  <input id="ltce-lite-mode" class="ltce-checkbox" type="checkbox"
                    ${cfg.lite_mode ? "checked" : ""}>
                  Tryb LITE (bez tła ha-card)
                </label>
              </div>

              <div class="ltce-field">
                <label>
                  <input id="ltce-show-trend" class="ltce-checkbox" type="checkbox"
                    ${cfg.show_trend ? "checked" : ""}>
                  Pokaż kolumnę TREND
                </label>
                <div class="ltce-note">
                  TREND korzysta z pola <code>trend</code> w każdym wierszu tabeli (opcjonalne).
                </div>
              </div>

            </div>
          </div>

          <!-- CZCIONKI -->
          <div class="ltce-section">
            <h3>Czcionki</h3>
            <div class="ltce-grid">

              <div class="ltce-field">
                <label>Nagłówek kolumn – font-size (rem)</label>
                <input id="ltce-font-header" class="ltce-number" type="number"
                  step="0.1" value="${cfg.font_size.header}">
              </div>

              <div class="ltce-field">
                <label>Wiersze – font-size (rem)</label>
                <input id="ltce-font-row" class="ltce-number" type="number"
                  step="0.1" value="${cfg.font_size.row}">
              </div>

              <div class="ltce-field">
                <label>Nazwa drużyny – font-size (rem)</label>
                <input id="ltce-font-team" class="ltce-number" type="number"
                  step="0.1" value="${cfg.font_size.team}">
              </div>

            </div>
          </div>

          <!-- PODŚWIETLENIA -->
          <div class="ltce-section">
            <h3>Podświetlenia – TOP / spadkowe / moja drużyna</h3>
            <div class="ltce-grid">

              <div class="ltce-field">
                <label>
                  <input id="ltce-highlight-favorite" class="ltce-checkbox" type="checkbox"
                    ${cfg.highlight.favorite ? "checked" : ""}>
                  Podświetl moją drużynę
                </label>
                <div class="ltce-note">
                  Moja drużyna = wiersz o pozycji <code>my_position</code> z sensora.
                </div>
              </div>

              <div class="ltce-field">
                <label>TOP – ile pierwszych drużyn podświetlić</label>
                <input id="ltce-highlight-top-count" class="ltce-number" type="number"
                  min="0" max="10" step="1" value="${cfg.highlight.top_count}">
              </div>

              <div class="ltce-field">
                <label>SPADKOWE – ile ostatnich drużyn podświetlić</label>
                <input id="ltce-highlight-bottom-count" class="ltce-number" type="number"
                  min="0" max="10" step="1" value="${cfg.highlight.bottom_count}">
              </div>

              <div class="ltce-field">
                <label>Kolor mojej drużyny</label>
                <input id="ltce-highlight-favorite-color" class="ltce-color"
                  type="color" value="${cfg.highlight.favorite_color}">
              </div>

              <div class="ltce-field">
                <label>Kolor TOP</label>
                <input id="ltce-highlight-top-color" class="ltce-color"
                  type="color" value="${cfg.highlight.top_color}">
              </div>

              <div class="ltce-field">
                <label>Kolor SPADKOWE</label>
                <input id="ltce-highlight-bottom-color" class="ltce-color"
                  type="color" value="${cfg.highlight.bottom_color}">
              </div>

            </div>
          </div>

        </div>
      `;

      // POWIĄZANIA

      // podstawy
      this._bindInput("#ltce-entity", "entity", (v) => v);
      this._bindInput("#ltce-name", "name", (v) => v);
      this._bindCheckbox("#ltce-show-name", "show_name");
      this._bindCheckbox("#ltce-lite-mode", "lite_mode");
      this._bindCheckbox("#ltce-show-trend", "show_trend");

      // fonty
      this._bindInput(
        "#ltce-font-header",
        "font_size.header",
        (v) => parseFloat(v || "0")
      );
      this._bindInput(
        "#ltce-font-row",
        "font_size.row",
        (v) => parseFloat(v || "0")
      );
      this._bindInput(
        "#ltce-font-team",
        "font_size.team",
        (v) => parseFloat(v || "0")
      );

      // highlight
      this._bindCheckbox("#ltce-highlight-favorite", "highlight.favorite");
      this._bindInput(
        "#ltce-highlight-top-count",
        "highlight.top_count",
        (v) => parseInt(v || "0", 10)
      );
      this._bindInput(
        "#ltce-highlight-bottom-count",
        "highlight.bottom_count",
        (v) => parseInt(v || "0", 10)
      );
      this._bindInput(
        "#ltce-highlight-favorite-color",
        "highlight.favorite_color",
        (v) => v
      );
      this._bindInput(
        "#ltce-highlight-top-color",
        "highlight.top_color",
        (v) => v
      );
      this._bindInput(
        "#ltce-highlight-bottom-color",
        "highlight.bottom_color",
        (v) => v
      );
    }
  }

  if (!customElements.get("league-table-card-editor")) {
    customElements.define("league-table-card-editor", LeagueTableCardEditor);
  }
})();
// ========== JSON INCLUDED: dist/league-table-card.json ==========
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
// ========== JSON INCLUDED: dist/manifest.json ==========
{
  "domain": "matches-card",
  "name": "Matches Card (90minut)",
  "version": "0.0.0",
  "documentation": "https://github.com/GieOeRZet/matches-card",
  "type": "module",
  "render_readme": true,
  "resources": [
    {
      "file": "matches-card.js",
      "type": "module"
    }
  ]
}
