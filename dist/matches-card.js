// ============================================================================
//  Matches Card (90minut) – v0.3.000 RESTORED + FIX 1-5
//  - Data + KONIEC/godzina (bez competition!)
//  - Herby jak w 0.3.000 z odstępem
//  - Wynik wyrównany do drużyn
//  - Kolumna W/D/L osobno
//  - Tryb LITE
// ============================================================================

class MatchesCard extends HTMLElement {

  setConfig(config) {
    if (!config.entity) {
      throw new Error("Entity is required");
    }

    this.config = {
      name: config.name ?? "90minut Matches",
      show_name: config.show_name ?? true,
      show_logos: config.show_logos ?? true,
      full_team_names: config.full_team_names ?? true,
      show_result_symbols: config.show_result_symbols ?? true,
      lite_mode: config.lite_mode ?? false,

      fill_mode: config.fill_mode ?? "gradient",

      font_size: {
        date:   config.font_size?.date   ?? 0.9,
        status: config.font_size?.status ?? 0.8,
        teams:  config.font_size?.teams  ?? 1.0,
        score:  config.font_size?.score  ?? 1.0
      },

      icon_size: {
        league: config.icon_size?.league ?? 26,
        crest:  config.icon_size?.crest  ?? 24,
        result: config.icon_size?.result ?? 26
      },

      colors: {
        win:  config.colors?.win  ?? "#3ba55d",
        draw: config.colors?.draw ?? "#468cd2",
        loss: config.colors?.loss ?? "#e23b3b",
      },

      gradient: {
        start:       config.gradient?.start       ?? 35,
        end:         config.gradient?.end         ?? 100,
        alpha_start: config.gradient?.alpha_start ?? 0.0,
        alpha_end:   config.gradient?.alpha_end   ?? 0.55
      },

      zebra_color: config.zebra_color ?? "#f0f0f0",
      zebra_alpha: config.zebra_alpha ?? 0.4,

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
        ? `tr:nth-child(even) { background-color:${this._rgba(this.config.zebra_color, this.config.zebra_alpha)}; }`
        : "";

    const style = `
      <style>
        ha-card {
          padding: 10px 0;
          font-family: "Sofascore Sans", Arial, sans-serif;
        }
        table { width:100%; border-collapse:collapse; }
        tr { border-bottom:1px solid rgba(255,255,255,0.08); }
        td { padding:4px 6px; vertical-align:middle; }

        .dual {
          display:flex;
          flex-direction:column;
          justify-content:center;
          align-items:center;
          gap:3px; /* odstęp między herbami */
        }

        .league-cell { padding-right:12px; }

        .team-cell { text-align:left; padding-left:6px; }

        .team-row { line-height:1.3em; }

        .score-cell {
          display:flex;
          flex-direction:column;
          justify-content:center;
          align-items:center;
          line-height:1.3em;
        }

        .result-circle {
          width:${this.config.icon_size.result}px;
          height:${this.config.icon_size.result}px;
          border-radius:50%;
          display:flex;
          align-items:center;
          justify-content:center;
          font-weight:bold;
          color:#fff;
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

    // DATA
    const dateStr = m.date || "-";

    // STATUS: KONIEC / godzina
    let status = "";
    if (m.finished === true) status = "KONIEC";
    else if (m.finished === false && m.date) {
      const t = m.date.split(" ")[1];
      status = t ?? "";
    }

    // SCORE
    let [home, away] = (m.score || "-").split("-");
    home = home ?? "";
    away = away ?? "";

    // BOLD logic
    const homeBold =
      m.result === "win" ? "font-weight:600" :
      m.result === "loss" ? "opacity:0.6" : "";

    const awayBold =
      m.result === "loss" ? "font-weight:600" :
      m.result === "win" ? "opacity:0.6" : "";

    return `
      <tr style="${this._gradient(m)}">

        <!-- DATA + STATUS -->
        <td style="width:11%; text-align:center;">
          <div style="font-size:${this.config.font_size.date}rem">${dateStr}</div>
          <div style="font-size:${this.config.font_size.status}rem">${status}</div>
        </td>

        <!-- LIGA -->
        <td class="league-cell" style="width:9%; text-align:center;">
          ${this._league(m.league)}
        </td>

        <!-- HERBY -->
        ${this.config.show_logos ? `
          <td style="width:10%;">
            <div class="dual">
              <img src="${m.logo_home}" height="${this.config.icon_size.crest}">
              <img src="${m.logo_away}" height="${this.config.icon_size.crest}">
            </div>
          </td>
        ` : ""}

        <!-- NAZWY DRUŻYN -->
        <td class="team-cell">
          <div class="team-row" style="${homeBold}; font-size:${this.config.font_size.teams}rem">${m.home}</div>
          <div class="team-row" style="${awayBold}; font-size:${this.config.font_size.teams}rem">${m.away}</div>
        </td>

        <!-- WYNIK -->
        <td class="score-cell" style="width:8%;">
          <div style="${homeBold}; font-size:${this.config.font_size.score}rem">${home}</div>
          <div style="${awayBold}; font-size:${this.config.font_size.score}rem">${away}</div>
        </td>

        <!-- W/D/L -->
        <td style="width:6%; text-align:center;">
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

  _league(code) {
    const file =
      code === "L"  ? "ekstraklasa.png" :
      code === "PP" ? "puchar.png" :
      null;

    if (!file) return `<div>${code}</div>`;

    return `<img src="https://raw.githubusercontent.com/GieOeRZet/matches-card/main/logo/${file}"
                height="${this.config.icon_size.league}">`;
  }

  _gradient(m) {
    if (this.config.fill_mode !== "gradient" || !m.result) return "";

    const c = this.config.colors[m.result];
    const g = this.config.gradient;

    return `
      background: linear-gradient(to right,
        rgba(0,0,0,0) 0%,
        ${this._rgba(c, g.alpha_start)} ${g.start}%,
        ${this._rgba(c, g.alpha_end)}   ${g.end}%,
        rgba(0,0,0,0) 100%
      );
    `;
  }

  _rgba(hex, a) {
    const h = hex.replace("#", "");
    const r = parseInt(h.substr(0,2),16);
    const g = parseInt(h.substr(2,2),16);
    const b = parseInt(h.substr(4,2),16);
    return `rgba(${r},${g},${b},${a})`;
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