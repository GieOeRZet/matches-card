// Matches Cards Pack – version 0.3.115
// Auto-generated from dist/

// ===== FILE INCLUDED: dist/league-table-card-editor.js =====
// ============================================================================
//  League Table Card – VISUAL EDITOR (YAML sync, stable)
// ============================================================================

class LeagueTableCardEditor extends HTMLElement {

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = {};
    this._debounce = null;
  }

  static get defaultConfig() {
    return {
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

        alpha: 0.55,
      }
    };
  }

  // deep merge
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

  setConfig(config) {
    const merged = this._mergeDeep(LeagueTableCardEditor.defaultConfig, config || {});
    if (config && config.entity) merged.entity = config.entity;
    this._config = merged;
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
  }

  _get(path) {
    return path.split(".").reduce((o,k)=>o?o[k]:undefined, this._config);
  }

  _set(path, val) {
    const cfg = JSON.parse(JSON.stringify(this._config));
    const parts = path.split(".");
    let ref = cfg;
    for (let i=0;i<parts.length-1;i++){
      if (!ref[parts[i]] || typeof ref[parts[i]]!=="object") ref[parts[i]] = {};
      ref = ref[parts[i]];
    }
    ref[parts[parts.length-1]] = val;
    this._config = cfg;

    clearTimeout(this._debounce);
    this._debounce = setTimeout(()=>{
      this.dispatchEvent(new CustomEvent("config-changed",{
        detail:{config:this._config}, bubbles:true, composed:true
      }));
    },700);
  }

  _render() {
    const c = this._config;
    const root = this.shadowRoot;

    const prev = {
      basic: root.querySelector("#basic")?.open ?? true,
      fonts: root.querySelector("#fonts")?.open ?? false,
      highlight: root.querySelector("#highlight")?.open ?? false,
    };

    root.innerHTML = `
      <style>
        .group{
          border:1px solid #ffffff33;
          border-radius:8px;
          margin:12px 0;
        }
        summary{
          padding:10px 12px;
          background:#ffffff0d;
        }
        .inner{
          padding:14px 16px 18px;
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:12px;
        }
        label{display:flex;flex-direction:column;font-size:0.85rem;opacity:0.9;}
        input[type="text"],input[type="number"],select{
          padding:6px;background:#0003;border:1px solid #fff3;border-radius:6px;color:inherit;
        }
        input[type="color"]{width:40px;height:26px;background:transparent;border:none;}
        .row{display:flex;align-items:center;gap:10px;}
      </style>

      <!-- PODSTAWOWE -->
      <details id="basic" class="group" ${prev.basic?"open":""}>
        <summary>Podstawowe</summary>
        <div class="inner">

          <label>Nazwa karty
            <input type="text" data-path="name" value="${c.name}">
          </label>

          <div class="row">
            <span>Nagłówek</span>
            <ha-switch data-path="show_name"></ha-switch>
          </div>

          <div class="row">
            <span>Tryb LITE</span>
            <ha-switch data-path="lite_mode"></ha-switch>
          </div>

        </div>
      </details>

      <!-- CZCIONKI -->
      <details id="fonts" class="group" ${prev.fonts?"open":""}>
        <summary>Czcionki</summary>
        <div class="inner">

          <label>Nagłówki
            <input type="number" step="0.1" data-type="number"
                   data-path="font_size.header" value="${c.font_size.header}">
          </label>

          <label>Wiersz
            <input type="number" step="0.1" data-type="number"
                   data-path="font_size.row" value="${c.font_size.row}">
          </label>

          <label>Drużyna
            <input type="number" step="0.1" data-type="number"
                   data-path="font_size.team" value="${c.font_size.team}">
          </label>

        </div>
      </details>

      <!-- KOLORY PODŚWIETLENIA -->
      <details id="highlight" class="group" ${prev.highlight?"open":""}>
        <summary>Podświetlenia i kolory</summary>
        <div class="inner">

          <label>Miejsca LM (top)
            <input type="number" data-type="number"
                   data-path="highlight.top_count" value="${c.highlight.top_count}">
          </label>

          <label>LK (3-4)
            <input type="number" data-type="number"
                   data-path="highlight.conf_count" value="${c.highlight.conf_count}">
          </label>

          <label>Spadek
            <input type="number" data-type="number"
                   data-path="highlight.bottom_count" value="${c.highlight.bottom_count}">
          </label>

          <label>Ulubiona – kolor
            <input type="color" data-path="highlight.favorite_color"
                   value="${c.highlight.favorite_color}">
          </label>

          <label>LM – kolor
            <input type="color" data-path="highlight.top_color"
                   value="${c.highlight.top_color}">
          </label>

          <label>LK – kolor
            <input type="color" data-path="highlight.conf_color"
                   value="${c.highlight.conf_color}">
          </label>

          <label>Spadek – kolor
            <input type="color" data-path="highlight.bottom_color"
                   value="${c.highlight.bottom_color}">
          </label>

          <label>Alfa
            <input type="number" step="0.05" min="0" max="1" data-type="number"
                   data-path="highlight.alpha" value="${c.highlight.alpha}">
          </label>

        </div>
      </details>
    `;

    this._bindEvents();
  }

  _bindEvents() {
    const root = this.shadowRoot;

    // SWITCHES
    root.querySelectorAll("ha-switch[data-path]").forEach(sw => {
      const path = sw.getAttribute("data-path");
      sw.checked = !!this._get(path);
      sw.addEventListener("change", () => {
        this._set(path, sw.checked);
      });
    });

    // INPUTS
    root.querySelectorAll("input[data-path]").forEach(inp => {
      const path = inp.getAttribute("data-path");
      const type = inp.getAttribute("data-type");
      inp.addEventListener("input", e => {
        let v = e.target.value;
        if (type === "number") v = Number(v);
        this._set(path, v);
      });
    });
  }
}

if (!customElements.get("league-table-card-editor")) {
  customElements.define("league-table-card-editor", LeagueTableCardEditor);
}
// ===== FILE INCLUDED: dist/league-table-card.js =====
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
