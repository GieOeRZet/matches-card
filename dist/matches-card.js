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
        background: rgba(255,255,255,0.5);
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
