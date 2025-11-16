// Matches Card (90minut) – version 0.3.022
// Auto-generated build: karta + edytor w jednym pliku

// ============================================================================
//  Matches Card (90minut) – v0.3.000 (RESTORED BASE) + FULL EDITOR SUPPORT
//  Author: GieOeRZet
// ============================================================================

class MatchesCard extends HTMLElement {
  setConfig(config) {
    if (!config.entity) {
      throw new Error("Entity is required (np. sensor.90minut_gornik_zabrze_matches)");
    }

    this.config = {
      name: "90minut Matches",
      show_name: true,
      show_logos: true,
      full_team_names: true,
      show_result_symbols: true,

      fill_mode: config.fill_mode || "gradient", // "gradient" / "zebra"

      font_size: {
        date:   config.font_size?.date   ?? 0.9,
        status: config.font_size?.status ?? 0.8,
        teams:  config.font_size?.teams  ?? 1.0,
        score:  config.font_size?.score  ?? 1.0,
      },

      icon_size: {
        league: config.icon_size?.league ?? 26,
        crest:  config.icon_size?.crest  ?? 24,
        result: config.icon_size?.result ?? 26,
      },

      colors: {
        win:  config.colors?.win  ?? "#3ba55d",
        draw: config.colors?.draw ?? "#468cd2",
        loss: config.colors?.loss ?? "#e23b3b",
      },

      gradient: {
        alpha_start: typeof config.gradient?.alpha_start === "number"
          ? config.gradient.alpha_start
          : 0.0,
        alpha_end: typeof config.gradient?.alpha_end === "number"
          ? config.gradient.alpha_end
          : (typeof config.gradient?.alpha === "number" ? config.gradient.alpha : 0.55),
        start: typeof config.gradient?.start === "number" ? config.gradient.start : 35,
        end:   typeof config.gradient?.end   === "number" ? config.gradient.end   : 100,
      },

      zebra_color: config.zebra_color ?? "#f0f0f0",
      zebra_alpha: typeof config.zebra_alpha === "number" ? config.zebra_alpha : 0.4,

      lite_mode: config.lite_mode ?? false,

      ...config,
    };
  }

