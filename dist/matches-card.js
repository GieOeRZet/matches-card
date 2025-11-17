// ============================================================================
//  Matches Card (90minut) – FIXED FINAL VERSION (data/godzina/KONIEC)
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

      fill_mode: config.fill_mode ?? "gradient",

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
        start:        config.gradient?.start        ?? 35,
        end:          config.gradient?.end          ?? 100,
        alpha_start:  config.gradient?.alpha_start  ?? 0.0,
        alpha_end:    config.gradient?.alpha_end    ?? 0.55,
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
          padding: 10px 0;
          font-family: Arial, sans-serif;
        }
        table { width: 100%; border-collapse: collapse; }
        tr { border-bottom: 1px solid rgba(0,0,0,0.1); }
        td { padding: 4px 6px; vertical-align: middle; }

        .dual-cell {
          display:flex;
          flex-direction:column;
          justify-content:center;
          align-items:center;
          gap:3px;
        }

        .league-cell { padding-right: 12px; }

        .team-cell { text-align:left; padding-left:8px; }
        .team-row  { line-height:1.3em; }

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
          justify-content:center;
          align-items:center;
          font-weight:bold;
          color:#fff;
          margin:auto;
        }

        ${zebraCSS}
      </style>
    `;

    const rows = matches.map(m => this._row(m)).join("");

    // --- TRYB LITE: bez ha-card ---
    if (this.config.lite_mode) {
      this.innerHTML = `${style}<table>${rows}</table>`;
      return;
    }

    const header =
      this.config.show_name
        ? `header="${this.config.name}"`
        : "";

    this.innerHTML = `
      ${style}
      <ha-card ${header}>
        <table>${rows}</table>
      </ha-card>
    `;
  }

  // ----------------------------------------------------------------------------
  //  POJEDYNCZY WIERSZ
  // ----------------------------------------------------------------------------
  _row(m) {
    // -----------------------------
    // DATA
    // -----------------------------
    let dateObj = null;
    if (m.date) {
      const iso = m.date.replace(" ", "T");
      dateObj = new Date(iso);
    }

    const dateStr = dateObj
      ? dateObj.toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit", year: "numeric" })
      : "-";

    // -----------------------------
    // GODZINA lub KONIEC
    // -----------------------------
    let statusStr = "";

    if (m.finished === true) {
      statusStr = "KONIEC";
    } else if (dateObj) {
      statusStr = dateObj.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });
    } else {
      statusStr = "";
    }

    // -----------------------------
    const [homeScore, awayScore] = (m.score || "-").split("-");

    const homeBold = m.result === "win" ? "bold" : m.result === "loss" ? "dim" : "";
    const awayBold = m.result === "loss" ? "bold" : m.result === "win" ? "dim" : "";

    const homeName = this.config.full_team_names ? m.home : m.home.split(" ")[0];
    const awayName = this.config.full_team_names ? m.away : m.away.split(" ")[0];

    return `
      <tr style="${this._gradient(m)}">

        <!-- DATA / GODZINA / KONIEC -->
        <td style="width:10%; text-align:center;">
          <div style="font-size:${this.config.font_size.date}rem">${dateStr}</div>
          <div style="font-size:${this.config.font_size.status}rem">${statusStr}</div>
        </td>

        <!-- LIGA -->
        <td class="league-cell" style="width:10%; text-align:center;">
          ${this._league(m.league)}
        </td>

        <!-- HERBY -->
        ${this.config.show_logos ? `
          <td class="dual-cell" style="width:10%">
            <img src="${m.logo_home}" height="${this.config.icon_size.crest}">
            <img src="${m.logo_away}" height="${this.config.icon_size.crest}">
          </td>
        ` : ""}

        <!-- DRUŻYNY -->
        <td class="team-cell">
          <div class="team-row ${homeBold}" style="font-size:${this.config.font_size.teams}rem">${homeName}</div>
          <div class="team-row ${awayBold}" style="font-size:${this.config.font_size.teams}rem">${awayName}</div>
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

  // ----------------------------------------------------------------------------
  //  HELPERY
  // ----------------------------------------------------------------------------
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
      code === "L"  ? "ekstraklasa.png" :
      code === "PP" ? "puchar.png" :
      null;

    if (!file) return `<div>${code}</div>`;

    return `
      <img
        src="https://raw.githubusercontent.com/GieOeRZet/matches-card/main/logo/${file}"
        height="${this.config.icon_size.league}"
      >
    `;
  }

  _rgba(hex, alpha) {
    const h = hex.replace("#", "");
    const r = parseInt(h.substring(0,2),16);
    const g = parseInt(h.substring(2,4),16);
    const b = parseInt(h.substring(4,6),16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  static getConfigElement() {
    return document.createElement("matches-card-editor");
  }
  static getStubConfig() { return { entity: "" }; }
}

customElements.define("matches-card", MatchesCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "matches-card",
  name: "Matches Card (90minut)",
  description: "Karta pokazująca mecze z sensora 90minut.pl"
});