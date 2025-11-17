// ============================================================================
//  League Table Card – FULL EDITOR v0.1.100
// ============================================================================

class LeagueTableCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = {};
    this._debounce = null;
  }

  setConfig(config) {
    this._config = JSON.parse(JSON.stringify(config || {}));
    this.render();
  }

  // -----------------------------------------------------
  // UPDATE + DEBOUNCE
  // -----------------------------------------------------
  _update(path, value) {
    const cfg = JSON.parse(JSON.stringify(this._config));

    // Ustawiamy w configu głębokie pola
    const parts = path.split(".");
    let obj = cfg;
    while (parts.length > 1) {
      const p = parts.shift();
      if (!obj[p]) obj[p] = {};
      obj = obj[p];
    }
    obj[parts[0]] = value;

    this._config = cfg;

    clearTimeout(this._debounce);
    this._debounce = setTimeout(() => this._apply(), 700);
  }

  _apply() {
    const ev = new CustomEvent("config-changed", {
      detail: { config: this._config },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(ev);
  }

  // -----------------------------------------------------
  // RENDER
  // -----------------------------------------------------
  render() {
    if (!this.shadowRoot) return;
    const c = this._config;
    const hl = c.highlight || {};

    this.shadowRoot.innerHTML = `
      <style>
        .group {
          margin: 12px 0;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.15);
          overflow: hidden;
        }

        summary {
          padding: 10px 12px;
          cursor: pointer;
          font-size: 1rem;
          background: rgba(255,255,255,0.05);
        }

        .content {
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
        select,
        input[type="text"] {
          padding: 4px 6px;
          border-radius: 6px;
          border: 1px solid rgba(255,255,255,0.20);
          background: rgba(0,0,0,0.2);
          color: inherit;
        }

        input[type="color"] {
          padding: 0;
          width: 40px;
          height: 28px;
          border: none;
          background: transparent;
          cursor: pointer;
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
        <div class="content">
          <label>
            Nazwa karty
            <input type="text"
              value="${c.name ?? ""}"
              @input="${e => this._update("name", e.target.value)}">
          </label>

          <label class="switch">
            <ha-switch
              ?checked="${c.show_name !== false}"
              @change="${e => this._update("show_name", e.target.checked)}">
            </ha-switch>
            Pokaż nagłówek
          </label>

          <label class="switch">
            <ha-switch
              ?checked="${c.show_trend !== false}"
              @change="${e => this._update("show_trend", e.target.checked)}">
            </ha-switch>
            Pokaż kolumnę trendu
          </label>

          <label class="switch">
            <ha-switch
              ?checked="${c.lite_mode === true}"
              @change="${e => this._update("lite_mode", e.target.checked)}">
            </ha-switch>
            Tryb LITE
          </label>
        </div>
      </details>

      <!-- ROZMIARY CZCIONEK -->
      <details class="group">
        <summary>Rozmiary czcionek</summary>
        <div class="content">
          <label>
            Nagłówek
            <input type="number" step="0.1"
              value="${c.font_size?.header ?? 0.8}"
              @input="${e => this._update("font_size.header", Number(e.target.value))}">
          </label>

          <label>
            Wiersz
            <input type="number" step="0.1"
              value="${c.font_size?.row ?? 0.9}"
              @input="${e => this._update("font_size.row", Number(e.target.value))}">
          </label>

          <label>
            Drużyna
            <input type="number" step="0.1"
              value="${c.font_size?.team ?? 1.0}"
              @input="${e => this._update("font_size.team", Number(e.target.value))}">
          </label>
        </div>
      </details>

      <!-- POZYCJE KLUCZOWE -->
      <details class="group">
        <summary>Konfiguracja pozycji</summary>
        <div class="content">

          <label>
            Top (LM) – ile miejsc
            <input type="number" min="0"
              value="${hl.top_count ?? 2}"
              @input="${e => this._update("highlight.top_count", Number(e.target.value))}">
          </label>

          <label>
            Europa (LK/LE) – ile miejsc
            <input type="number" min="0"
              value="${hl.eu_count ?? 2}"
              @input="${e => this._update("highlight.eu_count", Number(e.target.value))}">
          </label>

          <label>
            Spadek – ile miejsc
            <input type="number" min="0"
              value="${hl.bottom_count ?? 3}"
              @input="${e => this._update("highlight.bottom_count", Number(e.target.value))}">
          </label>

        </div>
      </details>

      <!-- KOLORY PODŚWIETLEŃ -->
      <details class="group">
        <summary>Kolory podświetleń (z ALFĄ)</summary>
        <div class="content">

          <!-- MOJA DRUŻYNA -->
          <label>
            Moja drużyna – kolor
            <input type="color"
              value="${hl.favorite_color ?? "#ffffff"}"
              @input="${e => this._update("highlight.favorite_color", e.target.value)}">
          </label>

          <label>
            Alfa
            <input type="number" min="0" max="1" step="0.05"
              value="${hl.favorite_alpha ?? 0.55}"
              @input="${e => this._update("highlight.favorite_alpha", Number(e.target.value))}">
          </label>

          <!-- TOP miejsca -->
          <label>
            Top – kolor
            <input type="color"
              value="${hl.top_color ?? "#3ba55d"}"
              @input="${e => this._update("highlight.top_color", e.target.value)}">
          </label>

          <label>
            Alfa
            <input type="number" min="0" max="1" step="0.05"
              value="${hl.top_alpha ?? 0.55}"
              @input="${e => this._update("highlight.top_alpha", Number(e.target.value))}">
          </label>

          <!-- EUROPEJSKIE -->
          <label>
            Europa – kolor
            <input type="color"
              value="${hl.eu_color ?? "#468cd2"}"
              @input="${e => this._update("highlight.eu_color", e.target.value)}">
          </label>

          <label>
            Alfa
            <input type="number" min="0" max="1" step="0.05"
              value="${hl.eu_alpha ?? 0.55}"
              @input="${e => this._update("highlight.eu_alpha", Number(e.target.value))}">
          </label>

          <!-- SPADKOWE -->
          <label>
            Spadek – kolor
            <input type="color"
              value="${hl.bottom_color ?? "#e23b3b"}"
              @input="${e => this._update("highlight.bottom_color", e.target.value)}">
          </label>

          <label>
            Alfa
            <input type="number" min="0" max="1" step="0.05"
              value="${hl.bottom_alpha ?? 0.55}"
              @input="${e => this._update("highlight.bottom_alpha", Number(e.target.value))}">
          </label>

        </div>
      </details>
    `;
  }
}

customElements.define("league-table-card-editor", LeagueTableCardEditor);