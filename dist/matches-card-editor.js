// ============================================================================
//  Matches Card Editor – stable, full bidirectional config
//  - debut: 700 ms
//  - number inputs
//  - accordion sections (no auto-collapse)
// ============================================================================

class MatchesCardEditor extends HTMLElement {

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = {};
    this._debounce = null;
  }

  // -----------------------------------
  // SET CONFIG FROM YAML
  // -----------------------------------
  setConfig(config) {
    this._config = JSON.parse(JSON.stringify(config));
    this.render();
  }

  // -----------------------------------
  // HA CALLS THIS TO PASS lovelace instance
  // -----------------------------------
  set hass(hass) {
    this._hass = hass;
  }

  // -----------------------------------
  // DEBOUNCED UPDATER
  // -----------------------------------
  _update(path, value) {
    const newConfig = JSON.parse(JSON.stringify(this._config));

    // Inject deep key path with value (example: font_size.score)
    const segments = path.split(".");
    let ref = newConfig;
    while (segments.length > 1) {
      const k = segments.shift();
      ref[k] = ref[k] ?? {};
      ref = ref[k];
    }
    ref[segments[0]] = value;

    this._config = newConfig;

    clearTimeout(this._debounce);
    this._debounce = setTimeout(() => this._commit(), 700);
  }

  _commit() {
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: this._config },
        bubbles: true,
        composed: true
      })
    );
  }

  // -----------------------------------
  // RENDER EDITOR UI
  // -----------------------------------
  render() {
    if (!this.shadowRoot) return;

    const c = this._config;

    this.shadowRoot.innerHTML = `
      <style>
        .group {
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 8px;
          margin: 12px 0;
          overflow: hidden;
        }
        .group summary {
          padding: 10px 12px;
          cursor: pointer;
          background: rgba(255,255,255,0.05);
          font-size: 1rem;
        }
        .group-content {
          padding: 12px 16px 16px 16px;
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
        input[type="number"], input[type="text"], select {
          padding: 4px 6px;
          background: rgba(0,0,0,0.20);
          color: inherit;
          border-radius: 6px;
          border: 1px solid rgba(255,255,255,0.20);
        }
        input[type="color"] {
          width: 40px;
          height: 28px;
          border-radius: 4px;
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
        <div class="group-content">

          <label>
            Nazwa karty
            <input type="text"
                   value="${c.name ?? ''}"
                   @input="${e => this._update('name', e.target.value)}">
          </label>

          <label class="switch">
            <ha-switch
              ?checked="${c.show_name !== false}"
              @change="${e => this._update('show_name', e.target.checked)}">
            </ha-switch>
            Pokaż nagłówek
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
            Pełne nazwy drużyn
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
            Tryb LITE (bez ha-card)
          </label>

        </div>
      </details>

      <!-- FILL MODE -->
      <details class="group">
        <summary>Styl wypełnienia</summary>
        <div class="group-content">

          <label>
            Mode
            <select @change="${e => this._update('fill_mode', e.target.value)}">
              <option value="gradient" ${c.fill_mode === "gradient" ? "selected" : ""}>Gradient</option>
              <option value="zebra"    ${c.fill_mode === "zebra"    ? "selected" : ""}>Zebra</option>
              <option value="clear"    ${c.fill_mode === "clear"    ? "selected" : ""}>Brak</option>
            </select>
          </label>

          ${c.fill_mode === "gradient" ? `
            <label>Start %
              <input type="number" min="0" max="100"
                     value="${c.gradient?.start ?? 35}"
                     @input="${e => this._update('gradient.start', Number(e.target.value))}">
            </label>

            <label>Koniec %
              <input type="number" min="0" max="100"
                     value="${c.gradient?.end ?? 100}"
                     @input="${e => this._update('gradient.end', Number(e.target.value))}">
            </label>

            <label>Alfa start
              <input type="number" min="0" max="1" step="0.05"
                     value="${c.gradient?.alpha_start ?? 0}"
                     @input="${e => this._update('gradient.alpha_start', Number(e.target.value))}">
            </label>

            <label>Alfa koniec
              <input type="number" min="0" max="1" step="0.05"
                     value="${c.gradient?.alpha_end ?? 0.55}"
                     @input="${e => this._update('gradient.alpha_end', Number(e.target.value))}">
            </label>
          ` : ""}

          ${c.fill_mode === "zebra" ? `
            <label>Kolor zebry
              <input type="color"
                     value="${c.zebra_color ?? "#f0f0f0"}"
                     @input="${e => this._update('zebra_color', e.target.value)}">
            </label>

            <label>Alfa zebry
              <input type="number" min="0" max="1" step="0.05"
                     value="${c.zebra_alpha ?? 0.4}"
                     @input="${e => this._update('zebra_alpha', Number(e.target.value))}">
            </label>
          ` : ""}
        </div>
      </details>

      <!-- FONT SIZES -->
      <details class="group">
        <summary>Rozmiary czcionek</summary>
        <div class="group-content">

          <label>Data
            <input type="number" step="0.1"
                   value="${c.font_size?.date ?? 0.9}"
                   @input="${e => this._update('font_size.date', Number(e.target.value))}">
          </label>

          <label>Status
            <input type="number" step="0.1"
                   value="${c.font_size?.status ?? 0.8}"
                   @input="${e => this._update('font_size.status', Number(e.target.value))}">
          </label>

          <label>Drużyny
            <input type="number" step="0.1"
                   value="${c.font_size?.teams ?? 1.0}"
                   @input="${e => this._update('font_size.teams', Number(e.target.value))}">
          </label>

          <label>Wynik
            <input type="number" step="0.1"
                   value="${c.font_size?.score ?? 1.0}"
                   @input="${e => this._update('font_size.score', Number(e.target.value))}">
          </label>

        </div>
      </details>

      <!-- ICON SIZES -->
      <details class="group">
        <summary>Rozmiary ikon</summary>
        <div class="group-content">

          <label>Liga
            <input type="number" min="10" max="60"
                   value="${c.icon_size?.league ?? 26}"
                   @input="${e => this._update('icon_size.league', Number(e.target.value))}">
          </label>

          <label>Herby
            <input type="number" min="10" max="60"
                   value="${c.icon_size?.crest ?? 24}"
                   @input="${e => this._update('icon_size.crest', Number(e.target.value))}">
          </label>

          <label>W/D/L
            <input type="number" min="10" max="60"
                   value="${c.icon_size?.result ?? 26}"
                   @input="${e => this._update('icon_size.result', Number(e.target.value))}">
          </label>

        </div>
      </details>

      <!-- COLORS -->
      <details class="group">
        <summary>Kolory W / D / L</summary>
        <div class="group-content">

          <label>Wygrana (W)
            <input type="color"
                   value="${c.colors?.win ?? "#3ba55d"}"
                   @input="${e => this._update('colors.win', e.target.value)}">
          </label>

          <label>Remis (D)
            <input type="color"
                   value="${c.colors?.draw ?? "#468cd2"}"
                   @input="${e => this._update('colors.draw', e.target.value)}">
          </label>

          <label>Porażka (L)
            <input type="color"
                   value="${c.colors?.loss ?? "#e23b3b"}"
                   @input="${e => this._update('colors.loss', e.target.value)}">
          </label>

        </div>
      </details>
    `;
  }
}

customElements.define("matches-card-editor", MatchesCardEditor);