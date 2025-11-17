// ============================================================================
//  League Table Card (90minut) – v0.1.100
//  Author: GieOeRZet
//  Dane z sensora: attributes.table[], my_position, my_points, my_goal_diff
//  - Spójny layout z Matches Card
//  - Podświetlenie: TOP / Liga Konferencji / dół / moja drużyna
//  - Ostatnia kolumna: TREND (opcjonalne pole "trend" w każdym wierszu)
//  - Tryb LITE: bez <ha-card>, samo <table>
//  - Kolory + ALFA konfigurowalne, domyślna alfa = 0.55 (jak w karcie meczów)
// ============================================================================

class LeagueTableCard extends HTMLElement {
  setConfig(config) {
    if (!config.entity) {
      throw new Error(
        "Entity is required (np. sensor.90minut_gornik_zabrze_table)"
      );
    }

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

      highlight: {
        favorite: true,

        // ILE MIEJSC:
        top_count: 2,    // Top2 = "Liga Mistrzów"
        eu_count: 2,     // 3–4 = "Liga Konferencji"
        bottom_count: 3, // 3 ostatnie = "Spadek"

        // KOLORY (bez powiązania z kartą meczową, ale stylistycznie podobne)
        favorite_color: "#ffffff", // biały, będzie z alfą
        top_color: "#3ba55d",      // zielony (jak win)
        eu_color: "#468cd2",       // niebieski (jak draw)
        bottom_color: "#e23b3b",   // czerwony (jak loss)

        // ALFY – ustawione tak jak końcowa alfa w gradientach meczowych
        favorite_alpha: 0.55,
        top_alpha: 0.55,
        eu_alpha: 0.55,
        bottom_alpha: 0.55,
      },
    };

    this.config = {
      ...defaults,
      ...config,
      font_size: { ...defaults.font_size, ...(config.font_size || {}) },
      highlight: { ...defaults.highlight, ...(config.highlight || {}) },
    };

    this.entityId = config.entity;
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  // -------------------------------------------------
  // RENDER
  // -------------------------------------------------
  _render() {
    if (!this._hass || !this.entityId) return;

    const stateObj = this._hass.states[this.entityId];
    if (!stateObj) {
      this.innerHTML = "<ha-card>Błąd: encja nie istnieje.</ha-card>";
      return;
    }

    const table = stateObj.attributes.table || [];
    const totalTeams = table.length || 0;
    const myPosAttr = stateObj.attributes.my_position;
    const myPosition = myPosAttr != null ? parseInt(myPosAttr, 10) : null;

    const cfg = this.config;
    const hl = cfg.highlight;

    // Wyliczamy REALNE kolory z alfą
    const favBg = this._withAlpha(hl.favorite_color, hl.favorite_alpha);
    const topBg = this._withAlpha(hl.top_color, hl.top_alpha);
    const euBg = this._withAlpha(hl.eu_color, hl.eu_alpha);
    const bottomBg = this._withAlpha(hl.bottom_color, hl.bottom_alpha);

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
          font-size: ${cfg.font_size.row}rem;
          text-align: center;
          vertical-align: middle;
          white-space: nowrap;
        }
        .ltc-table th {
          font-weight: 600;
          font-size: ${cfg.font_size.header}rem;
          opacity: 0.8;
        }
        .ltc-col-pos   { width: 10%; text-align: right; }
        .ltc-col-team  {
          text-align: left;
          font-size: ${cfg.font_size.team}rem;
        }
        .ltc-col-m     { width: 8%;  }
        .ltc-col-pkt   { width: 10%; font-weight: 600; }
        .ltc-col-goals { width: 14%; }
        .ltc-col-diff  { width: 10%; }
        .ltc-col-trend { width: 10%; }

        .ltc-row-favorite {
          background-color: ${favBg};
        }
        .ltc-row-top {
          background-color: ${topBg};
        }
        .ltc-row-eu {
          background-color: ${euBg};
        }
        .ltc-row-bottom {
          background-color: ${bottomBg};
        }

