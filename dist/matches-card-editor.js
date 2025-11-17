// ============================================================================
//  Matches Card Editor – FIXED (value binding + working config-changed)
// ============================================================================

class MatchesCardEditor extends HTMLElement {

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
      </style>

      <details class="group" open>
        <summary>Podstawowe</summary>
        <div>
          <label>
            Nazwa karty
            <input id="name" type="text" value="${c.name ?? ''}">
          </label>

          <label>
            Pokaż herby
            <ha-switch id="show_logos" ?checked="${c.show_logos !== false}"></ha-switch>
          </label>

          <label>
            Pełne nazwy
            <ha-switch id="full_team_names" ?checked="${c.full_team_names !== false}"></ha-switch>
          </label>

          <label>
            W/D/L symbole
            <ha-switch id="show_result_symbols" ?checked="${c.show_result_symbols !== false}"></ha-switch>
          </label>

          <label>
            Tryb LITE
            <ha-switch id="lite_mode" ?checked="${c.lite_mode === true}"></ha-switch>
          </label>
        </div>
      </details>

      <details class="group">
        <summary>Czcionki</summary>
        <div>
          <label>Data
            <input id="date" type="number" step="0.1" value="${c.font_size?.date ?? 0.9}">
          </label>

          <label>Status
            <input id="status" type="number" step="0.1" value="${c.font_size?.status ?? 0.8}">
          </label>

          <label>Drużyny
            <input id="teams" type="number" step="0.1" value="${c.font_size?.teams ?? 1.0}">
          </label>

          <label>Wynik
            <input id="score" type="number" step="0.1" value="${c.font_size?.score ?? 1.0}">
          </label>
        </div>
      </details>

      <details class="group">
        <summary>Ikony</summary>
        <div>
          <label>Liga
            <input id="league" type="number" value="${c.icon_size?.league ?? 26}">
          </label>
          <label>Herby
            <input id="crest" type="number" value="${c.icon_size?.crest ?? 24}">
          </label>
          <label>W/D/L
            <input id="result" type="number" value="${c.icon_size?.result ?? 26}">
          </label>
        </div>
      </details>
    `;

    // ===============================
    //  BIND INPUTS → CONFIG
    // ===============================
    const bind = (id, key, nested = null) => {
      const el = this.shadowRoot.getElementById(id);
      if (!el) return;

      el.addEventListener("input", (e) => {
        if (nested) {
          this._config[nested][key] = Number(e.target.value);
          this._debounceUpdate(nested, { ...this._config[nested] });
        } else {
          this._debounceUpdate(key, e.target.type === "number"
            ? Number(e.target.value)
            : e.target.value);
        }
      });

      el.addEventListener("change", (e) => {
        if (nested) {
          this._config[nested][key] = Number(e.target.value);
          this._debounceUpdate(nested, { ...this._config[nested] });
        } else {
          this._debounceUpdate(key, e.target.checked ?? e.target.value);
        }
      });
    };

    // PODSTAWOWE
    bind("name", "name");
    bind("show_logos", "show_logos");
    bind("full_team_names", "full_team_names");
    bind("show_result_symbols", "show_result_symbols");
    bind("lite_mode", "lite_mode");

    // FONTS
    bind("date", "date", "font_size");
    bind("status", "status", "font_size");
    bind("teams", "teams", "font_size");
    bind("score", "score", "font_size");

    // ICONS
    bind("league", "league", "icon_size");
    bind("crest", "crest", "icon_size");
    bind("result", "result", "icon_size");
  }

  static getConfigElement() { return this; }
  static getStubConfig() { return {}; }
}

customElements.define("matches-card-editor", MatchesCardEditor);