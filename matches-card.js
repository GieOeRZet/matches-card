// ============================================================================
//  Matches Card (90minut) – v0.3.000 (RESTORED BASE) + FULL EDITOR SUPPORT
//  Author: GieOeRZet
// ============================================================================

class MatchesCard extends HTMLElement {
  setConfig(config) {
    if (!config.entity)
      throw new Error("Entity is required (np. sensor.90minut_gornik_zabrze_matches)");

    // 🔵 DOMYŚLNA KONFIG + NOWE OPCJE Z EDYTORA
    this.config = {
      name: "90minut Matches",
      show_name: true,
      show_logos: true,
      full_team_names: true,
      show_result_symbols: true,

      fill_mode: config.fill_mode || "gradient", // gradient / zebra

      font_size: {
        date: config.font_size?.date ?? 0.9,
        status: config.font_size?.status ?? 0.8,
        teams: config.font_size?.teams ?? 1.0,
        score: config.font_size?.score ?? 1.0
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
        alpha_start: typeof config.gradient?.alpha_start === "number"
          ? config.gradient.alpha_start
          : 0.0,
        alpha_end: typeof config.gradient?.alpha_end === "number"
          ? config.gradient.alpha_end
          : (typeof config.gradient?.alpha === "number" ? config.gradient.alpha : 0.55),
        start: typeof config.gradient?.start === "number" ? config.gradient.start : 35,
        end:   typeof config.gradient?.end   === "number" ? config.gradient.end   : 100
      },

      zebra_color: config.zebra_color ?? "#f0f0f0",
      zebra_alpha: typeof config.zebra_alpha === "number" ? config.zebra_alpha : 0.4,

      lite_mode: config.lite_mode ?? false,

      ...config
    };
  }

  set hass(hass) {
    this._hass = hass;
    const entity = this.config.entity;
    const stateObj = hass.states[entity];
    if (!stateObj) {
      this.innerHTML = "<ha-card>Encja nie istnieje.</ha-card>";
      return;
    }
    const matches = stateObj.attributes.matches || [];

    // 🔵 ZEBRA CSS
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

        .dual-cell{display:flex;flex-direction:column;justify-content:center;align-items:center;}
        .team-cell{text-align:left;padding-left:8px;}
        .team-row{display:flex;align-items:center;justify-content:flex-start;line-height:1.3em;}
        .bold{font-weight:600;}
        .dim{opacity:0.8;}

        .result-circle{
          border-radius:50%;
          width:${this.config.icon_size.result}px;
          height:${this.config.icon_size.result}px;
          color:white;display:flex;justify-content:center;align-items:center;
          font-weight:bold;margin:0 auto;
        }

        ${zebraCSS}
      </style>
    `;

    const rows = matches.map((match) => this._renderRow(match)).join("");

    // 🔵 TRYB LITE (bez ha-card, bez headera)
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
  // RENDER POJEDYNCZEGO WIERSZA
  // ----------------------
  _renderRow(match) {
    const rawDate = match.date ? match.date.replace(" ", "T") : null;
    const dateObj = rawDate ? new Date(rawDate) : null;

    const dateStr = dateObj
      ? dateObj.toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit", year: "numeric" })
      : "-";

    const timeStr = match.finished
      ? "KONIEC"
      : dateObj
      ? dateObj.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })
      : "";

    const homeTeam = this.config.full_team_names ? match.home : match.home.split(" ")[0];
    const awayTeam = this.config.fullergwad full_temnm ea config.fulll_team_names ? match.away : match.away.split(" ")[0];

    const [homeScore, awayScore] = (match.score || "-").split("-");

    let iconLeague = this._leagueIcon(match.league);

    const gradientCSS =
      this.config.fill_mode === "gradient" && match.result
        ? this._gradientCSS(match.result)
        : "";

    const homeBold = match.result === "win" ? "bold" : match.result === "loss" ? "dim" : "";
    const awayBold = match.result === "loss" ? "bold" : match.result === "win" ? "dim" : "";

    return `
      <tr style="${gradientCSS}">
        <td style="width:10%;">
          <div style="font-size:${this.config.font_size.date}rem;">${dateStr}</div>
          <div style="font-size:${this.config.font_size.status}rem;">${timeStr}</div>
        </td>

        <td style="width:10%;">
          ${
            iconLeague
              ? `<img src="${iconLeague}" height="${this.config.icon_size.league}" style="margin:auto;">`
              : `<div style="font-size:0.9em;opacity:0.8;">${match.league}</div>`
          }
        </td>

        ${
          this.config.show_logos
            ? `<td class="dual-cell" style="width:10%;">
                 <div><img src="${match.logo_home}" height="${this.config.icon_size.crest}" style="background:white;border-radius:6px;padding:2px;" /></div>
                 <div><img src="${match.logo_away}" height="${this.config.icon_size.crest}" style="background:white;border-radius:6px;padding:2px;" /></div>
               </td>`
            : ""
        }

        <td class="team-cell">
          <div class="team-row ${homeBold}" style="font-size:${this.config.font_size.teams}rem;">${homeTeam}</div>
          <div class="team-row ${awayBold}" style="font-size:${this.config.font_size.teams}rem;">${awayTeam}</div>
        </td>

        <td class="dual-cell" style="width:10%;">
          <div class="${homeBold}" style="font-size:${this.config.font_size.score}rem;">${homeScore}</div>
          <div class="${awayBold}" style="font-size:${this.config.font_size.score}rem;">${awayScore}</div>
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
  // RGBA helper
  // ----------------------
  _rgba(hex, alpha) {
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  // ----------------------
  // GRADIENT – pełna logika z alpha_start i alpha_end
  // ----------------------
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

  // ----------------------
  // IKONY LIG – GitHub → tekst
  // ----------------------
  _leagueIcon(code) {
    if (!code) return null;

    const file =
      code === "L" ? "ekstraklasa.png" :
      code === "PP" ? "puchar.png" :
      null;

    if (!file) return null;

    return `https://raw.githubusercontent.com/GieOeRZet/matches-card/main/logo/${file}`;
  }

  // ----------------------
  // EDYTOR
  // ----------------------
  static getConfigElement() {
    return document.createElement("matches-card-editor");
  }

  static getStubConfig() {
    return { entity: "" };
  }

  getCardSize() {
    return 6;
  }
}

customElements.define("matches-card", MatchesCard);

// rejestracja karty (wymagane przez HA)
window.customCards = window.customCards || [];
window.customCards.push({
  type: "matches-card",
  name: "Matches Card (90minut)",
  description: "Karta pokazująca mecze z sensora 90minut.pl"
});