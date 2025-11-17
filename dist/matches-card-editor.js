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