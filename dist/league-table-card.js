// ============================================================================
//  League Table Card (90minut) – v0.2.000
//  + Premium Gradient (Sofascore-style)
//  + Linia 3px z lewej (jak Matches Card)
// ============================================================================

class LeagueTableCard extends HTMLElement {
  setConfig(config) {
    if (!config.entity) {
      throw new Error("Entity is required (np. sensor.90minut_gornik_zabrze_table)");
    }

    const defaults = {
      name: "Tabela ligowa",
      show_name: true,
      lite_mode: false,

      fill_mode: "gradient", // gradient | premium | zebra | clear

      gradient: {
        start: 35,
        end: 100,
        alpha_start: 0.0,
        alpha_end: 0.55,
      },

      // PREMIUM GRADIENT – nowość
      premium: {
        start_alpha: 0.85,
        mid_alpha: 0.35,
        end_alpha: 0.0,
        pastel_pos: 15,
      },

      zebra_color: "#f0f0f0",
      zebra_alpha: 0.4,

      highlight: {
        top_count: 2,
        conf_count: 2,
        bottom_count: 3,
      },

      colors: {
        top: "#3ba55d",
        conf: "#468cd2",
        bottom: "#e23b3b",
      },
    };

    this.config = {
      ...defaults,
      ...config,
      gradient: { ...defaults.gradient, ...(config.gradient || {}) },
      premium: { ...defaults.premium, ...(config.premium || {}) },
      highlight: { ...defaults.highlight, ...(config.highlight || {}) },
      colors: { ...defaults.colors, ...(config.colors || {}) },
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

    const myPos = parseInt(stateObj.attributes.my_position || "", 10);
    this._myPosition = !isNaN(myPos) ? myPos : null;

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
          font-size: 0.9rem;
          text-align: center;
          white-space: nowrap;
        }
        .ltc-table th {
          font-weight: 600;
          font-size: 0.8rem;
          opacity: 0.8;
        }
        .ltc-col-pos   { width: 8%;  text-align: right; }
        .ltc-col-team  { text-align: left; }
        .ltc-col-m     { width: 8%;  }
        .ltc-col-pkt   { width: 10%; font-weight: 600; }
        .ltc-col-goals { width: 14%; }
        .ltc-col-diff  { width: 10%; }

        .ltc-team-name { overflow: hidden; text-overflow: ellipsis; }
        .ltc-team-fav  { font-weight: 700; }

        .ltc-legend {
          margin-top: 10px;
          padding-top: 6px;
          border-top: 1px solid rgba(0,0,0,0.08);
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          font-size: 0.8rem;
        }
        .ltc-legend-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .ltc-legend-box {
          width: 12px;
          height: 12px;
          border-radius: 3px;
          border: 1px solid rgba(0,0,0,0.25);
        }
      </style>
    `;

    const rowsHTML = table
      .map((row, index) => this._renderRow(row, index, totalTeams))
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
        </tr>
      </thead>
    `;

    const legendHTML = `
      <div class="ltc-legend">
        <div class="ltc-legend-item">
          <span class="ltc-legend-box" style="background:${cfg.colors.top}"></span> Liga Mistrzów
        </div>
        <div class="ltc-legend-item">
          <span class="ltc-legend-box" style="background:${cfg.colors.conf}"></span> Liga Konferencji
        </div>
        <div class="ltc-legend-item">
          <span class="ltc-legend-box" style="background:${cfg.colors.bottom}"></span> Spadek
        </div>
      </div>
    `;

    const tableHTML = `
      <div class="ltc-card">
        <table class="ltc-table">
          ${headerHTML}
          <tbody>${rowsHTML}</tbody>
        </table>
        ${legendHTML}
      </div>
    `;

    if (cfg.lite_mode) {
      this.innerHTML = `${style}${tableHTML}`;
      return;
    }

    const cardName = cfg.show_name ? (cfg.name || "Tabela ligowa") : "";

    this.innerHTML = `
      ${style}
      <ha-card ${cardName ? `header="${cardName}"` : ""}>
        ${tableHTML}
      </ha-card>
    `;
  }

  _renderRow(row, index, totalTeams) {
    const cfg = this.config;

    const pos = parseInt(row.position || "", 10);
    const classification = this._classifyPosition(pos, totalTeams);

    const style = this._rowBackgroundStyle(classification, index);

    const team = row.team || "";
    const matches = row.matches ?? "-";
    const points = row.points ?? "-";
    const goals = row.goals ?? "-";

    let diffStr = "-";
    if (row.diff || row.diff === 0) {
      const d = parseInt(row.diff);
      diffStr = isNaN(d) ? row.diff : (d > 0 ? "+" + d : "" + d);
    }

    const favClass =
      pos === this._myPosition ? "ltc-team-name ltc-team-fav" : "ltc-team-name";

    return `
      <tr style="${style}">
        <td class="ltc-col-pos">${isNaN(pos) ? "" : pos}</td>
        <td class="ltc-col-team"><span class="${favClass}">${team}</span></td>
        <td class="ltc-col-m">${matches}</td>
        <td class="ltc-col-pkt">${points}</td>
        <td class="ltc-col-goals">${goals}</td>
        <td class="ltc-col-diff">${diffStr}</td>
      </tr>
    `;
  }

  _classifyPosition(pos, totalTeams) {
    const h = this.config.highlight;
    if (!pos || !totalTeams) return null;

    if (pos <= h.top_count) return "top";
    if (pos <= h.top_count + h.conf_count) return "conf";
    if (pos > totalTeams - h.bottom_count) return "bottom";
    return null;
  }

  _rowBackgroundStyle(classification, index) {
    const cfg = this.config;

    if (!classification) return "";

    const c = this.config.colors[classification];

    if (cfg.fill_mode === "premium")
      return this._premiumGradient(c);

    if (cfg.fill_mode === "gradient")
      return this._classicGradient(c);

    if (cfg.fill_mode === "zebra")
      return index % 2 === 1
        ? `background:${this._rgba(cfg.zebra_color, cfg.zebra_alpha)};border-left:3px solid ${c}`
        : `border-left:3px solid ${c}`;

    return `border-left:3px solid ${c}`;
  }

  _classicGradient(color) {
    const g = this.config.gradient;
    return `
      background: linear-gradient(to right,
        rgba(0,0,0,0) 0%,
        ${this._rgba(color, g.alpha_start)} ${g.start}%,
        ${this._rgba(color, g.alpha_end)} ${g.end}%,
        rgba(0,0,0,0) 100%
      );
      border-left:3px solid ${color};
    `;
  }

  _premiumGradient(color) {
    const p = this.config.premium;
    return `
      background: linear-gradient(to right,
        ${this._rgba(color, p.start_alpha)} 0%,
        ${this._rgba(color, p.mid_alpha)} ${p.pastel_pos}%,
        ${this._rgba(color, p.end_alpha)} 100%
      );
      border-left:3px solid ${color};
    `;
  }

  _rgba(hex, a) {
    const h = hex.replace("#", "");
    const r = parseInt(h.substring(0,2),16);
    const g = parseInt(h.substring(2,4),16);
    const b = parseInt(h.substring(4,6),16);
    return `rgba(${r},${g},${b},${a})`;
  }

  static getConfigElement() {
    return document.createElement("league-table-card-editor");
  }

  static getStubConfig() {
    const cfg = {
      entity: "",
      fill_mode: "gradient",
    };
    return cfg;
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
  description: "Tabela ligowa z sensora 90minut.pl (premium gradient ready)",
});
