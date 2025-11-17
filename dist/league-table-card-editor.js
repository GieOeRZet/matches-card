// ============================================================================
//  League Table Card – VISUAL EDITOR
//  Works with: LeagueTableCard (90minut)
//  Debounce: 700ms
// ============================================================================

class LeagueTableCardEditor extends HTMLElement {

  constructor() {
    super();
    this._config = {};
    this._debounceTimer = null;
    this.attachShadow({ mode: "open" });
  }

  setConfig(config) {
    this._config = JSON.parse(JSON.stringify(config));
    this.render();
  }

  set hass(hass) {
    this._hass = hass;
  }

  // Debounce write
  _debounceSave() {
    clearTimeout(this._debounceTimer);
    this._debounceTimer = setTimeout(() => {
      this._onChange();
    }, 700);
  }

  _onChange() {
    const event = new CustomEvent("config-changed", {
      detail: { config: this._config },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  _update(path, value) {
    const parts = path.split(".");
    let obj = this._config;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!obj[parts[i]]) obj[parts[i]] = {};
      obj = obj[parts[i]];
    }
    obj[parts[parts.length - 1]] = value;
    this._debounceSave();
  }

  render() {
    if (!this.shadowRoot) return;

    const cfg = this._config;

    this.shadowRoot.innerHTML = `
      <style>
        .section {
          border: 1px solid rgba(150,150,150,0.25);
          border-radius: 8px;
          margin: 12px 0;
          overflow: hidden;
        }
        .section-header {
          background: rgba(200,200,200,0.15);
          padding: 10px;
          font-weight: 600;
          cursor: pointer;
        }
        .section-body {
          padding: 12px;
        }
        .row {
          display: flex;
          align-items: center;
          margin: 8px 0;
        }
        .row label {
          flex: 1;
        }
        input[type="number"], input[type="text"], ha-textfield, ha-selector-color {
          flex: 1;
        }
      </style>

      <div class="section">
        <div class="section-header" id="sec-basic">⚽ Podstawowe</div>
        <div class="section-body" style="display:block">
          <div class="row">
            <label>Nazwa wyświetlana</label>
            <input type="text" value="${cfg.name ?? ""}"
              @input="${(e)=>this._update('name', e.target.value)}">
          </div>

          <div class="row">
            <label>Pokaż nazwę karty</label>
            <ha-switch
              ?checked="${cfg.show_name !== false}"
              @change="${(e)=>this._update('show_name', e.target.checked)}">
            </ha-switch>
          </div>

          <div class="row">
            <label>Tryb LITE</label>
            <ha-switch
              ?checked="${cfg.lite_mode === true}"
              @change="${(e)=>this._update('lite_mode', e.target.checked)}">
            </ha-switch>
          </div>

          <div class="row">
            <label>Pokaż trend</label>
            <ha-switch
              ?checked="${cfg.show_trend !== false}"
              @change="${(e)=>this._update('show_trend', e.target.checked)}">
            </ha-switch>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-header" id="sec-fonts">🔤 Czcionki</div>
        <div class="section-body" style="display:none">
          <div class="row">
            <label>Nagłówek (rem)</label>
            <input type="number" step="0.1" min="0.5"
              value="${cfg.font_size?.header ?? 0.8}"
              @input="${(e)=>this._update('font_size.header', Number(e.target.value))}">
          </div>
          <div class="row">
            <label>Wiersz (rem)</label>
            <input type="number" step="0.1" min="0.5"
              value="${cfg.font_size?.row ?? 0.9}"
              @input="${(e)=>this._update('font_size.row', Number(e.target.value))}">
          </div>
          <div class="row">
            <label>Drużyna (rem)</label>
            <input type="number" step="0.1" min="0.5"
              value="${cfg.font_size?.team ?? 1.0}"
              @input="${(e)=>this._update('font_size.team', Number(e.target.value))}">
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-header" id="sec-highlight">🎨 Wyróżnienia</div>
        <div class="section-body" style="display:none">

          <div class="row">
            <label>Top ile?</label>
            <input type="number" min="0" max="10"
              value="${cfg.highlight?.top_count ?? 3}"
              @input="${(e)=>this._update('highlight.top_count', Number(e.target.value))}">
          </div>

          <div class="row">
            <label>Spadkowe ile?</label>
            <input type="number" min="0" max="10"
              value="${cfg.highlight?.bottom_count ?? 3}"
              @input="${(e)=>this._update('highlight.bottom_count', Number(e.target.value))}">
          </div>

          <div class="row">
            <label>Kolor ulubionej</label>
            <ha-color-picker
              value="${cfg.highlight?.favorite_color ?? '#fff8e1'}"
              @color-changed="${(e)=>this._update('highlight.favorite_color', e.detail.value)}">
            </ha-color-picker>
          </div>

          <div class="row">
            <label>Kolor TOP</label>
            <ha-color-picker
              value="${cfg.highlight?.top_color ?? '#e8f5e9'}"
              @color-changed="${(e)=>this._update('highlight.top_color', e.detail.value)}">
            </ha-color-picker>
          </div>

          <div class="row">
            <label>Kolor DOŁU</label>
            <ha-color-picker
              value="${cfg.highlight?.bottom_color ?? '#ffebee'}"
              @color-changed="${(e)=>this._update('highlight.bottom_color', e.detail.value)}">
            </ha-color-picker>
          </div>
        </div>
      </div>
    `;

    // Sekcje rozwijane
    const toggle = (id) => {
      const body = this.shadowRoot.querySelector(`#${id}`).nextElementSibling;
      body.style.display = body.style.display === "none" ? "block" : "none";
    };

    this.shadowRoot.querySelector("#sec-basic")
      .addEventListener("click", () => toggle("sec-basic"));
    this.shadowRoot.querySelector("#sec-fonts")
      .addEventListener("click", () => toggle("sec-fonts"));
    this.shadowRoot.querySelector("#sec-highlight")
      .addEventListener("click", () => toggle("sec-highlight"));
  }
}

// Rejestracja edytora
customElements.define("league-table-card-editor", LeagueTableCardEditor);