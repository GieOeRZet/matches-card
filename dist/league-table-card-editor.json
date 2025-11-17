// ============================================================================
//  Matches Card Editor – accordion, numeric inputs, debounce, stable UI
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

  // --------------------------------------
  //  Helper: update config with debounce
  // --------------------------------------
  _update(key, value) {
    this._config = {
      ...this._config,
      [key]: value
    };

    clearTimeout(this._debounce);
    this._debounce = setTimeout(() => this._apply(), 700);
  }

  _apply() {
    const event = new CustomEvent("config-changed", {
      detail: { config: this._config },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(event);
  }

  // --------------------------------------
  //  Rendering
  // --------------------------------------
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

        label {
          display: flex;
          flex-direction: column;
          font-size: 0.85rem;
          opacity: 0.85;
        }

        input[type="number"] {
          padding: 4px 6px;
          border-radius: 6px;
          border: 1px solid rgba(255,255,255,0.20);
          background: rgba(0,0,0,0.2);
          color: inherit;
        }

        input[type="color"] {
          width: 40px;
          height: 28px;
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

      <!-- NAME + BASIC OPTIONS -->
      <details class="group" open>
        <summary>Podstawowe</summary>
        <div>
          <label>
            Nazwa karty
            <input type="text"
                   value="${c.name ?? ''}"
                   @input="${e => this._update('name', e.target.value)}">
          </label>

          <label class="switch">
            <ha-switch
              ?checked="${c.show_logos !== false}"
              @change="${e => this._update('show_logos', e.target.checked)}">
            </ha-switch>
            Pokaż herby
          </label>

          <label class="switch">
            <ha-switch
              ?checked="${c.full_team_names !== false}"
              @change="${e => this._update('full_team_names', e.target.checked)}">
            </ha-switch>
            Pełne nazwy
          </label>

          <label class="switch">
            <ha-switch
              ?checked="${c.show_result_symbols !== false}"
              @change="${e => this._update('show_result_symbols', e.target.checked)}">
            </ha-switch>
            Pokaż W/D/L
          </label>

          <label class="switch">
            <ha-switch
              ?checked="${c.lite_mode === true}"
              @change="${e => this._update('lite_mode', e.target.checked)}">
            </ha-switch>
            Tryb LITE
          </label>
        </div>
      </details>

      <!-- FILL MODE -->
      <details class="group">
        <summary>Styl wypełnienia</summary>
        <div>
          <label>
            Tryb
            <select @change="${e => this._update('fill_mode', e.target.value)}">
              <option value="gradient" ${c.fill_mode === "gradient" ? "selected" : ""}>Gradient</option>
              <option value="zebra" ${c.fill_mode === "zebra" ? "selected" : ""}>Zebra</option>
              <option value="clear" ${c.fill_mode === "clear" ? "selected" : ""}>Brak</option>
            </select>
          </label>

          ${c.fill_mode === "gradient" ? `
            <label>
              Start (%)
              <input type="number" min="0" max="100" value="${c.gradient?.start ?? 35}"
                     @input="${e => this._update('gradient', {...c.gradient, start: Number(e.target.value)})}">
            </label>

            <label>
              Koniec (%)
              <input type="number" min="0" max="100" value="${c.gradient?.end ?? 100}"
                     @input="${e => this._update('gradient', {...c.gradient, end: Number(e.target.value)})}">
            </label>

            <label>
              Alfa start
              <input type="number" min="0" max="1" step="0.05"
                     value="${c.gradient?.alpha_start ?? 0}"
                     @input="${e => this._update('gradient', {...c.gradient, alpha_start: Number(e.target.value)})}">
            </label>

            <label>
              Alfa koniec
              <input type="number" min="0" max="1" step="0.05"
                     value="${c.gradient?.alpha_end ?? 0.55}"
                     @input="${e => this._update('gradient', {...c.gradient, alpha_end: Number(e.target.value)})}">
            </label>
          ` : ""}

          ${c.fill_mode === "zebra" ? `
            <label>
              Kolor zebry
              <input type="color"
                     value="${c.zebra_color ?? "#f0f0f0"}"
                     @input="${e => this._update('zebra_color', e.target.value)}">
            </label>

            <label>
              Alfa zebry
              <input type="number" min="0" max="1" step="0.05"
                     value="${c.zebra_alpha ?? 0.4}"
                     @input="${e => this._update('zebra_alpha', Number(e.target.value))}">
            </label>
          ` : ""}
        </div>
      </details>

      <!-- FONTS -->
      <details class="group">
        <summary>Rozmiary czcionek</summary>
        <div>
          <label>
            Data
            <input type="number" step="0.1" value="${c.font_size?.date ?? 0.9}"
                   @input="${e => this._update('font_size', {...c.font_size, date: Number(e.target.value)})}">
          </label>

          <label>
            Status
            <input type="number" step="0.1" value="${c.font_size?.status ?? 0.8}"
                   @input="${e => this._update('font_size', {...c.font_size, status: Number(e.target.value)})}">
          </label>

          <label>
            Drużyny
            <input type="number" step="0.1" value="${c.font_size?.teams ?? 1.0}"
                   @input="${e => this._update('font_size', {...c.font_size, teams: Number(e.target.value)})}">
          </label>

          <label>
            Wynik
            <input type="number" step="0.1" value="${c.font_size?.score ?? 1.0}"
                   @input="${e => this._update('font_size', {...c.font_size, score: Number(e.target.value)})}">
          </label>
        </div>
      </details>

      <!-- ICON SIZES -->
      <details class="group">
        <summary>Rozmiary ikon</summary>
        <div>
          <label>
            Liga
            <input type="number" min="10" max="60"
                   value="${c.icon_size?.league ?? 26}"
                   @input="${e => this._update('icon_size', {...c.icon_size, league: Number(e.target.value)})}">
          </label>

          <label>
            Herby
            <input type="number" min="10" max="60"
                   value="${c.icon_size?.crest ?? 24}"
                   @input="${e => this._update('icon_size', {...c.icon_size, crest: Number(e.target.value)})}">
          </label>

          <label>
            W/D/L
            <input type="number" min="10" max="60"
                   value="${c.icon_size?.result ?? 26}"
                   @input="${e => this._update('icon_size', {...c.icon_size, result: Number(e.target.value)})}">
          </label>
        </div>
      </details>

      <!-- COLORS -->
      <details class="group">
        <summary>Kolory W / D / L</summary>
        <div>
          <label>
            Wygrana (W)
            <input type="color"
                   value="${c.colors?.win ?? "#3ba55d"}"
                   @input="${e => this._update('colors', {...c.colors, win: e.target.value})}">
          </label>

          <label>
            Remis (D)
            <input type="color"
                   value="${c.colors?.draw ?? "#468cd2"}"
                   @input="${e => this._update('colors', {...c.colors, draw: e.target.value})}">
          </label>

          <label>
            Porażka (L)
            <input type="color"
                   value="${c.colors?.loss ?? "#e23b3b"}"
                   @input="${e => this._update('colors', {...c.colors, loss: e.target.value})}">
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