        .ltc-team-name {
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .ltc-trend-up {
          color: var(--success-color, #2e7d32);
        }
        .ltc-trend-down {
          color: var(--error-color, #c62828);
        }
        .ltc-trend-same {
          color: var(--secondary-text-color, #808080);
        }

        .ltc-legend {
          margin-top: 6px;
          font-size: 0.75rem;
          opacity: 0.85;
          display: flex;
          flex-wrap: wrap;
          gap: 8px 16px;
          align-items: center;
        }
        .ltc-legend-item {
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .ltc-legend-box {
          width: 10px;
          height: 10px;
          border-radius: 2px;
        }
      </style>
    `;

    const rowsHTML = table
      .map((row) => this._renderRow(row, myPosition, totalTeams))
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
          ${
            this.config.show_trend
              ? `<th class="ltc-col-trend">Trend</th>`
              : ""
          }
        </tr>
      </thead>
    `;

    const tableHTML = `
      <div class="ltc-card">
        <table class="ltc-table">
          ${headerHTML}
          <tbody>
            ${rowsHTML}
          </tbody>
        </table>
        ${this._renderLegend(topBg, euBg, bottomBg)}
      </div>
    `;

    if (this.config.lite_mode) {
      this.innerHTML = `
        ${style}
        ${tableHTML}
      `;
      return;
    }

    const cardName =
      this.config.show_name === false
        ? ""
        : this.config.name ||
          stateObj.attributes.friendly_name ||
          "Tabela ligowa";

    this.innerHTML = `
      ${style}
      <ha-card ${cardName ? `header="${cardName}"` : ""}>
        ${tableHTML}
      </ha-card>
    `;
  }

  // -------------------------------------------------
  // POJEDYNCZY WIERSZ
  // -------------------------------------------------
  _renderRow(row, myPosition, totalTeams) {
    const cfg = this.config;
    const hl = cfg.highlight;

    const pos = row.position ? parseInt(row.position, 10) : null;

    const isFavorite =
      hl.favorite && myPosition != null && pos === myPosition;

    const isTop =
      hl.top_count > 0 &&
      pos != null &&
      pos >= 1 &&
      pos <= hl.top_count;

    const isEU =
      hl.eu_count > 0 &&
      pos != null &&
      pos > hl.top_count &&
      pos <= hl.top_count + hl.eu_count;

    const isBottom =
      hl.bottom_count > 0 &&
      pos != null &&
      totalTeams > 0 &&
      pos > totalTeams - hl.bottom_count;

    let rowClass = "";
    if (isFavorite) {
      rowClass = "ltc-row-favorite";
    } else if (isTop) {
      rowClass = "ltc-row-top";
    } else if (isEU) {
      rowClass = "ltc-row-eu";
    } else if (isBottom) {
      rowClass = "ltc-row-bottom";
    }

    const matches = row.matches ?? "-";
    const points = row.points ?? "-";
    const goals = row.goals ?? "-";

    let diff = row.diff;
    let diffStr = "-";
    if (diff !== undefined && diff !== null && diff !== "") {
      const n = typeof diff === "number" ? diff : parseInt(diff, 10);
      if (!isNaN(n)) {
        diffStr = (n > 0 ? "+" : "") + n;
      } else {
        diffStr = String(diff);
      }
    }

    const teamName = row.team || "";

    let trendHTML = "";
    if (cfg.show_trend) {
      trendHTML = this._renderTrend(row.trend);
    }

    return `
      <tr class="${rowClass}">
        <td class="ltc-col-pos">${pos != null && !isNaN(pos) ? pos : ""}</td>
        <td class="ltc-col-team">
          <span class="ltc-team-name">${teamName}</span>
        </td>
        <td class="ltc-col-m">${matches}</td>
        <td class="ltc-col-pkt">${points}</td>
        <td class="ltc-col-goals">${goals}</td>
        <td class="ltc-col-diff">${diffStr}</td>
        ${
          cfg.show_trend
            ? `<td class="ltc-col-trend">${trendHTML}</td>`
            : ""
        }
      </tr>
    `;
  }

  _renderTrend(trend) {
    if (!trend) return "";

    const t = String(trend).toLowerCase().trim();

    if (t === "up" || t === "+" || t === "↑" || t === "▲") {
      return `<span class="ltc-trend-up">▲</span>`;
    }
    if (t === "down" || t === "-" || t === "↓" || t === "▼") {
      return `<span class="ltc-trend-down">▼</span>`;
    }
    if (t === "same" || t === "0" || t === "=" || t === "→") {
      return `<span class="ltc-trend-same">━</span>`;
    }

    return `<span>${trend}</span>`;
  }

  // -------------------------------------------------
  // LEGENDA (Top2 / 3–4 / spadek)
  // -------------------------------------------------
  _renderLegend(topBg, euBg, bottomBg) {
    return `
      <div class="ltc-legend">
        <div class="ltc-legend-item">
          <span class="ltc-legend-box" style="background:${topBg};"></span>
          <span>Top 2 – Liga Mistrzów</span>
        </div>
        <div class="ltc-legend-item">
          <span class="ltc-legend-box" style="background:${euBg};"></span>
          <span>3–4 – Liga Konferencji</span>
        </div>
        <div class="ltc-legend-item">
          <span class="ltc-legend-box" style="background:${bottomBg};"></span>
          <span>3 ostatnie – Spadek</span>
        </div>
      </div>
    `;
  }

  // -------------------------------------------------
  // HELPERY
  // -------------------------------------------------
  _withAlpha(hex, alpha) {
    const a =
      typeof alpha === "number" && alpha >= 0 && alpha <= 1 ? alpha : 0.55;
    const h = (hex || "").replace("#", "");
    if (h.length !== 6) return `rgba(0,0,0,${a})`;

    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);

    if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
      return `rgba(0,0,0,${a})`;
    }

    return `rgba(${r},${g},${b},${a})`;
  }

  static getConfigElement() {
    return document.createElement("league-table-card-editor");
  }

  static getStubConfig() {
    return {
      entity: "sensor.90minut_gornik_zabrze_table",
    };
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
  description: "Tabela ligowa na podstawie sensora 90minut.pl",
});