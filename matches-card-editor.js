// ============================================================================
//  Matches Card Editor – for Matches Card 0.3.000 baseline
//  Author: GieOeRZet
//  Uwaga: Edytor nie zmienia logiki ani layoutu karty, tylko jej konfigurację
// ============================================================================

class MatchesCardEditor extends HTMLElement {
  constructor() {
    super();
    this._config = {};
    this._debounceTimer = null;
    this.attachShadow({ mode: "open" });
  }

  setConfig(config) {
    // Głęboka kopia, żeby nie modyfikować obiektu źródłowego
    this._config = JSON.parse(JSON.stringify(config || {}));
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
  }

  // -------------------------------
  //  Debounce aktualizacji configu
  // -------------------------------
  _scheduleUpdate() {
    clearTimeout(this._debounceTimer);
    this._debounceTimer = setTimeout(() => {
      this.dispatchEvent(
        new CustomEvent("config-changed", {
          detail: { config: this._config },
        })
      );
    }, 500); // 0.5 s
  }

  _updateRoot(key, value) {
    this._config[key] = value;
    this._scheduleUpdate();
  }

  _updateNested(section, key, value) {
    this._config[section] = {
      ...(this._config[section] || {}),
      [key]: value,
    };
    this._scheduleUpdate();
  }