  set hass(hass) {
    this._hass = hass;
    const entityId = this.config.entity;
    const stateObj = hass.states[entityId];

    if (!stateObj) {
      this.innerHTML = "<ha-card>Encja nie istnieje.</ha-card>";
      return;
    }

    const matches = stateObj.attributes.matches || [];

    const zebraCSS =
      this.config.fill_mode === "zebra"
        ? `tr:nth-child(even){background-color:${this._rgba(this.config.zebra_color, this.config.zebra_alpha)};}`
        : "";

    const style = `
      <style>
        ha-card {
          padding: 10px 0;
          font-family: "Sofascore Sans", Arial, sans-serif;
        }
        table { width: 100%; border-collapse: collapse; }
        td { text-align:center; vertical-align:middle; padding:4px 6px; }
        tr { border-bottom:1px solid rgba(0,0,0,0.1); }

        .dual-cell {
          display:flex;
          flex-direction:column;
          justify-content:center;
          align-items:center;
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

    const rows = matches.map((m) => this._renderRow(m)).join("");

    // LITE MODE – bez ha-card, bez nagłówka
    if (this.config.lite_mode) {
      this.innerHTML = `
        ${style}
        <table>${rows}</table>
      `;
      return;
    }

    const cardName =
      this.config.show_name === false
        ? ""
        : this.config.name || stateObj.attributes.friendly_name || "90minut Matches";

    this.innerHTML = `
      ${style}
      <ha-card ${cardName ? `header="${cardName}"` : ""}>
        <table>${rows}</table>
      </ha-card>
    `;
  }

  // ----------------------
  // POJEDYNCZY WIERSZ
  // ----------------------
  _renderRow(match) {
    const rawDate = match.date ? match.date.replace(" ", "T") : null;
    const dateObj = rawDate ? new Date(rawDate) : null;

    const dateStr = dateObj
      ? dateObj.toLocaleDateString("pl-PL", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "-";

    const timeStr = match.finished
      ? "KONIEC"
      : dateObj
      ? dateObj.toLocaleTimeString("pl-PL", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

    const fullNames = this.config.full_team_names ?? true;

    const homeTeam = fullNames ? match.home : (match.home || "").split(" ")[0];
    const awayTeam = fullNames ? match.away : (match.away || "").split(" ")[0];

    const [homeScore, awayScore] = (match.score || "-").split("-");

    const leagueIcon = this._leagueIcon(match.league);

    const gradientCSS =
      this.config.fill_mode === "gradient" && match.result
        ? this._gradientCSS(match.result)
        : "";

    const homeBold =
      match.result === "win" ? "bold" : match.result === "loss" ? "dim" : "";
    const awayBold =
      match.result === "loss" ? "bold" : match.result === "win" ? "dim" : "";

    return `
      <tr style="${gradientCSS}">
        <td style="width:10%;">
          <div style="font-size:${this.config.font_size.date}rem;">${dateStr}</div>
          <div style="font-size:${this.config.font_size.status}rem;">${timeStr}</div>
        </td>

        <td style="width:10%;">
          ${
            leagueIcon
              ? `<img src="${leagueIcon}" height="${this.config.icon_size.league}" style="margin:auto;">`
              : `<div style="font-size:0.9em;opacity:0.8;">${match.league}</div>`
          }
        </td>

        ${
          this.config.show_logos
            ? `<td class="dual-cell" style="width:10%;">
                 <div>
                   <img src="${match.logo_home}" height="${this.config.icon_size.crest}"
                        style="background:white;border-radius:6px;padding:2px;" />
                 </div>
                 <div>
                   <img src="${match.logo_away}" height="${this.config.icon_size.crest}"
                        style="background:white;border-radius:6px;padding:2px;" />
                 </div>
               </td>`
            : ""
        }

        <td class="team-cell">
          <div class="team-row ${homeBold}" style="font-size:${this.config.font_size.teams}rem;">
            ${homeTeam}
          </div>
          <div class="team-row ${awayBold}" style="font-size:${this.config.font_size.teams}rem;">
            ${awayTeam}
          </div>
        </td>

        <td class="dual-cell" style="width:10%;">
          <div class="${homeBold}" style="font-size:${this.config.font_size.score}rem;">
            ${homeScore}
          </div>
          <div class="${awayBold}" style="font-size:${this.config.font_size.score}rem;">
            ${awayScore}
          </div>
        </td>

        <td class="result-cell" style="width:8%;">
          ${
            this.config.show_result_symbols && match.result
              ? `<div class="result-circle" style="background-color:${this.config.colors[match.result]}">
                   ${match.result.charAt(0).toUpperCase()}
                 </div>`
              : ""
          }
        </td>
      </tr>
    `;
  }

  // ----------------------
  // HELPERY
  // ----------------------
  _rgba(hex, alpha) {
    const h = (hex || "").replace("#", "");
    if (h.length !== 6) {
      return `rgba(0,0,0,${alpha})`;
    }
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  _gradientCSS(result) {
    const col = this.config.colors[result] || "#000000";
    const g = this.config.gradient || {};

    const start = typeof g.start === "number" ? g.start : 35;
    const end   = typeof g.end   === "number" ? g.end   : 100;

    const aStart = typeof g.alpha_start === "number" ? g.alpha_start : 0.0;
    const aEnd   = typeof g.alpha_end   === "number" ? g.alpha_end   : 0.55;

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
      code === "L"  ? "ekstraklasa.png" :
      code === "PP" ? "puchar.png" :
      null;

    if (!file) return null;

    // tylko GitHub; jak nie znajdzie – pokaż tekst ligi
    return `https://raw.githubusercontent.com/GieOeRZet/matches-card/main/logo/${file}`;
  }

  // ----------------------
  // EDYTOR
  // ----------------------
  static getConfigElement() {
    return document.createElement("matches-card-editor");
  }

  static getStubConfig() {
    return {
      entity: "",
    };
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
  description: "Karta pokazująca mecze z sensora 90minut.pl",
});

// ========== EDYTOR ========== 

class MatchesCardEditor extends HTMLElement {

  constructor() {
    super();
    this._config = {};
    this._updateTimeout = null;
    this.attachShadow({ mode: "open" });
  }

  setConfig(config) {
    this._config = JSON.parse(JSON.stringify(config || {}));
    this.render();
  }

  set hass(hass) {
    this._hass = hass;
  }

  // Debounce — 700ms
  _debounceSave() {
    clearTimeout(this._updateTimeout);
    this._updateTimeout = setTimeout(() => {
      const event = new CustomEvent("config-changed", {
        detail: { config: this._config },
        bubbles: true,
        composed: true,
      });
      this.dispatchEvent(event);
    }, 700);
  }

  _inputChanged(ev, path) {
    const value = ev.target.type === "number"
      ? Number(ev.target.value)
      : ev.target.value;

    let ref = this._config;
    const parts = path.split(".");

    while (parts.length > 1) {
      const p = parts.shift();
      if (!ref[p]) ref[p] = {};
      ref = ref[p];
    }
    ref[parts[0]] = value;

    this._debounceSave();
  }

