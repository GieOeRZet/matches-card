// Matches Cards Pack – version 0.3.113
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
//  Matches Card Editor – FINAL VERSION (debounce, YAML sync, no auto-close)
// ============================================================================

class MatchesCardEditor extends HTMLElement {

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = {};
    this._debounce = null;
  }

  setConfig(config) {
    // kopiujemy config aby nie modyfikować oryginału
    this._config = JSON.parse(JSON.stringify(config));
    this.render();
  }

  // -----------------------------------------------------
  //  Aktualizacja wartości + debounce + wysłanie configu
  // -----------------------------------------------------
  _update(path, value) {
    // ścieżki typu: "font_size.date"
    const parts = path.split(".");
    let ref = this._config;

    for (let i = 0; i < parts.length - 1; i++) {
      if (!ref[parts[i]]) ref[parts[i]] = {};
      ref = ref[parts[i]];
    }

    ref[parts[parts.length - 1]] = value;

    clearTimeout(this._debounce);
    this._debounce = setTimeout(() => this._apply(), 700);
  }

  _apply() {
    const ev = new CustomEvent("config-changed", {
      detail: { config: this._config },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(ev);
  }

  // -----------------------------------------------------
  //  Render
  // -----------------------------------------------------
  render() {
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
          padding: 10px 12px;
          font-size: 1rem;
          cursor: pointer;
          background: rgba(255,255,255,0.05);
        }
        .group > div {
          padding: 14px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        label {
          display: flex;
          flex-direction: column;
          font-size: 0.85rem;
          opacity: 0.85;
        }
        input[type="number"],
        input[type="text"] {
          padding: 4px 6px;
          border-radius: 6px;
          border: 1px solid rgba(255,255,255,0.2);
          background: rgba(0,0,0,0.25);
          color: inherit;
        }
        select {
          padding: 4px 6px;
          border-radius: 6px;
          border: 1px solid rgba(255,255,255,0.2);
          background: rgba(0,0,0,0.25);
          color: inherit;
        }
        input[type="color"] {
          width: 40px;
          height: 26px;
          padding: 0;
          border: none;
          background: transparent;
        }
        .switch {
          display: flex;
          align-items: center;
          gap: 10px;
        }
      </style>

      <!-- PODSTAWOWE -->
      <details class="group" open>
        <summary>Podstawowe</summary>
        <div>

          <label>
            Nazwa karty
            <input type="text"
                   value="${c.name ?? ""}"
                   @input=${e => this._update("name", e.target.value)}>
          </label>

          <label class="switch">
            <ha-switch
              ?checked="${c.show_logos !== false}"
              @change=${e => this._update("show_logos", e.target.checked)}>
            </ha-switch>
            Pokaż herby
          </label>

          <label class="switch">
            <ha-switch
              ?checked="${c.full_team_names !== false}"
              @change=${e => this._update("full_team_names", e.target.checked)}>
            </ha-switch>
            Pełne nazwy drużyn
          </label>

          <label class="switch">
            <ha-switch
              ?checked="${c.show_result_symbols !== false}"
              @change=${e => this._update("show_result_symbols", e.target.checked)}>
            </ha-switch>
            Pokaż W/D/L
          </label>

          <label class="switch">
            <ha-switch
              ?checked="${c.lite_mode === true}"
              @change=${e => this._update("lite_mode", e.target.checked)}>
            </ha-switch>
            Tryb LITE
          </label>

        </div>
      </details>

      <!-- FILL MODE -->
      <details class="group" open>
        <summary>Styl wypełnienia</summary>
        <div>

          <label>
            Tryb
            <select @change=${e => this._update("fill_mode", e.target.value)}>
              <option value="gradient" ${c.fill_mode === "gradient" ? "selected" : ""}>Gradient</option>
              <option value="zebra"    ${c.fill_mode === "zebra" ? "selected" : ""}>Zebra</option>
              <option value="clear"    ${c.fill_mode === "clear" ? "selected" : ""}>Brak</option>
            </select>
          </label>

          ${
            c.fill_mode === "gradient"
            ? `
              <label>
                Start (%)
                <input type="number" min="0" max="100"
                       value="${c.gradient?.start ?? 35}"
                       @input=${e => this._update("gradient.start", Number(e.target.value))}>
              </label>

              <label>
                Koniec (%)
                <input type="number" min="0" max="100"
                       value="${c.gradient?.end ?? 100}"
                       @input=${e => this._update("gradient.end", Number(e.target.value))}>
              </label>

              <label>
                Alfa start
                <input type="number" min="0" max="1" step="0.05"
                       value="${c.gradient?.alpha_start ?? 0}"
                       @input=${e => this._update("gradient.alpha_start", Number(e.target.value))}>
              </label>

              <label>
                Alfa koniec
                <input type="number" min="0" max="1" step="0.05"
                       value="${c.gradient?.alpha_end ?? 0.55}"
                       @input=${e => this._update("gradient.alpha_end", Number(e.target.value))}>
              </label>
            `
            : ""
          }

          ${
            c.fill_mode === "zebra"
            ? `
              <label>
                Kolor zebry
                <input type="color"
                       value="${c.zebra_color ?? "#f0f0f0"}"
                       @input=${e => this._update("zebra_color", e.target.value)}>
              </label>

              <label>
                Alfa zebry
                <input type="number" min="0" max="1" step="0.05"
                       value="${c.zebra_alpha ?? 0.4}"
                       @input=${e => this._update("zebra_alpha", Number(e.target.value))}>
              </label>
            `
            : ""
          }

        </div>
      </details>

      <!-- CZCIONKI -->
      <details class="group">
        <summary>Rozmiary czcionek</summary>
        <div>

          <label>
            Data
            <input type="number" step="0.1"
                   value="${c.font_size?.date ?? 0.9}"
                   @input=${e => this._update("font_size.date", Number(e.target.value))}>
          </label>

          <label>
            Status (KONIEC / godzina)
            <input type="number" step="0.1"
                   value="${c.font_size?.status ?? 0.8}"
                   @input=${e => this._update("font_size.status", Number(e.target.value))}>
          </label>

          <label>
            Drużyny
            <input type="number" step="0.1"
                   value="${c.font_size?.teams ?? 1.0}"
                   @input=${e => this._update("font_size.teams", Number(e.target.value))}>
          </label>

          <label>
            Wynik
            <input type="number" step="0.1"
                   value="${c.font_size?.score ?? 1.0}"
                   @input=${e => this._update("font_size.score", Number(e.target.value))}>
          </label>

        </div>
      </details>

      <!-- ROZMIARY IKON -->
      <details class="group">
        <summary>Rozmiary ikon</summary>
        <div>

          <label>
            Liga
            <input type="number" min="10" max="60"
                   value="${c.icon_size?.league ?? 26}"
                   @input=${e => this._update("icon_size.league", Number(e.target.value))}>
          </label>

          <label>
            Herby
            <input type="number" min="10" max="60"
                   value="${c.icon_size?.crest ?? 24}"
                   @input=${e => this._update("icon_size.crest", Number(e.target.value))}>
          </label>

          <label>
            W/D/L
            <input type="number" min="10" max="60"
                   value="${c.icon_size?.result ?? 26}"
                   @input=${e => this._update("icon_size.result", Number(e.target.value))}>
          </label>

        </div>
      </details>

      <!-- KOLORY W/D/L -->
      <details class="group">
        <summary>Kolory W / D / L</summary>
        <div>

          <label>
            Wygrana (W)
            <input type="color"
                   value="${c.colors?.win ?? "#3ba55d"}"
                   @input=${e => this._update("colors.win", e.target.value)}>
          </label>

          <label>
            Remis (D)
            <input type="color"
                   value="${c.colors?.draw ?? "#468cd2"}"
                   @input=${e => this._update("colors.draw", e.target.value)}>
          </label>

          <label>
            Porażka (L)
            <input type="color"
                   value="${c.colors?.loss ?? "#e23b3b"}"
                   @input=${e => this._update("colors.loss", e.target.value)}>
          </label>

        </div>
      </details>
    `;
  }

  static get styles() {
    return window.HAUIUtils?.styles ?? "";
  }
}

customElements.define("matches-card-editor", MatchesCardEditor);
// ===== FILE INCLUDED: dist/matches-card.js =====
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
