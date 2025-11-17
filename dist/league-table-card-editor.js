// ============================================================================
//  League Table Card Editor (90minut)
//  - Bez lit, czysty Web Component
//  - Debounce ~700 ms na config-changed
//  - Sekcje <details> nie zwijają się same
//  - Obsługa: nazwa, show_name, lite_mode, font_size, highlight + kolory + alfa
// ============================================================================

class LeagueTableCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = {};
    this._debounceTimer = null;
  }

  setConfig(config) {
    // Głęboka kopia, żeby nie mieszać w oryginalnym obiekcie HA
    this._config = JSON.parse(JSON.stringify(config || {}));
    this._render();
  }

  set hass(_hass) {
    // Edytor nie potrzebuje hass, ale metoda musi istnieć
  }

  // ---------------------------------------------------------------------------
  // RENDER – tylko raz w setConfig, bez przebudowy przy każdej zmianie
  // ---------------------------------------------------------------------------
  _render() {
    if (!this.shadowRoot) return;

    this.shadowRoot.innerHTML = `
      <style>
        .group {
          margin: 12px 0;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.18);
          overflow: hidden;
        }

        .group summary {
          padding: 8px 12px;
          font-size: 0.95rem;
          cursor: pointer;
          background: rgba(255,255,255,0.04);
        }

        .group > div {
          padding: 10px 16px 14px 16px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px 14px;
        }

        label {
          display: flex;
          flex-direction: column;
          font-size: 0.85rem;
          opacity: 0.9;
        }

        input[type="text"],
        input[type="number"],
        select {
          margin-top: 4px;
          padding: 4px 6px;
          border-radius: 6px;
          border: 1px solid rgba(255,255,255,0.20);
          background: rgba(0,0,0,0.2);
          color: inherit;
          font: inherit;
        }

        input[type="color"] {
          margin-top: 4px;
          width: 48px;
          height: 28px;
          padding: 0;
          border-radius: 4px;
          border: 1px solid rgba(255,255,255,0.25);
          background: transparent;
        }

        .switch-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 4px;
        }

        .switch-row span {
          font-size: 0.9rem;
        }

        .full-width {
          grid-column: 1 / -1;
        }
      </style>

      <!-- PODSTAWOWE -->
      <details class="group" open>
        <summary>Podstawowe</summary>
        <div>
          <label class="full-width">
            Nazwa karty
            <input id="name" type="text">
          </label>

          <label class="full-width">
            <div class="switch-row">
              <ha-switch id="show_name"></ha-switch>
              <span>Pokaż nagłówek (ha-card header)</span>
            </div>
          </label>

          <label class="full-width">
            <div class="switch-row">
              <ha-switch id="lite_mode"></ha-switch>
              <span>Tryb LITE (bez tła ha-card)</span>
            </div>
          </label>
        </div>
      </details>

      <!-- ROZMIARY CZCIONEK -->
      <details class="group" open>
        <summary>Rozmiary czcionek</summary>
        <div>
          <label>
            Nagłówek tabeli
            <input id="font_header" type="number" step="0.1">
          </label>

          <label>
            Wiersz (cyfry)
            <input id="font_row" type="number" step="0.1">
          </label>

          <label>
            Nazwa drużyny
            <input id="font_team" type="number" step="0.1">
          </label>
        </div>
      </details>

      <!-- PODŚWIETLENIE -->
      <details class="group" open>
        <summary>Podświetlenie miejsc</summary>
        <div>
          <label>
            Liczba miejsc TOP (np. awans do LM)
            <input id="top_count" type="number" min="0" step="1">
          </label>

          <label>
            Liczba miejsc SPADKOWYCH
            <input id="bottom_count" type="number" min="0" step="1">
          </label>

          <label class="full-width">
            <div class="switch-row">
              <ha-switch id="highlight_favorite"></ha-switch>
              <span>Podświetl moją drużynę (my_position)</span>
            </div>
          </label>
        </div>
      </details>

      <!-- KOLORY + ALFA -->
      <details class="group" open>
        <summary>Kolory podświetleń</summary>
        <div>
          <label>
            Moja drużyna – kolor
            <input id="fav_color" type="color">
          </label>

          <label>
            Moja drużyna – alfa
            <input id="fav_alpha" type="number" min="0" max="1" step="0.05">
          </label>

          <label>
            TOP (np. 1–2 miejsce) – kolor
            <input id="top_color" type="color">
          </label>

          <label>
            TOP – alfa
            <input id="top_alpha" type="number" min="0" max="1" step="0.05">
          </label>

          <label>
            Spadek – kolor
            <input id="bottom_color" type="color">
          </label>

          <label>
            Spadek – alfa
            <input id="bottom_alpha" type="number" min="0" max="1" step="0.05">
          </label>
        </div>
      </details>
    `;

    this._bindValues();
    this._bindEvents();
  }

  // ---------------------------------------------------------------------------
  // Wstawienie wartości z configu do kontrolek
  // ---------------------------------------------------------------------------
  _bindValues() {
    const root = this.shadowRoot;
    const c = this._config || {};
    const fs = c.font_size || {};
    const hl = c.highlight || {};

    // Podstawowe
    root.getElementById("name").value = c.name ?? "";

    const showName = root.getElementById("show_name");
    showName.checked = c.show_name !== false;

    const liteMode = root.getElementById("lite_mode");
    liteMode.checked = c.lite_mode === true;

    // Czcionki
    root.getElementById("font_header").value =
      typeof fs.header === "number" ? fs.header : 0.8;
    root.getElementById("font_row").value =
      typeof fs.row === "number" ? fs.row : 0.9;
    root.getElementById("font_team").value =
      typeof fs.team === "number" ? fs.team : 1.0;

    // Podświetlenie / ilość miejsc
    root.getElementById("top_count").value =
      typeof hl.top_count === "number" ? hl.top_count : 2;
    root.getElementById("bottom_count").value =
      typeof hl.bottom_count === "number" ? hl.bottom_count : 3;

    const favSwitch = root.getElementById("highlight_favorite");
    favSwitch.checked = hl.favorite !== false;

    // Kolory + alfa
    root.getElementById("fav_color").value =
      hl.favorite_color || "#fff8e1";
    root.getElementById("fav_alpha").value =
      typeof hl.favorite_alpha === "number" ? hl.favorite_alpha : 0.55;

    root.getElementById("top_color").value =
      hl.top_color || "#3ba55d"; // zielony jak WIN z karty meczowej
    root.getElementById("top_alpha").value =
      typeof hl.top_alpha === "number" ? hl.top_alpha : 0.55;

    root.getElementById("bottom_color").value =
      hl.bottom_color || "#e23b3b"; // czerwony jak LOSS
    root.getElementById("bottom_alpha").value =
      typeof hl.bottom_alpha === "number" ? hl.bottom_alpha : 0.55;
  }

  // ---------------------------------------------------------------------------
  // Podpięcie zdarzeń
  // ---------------------------------------------------------------------------
  _bindEvents() {
    const root = this.shadowRoot;

    // Nazwa
    root.getElementById("name").addEventListener("input", (ev) => {
      this._config.name = ev.target.value;
      this._scheduleUpdate();
    });

    // show_name
    root.getElementById("show_name").addEventListener("change", (ev) => {
      this._config.show_name = ev.target.checked;
      this._scheduleUpdate();
    });

    // lite_mode
    root.getElementById("lite_mode").addEventListener("change", (ev) => {
      this._config.lite_mode = ev.target.checked;
      this._scheduleUpdate();
    });

    // Czcionki
    root.getElementById("font_header").addEventListener("input", (ev) => {
      const v = parseFloat(ev.target.value);
      this._ensurePath("font_size");
      this._config.font_size.header = isNaN(v) ? 0.8 : v;
      this._scheduleUpdate();
    });

    root.getElementById("font_row").addEventListener("input", (ev) => {
      const v = parseFloat(ev.target.value);
      this._ensurePath("font_size");
      this._config.font_size.row = isNaN(v) ? 0.9 : v;
      this._scheduleUpdate();
    });

    root.getElementById("font_team").addEventListener("input", (ev) => {
      const v = parseFloat(ev.target.value);
      this._ensurePath("font_size");
      this._config.font_size.team = isNaN(v) ? 1.0 : v;
      this._scheduleUpdate();
    });

    // Liczba miejsc
    root.getElementById("top_count").addEventListener("input", (ev) => {
      const v = parseInt(ev.target.value, 10);
      this._ensurePath("highlight");
      this._config.highlight.top_count = isNaN(v) ? 2 : v;
      this._scheduleUpdate();
    });

    root.getElementById("bottom_count").addEventListener("input", (ev) => {
      const v = parseInt(ev.target.value, 10);
      this._ensurePath("highlight");
      this._config.highlight.bottom_count = isNaN(v) ? 3 : v;
      this._scheduleUpdate();
    });

    // Podświetlenie mojej drużyny
    root.getElementById("highlight_favorite").addEventListener("change", (ev) => {
      this._ensurePath("highlight");
      this._config.highlight.favorite = ev.target.checked;
      this._scheduleUpdate();
    });

    // Kolor + alfa – moja drużyna
    root.getElementById("fav_color").addEventListener("input", (ev) => {
      this._ensurePath("highlight");
      this._config.highlight.favorite_color = ev.target.value;
      this._scheduleUpdate();
    });

    root.getElementById("fav_alpha").addEventListener("input", (ev) => {
      const v = parseFloat(ev.target.value);
      this._ensurePath("highlight");
      this._config.highlight.favorite_alpha = isNaN(v) ? 0.55 : v;
      this._scheduleUpdate();
    });

    // Kolor + alfa – TOP
    root.getElementById("top_color").addEventListener("input", (ev) => {
      this._ensurePath("highlight");
      this._config.highlight.top_color = ev.target.value;
      this._scheduleUpdate();
    });

    root.getElementById("top_alpha").addEventListener("input", (ev) => {
      const v = parseFloat(ev.target.value);
      this._ensurePath("highlight");
      this._config.highlight.top_alpha = isNaN(v) ? 0.55 : v;
      this._scheduleUpdate();
    });

    // Kolor + alfa – SPADKI
    root.getElementById("bottom_color").addEventListener("input", (ev) => {
      this._ensurePath("highlight");
      this._config.highlight.bottom_color = ev.target.value;
      this._scheduleUpdate();
    });

    root.getElementById("bottom_alpha").addEventListener("input", (ev) => {
      const v = parseFloat(ev.target.value);
      this._ensurePath("highlight");
      this._config.highlight.bottom_alpha = isNaN(v) ? 0.55 : v;
      this._scheduleUpdate();
    });
  }

  _ensurePath(key) {
    if (!this._config[key] || typeof this._config[key] !== "object") {
      this._config[key] = {};
    }
  }

  // ---------------------------------------------------------------------------
  // Debounce + wysłanie config-changed
  // ---------------------------------------------------------------------------
  _scheduleUpdate() {
    if (this._debounceTimer) clearTimeout(this._debounceTimer);
    this._debounceTimer = setTimeout(
      () => this._emitConfigChanged(),
      700
    );
  }

  _emitConfigChanged() {
    const ev = new CustomEvent("config-changed", {
      detail: { config: this._config },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(ev);
  }

  static get stubConfig() {
    return {
      entity: "sensor.90minut_gornik_zabrze_table",
    };
  }
}

customElements.define("league-table-card-editor", LeagueTableCardEditor);