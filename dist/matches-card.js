// ============================================================================
//  Matches Card (90minut) – Stable Rebuild (layout 0.3.000 preserved)
//  WITH:
//   - fixed date/time column
//   - fixed score alignment
//   - separate W/D/L column
//   - spacing fixes
//   - LITE mode
//   - FULL default YAML + bidirectional sync (deep merge)
// ============================================================================

class MatchesCard extends HTMLElement {

  // --------------------------------------------------------------------------
  // DEFAULT CONFIG returned also into YAML on card creation
  // --------------------------------------------------------------------------
  static getStubConfig() {
    return {
      entity: "",
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
        score: 1.0
      },

      icon_size: {
        league: 26,
        crest: 24,
        result: 26
      },

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
      zebra_alpha: 0.4
    };
  }

  // --------------------------------------------------------------------------
  // DEEP MERGE – **critical fix** so config from editor/YAML syncs both ways
  // --------------------------------------------------------------------------
  static _deepMerge(target, defaults) {
    for (const k in defaults) {
      if (defaults[k] !== null && typeof defaults[k] === "object" && !Array.isArray(defaults[k])) {
        if (!target[k]) target[k] = {};
        this._deepMerge(target[k], defaults[k]);
      } else {
        if (target[k] === undefined) target[k] = defaults[k];
      }
    }
    return target;
  }

  // --------------------------------------------------------------------------
  // CONFIG SETTER
  // --------------------------------------------------------------------------
  setConfig(config) {
    const defaults = MatchesCard.getStubConfig();
    this.config = MatchesCard._deepMerge(JSON.parse(JSON.stringify(config)), defaults);
  }

  // --------------------------------------------------------------------------
  // MAIN RENDER LOOP
  // --------------------------------------------------------------------------
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
          padding-right:12px; /* odstęp od herbów */
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

  // --------------------------------------------------------------------------
  // RENDER ONE MATCH ROW
  // --------------------------------------------------------------------------
  _row(m) {

    // -----------------------------
    // DATE + TIME / KONIEC (FIX)
    // -----------------------------
    const dt = m.date || ""; // "2025-10-05 20:15"
    const [day, tm] = dt.split(" "); // ["2025-10-05", "20:15"]

    const statusText =
      m.finished === true
        ? "KONIEC"
        : (tm || "");

    const [homeScore, awayScore] = (m.score || "-").split("-");

    const homeBold = m.result === "win" ? "bold" : m.result === "loss" ? "dim" : "";
    const awayBold = m.result === "loss" ? "bold" : m.result === "win" ? "dim" : "";

    return `
      <tr style="${this._gradient(m)}">

        <!-- DATA -->
        <td style="width:10%; text-align:center;">
          <div style="font-size:${this.config.font_size.date}rem">${day}</div>
          <div style="font-size:${this.config.font_size.status}rem">${statusText}</div>
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

  // --------------------------------------------------------------------------
  // LEAGUE ICON
  // --------------------------------------------------------------------------
  _league(code) {
    const file =
      code === "L"  ? "ekstraklasa.png" :
      code === "PP" ? "puchar.png" :
      null;

    if (!file) return `<div>${code}</div>`;

    return `<img src="https://raw.githubusercontent.com/GieOeRZet/matches-card/main/logo/${file}"
                height="${this.config.icon_size.league}" />`;
  }

  // --------------------------------------------------------------------------
  // GRADIENT GENERATOR
  // --------------------------------------------------------------------------
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

  // --------------------------------------------------------------------------
  // HEX → RGBA
  // --------------------------------------------------------------------------
  _rgba(hex, alpha) {
    const h = hex.replace("#", "");
    const r = parseInt(h.substr(0,2),16);
    const g = parseInt(h.substr(2,2),16);
    const b = parseInt(h.substr(4,2),16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  // --------------------------------------------------------------------------
  // LINK TO EDITOR
  // --------------------------------------------------------------------------
  static getConfigElement() {
    return document.createElement("matches-card-editor");
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
  description: "Karta pokazująca mecze z sensora 90minut.pl"
});