  // -------------------------------
  //  Render edytora
  // -------------------------------
  _render() {
    const cfg = this._config;

    const fill_mode = cfg.fill_mode || "gradient";
    const colors = cfg.colors || {};
    const gradient = cfg.gradient || {};
    const icon_size = cfg.icon_size || {};
    const font_size = cfg.font_size || {};

    const zebra_color = cfg.zebra_color || "#f0f0f0";
    const zebra_alpha = typeof cfg.zebra_alpha === "number" ? cfg.zebra_alpha : 0.4;

    const lite_mode = !!cfg.lite_mode;

    const style = `
      <style>
        :host {
          display: block;
          padding-bottom: 16px;
        }
        .section {
          border: 1px solid var(--divider-color, #ccc);
          border-radius: 8px;
          margin: 10px 0;
          overflow: hidden;
          background: var(--card-background-color, #fff0);
        }
        .section-header {
          padding: 10px 14px;
          background: var(--secondary-background-color);
          font-weight: 600;
          cursor: pointer;
          user-select: none;
        }
        .section-header span {
          font-size: 0.9em;
        }
        .section-content {
          padding: 10px 14px 14px;
          display: none;
        }
        .section.open .section-content {
          display: block;
        }

        .row {
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
          margin-bottom: 10px;
        }
        .col {
          flex: 1;
          min-width: 120px;
          display: flex;
          flex-direction: column;
        }
        label {
          font-size: 0.8em;
          margin-bottom: 4px;
          color: var(--secondary-text-color);
        }
        input[type="number"],
        input[type="color"],
        select {
          padding: 4px;
          font-size: 0.9em;
          box-sizing: border-box;
        }
        input[type="checkbox"] {
          margin-right: 8px;
        }
        .checkbox-row {
          display: flex;
          align-items: center;
          margin: 4px 0;
        }
        .checkbox-row label {
          margin: 0;
        }
      </style>
    `;

    const html = `
      ${style}

      <!-- OGÓLNE / TRYB + LITE -->
      <div class="section open" id="section-general">
        <div class="section-header">
          <span>Ogólne</span>
        </div>
        <div class="section-content">
          <div class="row">
            <div class="col">
              <label>Tryb wypełnienia</label>
              <select id="fill_mode">
                <option value="gradient"${fill_mode === "gradient" ? " selected" : ""}>Gradient</option>
                <option value="zebra"${fill_mode === "zebra" ? " selected" : ""}>Zebra</option>
              </select>
            </div>
          </div>
          <div class="row">
            <div class="col">
              <div class="checkbox-row">
                <input type="checkbox" id="lite_mode"${lite_mode ? " checked" : ""}>
                <label for="lite_mode">Tryb LITE (bez tła karty i nagłówka)</label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- GRADIENT -->
      <div class="section" id="section-gradient">
        <div class="section-header">
          <span>Gradient (W / R / P)</span>
        </div>
        <div class="section-content">
          <div class="row">
            <div class="col">
              <label>Kolor WYGRANA (W)</label>
              <input type="color" id="color_win" value="${colors.win || "#3ba55d"}">
            </div>
            <div class="col">
              <label>Kolor REMIS (R)</label>
              <input type="color" id="color_draw" value="${colors.draw || "#468cd2"}">
            </div>
            <div class="col">
              <label>Kolor PORAŻKA (P)</label>
              <input type="color" id="color_loss" value="${colors.loss || "#e23b3b"}">
            </div>
          </div>

          <div class="row">
            <div class="col">
              <label>Przezroczystość (alpha 0–1)</label>
              <input type="number" id="grad_alpha" min="0" max="1" step="0.05"
                     value="${typeof gradient.alpha === "number" ? gradient.alpha : 0.55}">
            </div>
            <div class="col">
              <label>Początek gradientu (%)</label>
              <input type="number" id="grad_start" min="0" max="100" step="1"
                     value="${typeof gradient.start === "number" ? gradient.start : 35}">
            </div>
            <div class="col">
              <label>Koniec gradientu (%)</label>
              <input type="number" id="grad_end" min="0" max="100" step="1"
                     value="${typeof gradient.end === "number" ? gradient.end : 100}">
            </div>
          </div>
        </div>
      </div>

      <!-- ZEBRA -->
      <div class="section" id="section-zebra">
        <div class="section-header">
          <span>Zebra</span>
        </div>
        <div class="section-content">
          <div class="row">
            <div class="col">
              <label>Kolor zebry</label>
              <input type="color" id="zebra_color" value="${zebra_color}">
            </div>
            <div class="col">
              <label>Przezroczystość zebry (alpha 0–1)</label>
              <input type="number" id="zebra_alpha" min="0" max="1" step="0.05" value="${zebra_alpha}">
            </div>
          </div>
        </div>
      </div>

      <!-- IKONY -->
      <div class="section" id="section-icons">
        <div class="section-header">
          <span>Ikony (herb, liga, W/R/P)</span>
        </div>
        <div class="section-content">
          <div class="row">
            <div class="col">
              <label>Rozmiar logo ligi (px)</label>
              <input type="number" id="icon_league" min="8" max="128" step="1"
                     value="${typeof icon_size.league === "number" ? icon_size.league : 26}">
            </div>
            <div class="col">
              <label>Rozmiar herbu drużyny (px)</label>
              <input type="number" id="icon_crest" min="8" max="128" step="1"
                     value="${typeof icon_size.crest === "number" ? icon_size.crest : 24}">
            </div>
            <div class="col">
              <label>Rozmiar symbolu wyniku (W/R/P) (px)</label>
              <input type="number" id="icon_result" min="8" max="128" step="1"
                     value="${typeof icon_size.result === "number" ? icon_size.result : 26}">
            </div>
          </div>
        </div>
      </div>

      <!-- CZCIONKI -->
      <div class="section" id="section-fonts">
        <div class="section-header">
          <span>Czcionki</span>
        </div>
        <div class="section-content">
          <div class="row">
            <div class="col">
              <label>Rozmiar daty (rem)</label>
              <input type="number" id="font_date" min="0.5" max="3" step="0.1"
                     value="${typeof font_size.date === "number" ? font_size.date : 0.9}">
            </div>
            <div class="col">
              <label>Rozmiar statusu (drugi wiersz, np. KONIEC) (rem)</label>
              <input type="number" id="font_status" min="0.5" max="3" step="0.1"
                     value="${typeof font_size.status === "number" ? font_size.status : 0.8}">
            </div>
          </div>

          <div class="row">
            <div class="col">
              <label>Rozmiar nazw drużyn (rem)</label>
              <input type="number" id="font_teams" min="0.5" max="3" step="0.1"
                     value="${typeof font_size.teams === "number" ? font_size.teams : 1.0}">
            </div>
            <div class="col">
              <label>Rozmiar wyniku (rem)</label>
              <input type="number" id="font_score" min="0.5" max="3" step="0.1"
                     value="${typeof font_size.score === "number" ? font_size.score : 1.0}">
            </div>
          </div>
        </div>
      </div>
    `;

    this.shadowRoot.innerHTML = html;

    this._attachSectionToggles();
    this._attachInputs();

    // Auto-expand: w zależności od trybu wypełnienia
    this._autoExpand(fill_mode);
  }

  // -------------------------------
  //  Obsługa rozwijania sekcji
  // -------------------------------
  _attachSectionToggles() {
    const sections = this.shadowRoot.querySelectorAll(".section");
    sections.forEach((sec) => {
      const header = sec.querySelector(".section-header");
      header.addEventListener("click", () => {
        sec.classList.toggle("open");
      });
    });
  }

  _autoExpand(fill_mode) {
    const gradientSec = this.shadowRoot.getElementById("section-gradient");
    const zebraSec = this.shadowRoot.getElementById("section-zebra");

    if (gradientSec) gradientSec.classList.remove("open");
    if (zebraSec) zebraSec.classList.remove("open");

    if (fill_mode === "gradient" && gradientSec) {
      gradientSec.classList.add("open");
    }
    if (fill_mode === "zebra" && zebraSec) {
      zebraSec.classList.add("open");
    }
  }

