// Matches Cards Pack – version 0.3.114
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
//  Matches Card Editor – YAML sync, debounce, pełna konfiguracja
// ============================================================================

class MatchesCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = {};
    this._debounce = null;
  }

  static get defaultConfig() {
    return {
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

  // głębokie łączenie
  _mergeDeep(base, extra) {
    const out = {};
    const keys = new Set([...Object.keys(base), ...Object.keys(extra || {})]);
    keys.forEach((k) => {
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

  setConfig(config) {
    const merged = this._mergeDeep(MatchesCardEditor.defaultConfig, config || {});
    if (config && config.entity) merged.entity = config.entity;
    this._config = merged;
    this._render();
  }

  // helper pobierania wartości
  _getPath(path) {
    return path.split(".").reduce((o, k) => (o ? o[k] : undefined), this._config);
  }

  // helper ustawiania wartości
  _updatePath(path, value) {
    const obj = JSON.parse(JSON.stringify(this._config));
    const parts = path.split(".");
    let ref = obj;

    for (let i = 0; i < parts.length - 1; i++) {
      if (!ref[parts[i]] || typeof ref[parts[i]] !== "object") {
        ref[parts[i]] = {};
      }
      ref = ref[parts[i]];
    }
    ref[parts[parts.length - 1]] = value;

    this._config = obj;

    clearTimeout(this._debounce);
    this._debounce = setTimeout(() => {
      this.dispatchEvent(
        new CustomEvent("config-changed", {
          detail: { config: this._config },
          bubbles: true,
          composed: true,
        })
      );
    }, 700);
  }

  // ------------------------------
  // render
  // ------------------------------
  _render() {
    const c = this._config;
    const root = this.shadowRoot;

    const prev = {
      basic: root.querySelector("#basic")?.open ?? true,
      fill: root.querySelector("#fill")?.open ?? false,
      fonts: root.querySelector("#fonts")?.open ?? false,
      icons: root.querySelector("#icons")?.open ?? false,
      colors: root.querySelector("#colors")?.open ?? false,
    };

    root.innerHTML = `
      <style>
        .group{margin:12px 0;border:1px solid rgba(255,255,255,0.1);border-radius:8px;}
        .group summary{padding:10px 12px;background:rgba(255,255,255,0.05);cursor:pointer;}
        .group div{padding:10px 16px 16px;display:grid;grid-template-columns:1fr 1fr;gap:12px;}
        label{display:flex;flex-direction:column;font-size:0.9rem;}
        input[type="text"],input[type="number"],select{
          padding:6px;background:#0003;border:1px solid #fff2;border-radius:6px;color:inherit;
        }
        input[type="color"]{width:40px;height:26px;border:none;background:transparent;}
        .row{display:flex;align-items:center;gap:10px;}
      </style>

      <!-- PODSTAWOWE -->
      <details id="basic" class="group" ${prev.basic ? "open" : ""}>
        <summary>Podstawowe</summary>
        <div>
          <label>Nazwa karty
            <input type="text" data-path="name" value="${c.name}">
          </label>

          <div class="row">
            <span>Pokaż herby</span>
            <ha-switch data-path="show_logos"></ha-switch>
          </div>

          <div class="row">
            <span>Pełne nazwy</span>
            <ha-switch data-path="full_team_names"></ha-switch>
          </div>

          <div class="row">
            <span>Pokaż W/D/L</span>
            <ha-switch data-path="show_result_symbols"></ha-switch>
          </div>

          <div class="row">
            <span>Tryb LITE</span>
            <ha-switch data-path="lite_mode"></ha-switch>
          </div>
        </div>
      </details>

      <!-- STYL -->
      <details id="fill" class="group" ${prev.fill ? "open" : ""}>
        <summary>Styl wypełnienia</summary>
        <div>
          <label>Tryb
            <select data-path="fill_mode">
              <option value="gradient" ${c.fill_mode === "gradient" ? "selected" : ""}>Gradient</option>
              <option value="zebra" ${c.fill_mode === "zebra" ? "selected" : ""}>Zebra</option>
              <option value="clear" ${c.fill_mode === "clear" ? "selected" : ""}>Brak</option>
            </select>
          </label>

          ${
            c.fill_mode === "gradient"
              ? `
            <label>Start %
              <input type="number" data-type="number" data-path="gradient.start" value="${c.gradient.start}">
            </label>

            <label>Koniec %
              <input type="number" data-type="number" data-path="gradient.end" value="${c.gradient.end}">
            </label>

            <label>Alfa start
              <input type="number" data-type="number" step="0.05" data-path="gradient.alpha_start" value="${c.gradient.alpha_start}">
            </label>

            <label>Alfa koniec
              <input type="number" data-type="number" step="0.05" data-path="gradient.alpha_end" value="${c.gradient.alpha_end}">
            </label>
          `
              : ""
          }

          ${
            c.fill_mode === "zebra"
              ? `
            <label>Kolor zebry
              <input type="color" data-path="zebra_color" value="${c.zebra_color}">
            </label>

            <label>Alfa
              <input type="number" data-type="number" step="0.05" data-path="zebra_alpha" value="${c.zebra_alpha}">
            </label>
          `
              : ""
          }
        </div>
      </details>

      <!-- CZCIONKI -->
      <details id="fonts" class="group" ${prev.fonts ? "open" : ""}>
        <summary>Rozmiary czcionek</summary>
        <div>
          <label>Data
            <input type="number" step="0.1" data-path="font_size.date" data-type="number" value="${c.font_size.date}">
          </label>
          <label>Status / godzina
            <input type="number" step="0.1" data-path="font_size.status" data-type="number" value="${c.font_size.status}">
          </label>
          <label>Drużyny
            <input type="number" step="0.1" data-path="font_size.teams" data-type="number" value="${c.font_size.teams}">
          </label>
          <label>Wynik
            <input type="number" step="0.1" data-path="font_size.score" data-type="number" value="${c.font_size.score}">
          </label>
        </div>
      </details>

      <!-- IKONY -->
      <details id="icons" class="group" ${prev.icons ? "open" : ""}>
        <summary>Rozmiary ikon</summary>
        <div>
          <label>Liga
            <input type="number" data-path="icon_size.league" data-type="number" value="${c.icon_size.league}">
          </label>
          <label>Herby
            <input type="number" data-path="icon_size.crest" data-type="number" value="${c.icon_size.crest}">
          </label>
          <label>W/D/L
            <input type="number" data-path="icon_size.result" data-type="number" value="${c.icon_size.result}">
          </label>
        </div>
      </details>

      <!-- KOLORY -->
      <details id="colors" class="group" ${prev.colors ? "open" : ""}>
        <summary>Kolory W/D/L</summary>
        <div>
          <label>Wygrana
            <input type="color" data-path="colors.win" value="${c.colors.win}">
          </label>
          <label>Remis
            <input type="color" data-path="colors.draw" value="${c.colors.draw}">
          </label>
          <label>Porażka
            <input type="color" data-path="colors.loss" value="${c.colors.loss}">
          </label>
        </div>
      </details>
    `;

    this._attachEvents();
  }

  // ------------------------------
  // eventy
  // ------------------------------
  _attachEvents() {
    const root = this.shadowRoot;

    // inputy
    root.querySelectorAll("input[data-path]").forEach((el) => {
      const path = el.getAttribute("data-path");
      const type = el.getAttribute("data-type");

      el.addEventListener("input", (ev) => {
        let v = ev.target.value;
        if (type === "number") v = Number(v);
        this._updatePath(path, v);
      });
    });

    // select
    root.querySelectorAll("select[data-path]").forEach((sel) => {
      sel.addEventListener("change", (ev) => {
        this._updatePath(sel.getAttribute("data-path"), ev.target.value);
        this._render(); // przeładować sekcję odpowiednią
      });
    });

    // ha-switch
    root.querySelectorAll("ha-switch[data-path]").forEach((sw) => {
      const path = sw.getAttribute("data-path");
      sw.checked = !!this._getPath(path);
      sw.addEventListener("change", (ev) => {
        this._updatePath(path, ev.target.checked);
      });
    });
  }

  set hass(hass) {
    this._hass = hass;
  }
}

if (!customElements.get("matches-card-editor")) {
  customElements.define("matches-card-editor", MatchesCardEditor);
}
// ===== FILE INCLUDED: dist/matches-card.js =====
// ============================================================================
//  Matches Card (90minut) – v0.3.XXX (YAML + EDITOR SYNC, FIXED LAYOUT)
//  - Pełen model domyślny
//  - YAML i edytor synchronizowane w obie strony
//  - Layout zgodny z ustaleniami (data + godzina/KONIEC)
// ============================================================================

class MatchesCard extends HTMLElement {
  // ------------------------------
  //  DOMYŚLNA KONFIGURACJA
  // ------------------------------
  static get defaultConfig() {
    return {
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

  // prosty deep merge
  _mergeDeep(base, extra) {
    const out = Array.isArray(base) ? [] : {};
    const keys = new Set([...Object.keys(base || {}), ...Object.keys(extra || {})]);
    keys.forEach((k) => {
      const bv = base ? base[k] : undefined;
      const ev = extra ? extra[k] : undefined;
      if (
        bv &&
        ev &&
        typeof bv === "object" &&
        !Array.isArray(bv) &&
        typeof ev === "object" &&
        !Array.isArray(ev)
      ) {
        out[k] = this._mergeDeep(bv, ev);
      } else if (ev !== undefined) {
        out[k] = ev;
      } else {
        out[k] = bv;
      }
    });
    return out;
  }

  // ------------------------------
  // CONFIG
  // ------------------------------
  setConfig(config) {
    if (!config || !config.entity) {
      throw new Error("Entity is required (np. sensor.90minut_gornik_zabrze_matches)");
    }

    const merged = this._mergeDeep(MatchesCard.defaultConfig, config);
    merged.entity = config.entity;
    this.config = merged;
  }

  // ------------------------------
  // RENDER
  // ------------------------------
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
        }

        .crest-cell { gap:3px; }
        .league-cell { padding-right:12px; }

        .team-cell { text-align:left; padding-left:8px; }
        .team-row { line-height:1.3em; }

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
          align-items:center;
          justify-content:center;
          color:#fff; font-weight:bold; margin:auto;
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

  // ------------------------------
  // RENDER JEDNEGO MECZU
  // ------------------------------
  _row(m) {
    // DATA + GODZINA / KONIEC
    let dateStr = "";
    let timeStr = "";

    if (m.date) {
      const raw = String(m.date);
      const dt = new Date(raw.replace(" ", "T"));
      if (!isNaN(dt.getTime())) {
        dateStr = dt.toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit", year: "numeric" });
        timeStr = dt.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });
      } else {
        const [d, t] = raw.split(" ");
        dateStr = d || "";
        timeStr = t || "";
      }
    }

    const bottomLine = m.finished ? "KONIEC" : timeStr;

    // NAZWY
    const full = this.config.full_team_names !== false;
    const home = full ? m.home : this._short(m.home);
    const away = full ? m.away : this._short(m.away);

    // WYNIK
    const [hs, as] = (m.score || "-").split("-");
    const homeClass = m.result === "win" ? "bold" : m.result === "loss" ? "dim" : "";
    const awayClass = m.result === "loss" ? "bold" : m.result === "win" ? "dim" : "";

    return `
      <tr style="${this._gradient(m)}">

        <td style="width:10%; text-align:center;">
          <div style="font-size:${this.config.font_size.date}rem">${dateStr}</div>
          <div style="font-size:${this.config.font_size.status}rem">${bottomLine}</div>
        </td>

        <td class="league-cell" style="width:10%; text-align:center;">
          ${this._league(m.league)}
        </td>

        ${
          this.config.show_logos
            ? `<td class="crest-cell dual-cell" style="width:10%;">
                 <img src="${m.logo_home}" height="${this.config.icon_size.crest}">
                 <img src="${m.logo_away}" height="${this.config.icon_size.crest}">
               </td>`
            : ""
        }

        <td class="team-cell">
          <div class="team-row ${homeClass}" style="font-size:${this.config.font_size.teams}rem">${home}</div>
          <div class="team-row ${awayClass}" style="font-size:${this.config.font_size.teams}rem">${away}</div>
        </td>

        <td class="score-cell" style="width:10%;">
          <div class="${homeClass}" style="font-size:${this.config.font_size.score}rem">${hs}</div>
          <div class="${awayClass}" style="font-size:${this.config.font_size.score}rem">${as}</div>
        </td>

        <td class="result-cell" style="width:8%;">
          ${
            this.config.show_result_symbols && m.result
              ? `<div class="result-circle" style="background:${this.config.colors[m.result]}">
                   ${m.result.charAt(0).toUpperCase()}
                 </div>`
              : ""
          }
        </td>

      </tr>
    `;
  }

  _short(name) {
    if (!name) return "";
    return name.split(" ").filter(Boolean)[0];
  }

  _gradient(m) {
    if (this.config.fill_mode !== "gradient" || !m.result) return "";

    const c = this.config.colors[m.result];
    const g = this.config.gradient;
    return `
      background: linear-gradient(to right,
        rgba(0,0,0,0) 0%,
        ${this._rgba(c, g.alpha_start)} ${g.start}%,
        ${this._rgba(c, g.alpha_end)} ${g.end}%,
        rgba(0,0,0,0) 100%
      );
    `;
  }

  _league(code) {
    const file =
      code === "L" ? "ekstraklasa.png" :
      code === "PP" ? "puchar.png" : null;

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

  // ------------------------------
  // EDYTOR + STUB CONFIG
  // ------------------------------
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
