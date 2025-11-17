// ============================================================================
//  Matches Card (90minut) – v0.3.022-ish (layout jak 0.3.000 + poprawki)
//  - 1 kolumna: DATA (góra) + GODZINA/KONIEC (dół)
//  - W/P/R w osobnej kolumnie (kółka), nic pod wynikiem
//  - Herby jak były, tylko lekki odstęp między nimi
//  - Większy odstęp między logo ligi a herbami
//  - Lite mode: bez <ha-card>
//  - full_team_names: pełne / skrócone nazwy
// ============================================================================

class MatchesCard extends HTMLElement {

  setConfig(config) {
    if (!config.entity) {
      throw new Error("Entity is required (np. sensor.90minut_gornik_zabrze_matches)");
    }

    // Domyślne wartości spójne z edytorem
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
        alpha_end: 0.55,
      },
      zebra_color: "#f0f0f0",
      zebra_alpha: 0.4,
      lite_mode: false,
    };

    const merged = {
      ...defaults,
      ...config,
      font_size: { ...defaults.font_size, ...(config.font_size || {}) },
      icon_size: { ...defaults.icon_size, ...(config.icon_size || {}) },
      colors: { ...defaults.colors, ...(config.colors || {}) },
      gradient: { ...defaults.gradient, ...(config.gradient || {}) },
    };

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
        :host {
          display:block;
        }

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
          padding-right:12px; /* większy odstęp od herbów */
          text-align:center;
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
          text-align:center;
        }

        .result-cell {
          text-align:center;
        }

        .bold {
          font-weight:600;
        }

        .dim {
          opacity:0.7;
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

    // LITE MODE – bez ha-card
    if (this.config.lite_mode) {
      this.innerHTML = `
        ${style}
        <table>${rows}</table>
      `;
      return;
    }

    const header =
      this.config.show_name === false
        ? ""
        : (this.config.name || entity.attributes.friendly_name || "90minut Matches");

    this.innerHTML = `
      ${style}
      <ha-card ${header ? `header="${header}"` : ""}>
        <table>${rows}</table>
      </ha-card>
    `;
  }

  _row(m) {
    // DATA + GODZINA/KONIEC
    let dateStr = "-";
    let timeStr = "";

    if (m.date) {
      const safe = String(m.date).replace(" ", "T");
      const d = new Date(safe);

      if (!isNaN(d.getTime())) {
        dateStr = d.toLocaleDateString("pl-PL", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });

        if (m.finished) {
          timeStr = "KONIEC";
        } else {
          timeStr = d.toLocaleTimeString("pl-PL", {
            hour: "2-digit",
            minute: "2-digit",
          });
        }
      } else {
        // fallback, jakby Date nie zadziałał
        const [rawDate, rawTime] = String(m.date).split(" ");
        dateStr = rawDate || "-";
        timeStr = m.finished ? "KONIEC" : (rawTime || "");
      }
    }

    const scoreStr = m.score || "-";
    const [homeScore, awayScore] = scoreStr.includes("-")
      ? scoreStr.split("-")
      : [scoreStr, ""];

    const full = this.config.full_team_names !== false;
    const homeName = full ? (m.home || "") : (m.home || "").split(" ")[0];
    const awayName = full ? (m.away || "") : (m.away || "").split(" ")[0];

    const res = m.result; // "win" / "draw" / "loss" / null

    const homeBold = res === "win" ? "bold" : res === "loss" ? "dim" : "";
    const awayBold = res === "loss" ? "bold" : res === "win" ? "dim" : "";

    const rowStyle = this._gradientStyle(res);

    return `
      <tr style="${rowStyle}">
        <!-- DATA + GODZINA/KONIEC -->
        <td style="width:10%; text-align:center;">
          <div style="font-size:${this.config.font_size.date}rem;">${dateStr}</div>
          <div style="font-size:${this.config.font_size.status}rem;">${timeStr}</div>
        </td>

        <!-- LIGA -->
        <td class="league-cell" style="width:10%;">
          ${this._league(m.league)}
        </td>

        <!-- HERBY -->
        ${
          this.config.show_logos
            ? `
          <td class="crest-cell dual-cell" style="width:10%;">
            <img src="${m.logo_home}" height="${this.config.icon_size.crest}" />
            <img src="${m.logo_away}" height="${this.config.icon_size.crest}" />
          </td>
        `
            : ""
        }

        <!-- DRUŻYNY -->
        <td class="team-cell">
          <div class="team-row ${homeBold}" style="font-size:${this.config.font_size.teams}rem;">${homeName}</div>
          <div class="team-row ${awayBold}" style="font-size:${this.config.font_size.teams}rem;">${awayName}</div>
        </td>

        <!-- WYNIK (osobna pionowa sekcja, wyrównana do drużyn) -->
        <td class="score-cell" style="width:10%;">
          <div class="${homeBold}" style="font-size:${this.config.font_size.score}rem;">${homeScore}</div>
          <div class="${awayBold}" style="font-size:${this.config.font_size.score}rem;">${awayScore}</div>
        </td>

        <!-- W / D / L – osobna kolumna z kółkiem -->
        <td class="result-cell" style="width:8%;">
          ${
            this.config.show_result_symbols && res
              ? `
            <div class="result-circle" style="background:${this.config.colors[res] || "#000"};">
              ${res === "win" ? "W" : res === "draw" ? "D" : "P"}
            </div>
          `
              : ""
          }
        </td>
      </tr>
    `;
  }

  _gradientStyle(result) {
    if (this.config.fill_mode !== "gradient" || !result) return "";

    const col = this.config.colors[result];
    if (!col) return "";

    const g = this.config.gradient || {};
    const start = typeof g.start === "number" ? g.start : 35;
    const end = typeof g.end === "number" ? g.end : 100;
    const aStart = typeof g.alpha_start === "number" ? g.alpha_start : 0.0;
    const aEnd = typeof g.alpha_end === "number" ? g.alpha_end : 0.55;

    return `
      background: linear-gradient(to right,
        rgba(0,0,0,0) 0%,
        ${this._rgba(col, aStart)} ${start}%,
        ${this._rgba(col, aEnd)} ${end}%,
        rgba(0,0,0,0) 100%
      );
    `;
  }

  _league(code) {
    if (!code) return "";

    const file =
      code === "L" ? "ekstraklasa.png" :
      code === "PP" ? "puchar.png" :
      null;

    if (!file) {
      return `<div style="font-size:0.9em;opacity:0.8;">${code}</div>`;
    }

    return `
      <img
        src="https://raw.githubusercontent.com/GieOeRZet/matches-card/main/logo/${file}"
        height="${this.config.icon_size.league}"
      />
    `;
  }

  _rgba(hex, alpha) {
    if (!hex) return `rgba(0,0,0,${alpha})`;
    const h = hex.replace("#", "");
    if (h.length !== 6) return `rgba(0,0,0,${alpha})`;
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  static getConfigElement() {
    return document.createElement("matches-card-editor");
  }

  static getStubConfig() {
    // Pełny YAML na starcie
    return {
      type: "custom:matches-card",
      entity: "",
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