  // -------------------------------
  //  Podpinanie inputów i listenerów
  // -------------------------------
  _attachInputs() {
    // Fill mode
    const fillSelect = this.shadowRoot.getElementById("fill_mode");
    if (fillSelect) {
      fillSelect.addEventListener("change", (e) => {
        const value = e.target.value;
        this._updateRoot("fill_mode", value);
        this._autoExpand(value);
      });
    }

    // Lite mode
    const liteCheckbox = this.shadowRoot.getElementById("lite_mode");
    if (liteCheckbox) {
      liteCheckbox.addEventListener("change", (e) => {
        this._updateRoot("lite_mode", e.target.checked);
      });
    }

    // Gradient colors
    const colorWin = this.shadowRoot.getElementById("color_win");
    const colorDraw = this.shadowRoot.getElementById("color_draw");
    const colorLoss = this.shadowRoot.getElementById("color_loss");

    if (colorWin) {
      colorWin.addEventListener("input", (e) =>
        this._updateNested("colors", "win", e.target.value)
      );
    }
    if (colorDraw) {
      colorDraw.addEventListener("input", (e) =>
        this._updateNested("colors", "draw", e.target.value)
      );
    }
    if (colorLoss) {
      colorLoss.addEventListener("input", (e) =>
        this._updateNested("colors", "loss", e.target.value)
      );
    }

    // Gradient numeric
    const gradAlpha = this.shadowRoot.getElementById("grad_alpha");
    const gradStart = this.shadowRoot.getElementById("grad_start");
    const gradEnd = this.shadowRoot.getElementById("grad_end");

    if (gradAlpha) {
      gradAlpha.addEventListener("input", (e) =>
        this._updateNested("gradient", "alpha", Number(e.target.value))
      );
    }
    if (gradStart) {
      gradStart.addEventListener("input", (e) =>
        this._updateNested("gradient", "start", Number(e.target.value))
      );
    }
    if (gradEnd) {
      gradEnd.addEventListener("input", (e) =>
        this._updateNested("gradient", "end", Number(e.target.value))
      );
    }

    // Zebra
    const zebraColor = this.shadowRoot.getElementById("zebra_color");
    const zebraAlpha = this.shadowRoot.getElementById("zebra_alpha");

    if (zebraColor) {
      zebraColor.addEventListener("input", (e) =>
        this._updateRoot("zebra_color", e.target.value)
      );
    }
    if (zebraAlpha) {
      zebraAlpha.addEventListener("input", (e) =>
        this._updateRoot("zebra_alpha", Number(e.target.value))
      );
    }

    // Icons
    const iconLeague = this.shadowRoot.getElementById("icon_league");
    const iconCrest = this.shadowRoot.getElementById("icon_crest");
    const iconResult = this.shadowRoot.getElementById("icon_result");

    if (iconLeague) {
      iconLeague.addEventListener("input", (e) =>
        this._updateNested("icon_size", "league", Number(e.target.value))
      );
    }
    if (iconCrest) {
      iconCrest.addEventListener("input", (e) =>
        this._updateNested("icon_size", "crest", Number(e.target.value))
      );
    }
    if (iconResult) {
      iconResult.addEventListener("input", (e) =>
        this._updateNested("icon_size", "result", Number(e.target.value))
      );
    }

    // Fonts
    const fontDate = this.shadowRoot.getElementById("font_date");
    const fontStatus = this.shadowRoot.getElementById("font_status");
    const fontTeams = this.shadowRoot.getElementById("font_teams");
    const fontScore = this.shadowRoot.getElementById("font_score");

    if (fontDate) {
      fontDate.addEventListener("input", (e) =>
        this._updateNested("font_size", "date", Number(e.target.value))
      );
    }
    if (fontStatus) {
      fontStatus.addEventListener("input", (e) =>
        this._updateNested("font_size", "status", Number(e.target.value))
      );
    }
    if (fontTeams) {
      fontTeams.addEventListener("input", (e) =>
        this._updateNested("font_size", "teams", Number(e.target.value))
      );
    }
    if (fontScore) {
      fontScore.addEventListener("input", (e) =>
        this._updateNested("font_size", "score", Number(e.target.value))
      );
    }
  }

  // Lovelace oczekuje get value w niektórych implementacjach
  get value() {
    return this._config;
  }
}

customElements.define("matches-card-editor", MatchesCardEditor);