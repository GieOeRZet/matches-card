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