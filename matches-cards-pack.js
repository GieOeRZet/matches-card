// Matches Cards Pack – version 0.3.109
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
//  Matches Card Editor – FIXED (value binding + working config-changed)
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
      </style>

      <details class="group" open>
        <summary>Podstawowe</summary>
        <div>
          <label>
            Nazwa karty
            <input id="name" type="text" value="${c.name ?? ''}">
          </label>

          <label>
            Pokaż herby
            <ha-switch id="show_logos" ?checked="${c.show_logos !== false}"></ha-switch>
          </label>

          <label>
            Pełne nazwy
            <ha-switch id="full_team_names" ?checked="${c.full_team_names !== false}"></ha-switch>
          </label>

          <label>
            W/D/L symbole
            <ha-switch id="show_result_symbols" ?checked="${c.show_result_symbols !== false}"></ha-switch>
          </label>

          <label>
            Tryb LITE
            <ha-switch id="lite_mode" ?checked="${c.lite_mode === true}"></ha-switch>
          </label>
        </div>
      </details>

      <details class="group">
        <summary>Czcionki</summary>
        <div>
          <label>Data
            <input id="date" type="number" step="0.1" value="${c.font_size?.date ?? 0.9}">
          </label>

          <label>Status
            <input id="status" type="number" step="0.1" value="${c.font_size?.status ?? 0.8}">
          </label>

          <label>Drużyny
            <input id="teams" type="number" step="0.1" value="${c.font_size?.teams ?? 1.0}">
          </label>

          <label>Wynik
            <input id="score" type="number" step="0.1" value="${c.font_size?.score ?? 1.0}">
          </label>
        </div>
      </details>

      <details class="group">
        <summary>Ikony</summary>
        <div>
          <label>Liga
            <input id="league" type="number" value="${c.icon_size?.league ?? 26}">
          </label>
          <label>Herby
            <input id="crest" type="number" value="${c.icon_size?.crest ?? 24}">
          </label>
          <label>W/D/L
            <input id="result" type="number" value="${c.icon_size?.result ?? 26}">
          </label>
        </div>
      </details>
    `;

    // ===============================
    //  BIND INPUTS → CONFIG
    // ===============================
    const bind = (id, key, nested = null) => {
      const el = this.shadowRoot.getElementById(id);
      if (!el) return;

      el.addEventListener("input", (e) => {
        if (nested) {
          this._config[nested][key] = Number(e.target.value);
          this._debounceUpdate(nested, { ...this._config[nested] });
        } else {
          this._debounceUpdate(key, e.target.type === "number"
            ? Number(e.target.value)
            : e.target.value);
        }
      });

      el.addEventListener("change", (e) => {
        if (nested) {
          this._config[nested][key] = Number(e.target.value);
          this._debounceUpdate(nested, { ...this._config[nested] });
        } else {
          this._debounceUpdate(key, e.target.checked ?? e.target.value);
        }
      });
    };

    // PODSTAWOWE
    bind("name", "name");
    bind("show_logos", "show_logos");
    bind("full_team_names", "full_team_names");
    bind("show_result_symbols", "show_result_symbols");
    bind("lite_mode", "lite_mode");

    // FONTS
    bind("date", "date", "font_size");
    bind("status", "status", "font_size");
    bind("teams", "teams", "font_size");
    bind("score", "score", "font_size");

    // ICONS
    bind("league", "league", "icon_size");
    bind("crest", "crest", "icon_size");
    bind("result", "result", "icon_size");
  }

  static getConfigElement() { return this; }
  static getStubConfig() { return {}; }
}

customElements.define("matches-card-editor", MatchesCardEditor);
// ===== FILE INCLUDED: dist/matches-card.js =====
// ============================================================================
//  Matches Card (90minut) – v0.3.000 (RESTORED BASE) + FIXES
// ============================================================================

class MatchesCard extends HTMLElement {

  setConfig(config) {
    if (!config.entity) throw new Error("Entity is required");

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
        loss: config.colors?.loss ?? "#e23b3b",
      },

      gradient: {
        start: config.gradient?.start ?? 35,
        end: config.gradient?.end ?? 100,
        alpha_start: config.gradient?.alpha_start ?? 0.0,
        alpha_end: config.gradient?.alpha_end ?? 0.55,
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
          display:flex;
          flex-direction:column;
          gap:4px;
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
          justify-content:center;
          align-items:center;
          color:white;
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

    const statusStr = m.status || m.competition || "";

    return `
      <tr style="${this._gradient(m)}">

        <!-- DATA -->
        <td style="width:10%; text-align:center;">
          <div style="font-size:${this.config.font_size.date}rem">${m.date}</div>
          <div style="font-size:${this.config.font_size.status}rem">${statusStr}</div>
        </td>

        <!-- LIGA -->
        <td class="league-cell" style="width:10%; text-align:center;">
          ${this._league(m.league)}
        </td>

        <!-- HERBY -->
        ${this.config.show_logos ? `
          <td class="crest-cell" style="width:10%;">
            <img src="${m.logo_home}" height="${this.config.icon_size.crest}">
            <img src="${m.logo_away}" height="${this.config.icon_size.crest}">
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
      code === "PP" ? "puchar.png" :
      null;

    if (!file) return `<div>${code}</div>`;

    return `<img src="https://raw.githubusercontent.com/GieOeRZet/matches-card/main/logo/${file}"
                height="${this.config.icon_size.league}">`;
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
  description: "Karta pokazująca mecze 90minut.pl"
});