  _toggleChanged(ev, path) {
    let ref = this._config;
    const parts = path.split(".");

    while (parts.length > 1) {
      const p = parts.shift();
      if (!ref[p]) ref[p] = {};
      ref = ref[p];
    }

    ref[parts[0]] = ev.target.checked;
    this._debounceSave();
  }

  _renderSwitch(title, path) {
    const val = this._get(path);
    return `
      <ha-formfield label="${title}">
        <ha-switch .checked=${val === true}
          @change=${(ev) => this._toggleChanged(ev, path)}>
        </ha-switch>
      </ha-formfield>
    `;
  }

  _renderNumber(title, path, min = 0, max = 999, step = 1) {
    const val = this._get(path);
    return `
      <div class="form-row">
        <label>${title}</label>
        <ha-textfield
          type="number"
          min="${min}"
          max="${max}"
          step="${step}"
          .value="${val}"
          @input=${(ev) => this._inputChanged(ev, path)}
        ></ha-textfield>
      </div>
    `;
  }

  _renderColor(title, path) {
    const val = this._get(path);
    return `
      <div class="form-row">
        <label>${title}</label>
        <input type="color" class="color-input"
          .value="${val}"
          @input=${(ev) => this._inputChanged(ev, path)}>
      </div>
    `;
  }

  _renderSection(title, content) {
    return `
      <ha-expansion-panel>
        <span slot="header">${title}</span>
        <div class="section-body">
          ${content}
        </div>
      </ha-expansion-panel>
    `;
  }

  _get(path) {
    const parts = path.split(".");
    let ref = this._config;
    for (const p of parts) {
      ref = ref?.[p];
    }
    return ref;
  }

  render() {
    if (!this.shadowRoot) return;

    this.shadowRoot.innerHTML = `
      <style>
        .section-body {
          padding: 12px 6px 14px 6px;
        }
        .form-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 0;
        }
        .form-row label {
          color: var(--primary-text-color);
          font-size: 15px;
        }
        ha-textfield {
          width: 110px;
        }
        input.color-input {
          width: 60px !important;
          height: 32px !important;
          border: none;
          border-radius: 6px;
        }
      </style>

      <ha-card>
        ${this._renderSection("Ogólne", `
          ${this._renderSwitch("Pokaż nazwę", "show_name")}
          ${this._renderSwitch("Tryb LITE", "lite_mode")}
        `)}

        ${this._renderSection("Drużyny / Herby", `
          ${this._renderSwitch("Pokaż herby", "show_logos")}
          ${this._renderSwitch("Pełne nazwy", "full_team_names")}
          ${this._renderNumber("Ikona liga (px)", "icon_size.league", 10, 100, 1)}
          ${this._renderNumber("Herb (px)", "icon_size.crest", 10, 100, 1)}
          ${this._renderNumber("Symbol W/P/R (px)", "icon_size.result", 10, 120, 1)}
        `)}

        ${this._renderSection("Wyniki W/P/R", `
          ${this._renderSwitch("Pokaż symbole W/P/R", "show_result_symbols")}
          ${this._renderColor("Kolor WYGRANA", "colors.win")}
          ${this._renderColor("Kolor REMIS", "colors.draw")}
          ${this._renderColor("Kolor PORAŻKA", "colors.loss")}
        `)}

        ${this._renderSection("Gradient", `
          ${this._renderNumber("Start (%)", "gradient.start", 0, 100, 1)}
          ${this._renderNumber("Koniec (%)", "gradient.end", 0, 100, 1)}
          ${this._renderNumber("Alfa Start", "gradient.alpha_start", 0, 1, 0.01)}
          ${this._renderNumber("Alfa Koniec", "gradient.alpha_end", 0, 1, 0.01)}
        `)}

        ${this._renderSection("Zebra", `
          ${this._renderColor("Kolor zebry", "zebra_color")}
          ${this._renderNumber("Alfa zebry", "zebra_alpha", 0, 1, 0.01)}
        `)}

        ${this._renderSection("Czcionki", `
          ${this._renderNumber("Data (rem)", "font_size.date", 0.1, 5, 0.05)}
          ${this._renderNumber("Status (rem)", "font_size.status", 0.1, 5, 0.05)}
          ${this._renderNumber("Drużyny (rem)", "font_size.teams", 0.1, 5, 0.05)}
          ${this._renderNumber("Wynik (rem)", "font_size.score", 0.1, 5, 0.05)}
        `)}
      </ha-card>
    `;
  }
}

customElements.define("matches-card-editor", MatchesCardEditor);