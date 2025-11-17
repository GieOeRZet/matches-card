// ============================================================================
//  League Table Card (90minut) – stable version (layout = OK)
//  Author: GieOeRZet
//  - Spójny layout z Matches Card
//  - Podświetlenie: ulubiona / LM / LK / spadek
//  - Legenda pod tabelą: kolorek + opis (LM / LK / Spadek)
//  - YAML → karta w pełni działa
// ============================================================================

class LeagueTableCard extends HTMLElement {

  setConfig(config) {
    if (!config.entity) throw new Error("Entity is required");

    this.defaultConfig = {
      name: "Tabela ligowa",
      show_name: true,
      lite_mode: false,

      font_size: {
        header: 0.8,
        row: 0.9,
        team: 1.0,
      },

      highlight: {
        favorite: true,
        top_count: 2,
        conf_count: 2,
        bottom_count: 3,

        favorite_color: "#fff8e1",
        top_color: "#e8f5e9",
        conf_color: "#e3f2fd",
        bottom_color: "#ffebee",
        alpha: 0.55
      }
    };

    this.config = this._mergeDeep(this.defaultConfig, config);
    this.entityId = config.entity;
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._hass.states[this.entityId]) {
      this.innerHTML = "<ha-card>Encja nie istnieje.</ha-card>";
      return;
    }
    this._render();
  }

  // --------------------------
  // Deep merge helper
  // --------------------------
  _mergeDeep(base, extra) {
    const out = {};
    const keys = new Set([...Object.keys(base), ...Object.keys(extra || {})]);
    keys.forEach(k => {
      const bv = base[k];
      const ev = extra ? extra[k] : undefined;
      if (typeof bv === "object" && !Array.isArray(bv)) {
        out[k] = this._mergeDeep(bv, ev || {});
      } else {
        out[k] = ev !== undefined ? ev : bv;
      }
    });
    return out;
  }

  // --------------------------
  // RENDER
  // --------------------------
  _render() {
    const entity = this._hass.states[this.entityId];
    const table = entity.attributes.table || [];
    const myPos = parseInt(entity.attributes.my_position || "0", 10);
    const total = table.length;

    const c = this.config;

    const style = `
      <style>
        .lt-card {
          font-family: "Sofascore Sans", Arial, sans-serif;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          border-bottom: 1px solid rgba(0,0,0,0.1);
          padding: 4px 6px;
          font-size: ${c.font_size.row}rem;
          white-space: nowrap;
          text-align: center;
        }
        th {
          font-weight: 600;
          font-size: ${c.font_size.header}rem;
          opacity: 0.8;
        }
        .team-col {
          text-align: left;
          font-size: ${c.font_size.team}rem;
        }

        .fav { background: ${this._rgba(c.highlight.favorite_color, c.highlight.alpha)}; }
        .lm  { background: ${this._rgba(c.highlight.top_color, c.highlight.alpha)}; }
        .lk  { background: ${this._rgba(c.highlight.conf_color, c.highlight.alpha)}; }
        .sp  { background: ${this._rgba(c.highlight.bottom_color, c.highlight.alpha)}; }

        .legend { margin-top: 10px; font-size: 0.75rem; opacity:0.85; display:flex; gap:20px; }
        .lg-item { display:flex; align-items:center; gap:6px; }
        .lg-box  { width:14px; height:14px; border-radius:3px; }
      </style>
    `;

    const header = `
      <thead>
        <tr>
          <th>Poz</th>
          <th class="team-col">Drużyna</th>
          <th>M</th>
          <th>Pkt</th>
          <th>Bramki</th>
          <th>+/-</th>
        </tr>
      </thead>
    `;

    const rows = table.map(row => {
      const pos = parseInt(row.position || "0", 10);
      const diff = row.diff >= 0 ? "+" + row.diff : row.diff;

      let cls = "";
      if (c.highlight.favorite && pos === myPos) cls = "fav";
      else if (pos <= c.highlight.top_count) cls = "lm";
      else if (pos > c.highlight.top_count && pos <= c.highlight.top_count + c.highlight.conf_count) cls = "lk";
      else if (pos > total - c.highlight.bottom_count) cls = "sp";

      return `
        <tr class="${cls}">
          <td>${pos}</td>
          <td class="team-col">${row.team}</td>
          <td>${row.matches}</td>
          <td>${row.points}</td>
          <td>${row.goals}</td>
          <td>${diff}</td>
        </tr>
      `;
    }).join("");

    const legend = `
      <div class="legend">
        <div class="lg-item">
          <div class="lg-box" style="background:${this._rgba(c.highlight.top_color, c.highlight.alpha)}"></div>
          Liga Mistrzów
        </div>
        <div class="lg-item">
          <div class="lg-box" style="background:${this._rgba(c.highlight.conf_color, c.highlight.alpha)}"></div>
          Liga Konferencji
        </div>
        <div class="lg-item">
          <div class="lg-box" style="background:${this._rgba(c.highlight.bottom_color, c.highlight.alpha)}"></div>
          Spadek
        </div>
      </div>
    `;

    // LITE MODE
    if (c.lite_mode) {
      this.innerHTML = `
        ${style}
        <div class="lt-card">
          <table>${header}<tbody>${rows}</tbody></table>
          ${legend}
        </div>
      `;
      return;
    }

    // NORMAL MODE
    const cardName = c.show_name ? (c.name || entity.attributes.friendly_name) : "";
    this.innerHTML = `
      ${style}
      <ha-card ${cardName ? `header="${cardName}"` : ""}>
        <div class="lt-card">
          <table>${header}<tbody>${rows}</tbody></table>
          ${legend}
        </div>
      </ha-card>
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
    return document.createElement("league-table-card-editor");
  }

  static getStubConfig() {
    return { entity: "sensor.90minut_gornik_zabrze_table" };
  }
}

if (!customElements.get("league-table-card")) {
  customElements.define("league-table-card", LeagueTableCard);
}

window.customCards = window.customCards || [];
window.customCards.push({
  type: "league-table-card",
  name: "League Table Card (90minut)",
  description: "Karta tabeli ligowej kompatybilna z Matches Card"
});