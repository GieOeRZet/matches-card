// ============================================================================
//  League Table Card Editor – FIXED (value binding + alpha colors + debounce)
// ============================================================================

class LeagueTableCardEditor extends HTMLElement {

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = {};
    this._debounce = null;
  }

  setConfig(config) {
    this._config = JSON.parse(JSON.stringify(config));
    this.render();
  }

  _debounceUpdate(key, value) {
    this._config[key] = value;

    clearTimeout(this._debounce);
    this._debounce = setTimeout(() => {
      this.dispatchEvent(
        new CustomEvent("config-changed", {
          detail: { config: this._config }
        })
      );
    }, 700);
  }

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
          padding: 10px 16px 18px 16px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        label { font-size: 0.85rem; display:flex; flex-direction:column; }
        input[type="number"], input[type="text"] {
          padding: 4px 6px;
          border-radius: 6px;
          border: 1px solid rgba(255,255,255,0.20);
          background: rgba(0,0,0,0.2);
          color: inherit;
        }
        input[type="color"] {
          width:40px;
          height:28px;
          padding:0;
          border:none;
          background:transparent;
        }
      </style>

      <!-- PODSTAWOWE -->
      <details class="group" open>
        <summary>Podstawowe</summary>
        <div>
          <label>
            Nazwa karty
            <input id="name" type="text" value="${c.name ?? ''}">
          </label>

          <label>
            Tryb LITE
            <ha-switch id="lite_mode" ?checked="${c.lite_mode === true}"></ha-switch>
          </label>

          <label>
            Pokaz trend
            <ha-switch id="show_trend" ?checked="${c.show_trend !== false}"></ha-switch>
          </label>
        </div>
      </details>

      <!-- PODŚWIETLENIA -->
      <details class="group" open>
        <summary>Podświetlenia</summary>
        <div>
          <label>
            TOP – kolor
            <input id="top_color" type="color" value="${c.highlight?.top_color ?? '#00ff00'}">
          </label>

          <label>
            TOP – alfa
            <input id="top_alpha" type="number" min="0" max="1" step="0.05"
                   value="${c.highlight?.top_alpha ?? 0.35}">
          </label>

          <label>
            MIEJSCA 3–4 – kolor
            <input id="mid_color" type="color" value="${c.highlight?.mid_color ?? '#468cd2'}">
          </label>

          <label>
            MIEJSCA 3–4 – alfa
            <input id="mid_alpha" type="number" min="0" max="1" step="0.05"
                   value="${c.highlight?.mid_alpha ?? 0.35}">
          </label>

          <label>
            SPADKOWE – kolor
            <input id="bottom_color" type="color" value="${c.highlight?.bottom_color ?? '#e23b3b'}">
          </label>

          <label>
            SPADKOWE – alfa
            <input id="bottom_alpha" type="number" min="0" max="1" step="0.05"
                   value="${c.highlight?.bottom_alpha ?? 0.35}">
          </label>

          <label>
            Moja drużyna – kolor
            <input id="favorite_color" type="color"
                   value="${c.highlight?.favorite_color ?? '#ffffff'}">
          </label>

          <label>
            Moja drużyna – alfa
            <input id="favorite_alpha" type="number" min="0" max="1" step="0.05"
                   value="${c.highlight?.favorite_alpha ?? 0.35}">
          </label>
        </div>
      </details>
    `;

    // =====================================
    //  BIND INPUTS → CONFIG
    // =====================================
    const bind = (id, key, group = null) => {
      const el = this.shadowRoot.getElementById(id);
      if (!el) return;

      const handler = (e) => {
        const value =
          el.type === "number" ? Number(e.target.value)
          : el.type === "color" ? e.target.value
          : el.checked ?? e.target.value;

        if (group) {
          this._config[group][key] = value;
          this._debounceUpdate(group, { ...this._config[group] });
        } else {
          this._debounceUpdate(key, value);
        }
      };

      el.addEventListener("input", handler);
      el.addEventListener("change", handler);
    };

    // BASIC
    bind("name", "name");
    bind("lite_mode", "lite_mode");
    bind("show_trend", "show_trend");

    // HIGHLIGHT (z alfach)
    bind("top_color", "top_color", "highlight");
    bind("top_alpha", "top_alpha", "highlight");

    bind("mid_color", "mid_color", "highlight");
    bind("mid_alpha", "mid_alpha", "highlight");

    bind("bottom_color", "bottom_color", "highlight");
    bind("bottom_alpha", "bottom_alpha", "highlight");

    bind("favorite_color", "favorite_color", "highlight");
    bind("favorite_alpha", "favorite_alpha", "highlight");
  }

  static getConfigElement() { return this; }
  static getStubConfig() { return {}; }
}

customElements.define("league-table-card-editor", LeagueTableCardEditor);