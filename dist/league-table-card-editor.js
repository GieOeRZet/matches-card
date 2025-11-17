// ============================================================================
//  League Table Card Editor – v0.1.100
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

  // -------------------------------------------------------
  // deep update
  // -------------------------------------------------------
  _update(path, value) {
    const keys = path.split(".");
    let obj = this._config;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!obj[keys[i]]) obj[keys[i]] = {};
      obj = obj[keys[i]];
    }

    obj[keys[keys.length - 1]] = value;

    clearTimeout(this._debounce);
    this._debounce = setTimeout(() => this._apply(), 700);
  }

  _apply() {
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: this._config },
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
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
          cursor: pointer;
          background: rgba(255,255,255,0.06);
          font-size: 1rem;
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

        input[type="number"],
        input[type="color"],
        input[type="text"] {
          padding: 4px 6px;
          border-radius: 6px;
          border: 1px solid rgba(255,255,255,0.20);
          background: rgba(0,0,0,0.2);
          color: inherit;
        }

        .switch {
          display: flex;
          align-items: center;
          gap: 10px;
        }
      </style>

      <!-- BASIC -->
      <details class="group" open>
        <summary>Podstawowe</summary>
        <div>
          <label>
            Nazwa
            <input type="text"
                   value="${c.name ?? ''}"
                   @input="${e => this._update('name', e.target.value)}">
          </label>

          <label class="switch">
            <ha-switch
              ?checked="${c.show_name !== false}"
              @change="${e => this._update('show_name', e.target.checked)}">
            </ha-switch>
            Pokaż nazwę
          </label>

          <label class="switch">
            <ha-switch
              ?checked="${c.lite_mode === true}"
              @change="${e => this._update('lite_mode', e.target.checked)}">
            </ha-switch>
            Tryb LITE
          </label>

          <label class="switch">
            <ha-switch
              ?checked="${c.show_trend !== false}"
              @change="${e => this._update('show_trend', e.target.checked)}">
            </ha-switch>
            Pokaż trend
          </label>
        </div>
      </details>

      <!-- FONT SIZES -->
      <details class="group">
        <summary>Rozmiary czcionek</summary>
        <div>
          <label>
            Nagłówek
            <input type="number" step="0.1"
                   value="${c.font_size?.header ?? 0.8}"
                   @input="${e => this._update('font_size.header', Number(e.target.value))}">
          </label>

          <label>
            Wiersze
            <input type="number" step="0.1"
                   value="${c.font_size?.row ?? 0.9}"
                   @input="${e => this._update('font_size.row', Number(e.target.value))}">
          </label>

          <label>
            Drużyna
            <input type="number" step="0.1"
                   value="${c.font_size?.team ?? 1.0}"
                   @input="${e => this._update('font_size.team', Number(e.target.value))}">
          </label>
        </div>
      </details>

      <!-- COLORS -->
      <details class="group">
        <summary>Kolory stref</summary>
        <div>
          <label>
            Liga Mistrzów
            <input type="color"
                   value="${c.colors?.top ?? "#3ba55d"}"
                   @input="${e => this._update('colors.top', e.target.value)}">
          </label>

          <label>
            Liga Konferencji
            <input type="color"
                   value="${c.colors?.conference ?? "#468cd2"}"
                   @input="${e => this._update('colors.conference', e.target.value)}">
          </label>

          <label>
            Spadek
            <input type="color"
                   value="${c.colors?.bottom ?? "#e23b3b"}"
                   @input="${e => this._update('colors.bottom', e.target.value)}">
          </label>

          <label>
            Moja drużyna
            <input type="color"
                   value="${c.colors?.favorite ?? "#fff7c2"}"
                   @input="${e => this._update('colors.favorite', e.target.value)}">
          </label>
        </div>
      </details>

      <!-- HIGHLIGHT -->
      <details class="group">
        <summary>Strefy pozycji</summary>
        <div>
          <label>
            TOP (LM)
            <input type="number" min="1" max="10"
                   value="${c.highlight?.top_count ?? 2}"
                   @input="${e => this._update('highlight.top_count', Number(e.target.value))}">
          </label>

          <label>
            Konferencje
            <input type="number" min="0" max="10"
                   value="${c.highlight?.conference_count ?? 2}"
                   @input="${e => this._update('highlight.conference_count', Number(e.target.value))}">
          </label>

          <label>
            Spadek
            <input type="number" min="1" max="10"
                   value="${c.highlight?.bottom_count ?? 3}"
                   @input="${e => this._update('highlight.bottom_count', Number(e.target.value))}">
          </label>
        </div>
      </details>
    `;
  }
}

customElements.define("league-table-card-editor", LeagueTableCardEditor);