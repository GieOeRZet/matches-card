// ============================================================================
//  Matches Card Editor – FINAL
//  - Bez lit, czysty Web Component
//  - Nie prze-renderuje się przy każdej zmianie (brak utraty focusa)
//  - Sekcje <details> nie zamykają się same
//  - Debounce ~700 ms na "config-changed"
//  - Spięty z konfiguracją z MatchesCard.getStubConfig()
// ============================================================================

class MatchesCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = {};
    this._debounceTimer = null;
  }

  setConfig(config) {
    // głęboka kopia żeby nie grzebać w oryginale
    this._config = JSON.parse(JSON.stringify(config || {}));
    this._render();
  }

  // --------------------------------------
  //  Home Assistant może to wywoływać
  // --------------------------------------
  set hass(_hass) {
    // edytor nie potrzebuje hass, ale metoda musi istnieć
  }

  // --------------------------------------
  //  RENDER (JEDNORAZOWY, BEZ PRZE-RENDERÓW NA INPUT)
  // --------------------------------------
  _render() {
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
              <ha-switch id="show_logos"></ha-switch>
              <span>Pokaż herby</span>
            </div>
          </label>

          <label class="full-width">
            <div class="switch-row">
              <ha-switch id="full_team_names"></ha-switch>
              <span>Pełne nazwy drużyn (zamiast skróconych)</span>
            </div>
          </label>

          <label class="full-width">
            <div class="switch-row">
              <ha-switch id="show_result_symbols"></ha-switch>
              <span>Pokaż symbole W / D / L</span>
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

      <!-- WYPEŁNIENIE -->
      <details class="group" open>
        <summary>Wypełnienie tła wiersza</summary>
        <div>
          <label>
            Tryb wypełnienia
            <select id="fill_mode">
              <option value="gradient">Gradient (kolor zależny od wyniku)</option>
              <option value="zebra">Zebra</option>
              <option value="clear">Brak</option>
            </select>
          </label>

          <label>
            Kolor zebry
            <input id="zebra_color" type="color">
          </label>

          <label>
            Alfa zebry
            <input id="zebra_alpha" type="number" min="0" max="1" step="0.05">
          </label>

          <label>
            Gradient – start (%)
            <input id="grad_start" type="number" min="0" max="100" step="1">
          </label>

          <label>
            Gradient – koniec (%)
            <input id="grad_end" type="number" min="0" max="100" step="1">
          </label>

          <label>
            Gradient – alfa start
            <input id="grad_alpha_start" type="number" min="0" max="1" step="0.05">
          </label>

          <label>
            Gradient – alfa koniec
            <input id="grad_alpha_end" type="number" min="0" max="1" step="0.05">
          </label>
        </div>
      </details>

      <!-- CZCIONKI -->
      <details class="group" open>
        <summary>Rozmiary czcionek</summary>
        <div>
          <label>
            Data
            <input id="font_date" type="number" step="0.1">
          </label>

          <label>
            Status (KONIEC / godzina)
            <input id="font_status" type="number" step="0.1">
          </label>

          <label>
            Drużyny
            <input id="font_teams" type="number" step="0.1">
          </label>

          <label>
            Wynik
            <input id="font_score" type="number" step="0.1">
          </label>
        </div>
      </details>

      <!-- IKONY -->
      <details class="group" open>
        <summary>Rozmiary ikon</summary>
        <div>
          <label>
            Logo ligi
            <input id="icon_league" type="number" min="10" max="80" step="1">
          </label>

          <label>
            Herby
            <input id="icon_crest" type="number" min="10" max="80" step="1">
          </label>

          <label>
            Symbol W / D / L
            <input id="icon_result" type="number" min="10" max="80" step="1">
          </label>
        </div>
      </details>

      <!-- KOLORY W/D/L -->
      <details class="group" open>
        <summary>Kolory wyników</summary>
        <div>
          <label>
            Wygrana (W)
            <input id="color_win" type="color">
          </label>

          <label>
            Remis (D)
            <input id="color_draw" type="color">
          </label>

          <label>
            Porażka (L)
            <input id="color_loss" type="color">
          </label>
        </div>
      </details>
    `;

    this._bindValues();
    this._bindEvents();
  }

  // --------------------------------------
  //  WSTAWIENIE WARTOŚCI Z CONFIG DO INPUTÓW
  // --------------------------------------
  _bindValues() {
    const root = this.shadowRoot;
    const c = this._config;

    // Podstawowe
    root.getElementById("name").value = c.name ?? "";

    const showName = root.getElementById("show_name");
    showName.checked = c.show_name !== false;

    const showLogos = root.getElementById("show_logos");
    showLogos.checked = c.show_logos !== false;

    const fullTeamNames = root.getElementById("full_team_names");
    fullTeamNames.checked = c.full_team_names !== false;

    const showResultSymbols = root.getElementById("show_result_symbols");
    showResultSymbols.checked = c.show_result_symbols !== false;

    const liteMode = root.getElementById("lite_mode");
    liteMode.checked = c.lite_mode === true;

    // Wypełnienie
    root.getElementById("fill_mode").value = c.fill_mode || "gradient";

    root.getElementById("zebra_color").value = c.zebra_color || "#f0f0f0";
    root.getElementById("zebra_alpha").value =
      typeof c.zebra_alpha === "number" ? c.zebra_alpha : 0.4;

    const grad = c.gradient || {};
    root.getElementById("grad_start").value =
      typeof grad.start === "number" ? grad.start : 35;
    root.getElementById("grad_end").value =
      typeof grad.end === "number" ? grad.end : 100;
    root.getElementById("grad_alpha_start").value =
      typeof grad.alpha_start === "number" ? grad.alpha_start : 0.0;
    root.getElementById("grad_alpha_end").value =
      typeof grad.alpha_end === "number" ? grad.alpha_end : 0.55;

    // Czcionki
    const fs = c.font_size || {};
    root.getElementById("font_date").value =
      typeof fs.date === "number" ? fs.date : 0.9;
    root.getElementById("font_status").value =
      typeof fs.status === "number" ? fs.status : 0.8;
    root.getElementById("font_teams").value =
      typeof fs.teams === "number" ? fs.teams : 1.0;
    root.getElementById("font_score").value =
      typeof fs.score === "number" ? fs.score : 1.0;

    // Ikony
    const isz = c.icon_size || {};
    root.getElementById("icon_league").value =
      typeof isz.league === "number" ? isz.league : 26;
    root.getElementById("icon_crest").value =
      typeof isz.crest === "number" ? isz.crest : 24;
    root.getElementById("icon_result").value =
      typeof isz.result === "number" ? isz.result : 26;

    // Kolory W/D/L
    const col = c.colors || {};
    root.getElementById("color_win").value = col.win || "#3ba55d";
    root.getElementById("color_draw").value = col.draw || "#468cd2";
    root.getElementById("color_loss").value = col.loss || "#e23b3b";
  }

  // --------------------------------------
  //  PODPIĘCIE ZDARZEŃ
  // --------------------------------------
  _bindEvents() {
    const root = this.shadowRoot;

    // Tekst: nazwa
    root.getElementById("name").addEventListener("input", (ev) => {
      this._config.name = ev.target.value;
      this._scheduleUpdate();
    });

    // Switche
    root.getElementById("show_name").addEventListener("change", (ev) => {
      this._config.show_name = ev.target.checked;
      this._scheduleUpdate();
    });

    root.getElementById("show_logos").addEventListener("change", (ev) => {
      this._config.show_logos = ev.target.checked;
      this._scheduleUpdate();
    });

    root.getElementById("full_team_names").addEventListener("change", (ev) => {
      this._config.full_team_names = ev.target.checked;
      this._scheduleUpdate();
    });

    root.getElementById("show_result_symbols").addEventListener("change", (ev) => {
      this._config.show_result_symbols = ev.target.checked;
      this._scheduleUpdate();
    });

    root.getElementById("lite_mode").addEventListener("change", (ev) => {
      this._config.lite_mode = ev.target.checked;
      this._scheduleUpdate();
    });

    // Tryb wypełnienia
    root.getElementById("fill_mode").addEventListener("change", (ev) => {
      this._config.fill_mode = ev.target.value;
      this._scheduleUpdate();
    });

    // Zebra
    root.getElementById("zebra_color").addEventListener("input", (ev) => {
      this._config.zebra_color = ev.target.value;
      this._scheduleUpdate();
    });

    root.getElementById("zebra_alpha").addEventListener("input", (ev) => {
      const val = parseFloat(ev.target.value);
      if (!this._config) this._config = {};
      this._config.zebra_alpha = isNaN(val) ? 0.4 : val;
      this._scheduleUpdate();
    });

    // Gradient
    root.getElementById("grad_start").addEventListener("input", (ev) => {
      const val = parseInt(ev.target.value, 10);
      this._ensurePath("gradient");
      this._config.gradient.start = isNaN(val) ? 35 : val;
      this._scheduleUpdate();
    });

    root.getElementById("grad_end").addEventListener("input", (ev) => {
      const val = parseInt(ev.target.value, 10);
      this._ensurePath("gradient");
      this._config.gradient.end = isNaN(val) ? 100 : val;
      this._scheduleUpdate();
    });

    root.getElementById("grad_alpha_start").addEventListener("input", (ev) => {
      const val = parseFloat(ev.target.value);
      this._ensurePath("gradient");
      this._config.gradient.alpha_start = isNaN(val) ? 0.0 : val;
      this._scheduleUpdate();
    });

    root.getElementById("grad_alpha_end").addEventListener("input", (ev) => {
      const val = parseFloat(ev.target.value);
      this._ensurePath("gradient");
      this._config.gradient.alpha_end = isNaN(val) ? 0.55 : val;
      this._scheduleUpdate();
    });

    // Czcionki
    root.getElementById("font_date").addEventListener("input", (ev) => {
      const val = parseFloat(ev.target.value);
      this._ensurePath("font_size");
      this._config.font_size.date = isNaN(val) ? 0.9 : val;
      this._scheduleUpdate();
    });

    root.getElementById("font_status").addEventListener("input", (ev) => {
      const val = parseFloat(ev.target.value);
      this._ensurePath("font_size");
      this._config.font_size.status = isNaN(val) ? 0.8 : val;
      this._scheduleUpdate();
    });

    root.getElementById("font_teams").addEventListener("input", (ev) => {
      const val = parseFloat(ev.target.value);
      this._ensurePath("font_size");
      this._config.font_size.teams = isNaN(val) ? 1.0 : val;
      this._scheduleUpdate();
    });

    root.getElementById("font_score").addEventListener("input", (ev) => {
      const val = parseFloat(ev.target.value);
      this._ensurePath("font_size");
      this._config.font_size.score = isNaN(val) ? 1.0 : val;
      this._scheduleUpdate();
    });

    // Ikony
    root.getElementById("icon_league").addEventListener("input", (ev) => {
      const val = parseInt(ev.target.value, 10);
      this._ensurePath("icon_size");
      this._config.icon_size.league = isNaN(val) ? 26 : val;
      this._scheduleUpdate();
    });

    root.getElementById("icon_crest").addEventListener("input", (ev) => {
      const val = parseInt(ev.target.value, 10);
      this._ensurePath("icon_size");
      this._config.icon_size.crest = isNaN(val) ? 24 : val;
      this._scheduleUpdate();
    });

    root.getElementById("icon_result").addEventListener("input", (ev) => {
      const val = parseInt(ev.target.value, 10);
      this._ensurePath("icon_size");
      this._config.icon_size.result = isNaN(val) ? 26 : val;
      this._scheduleUpdate();
    });

    // Kolory W/D/L
    root.getElementById("color_win").addEventListener("input", (ev) => {
      this._ensurePath("colors");
      this._config.colors.win = ev.target.value;
      this._scheduleUpdate();
    });

    root.getElementById("color_draw").addEventListener("input", (ev) => {
      this._ensurePath("colors");
      this._config.colors.draw = ev.target.value;
      this._scheduleUpdate();
    });

    root.getElementById("color_loss").addEventListener("input", (ev) => {
      this._ensurePath("colors");
      this._config.colors.loss = ev.target.value;
      this._scheduleUpdate();
    });
  }

  _ensurePath(key) {
    if (!this._config[key] || typeof this._config[key] !== "object") {
      this._config[key] = {};
    }
  }

  // --------------------------------------
  //  DEBOUNCE + EMIT CONFIG
  // --------------------------------------
  _scheduleUpdate() {
    if (this._debounceTimer) clearTimeout(this._debounceTimer);
    this._debounceTimer = setTimeout(() => this._emitConfigChanged(), 700);
  }

  _emitConfigChanged() {
    const event = new CustomEvent("config-changed", {
      detail: { config: this._config },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  // wymagane przez HA (nie musi nic zwracać konkretnego)
  static get stubConfig() {
    return {
      entity: "sensor.90minut_gornik_zabrze_matches"
    };
  }
}

customElements.define("matches-card-editor", MatchesCardEditor);