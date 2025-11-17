// ============================================================================
//  League Table Card Editor – Premium Gradient Edition
//  - Pełna zgodność z YAML
//  - Tryby: gradient, premium, zebra, clear
//  - Premium: start_alpha / mid_alpha / end_alpha / pastel_pos
//  - Debounce 700 ms
// ============================================================================

class LeagueTableCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = {};
    this._debounce = null;
  }

  setConfig(config) {
    const defaults = {
      name: "Tabela ligowa",
      show_name: true,
      lite_mode: false,

      fill_mode: "gradient", // gradient | premium | zebra | clear

      gradient: {
        start: 35,
        end: 100,
        alpha_start: 0.0,
        alpha_end: 0.55,
      },

      premium: {
        start_alpha: 0.85,
        mid_alpha: 0.35,
        end_alpha: 0.0,
        pastel_pos: 15,
      },

      zebra_color: "#f0f0f0",
      zebra_alpha: 0.4,

      highlight: {
        top_count: 2,
        conf_count: 2,
        bottom_count: 3,
      },

      colors: {
        top: "#3ba55d",
        conf: "#468cd2",
        bottom: "#e23b3b",
      },

      font_size: {
        header: 0.8,
        row: 0.9,
        team: 1.0,
      },
    };

    this._config = {
      ...defaults,
      ...config,
      gradient: { ...defaults.gradient, ...(config.gradient || {}) },
      premium: { ...defaults.premium, ...(config.premium || {}) },
      highlight: { ...defaults.highlight, ...(config.highlight || {}) },
      colors: { ...defaults.colors, ...(config.colors || {}) },
      font_size: { ...defaults.font_size, ...(config.font_size || {}) },
    };

    this._render();
  }

  _scheduleApply() {
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

  _updateRoot(key, value) {
    this._config[key] = value;
    this._scheduleApply();
  }

  _updateNested(group, key, value) {
    this._config[group][key] = value;
    this._scheduleApply();
  }

  _render() {
    const c = this._config;

    this.shadowRoot.innerHTML = `
      <style>
        .group {
          margin: 12px 0;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.2);
        }
        .group summary {
          padding: 10px 12px;
          font-size: 1rem;
          cursor: pointer;
          background: rgba(255,255,255,0.05);
        }
        .group > div {
          padding: 12px 16px 14px 16px;
          display: grid;
          gap: 12px;
          grid-template-columns: 1fr 1fr;
        }

        label {
          display: flex;
          flex-direction: column;
          font-size: 0.9rem;
        }

        input[type="text"],
        input[type="number"],
        select {
          margin-top: 4px;
          padding: 6px;
          border-radius: 6px;
          border: 1px solid rgba(255,255,255,0.2);
          background: rgba(0,0,0,0.2);
          color: inherit;
        }

        input[type="color"] {
          margin-top: 4px;
          width: 40px;
          height: 28px;
          border: none;
          background: transparent;
        }

        .switch-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }
      </style>

      <!-- PODSTAWOWE -->
      <details class="group" open>
        <summary>Podstawowe</summary>
        <div>
          <label>
            Nazwa karty
            <input type="text" data-root="name" value="${c.name}">
          </label>

          <div class="switch-row">
            <ha-switch data-root="show_name" ${c.show_name ? "checked" : ""}></ha-switch>
            <span>Pokaż nagłówek</span>
          </div>

          <div class="switch-row">
            <ha-switch data-root="lite_mode" ${c.lite_mode ? "checked" : ""}></ha-switch>
            <span>Tryb LITE</span>
          </div>
        </div>
      </details>


      <!-- STYL WIERSZY -->
      <details class="group">
        <summary>Styl wierszy</summary>
        <div>

          <label>
            Tryb
            <select data-root="fill_mode">
              <option value="gradient" ${c.fill_mode === "gradient" ? "selected" : ""}>Gradient</option>
              <option value="premium" ${c.fill_mode === "premium" ? "selected" : ""}>Premium gradient</option>
              <option value="zebra" ${c.fill_mode === "zebra" ? "selected" : ""}>Zebra</option>
              <option value="clear" ${c.fill_mode === "clear" ? "selected" : ""}>Brak</option>
            </select>
          </label>

          ${
            c.fill_mode === "gradient"
              ? `
          <label>Start %
            <input type="number" min="0" max="100" data-group="gradient" data-key="start" value="${c.gradient.start}">
          </label>

          <label>Koniec %
            <input type="number" min="0" max="100" data-group="gradient" data-key="end" value="${c.gradient.end}">
          </label>

          <label>Alfa start
            <input type="number" min="0" max="1" step="0.05" data-group="gradient" data-key="alpha_start" value="${c.gradient.alpha_start}">
          </label>

          <label>Alfa koniec
            <input type="number" min="0" max="1" step="0.05" data-group="gradient" data-key="alpha_end" value="${c.gradient.alpha_end}">
          </label>
          `
              : ""
          }

          ${
            c.fill_mode === "premium"
              ? `
          <label>Moc startowa
            <input type="number" min="0" max="1" step="0.05" data-group="premium" data-key="start_alpha" value="${c.premium.start_alpha}">
          </label>

          <label>Moc środkowa
            <input type="number" min="0" max="1" step="0.05" data-group="premium" data-key="mid_alpha" value="${c.premium.mid_alpha}">
          </label>

          <label>Moc końcowa
            <input type="number" min="0" max="1" step="0.05" data-group="premium" data-key="end_alpha" value="${c.premium.end_alpha}">
          </label>

          <label>Pozycja pastelowa %
            <input type="number" min="0" max="100" step="1" data-group="premium" data-key="pastel_pos" value="${c.premium.pastel_pos}">
          </label>
          `
              : ""
          }

          ${
            c.fill_mode === "zebra"
              ? `
          <label>Kolor zebry
            <input type="color" data-root="zebra_color" value="${c.zebra_color}">
          </label>

          <label>Alfa
            <input type="number" min="0" max="1" step="0.05" data-root="zebra_alpha" value="${c.zebra_alpha}">
          </label>
          `
              : ""
          }
        </div>
      </details>


      <!-- STREFY KOLORÓW -->
      <details class="group">
        <summary>Strefy kolorystyczne</summary>
        <div>
          <label>TOP (LM)
            <input type="color" data-group="colors" data-key="top" value="${c.colors.top}">
          </label>

          <label>Conference (LKE)
            <input type="color" data-group="colors" data-key="conf" value="${c.colors.conf}">
          </label>

          <label>Spadek
            <input type="color" data-group="colors" data-key="bottom" value="${c.colors.bottom}">
          </label>

          <label>Liczba TOP
            <input type="number" min="0" max="10" data-group="highlight" data-key="top_count" value="${c.highlight.top_count}">
          </label>

          <label>Liczba Conference
            <input type="number" min="0" max="10" data-group="highlight" data-key="conf_count" value="${c.highlight.conf_count}">
          </label>

          <label>Liczba spadkowych
            <input type="number" min="0" max="10" data-group="highlight" data-key="bottom_count" value="${c.highlight.bottom_count}">
          </label>
        </div>
      </details>


      <!-- CZCIONKI -->
      <details class="group">
        <summary>Czcionki</summary>
        <div>
          <label>Nagłówek
            <input type="number" step="0.1" data-group="font_size" data-key="header" value="${c.font_size.header}">
          </label>

          <label>Wiersze
            <input type="number" step="0.1" data-group="font_size" data-key="row" value="${c.font_size.row}">
          </label>

          <label>Nazwy drużyn
            <input type="number" step="0.1" data-group="font_size" data-key="team" value="${c.font_size.team}">
          </label>
        </div>
      </details>
    `;

    this._attachListeners();
  }

  _attachListeners() {
    const root = this.shadowRoot;

    // ROOT
    root.querySelectorAll("[data-root]").forEach((el) => {
      const key = el.getAttribute("data-root");
      if (el.tagName.toLowerCase() === "ha-switch") {
        el.addEventListener("change", () => {
          this._updateRoot(key, el.checked);
        });
      } else {
        el.addEventListener("input", () => {
          const isNum = el.type === "number";
          const val = isNum ? Number(el.value) : el.value;
          this._updateRoot(key, val);
        });
      }
    });

    // NESTED
    root.querySelectorAll("[data-group][data-key]").forEach((el) => {
      const group = el.getAttribute("data-group");
      const key = el.getAttribute("data-key");

      if (el.tagName.toLowerCase() === "ha-switch") {
        el.addEventListener("change", () => {
          this._updateNested(group, key, el.checked);
        });
      } else {
        el.addEventListener("input", () => {
          const isNum = el.type === "number";
          const val = isNum ? Number(el.value) : el.value;
          this._updateNested(group, key, val);
        });
      }
    });
  }
}

customElements.define("league-table-card-editor", LeagueTableCardEditor);
