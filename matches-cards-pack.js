// Matches Cards Pack – version 0.3.112
// Auto-generated from dist/

// ===== FILE INCLUDED: dist/league-table-card-editor.js =====
// ============================================================================
//  League Table Card Editor (90minut)
//  - Bez lit, czysty Web Component
//  - Debounce ~700 ms na config-changed
//  - Sekcje <details> nie zwijają się same
//  - Obsługa: nazwa, show_name, lite_mode, font_size, highlight + kolory + alfa
// ============================================================================

class LeagueTableCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = {};
    this._debounceTimer = null;
  }

  setConfig(config) {
    // Głęboka kopia, żeby nie mieszać w oryginalnym obiekcie HA
    this._config = JSON.parse(JSON.stringify(config || {}));
    this._render();
  }

  set hass(_hass) {
    // Edytor nie potrzebuje hass, ale metoda musi istnieć
  }

  // ---------------------------------------------------------------------------
  // RENDER – tylko raz w setConfig, bez przebudowy przy każdej zmianie
  // ---------------------------------------------------------------------------
  _render() {
    if (!this.shadowRoot) return;

    this.shadowRoot.innerHTML = `
      <style>
        .group {
          margin: 12px 0;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.18);
          overflow: hidden;
        }

        .group summary {
          padding: 8px 12px;
          font-size: 0.95rem;
          cursor: pointer;
          background: rgba(255,255,255,0.04);
        }

        .group > div {
          padding: 10px 16px 14px 16px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px 14px;
        }

        label {
          display: flex;
          flex-direction: column;
          font-size: 0.85rem;
          opacity: 0.9;
        }

        input[type="text"],
        input[type="number"],
        select {
          margin-top: 4px;
          padding: 4px 6px;
          border-radius: 6px;
          border: 1px solid rgba(255,255,255,0.20);
          background: rgba(0,0,0,0.2);
          color: inherit;
          font: inherit;
        }

        input[type="color"] {
          margin-top: 4px;
          width: 48px;
          height: 28px;
          padding: 0;
          border-radius: 4px;
          border: 1px solid rgba(255,255,255,0.25);
          background: transparent;
        }

        .switch-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 4px;
        }

        .switch-row span {
          font-size: 0.9rem;
        }

        .full-width {
          grid-column: 1 / -1;
        }
      </style>

      <!-- PODSTAWOWE -->
      <details class="group" open>
        <summary>Podstawowe</summary>
        <div>
          <label class="full-width">
            Nazwa karty
            <input id="name" type="text">
          </label>

          <label class="full-width">
            <div class="switch-row">
              <ha-switch id="show_name"></ha-switch>
              <span>Pokaż nagłówek (ha-card header)</span>
            </div>
          </label>

          <label class="full-width">
            <div class="switch-row">
              <ha-switch id="lite_mode"></ha-switch>
              <span>Tryb LITE (bez tła ha-card)</span>
            </div>
          </label>
        </div>
      </details>

      <!-- ROZMIARY CZCIONEK -->
      <details class="group" open>
        <summary>Rozmiary czcionek</summary>
        <div>
          <label>
            Nagłówek tabeli
            <input id="font_header" type="number" step="0.1">
          </label>

          <label>
            Wiersz (cyfry)
            <input id="font_row" type="number" step="0.1">
          </label>

          <label>
            Nazwa drużyny
            <input id="font_team" type="number" step="0.1">
          </label>
        </div>
      </details>

      <!-- PODŚWIETLENIE -->
      <details class="group" open>
        <summary>Podświetlenie miejsc</summary>
        <div>
          <label>
            Liczba miejsc TOP (np. awans do LM)
            <input id="top_count" type="number" min="0" step="1">
          </label>

          <label>
            Liczba miejsc SPADKOWYCH
            <input id="bottom_count" type="number" min="0" step="1">
          </label>

          <label class="full-width">
            <div class="switch-row">
              <ha-switch id="highlight_favorite"></ha-switch>
              <span>Podświetl moją drużynę (my_position)</span>
            </div>
          </label>
        </div>
      </details>

      <!-- KOLORY + ALFA -->
      <details class="group" open>
        <summary>Kolory podświetleń</summary>
        <div>
          <label>
            Moja drużyna – kolor
            <input id="fav_color" type="color">
          </label>

          <label>
            Moja drużyna – alfa
            <input id="fav_alpha" type="number" min="0" max="1" step="0.05">
          </label>

          <label>
            TOP (np. 1–2 miejsce) – kolor
            <input id="top_color" type="color">
          </label>

          <label>
            TOP – alfa
            <input id="top_alpha" type="number" min="0" max="1" step="0.05">
          </label>

          <label>
            Spadek – kolor
            <input id="bottom_color" type="color">
          </label>

          <label>
            Spadek – alfa
            <input id="bottom_alpha" type="number" min="0" max="1" step="0.05">
          </label>
        </div>
      </details>
    `;

    this._bindValues();
    this._bindEvents();
  }

  // ---------------------------------------------------------------------------
  // Wstawienie wartości z configu do kontrolek
  // ---------------------------------------------------------------------------
  _bindValues() {
    const root = this.shadowRoot;
    const c = this._config || {};
    const fs = c.font_size || {};
    const hl = c.highlight || {};

    // Podstawowe
    root.getElementById("name").value = c.name ?? "";

    const showName = root.getElementById("show_name");
    showName.checked = c.show_name !== false;

    const liteMode = root.getElementById("lite_mode");
    liteMode.checked = c.lite_mode === true;

    // Czcionki
    root.getElementById("font_header").value =
      typeof fs.header === "number" ? fs.header : 0.8;
    root.getElementById("font_row").value =
      typeof fs.row === "number" ? fs.row : 0.9;
    root.getElementById("font_team").value =
      typeof fs.team === "number" ? fs.team : 1.0;

    // Podświetlenie / ilość miejsc
    root.getElementById("top_count").value =
      typeof hl.top_count === "number" ? hl.top_count : 2;
    root.getElementById("bottom_count").value =
      typeof hl.bottom_count === "number" ? hl.bottom_count : 3;

    const favSwitch = root.getElementById("highlight_favorite");
    favSwitch.checked = hl.favorite !== false;

    // Kolory + alfa
    root.getElementById("fav_color").value =
      hl.favorite_color || "#fff8e1";
    root.getElementById("fav_alpha").value =
      typeof hl.favorite_alpha === "number" ? hl.favorite_alpha : 0.55;

    root.getElementById("top_color").value =
      hl.top_color || "#3ba55d"; // zielony jak WIN z karty meczowej
    root.getElementById("top_alpha").value =
      typeof hl.top_alpha === "number" ? hl.top_alpha : 0.55;

    root.getElementById("bottom_color").value =
      hl.bottom_color || "#e23b3b"; // czerwony jak LOSS
    root.getElementById("bottom_alpha").value =
      typeof hl.bottom_alpha === "number" ? hl.bottom_alpha : 0.55;
  }

  // ---------------------------------------------------------------------------
  // Podpięcie zdarzeń
  // ---------------------------------------------------------------------------
  _bindEvents() {
    const root = this.shadowRoot;

    // Nazwa
    root.getElementById("name").addEventListener("input", (ev) => {
      this._config.name = ev.target.value;
      this._scheduleUpdate();
    });

    // show_name
    root.getElementById("show_name").addEventListener("change", (ev) => {
      this._config.show_name = ev.target.checked;
      this._scheduleUpdate();
    });

    // lite_mode
    root.getElementById("lite_mode").addEventListener("change", (ev) => {
      this._config.lite_mode = ev.target.checked;
      this._scheduleUpdate();
    });

    // Czcionki
    root.getElementById("font_header").addEventListener("input", (ev) => {
      const v = parseFloat(ev.target.value);
      this._ensurePath("font_size");
      this._config.font_size.header = isNaN(v) ? 0.8 : v;
      this._scheduleUpdate();
    });

    root.getElementById("font_row").addEventListener("input", (ev) => {
      const v = parseFloat(ev.target.value);
      this._ensurePath("font_size");
      this._config.font_size.row = isNaN(v) ? 0.9 : v;
      this._scheduleUpdate();
    });

    root.getElementById("font_team").addEventListener("input", (ev) => {
      const v = parseFloat(ev.target.value);
      this._ensurePath("font_size");
      this._config.font_size.team = isNaN(v) ? 1.0 : v;
      this._scheduleUpdate();
    });

    // Liczba miejsc
    root.getElementById("top_count").addEventListener("input", (ev) => {
      const v = parseInt(ev.target.value, 10);
      this._ensurePath("highlight");
      this._config.highlight.top_count = isNaN(v) ? 2 : v;
      this._scheduleUpdate();
    });

    root.getElementById("bottom_count").addEventListener("input", (ev) => {
      const v = parseInt(ev.target.value, 10);
      this._ensurePath("highlight");
      this._config.highlight.bottom_count = isNaN(v) ? 3 : v;
      this._scheduleUpdate();
    });

    // Podświetlenie mojej drużyny
    root.getElementById("highlight_favorite").addEventListener("change", (ev) => {
      this._ensurePath("highlight");
      this._config.highlight.favorite = ev.target.checked;
      this._scheduleUpdate();
    });

    // Kolor + alfa – moja drużyna
    root.getElementById("fav_color").addEventListener("input", (ev) => {
      this._ensurePath("highlight");
      this._config.highlight.favorite_color = ev.target.value;
      this._scheduleUpdate();
    });

    root.getElementById("fav_alpha").addEventListener("input", (ev) => {
      const v = parseFloat(ev.target.value);
      this._ensurePath("highlight");
      this._config.highlight.favorite_alpha = isNaN(v) ? 0.55 : v;
      this._scheduleUpdate();
    });

    // Kolor + alfa – TOP
    root.getElementById("top_color").addEventListener("input", (ev) => {
      this._ensurePath("highlight");
      this._config.highlight.top_color = ev.target.value;
      this._scheduleUpdate();
    });

    root.getElementById("top_alpha").addEventListener("input", (ev) => {
      const v = parseFloat(ev.target.value);
      this._ensurePath("highlight");
      this._config.highlight.top_alpha = isNaN(v) ? 0.55 : v;
      this._scheduleUpdate();
    });

    // Kolor + alfa – SPADKI
    root.getElementById("bottom_color").addEventListener("input", (ev) => {
      this._ensurePath("highlight");
      this._config.highlight.bottom_color = ev.target.value;
      this._scheduleUpdate();
    });

    root.getElementById("bottom_alpha").addEventListener("input", (ev) => {
      const v = parseFloat(ev.target.value);
      this._ensurePath("highlight");
      this._config.highlight.bottom_alpha = isNaN(v) ? 0.55 : v;
      this._scheduleUpdate();
    });
  }

  _ensurePath(key) {
    if (!this._config[key] || typeof this._config[key] !== "object") {
      this._config[key] = {};
    }
  }

  // ---------------------------------------------------------------------------
  // Debounce + wysłanie config-changed
  // ---------------------------------------------------------------------------
  _scheduleUpdate() {
    if (this._debounceTimer) clearTimeout(this._debounceTimer);
    this._debounceTimer = setTimeout(
      () => this._emitConfigChanged(),
      700
    );
  }

  _emitConfigChanged() {
    const ev = new CustomEvent("config-changed", {
      detail: { config: this._config },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(ev);
  }

  static get stubConfig() {
    return {
      entity: "sensor.90minut_gornik_zabrze_table",
    };
  }
}

customElements.define("league-table-card-editor", LeagueTableCardEditor);
// ===== FILE INCLUDED: dist/league-table-card.js =====
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
// ===== FILE INCLUDED: dist/matches-card-editor.js =====
// ============================================================================
//  Matches Card Editor – FINAL
//  - Bez lit, czysty Web Component
//  - Nie prze-renderuje się przy każdej zmianie (brak utraty focusa)
//  - Sekcje <details> nie zamykają się same
//  - Debounce ~700 ms na "config-changed"
//  - Spięty z konfiguracją z MatchesCard.getStubConfig()
// ============================================================================

class MatchesCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = {};
    this._debounceTimer = null;
  }

  setConfig(config) {
    // głęboka kopia żeby nie grzebać w oryginale
    this._config = JSON.parse(JSON.stringify(config || {}));
    this._render();
  }

  // --------------------------------------
  //  Home Assistant może to wywoływać
  // --------------------------------------
  set hass(_hass) {
    // edytor nie potrzebuje hass, ale metoda musi istnieć
  }

  // --------------------------------------
  //  RENDER (JEDNORAZOWY, BEZ PRZE-RENDERÓW NA INPUT)
  // --------------------------------------
  _render() {
    if (!this.shadowRoot) return;

    const c = this._config;

    this.shadowRoot.innerHTML = `
      <style>
        .group {
          margin: 12px 0;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.15);
          overflow: hidden;
        }

        .group summary {
          padding: 8px 12px;
          font-size: 0.95rem;
          cursor: pointer;
          background: rgba(255,255,255,0.04);
        }

        .group > div {
          padding: 10px 16px 14px 16px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px 14px;
        }

        label {
          display: flex;
          flex-direction: column;
          font-size: 0.85rem;
          opacity: 0.9;
        }

        input[type="text"],
        input[type="number"],
        select {
          margin-top: 4px;
          padding: 4px 6px;
          border-radius: 6px;
          border: 1px solid rgba(255,255,255,0.20);
          background: rgba(0,0,0,0.2);
          color: inherit;
          font: inherit;
        }

        input[type="color"] {
          margin-top: 4px;
          width: 48px;
          height: 28px;
          padding: 0;
          border-radius: 4px;
          border: 1px solid rgba(255,255,255,0.25);
          background: transparent;
        }

        .switch-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 4px;
        }

        .switch-row span {
          font-size: 0.9rem;
        }

        .full-width {
          grid-column: 1 / -1;
        }
      </style>

      <!-- PODSTAWOWE -->
      <details class="group" open>
        <summary>Podstawowe</summary>
        <div>
          <label class="full-width">
            Nazwa karty
            <input id="name" type="text">
          </label>

          <label class="full-width">
            <div class="switch-row">
              <ha-switch id="show_name"></ha-switch>
              <span>Pokaż nagłówek (ha-card header)</span>
            </div>
          </label>

          <label class="full-width">
            <div class="switch-row">
              <ha-switch id="show_logos"></ha-switch>
              <span>Pokaż herby</span>
            </div>
          </label>

          <label class="full-width">
            <div class="switch-row">
              <ha-switch id="full_team_names"></ha-switch>
              <span>Pełne nazwy drużyn (zamiast skróconych)</span>
            </div>
          </label>

          <label class="full-width">
            <div class="switch-row">
              <ha-switch id="show_result_symbols"></ha-switch>
              <span>Pokaż symbole W / D / L</span>
            </div>
          </label>

          <label class="full-width">
            <div class="switch-row">
              <ha-switch id="lite_mode"></ha-switch>
              <span>Tryb LITE (bez tła ha-card)</span>
            </div>
          </label>
        </div>
      </details>

      <!-- WYPEŁNIENIE -->
      <details class="group" open>
        <summary>Wypełnienie tła wiersza</summary>
        <div>
          <label>
            Tryb wypełnienia
            <select id="fill_mode">
              <option value="gradient">Gradient (kolor zależny od wyniku)</option>
              <option value="zebra">Zebra</option>
              <option value="clear">Brak</option>
            </select>
          </label>

          <label>
            Kolor zebry
            <input id="zebra_color" type="color">
          </label>

          <label>
            Alfa zebry
            <input id="zebra_alpha" type="number" min="0" max="1" step="0.05">
          </label>

          <label>
            Gradient – start (%)
            <input id="grad_start" type="number" min="0" max="100" step="1">
          </label>

          <label>
            Gradient – koniec (%)
            <input id="grad_end" type="number" min="0" max="100" step="1">
          </label>

          <label>
            Gradient – alfa start
            <input id="grad_alpha_start" type="number" min="0" max="1" step="0.05">
          </label>

          <label>
            Gradient – alfa koniec
            <input id="grad_alpha_end" type="number" min="0" max="1" step="0.05">
          </label>
        </div>
      </details>

      <!-- CZCIONKI -->
      <details class="group" open>
        <summary>Rozmiary czcionek</summary>
        <div>
          <label>
            Data
            <input id="font_date" type="number" step="0.1">
          </label>

          <label>
            Status (KONIEC / godzina)
            <input id="font_status" type="number" step="0.1">
          </label>

          <label>
            Drużyny
            <input id="font_teams" type="number" step="0.1">
          </label>

          <label>
            Wynik
            <input id="font_score" type="number" step="0.1">
          </label>
        </div>
      </details>

      <!-- IKONY -->
      <details class="group" open>
        <summary>Rozmiary ikon</summary>
        <div>
          <label>
            Logo ligi
            <input id="icon_league" type="number" min="10" max="80" step="1">
          </label>

          <label>
            Herby
            <input id="icon_crest" type="number" min="10" max="80" step="1">
          </label>

          <label>
            Symbol W / D / L
            <input id="icon_result" type="number" min="10" max="80" step="1">
          </label>
        </div>
      </details>

      <!-- KOLORY W/D/L -->
      <details class="group" open>
        <summary>Kolory wyników</summary>
        <div>
          <label>
            Wygrana (W)
            <input id="color_win" type="color">
          </label>

          <label>
            Remis (D)
            <input id="color_draw" type="color">
          </label>

          <label>
            Porażka (L)
            <input id="color_loss" type="color">
          </label>
        </div>
      </details>
    `;

    this._bindValues();
    this._bindEvents();
  }

  // --------------------------------------
  //  WSTAWIENIE WARTOŚCI Z CONFIG DO INPUTÓW
  // --------------------------------------
  _bindValues() {
    const root = this.shadowRoot;
    const c = this._config;

    // Podstawowe
    root.getElementById("name").value = c.name ?? "";

    const showName = root.getElementById("show_name");
    showName.checked = c.show_name !== false;

    const showLogos = root.getElementById("show_logos");
    showLogos.checked = c.show_logos !== false;

    const fullTeamNames = root.getElementById("full_team_names");
    fullTeamNames.checked = c.full_team_names !== false;

    const showResultSymbols = root.getElementById("show_result_symbols");
    showResultSymbols.checked = c.show_result_symbols !== false;

    const liteMode = root.getElementById("lite_mode");
    liteMode.checked = c.lite_mode === true;

    // Wypełnienie
    root.getElementById("fill_mode").value = c.fill_mode || "gradient";

    root.getElementById("zebra_color").value = c.zebra_color || "#f0f0f0";
    root.getElementById("zebra_alpha").value =
      typeof c.zebra_alpha === "number" ? c.zebra_alpha : 0.4;

    const grad = c.gradient || {};
    root.getElementById("grad_start").value =
      typeof grad.start === "number" ? grad.start : 35;
    root.getElementById("grad_end").value =
      typeof grad.end === "number" ? grad.end : 100;
    root.getElementById("grad_alpha_start").value =
      typeof grad.alpha_start === "number" ? grad.alpha_start : 0.0;
    root.getElementById("grad_alpha_end").value =
      typeof grad.alpha_end === "number" ? grad.alpha_end : 0.55;

    // Czcionki
    const fs = c.font_size || {};
    root.getElementById("font_date").value =
      typeof fs.date === "number" ? fs.date : 0.9;
    root.getElementById("font_status").value =
      typeof fs.status === "number" ? fs.status : 0.8;
    root.getElementById("font_teams").value =
      typeof fs.teams === "number" ? fs.teams : 1.0;
    root.getElementById("font_score").value =
      typeof fs.score === "number" ? fs.score : 1.0;

    // Ikony
    const isz = c.icon_size || {};
    root.getElementById("icon_league").value =
      typeof isz.league === "number" ? isz.league : 26;
    root.getElementById("icon_crest").value =
      typeof isz.crest === "number" ? isz.crest : 24;
    root.getElementById("icon_result").value =
      typeof isz.result === "number" ? isz.result : 26;

    // Kolory W/D/L
    const col = c.colors || {};
    root.getElementById("color_win").value = col.win || "#3ba55d";
    root.getElementById("color_draw").value = col.draw || "#468cd2";
    root.getElementById("color_loss").value = col.loss || "#e23b3b";
  }

  // --------------------------------------
  //  PODPIĘCIE ZDARZEŃ
  // --------------------------------------
  _bindEvents() {
    const root = this.shadowRoot;

    // Tekst: nazwa
    root.getElementById("name").addEventListener("input", (ev) => {
      this._config.name = ev.target.value;
      this._scheduleUpdate();
    });

    // Switche
    root.getElementById("show_name").addEventListener("change", (ev) => {
      this._config.show_name = ev.target.checked;
      this._scheduleUpdate();
    });

    root.getElementById("show_logos").addEventListener("change", (ev) => {
      this._config.show_logos = ev.target.checked;
      this._scheduleUpdate();
    });

    root.getElementById("full_team_names").addEventListener("change", (ev) => {
      this._config.full_team_names = ev.target.checked;
      this._scheduleUpdate();
    });

    root.getElementById("show_result_symbols").addEventListener("change", (ev) => {
      this._config.show_result_symbols = ev.target.checked;
      this._scheduleUpdate();
    });

    root.getElementById("lite_mode").addEventListener("change", (ev) => {
      this._config.lite_mode = ev.target.checked;
      this._scheduleUpdate();
    });

    // Tryb wypełnienia
    root.getElementById("fill_mode").addEventListener("change", (ev) => {
      this._config.fill_mode = ev.target.value;
      this._scheduleUpdate();
    });

    // Zebra
    root.getElementById("zebra_color").addEventListener("input", (ev) => {
      this._config.zebra_color = ev.target.value;
      this._scheduleUpdate();
    });

    root.getElementById("zebra_alpha").addEventListener("input", (ev) => {
      const val = parseFloat(ev.target.value);
      if (!this._config) this._config = {};
      this._config.zebra_alpha = isNaN(val) ? 0.4 : val;
      this._scheduleUpdate();
    });

    // Gradient
    root.getElementById("grad_start").addEventListener("input", (ev) => {
      const val = parseInt(ev.target.value, 10);
      this._ensurePath("gradient");
      this._config.gradient.start = isNaN(val) ? 35 : val;
      this._scheduleUpdate();
    });

    root.getElementById("grad_end").addEventListener("input", (ev) => {
      const val = parseInt(ev.target.value, 10);
      this._ensurePath("gradient");
      this._config.gradient.end = isNaN(val) ? 100 : val;
      this._scheduleUpdate();
    });

    root.getElementById("grad_alpha_start").addEventListener("input", (ev) => {
      const val = parseFloat(ev.target.value);
      this._ensurePath("gradient");
      this._config.gradient.alpha_start = isNaN(val) ? 0.0 : val;
      this._scheduleUpdate();
    });

    root.getElementById("grad_alpha_end").addEventListener("input", (ev) => {
      const val = parseFloat(ev.target.value);
      this._ensurePath("gradient");
      this._config.gradient.alpha_end = isNaN(val) ? 0.55 : val;
      this._scheduleUpdate();
    });

    // Czcionki
    root.getElementById("font_date").addEventListener("input", (ev) => {
      const val = parseFloat(ev.target.value);
      this._ensurePath("font_size");
      this._config.font_size.date = isNaN(val) ? 0.9 : val;
      this._scheduleUpdate();
    });

    root.getElementById("font_status").addEventListener("input", (ev) => {
      const val = parseFloat(ev.target.value);
      this._ensurePath("font_size");
      this._config.font_size.status = isNaN(val) ? 0.8 : val;
      this._scheduleUpdate();
    });

    root.getElementById("font_teams").addEventListener("input", (ev) => {
      const val = parseFloat(ev.target.value);
      this._ensurePath("font_size");
      this._config.font_size.teams = isNaN(val) ? 1.0 : val;
      this._scheduleUpdate();
    });

    root.getElementById("font_score").addEventListener("input", (ev) => {
      const val = parseFloat(ev.target.value);
      this._ensurePath("font_size");
      this._config.font_size.score = isNaN(val) ? 1.0 : val;
      this._scheduleUpdate();
    });

    // Ikony
    root.getElementById("icon_league").addEventListener("input", (ev) => {
      const val = parseInt(ev.target.value, 10);
      this._ensurePath("icon_size");
      this._config.icon_size.league = isNaN(val) ? 26 : val;
      this._scheduleUpdate();
    });

    root.getElementById("icon_crest").addEventListener("input", (ev) => {
      const val = parseInt(ev.target.value, 10);
      this._ensurePath("icon_size");
      this._config.icon_size.crest = isNaN(val) ? 24 : val;
      this._scheduleUpdate();
    });

    root.getElementById("icon_result").addEventListener("input", (ev) => {
      const val = parseInt(ev.target.value, 10);
      this._ensurePath("icon_size");
      this._config.icon_size.result = isNaN(val) ? 26 : val;
      this._scheduleUpdate();
    });

    // Kolory W/D/L
    root.getElementById("color_win").addEventListener("input", (ev) => {
      this._ensurePath("colors");
      this._config.colors.win = ev.target.value;
      this._scheduleUpdate();
    });

    root.getElementById("color_draw").addEventListener("input", (ev) => {
      this._ensurePath("colors");
      this._config.colors.draw = ev.target.value;
      this._scheduleUpdate();
    });

    root.getElementById("color_loss").addEventListener("input", (ev) => {
      this._ensurePath("colors");
      this._config.colors.loss = ev.target.value;
      this._scheduleUpdate();
    });
  }

  _ensurePath(key) {
    if (!this._config[key] || typeof this._config[key] !== "object") {
      this._config[key] = {};
    }
  }

  // --------------------------------------
  //  DEBOUNCE + EMIT CONFIG
  // --------------------------------------
  _scheduleUpdate() {
    if (this._debounceTimer) clearTimeout(this._debounceTimer);
    this._debounceTimer = setTimeout(() => this._emitConfigChanged(), 700);
  }

  _emitConfigChanged() {
    const event = new CustomEvent("config-changed", {
      detail: { config: this._config },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  // wymagane przez HA (nie musi nic zwracać konkretnego)
  static get stubConfig() {
    return {
      entity: "sensor.90minut_gornik_zabrze_matches"
    };
  }
}

customElements.define("matches-card-editor", MatchesCardEditor);
// ===== FILE INCLUDED: dist/matches-card.js =====
// ============================================================================
//  Matches Card (90minut) – FINAL FIXED VERSION
//  - 2-linia data/status
//  - krótka nazwa = pierwsze słowo
//  - W/D/L osobna kolumna
//  - odstęp liga → herby
//  - wynik wyrównany do drużyn (vertical-match)
//  - tryb LITE usuwa ha-card w całości
//  - brak undefined
//  - działa z edytorem (config-changed)
// ============================================================================

class MatchesCard extends HTMLElement {

  setConfig(config) {
    if (!config.entity) throw new Error("Entity is required");

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
        alpha_end: 0.55
      },

      zebra_color: "#f0f0f0",
      zebra_alpha: 0.4,

      lite_mode: false
    };

    this.config = JSON.parse(JSON.stringify(defaults));
    this._mergeDeep(this.config, config);
  }

  _mergeDeep(target, source) {
    for (const key in source) {
      if (source[key] !== null && typeof source[key] === "object" && !Array.isArray(source[key])) {
        if (!target[key]) target[key] = {};
        this._mergeDeep(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  // ----------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------
  _render() {
    const entity = this._hass.states[this.config.entity];
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

        .league-cell { padding-right:12px; }

        .team-cell { text-align:left; padding-left:8px; line-height:1.25em; }

        .score-cell {
          display:flex;
          flex-direction:column;
          justify-content:center;
          align-items:center;
          line-height:1.25em;
        }

        .result-circle {
          border-radius:50%;
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

    const body = matches.map(m => this._row(m)).join("");

    if (this.config.lite_mode) {
      // tryb LITE → bez ha-card
      this.innerHTML = `${style}<table>${body}</table>`;
      return;
    }

    const header = this.config.show_name ? `header="${this.config.name}"` : "";

    this.innerHTML = `
      ${style}
      <ha-card ${header}>
        <table>${body}</table>
      </ha-card>
    `;
  }

  // ----------------------------------------------------------
  // POJEDYNCZY WIERSZ
  // ----------------------------------------------------------
  _row(m) {
    const date = m.date || "-";
    const time = m.finished ? "KONIEC" : (m.status || "");

    const homeName = this.config.full_team_names ? m.home : m.home.split(" ")[0];
    const awayName = this.config.full_team_names ? m.away : m.away.split(" ")[0];

    const [homeScore, awayScore] = (m.score || "-").split("-");

    const gradient = this._gradient(m);

    return `
      <tr style="${gradient}">
        <!-- DATA -->
        <td style="width:10%; text-align:center;">
          <div style="font-size:${this.config.font_size.date}rem">${date}</div>
          <div style="font-size:${this.config.font_size.status}rem">${time}</div>
        </td>

        <!-- LIGA -->
        <td class="league-cell" style="width:10%; text-align:center;">
          ${this._league(m.league)}
        </td>

        <!-- HERBY -->
        ${this.config.show_logos ? `
          <td class="dual-cell" style="width:10%;">
            <img src="${m.logo_home}" height="${this.config.icon_size.crest}">
            <img src="${m.logo_away}" height="${this.config.icon_size.crest}">
          </td>` : ""}

        <!-- DRUŻYNY -->
        <td class="team-cell">
          <div style="font-size:${this.config.font_size.teams}rem">${homeName}</div>
          <div style="font-size:${this.config.font_size.teams}rem">${awayName}</div>
        </td>

        <!-- WYNIKI -->
        <td class="score-cell" style="width:10%;">
          <div style="font-size:${this.config.font_size.score}rem">${homeScore}</div>
          <div style="font-size:${this.config.font_size.score}rem">${awayScore}</div>
        </td>

        <!-- W / D / L -->
        <td style="width:8%; text-align:center;">
          ${this.config.show_result_symbols && m.result ? `
            <div class="result-circle"
                 style="background:${this.config.colors[m.result]};
                        width:${this.config.icon_size.result}px;
                        height:${this.config.icon_size.result}px;">
              ${m.result.charAt(0).toUpperCase()}
            </div>` : ""}
        </td>
      </tr>
    `;
  }

  // ----------------------------------------------------------
  // HELPERY
  // ----------------------------------------------------------
  _rgba(hex, alpha) {
    const h = hex.replace("#", "");
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

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
      code === "L" ? "ekstraklasa.png" :
      code === "PP" ? "puchar.png" :
      null;

    if (!file) return `<div>${code}</div>`;

    return `
      <img src="https://raw.githubusercontent.com/GieOeRZet/matches-card/main/logo/${file}"
           height="${this.config.icon_size.league}">
    `;
  }

  static getConfigElement() { return document.createElement("matches-card-editor"); }
  static getStubConfig() {
    return {
      entity: "sensor.90minut_gornik_zabrze_matches",
      name: "90minut Matches",
      show_name: true,
      show_logos: true,
      full_team_names: true,
      show_result_symbols: true,
      lite_mode: false,
      fill_mode: "gradient",

      font_size: { date: 0.9, status: 0.8, teams: 1.0, score: 1.0 },
      icon_size: { league: 26, crest: 24, result: 26 },

      colors: { win: "#3ba55d", draw: "#468cd2", loss: "#e23b3b" },

      gradient: { start: 35, end: 100, alpha_start: 0.0, alpha_end: 0.55 },

      zebra_color: "#f0f0f0",
      zebra_alpha: 0.4
    };
  }
}

customElements.define("matches-card", MatchesCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "matches-card",
  name: "Matches Card (90minut)",
  description: "Wyniki meczów z sensora 90minut.pl"
});
