// ============================================================================
//  League Table Card (90minut) – v0.1.100 (stable)
//  Author: GieOeRZet
// ============================================================================

class LeagueTableCard extends HTMLElement {
  setConfig(config) {
    const defaults = {
      name: "Tabela ligowa",
      show_name: true,
      lite_mode: false,
      show_trend: true,

      font_size: {
        header: 0.8,
        row: 0.9,
        team: 1.0,
      },

      // zgodne stylistycznie z Matches Card
      colors: {
        top: "#3ba55d",      // green (win)
        conference: "#468cd2", // blue (draw)
        bottom: "#e23b3b",     // red (loss)
        favorite: "#fff7c2",   // light gold
      },

      highlight: {
        top_count: 2,
        conference_count: 2,
        bottom_count: 3,
      },
    };

    this.config = {
      ...defaults,
      ...config,
      font_size: { ...defaults.font_size, ...(config.font_size || {}) },
      colors: { ...defaults.colors, ...(config.colors || {}) },
      highlight: { ...defaults.highlight, ...(config.highlight || {}) },
    };

    this.entityId = this.config.entity;
    if (this._hass) this._render();
  }

  set hass(hass) {
    this._hass = hass;
    if (this.config) this._render();
  }

  // -------------------------------------------------------
  // RENDER
  // -------------------------------------------------------
  _render() {
    const hass = this._hass;
    const cfg = this.config;

    if (!hass || !this.entityId) return;

    const stateObj = hass.states[this.entityId];
    if (!stateObj) {
      this.innerHTML = `<ha-card>Błąd: encja nie istnieje.</ha-card>`;
      return;
    }

    const table = stateObj.attributes.table || [];
    const totalTeams = table.length || 0;
    const myPosAttr = stateObj.attributes.my_position;
    const myPosition = myPosAttr != null ? parseInt(myPosAttr, 10) : null;

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
          border-bottom: 1px solid rgba(255,255,255,0.12);
          font-size: ${cfg.font_size.row}rem;
          text-align: center;
          vertical-align: middle;
          white-space: nowrap;
        }

        .ltc-table th {
          font-weight: 600;
          font-size: ${cfg.font_size.header}rem;
          opacity: 0.85;
        }

        .ltc-col-pos   { width: 10%; text-align: right; }
        .ltc-col-team  { text-align: left; font-size: ${cfg.font_size.team}rem; }
        .ltc-col-m     { width: 8%;  }
        .ltc-col-pkt   { width: 10%; font-weight: 600; }
        .ltc-col-goals { width: 14%; }
        .ltc-col-diff  { width: 10%; }
        .ltc-col-trend { width: 10%; }

        /* Highlight colors */
        .ltc-row-favorite {
          background-color: ${cfg.colors.favorite};
        }
        .ltc-row-top {
          background-color: ${cfg.colors.top};
        }
        .ltc-row-conf {
          background-color: ${cfg.colors.conference};
        }
        .ltc-row-bottom {
          background-color: ${cfg.colors.bottom};
        }

