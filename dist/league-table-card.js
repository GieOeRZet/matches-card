// ============================================================================
//  League Table Card (90minut) – v0.1.000 (no trend)
// ============================================================================

class LeagueTableCard extends HTMLElement {

  setConfig(config) {
    if (!config.entity)
      throw new Error("Entity is required (np. sensor.90minut_table)");

    this.config = {
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
        conference_count: 2,
        bottom_count: 3,
        favorite_color: "rgba(255,255,255,0.35)",
        top_color: "rgba(59,165,93,0.35)",
        conf_color: "rgba(70,140,210,0.35)",
        bottom_color: "rgba(226,59,59,0.35)"
      },

      ...config
    };

    this.entityId = this.config.entity;
  }

  set hass(hass) {
    this._hass = hass;
    const stateObj = hass.states[this.entityId];

    if (!stateObj) {
      this.innerHTML = "<ha-card>Encja nie istnieje.</ha-card>";
      return;
    }

    const table = stateObj.attributes.table || [];
    const total = table.length;
    const myPos = parseInt(stateObj.attributes.my_position, 10);

    const cfg = this.config;

    const style = `
      <style>
        table {
          width:100%;
          border-collapse:collapse;
          font-family: Arial, sans-serif;
        }

        th, td {
          padding:4px 6px;
          border-bottom:1px solid rgba(0,0,0,0.1);
          text-align:center;
          white-space:nowrap;
        }

        th {
          font-size:${cfg.font_size.header}rem;
          opacity:0.75;
        }

        .team-col {
          text-align:left;
          font-size:${cfg.font_size.team}rem;
        }

        .fav { background:${cfg.highlight.favorite_color}; }
        .top { background:${cfg.highlight.top_color}; }
        .conf { background:${cfg.highlight.conf_color}; }
        .bot { background:${cfg.highlight.bottom_color}; }

        .legend {
          margin-top:10px;
          display:flex;
          gap:14px;
          align-items:center;
          font-size:0.85rem;
          opacity:0.8;
        }
        .legend-box {
          width:14px;
          height:14px;
          border-radius:4px;
          display:inline-block;
        }
      </style>
    `;

    const rows = table.map(row => {
      const pos = parseInt(row.position, 10);

      let cls = "";
      if (cfg.highlight.favorite && pos === myPos) cls = "fav";
      else if (pos <= cfg.highlight.top_count) cls = "top";
      else if (pos > cfg.highlight.top_count && pos <= cfg.highlight.top_count + cfg.highlight.conference_count) cls = "conf";
      else if (pos > total - cfg.highlight.bottom_count) cls = "bot";

      return `
        <tr class="${cls}">
          <td>${pos}</td>
          <td class="team-col">${row.team}</td>
          <td>${row.matches}</td>
          <td>${row.points}</td>
          <td>${row.goals}</td>
          <td>${row.diff >= 0 ? "+" + row.diff : row.diff}</td>
        </tr>
      `;
    }).join("");

    const legend = `
      <div class="legend">
        <span class="legend-box" style="background:${cfg.highlight.top_color}"></span> TOP 2 (Liga Mistrzów)
        <span class="legend-box" style="background:${cfg.highlight.conf_color}"></span> 3–4 (Liga Konferencji)
        <span class="legend-box" style="background:${cfg.highlight.bottom_color}"></span> Spadek (ostatnie 3)
      </div>
    `;

    const header = this.config.show_name ? `header="${this.config.name}"` : "";

    if (this.config.lite_mode) {
      this.innerHTML = `${style}<table><tbody>${rows}</tbody></table>${legend}`;
      return;
    }

    this.innerHTML = `
      ${style}
      <ha-card ${header}>
        <table>
          <thead>
            <tr>
              <th>Poz</th>
              <th>Drużyna</th>
              <th>M</th>
              <th>Pkt</th>
              <th>Bramki</th>
              <th>+/-</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        ${legend}
      </ha-card>
    `;
  }
}

customElements.define("league-table-card", LeagueTableCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "league-table-card",
  name: "League Table Card (90minut)",
  description: "Tabela ligowa bez trendu"
});