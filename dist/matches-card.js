// ============================================================================
//  Matches Card (90minut) – FINAL FIXED VERSION
//  - 2-linia data/status
//  - krótka nazwa = pierwsze słowo
//  - W/D/L osobna kolumna
//  - odstęp liga → herby
//  - wynik wyrównany do drużyn (vertical-match)
//  - tryb LITE usuwa ha-card w całości
//  - brak undefined
//  - działa z edytorem (config-changed)
// ============================================================================

class MatchesCard extends HTMLElement {

  setConfig(config) {
    if (!config.entity) throw new Error("Entity is required");

    const defaults = {
      name: "90minut Matches",
      show_name: true,
      show_logos: true,
      full_team_names: true,
      show_result_symbols: true,
      fill_mode: "gradient",

      font_size: { date: 0.9, status: 0.8, teams: 1.0, score: 1.0 },
      icon_size: { league: 26, crest: 24, result: 26 },

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
      zebra_alpha: 0.4,

      lite_mode: false
    };

    this.config = JSON.parse(JSON.stringify(defaults));
    this._mergeDeep(this.config, config);
  }

  _mergeDeep(target, source) {
    for (const key in source) {
      if (source[key] !== null && typeof source[key] === "object" && !Array.isArray(source[key])) {
        if (!target[key]) target[key] = {};
        this._mergeDeep(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  // ----------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------
  _render() {
    const entity = this._hass.states[this.config.entity];
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

        .league-cell { padding-right:12px; }

        .team-cell { text-align:left; padding-left:8px; line-height:1.25em; }

        .score-cell {
          display:flex;
          flex-direction:column;
          justify-content:center;
          align-items:center;
          line-height:1.25em;
        }

        .result-circle {
          border-radius:50%;
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

    const body = matches.map(m => this._row(m)).join("");

    if (this.config.lite_mode) {
      // tryb LITE → bez ha-card
      this.innerHTML = `${style}<table>${body}</table>`;
      return;
    }

    const header = this.config.show_name ? `header="${this.config.name}"` : "";

    this.innerHTML = `
      ${style}
      <ha-card ${header}>
        <table>${body}</table>
      </ha-card>
    `;
  }

  // ----------------------------------------------------------
  // POJEDYNCZY WIERSZ
  // ----------------------------------------------------------
  _row(m) {
    const date = m.date || "-";
    const time = m.finished ? "KONIEC" : (m.status || "");

    const homeName = this.config.full_team_names ? m.home : m.home.split(" ")[0];
    const awayName = this.config.full_team_names ? m.away : m.away.split(" ")[0];

    const [homeScore, awayScore] = (m.score || "-").split("-");

    const gradient = this._gradient(m);

    return `
      <tr style="${gradient}">
        <!-- DATA -->
        <td style="width:10%; text-align:center;">
          <div style="font-size:${this.config.font_size.date}rem">${date}</div>
          <div style="font-size:${this.config.font_size.status}rem">${time}</div>
        </td>

        <!-- LIGA -->
        <td class="league-cell" style="width:10%; text-align:center;">
          ${this._league(m.league)}
        </td>

        <!-- HERBY -->
        ${this.config.show_logos ? `
          <td class="dual-cell" style="width:10%;">
            <img src="${m.logo_home}" height="${this.config.icon_size.crest}">
            <img src="${m.logo_away}" height="${this.config.icon_size.crest}">
          </td>` : ""}

        <!-- DRUŻYNY -->
        <td class="team-cell">
          <div style="font-size:${this.config.font_size.teams}rem">${homeName}</div>
          <div style="font-size:${this.config.font_size.teams}rem">${awayName}</div>
        </td>

        <!-- WYNIKI -->
        <td class="score-cell" style="width:10%;">
          <div style="font-size:${this.config.font_size.score}rem">${homeScore}</div>
          <div style="font-size:${this.config.font_size.score}rem">${awayScore}</div>
        </td>

        <!-- W / D / L -->
        <td style="width:8%; text-align:center;">
          ${this.config.show_result_symbols && m.result ? `
            <div class="result-circle"
                 style="background:${this.config.colors[m.result]};
                        width:${this.config.icon_size.result}px;
                        height:${this.config.icon_size.result}px;">
              ${m.result.charAt(0).toUpperCase()}
            </div>` : ""}
        </td>
      </tr>
    `;
  }

  // ----------------------------------------------------------
  // HELPERY
  // ----------------------------------------------------------
  _rgba(hex, alpha) {
    const h = hex.replace("#", "");
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  _gradient(m) {
    if (this.config.fill_mode !== "gradient" || !m.result) return "";

    const col = this.config.colors[m.result];
    const g = this.config.gradient;

    return `
      background: linear-gradient(to right,
        rgba(0,0,0,0) 0%,
        ${this._rgba(col, g.alpha_start)} ${g.start}%,
        ${this._rgba(col, g.alpha_end)} ${g.end}%,
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

    return `
      <img src="https://raw.githubusercontent.com/GieOeRZet/matches-card/main/logo/${file}"
           height="${this.config.icon_size.league}">
    `;
  }

  static getConfigElement() { return document.createElement("matches-card-editor"); }
  static getStubConfig() {
    return {
      entity: "sensor.90minut_gornik_zabrze_matches",
      name: "90minut Matches",
      show_name: true,
      show_logos: true,
      full_team_names: true,
      show_result_symbols: true,
      lite_mode: false,
      fill_mode: "gradient",

      font_size: { date: 0.9, status: 0.8, teams: 1.0, score: 1.0 },
      icon_size: { league: 26, crest: 24, result: 26 },

      colors: { win: "#3ba55d", draw: "#468cd2", loss: "#e23b3b" },

      gradient: { start: 35, end: 100, alpha_start: 0.0, alpha_end: 0.55 },

      zebra_color: "#f0f0f0",
      zebra_alpha: 0.4
    };
  }
}

customElements.define("matches-card", MatchesCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "matches-card",
  name: "Matches Card (90minut)",
  description: "Wyniki meczów z sensora 90minut.pl"
});