        .ltc-team-name {
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .ltc-trend-up   { color: #2e7d32; }
        .ltc-trend-down { color: #c62828; }
        .ltc-trend-same { color: #808080; }

        /* LEGEND */
        .ltc-legend {
          display:flex;
          gap:18px;
          margin-top:10px;
          padding:4px 6px;
          font-size:0.8rem;
          opacity:0.9;
        }
        .ltc-leg-item {
          display:flex;
          align-items:center;
          gap:6px;
        }
        .ltc-leg-box {
          width:14px;
          height:14px;
          border-radius:3px;
        }
      </style>
    `;

    // ROWS
    const rows = table.map((row) =>
      this._renderRow(row, myPosition, totalTeams)
    ).join("");

    // HEADER
    const header = `
      <thead>
        <tr>
          <th class="ltc-col-pos">Poz</th>
          <th class="ltc-col-team">Drużyna</th>
          <th class="ltc-col-m">M</th>
          <th class="ltc-col-pkt">Pkt</th>
          <th class="ltc-col-goals">Bramki</th>
          <th class="ltc-col-diff">+/-</th>
          ${cfg.show_trend ? `<th class="ltc-col-trend">Trend</th>` : ""}
        </tr>
      </thead>
    `;

    const legend = `
      <div class="ltc-legend">
        <div class="ltc-leg-item">
          <div class="ltc-leg-box" style="background:${cfg.colors.top}"></div>
          Liga Mistrzów
        </div>

        <div class="ltc-leg-item">
          <div class="ltc-leg-box" style="background:${cfg.colors.conference}"></div>
          Liga Konferencji
        </div>

        <div class="ltc-leg-item">
          <div class="ltc-leg-box" style="background:${cfg.colors.bottom}"></div>
          Spadek
        </div>
      </div>
    `;

    const tableHTML = `
      ${style}
      <div class="ltc-card">
        <table class="ltc-table">
          ${header}
          <tbody>${rows}</tbody>
        </table>
        ${legend}
      </div>
    `;

    if (cfg.lite_mode) {
      this.innerHTML = tableHTML;
      return;
    }

    const cardName =
      cfg.show_name === false
        ? ""
        : cfg.name || stateObj.attributes.friendly_name || "Tabela ligowa";

    this.innerHTML = `
      ${style}
      <ha-card ${cardName ? `header="${cardName}"` : ""}>
        ${tableHTML}
      </ha-card>
    `;
  }

  // -------------------------------------------------------
  // ROW RENDER
  // -------------------------------------------------------
  _renderRow(row, myPosition, totalTeams) {
    const cfg = this.config;
    const pos = parseInt(row.position, 10);

    const isFav = myPosition && pos === myPosition;
    const isTop = pos >= 1 && pos <= cfg.highlight.top_count;
    const isConf =
      pos > cfg.highlight.top_count &&
      pos <= cfg.highlight.top_count + cfg.highlight.conference_count;

    const isBottom =
      pos > totalTeams - cfg.highlight.bottom_count;

    let cls = "";
    if (isFav) cls = "ltc-row-favorite";
    else if (isTop) cls = "ltc-row-top";
    else if (isConf) cls = "ltc-row-conf";
    else if (isBottom) cls = "ltc-row-bottom";

    const diff = row.diff;
    const diffStr =
      diff !== undefined && diff !== null && diff !== ""
        ? (diff > 0 ? `+${diff}` : diff)
        : "-";

    return `
      <tr class="${cls}">
        <td class="ltc-col-pos">${pos}</td>
        <td class="ltc-col-team"><span class="ltc-team-name">${row.team}</span></td>
        <td class="ltc-col-m">${row.matches}</td>
        <td class="ltc-col-pkt">${row.points}</td>
        <td class="ltc-col-goals">${row.goals}</td>
        <td class="ltc-col-diff">${diffStr}</td>
        ${
          this.config.show_trend
            ? `<td class="ltc-col-trend">${this._trend(row.trend)}</td>`
            : ""
        }
      </tr>
    `;
  }

  _trend(t) {
    if (!t) return "";
    t = String(t).trim().toLowerCase();
    if (["up", "+", "↑"].includes(t)) return `<span class="ltc-trend-up">▲</span>`;
    if (["down", "-", "↓"].includes(t)) return `<span class="ltc-trend-down">▼</span>`;
    return `<span class="ltc-trend-same">━</span>`;
  }

  static getConfigElement() {
    return document.createElement("league-table-card-editor");
  }

  static getStubConfig() {
    return { entity: "sensor.90minut_gornik_zabrze_table" };
  }

  getCardSize() {
    return 5;
  }
}

customElements.define("league-table-card", LeagueTableCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "league-table-card",
  name: "League Table Card (90minut)",
  description: "Tabela ligowa 90minut.pl – kolorowe strefy, legenda, tryb LITE",
});