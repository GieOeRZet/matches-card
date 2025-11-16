// Matches Card (90minut) – version 0.3.021
// Auto-generated build: karta + edytor w jednym pliku

// ============================================================================
//  Matches Card (90minut) – v0.3.000 (RESTORED BASE) + FULL EDITOR SUPPORT
//  Author: GieOeRZet
// ============================================================================

class MatchesCard extends HTMLElement {
  setConfig(config) {
    if (!config.entity) {
      throw new Error("Entity is required (np. sensor.90minut_gornik_zabrze_matches)");
    }

    this.config = {
      name: "90minut Matches",
      show_name: true,
      show_logos: true,
      full_team_names: true,
      show_result_symbols: true,

      fill_mode: config.fill_mode || "gradient", // "gradient" / "zebra"

      font_size: {
        date:   config.font_size?.date   ?? 0.9,
        status: config.font_size?.status ?? 0.8,
        teams:  config.font_size?.teams  ?? 1.0,
        score:  config.font_size?.score  ?? 1.0,
      },

      icon_size: {
        league: config.icon_size?.league ?? 26,
        crest:  config.icon_size?.crest  ?? 24,
        result: config.icon_size?.result ?? 26,
      },

      colors: {
        win:  config.colors?.win  ?? "#3ba55d",
        draw: config.colors?.draw ?? "#468cd2",
        loss: config.colors?.loss ?? "#e23b3b",
      },

      gradient: {
        alpha_start: typeof config.gradient?.alpha_start === "number"
          ? config.gradient.alpha_start
          : 0.0,
        alpha_end: typeof config.gradient?.alpha_end === "number"
          ? config.gradient.alpha_end
          : (typeof config.gradient?.alpha === "number" ? config.gradient.alpha : 0.55),
        start: typeof config.gradient?.start === "number" ? config.gradient.start : 35,
        end:   typeof config.gradient?.end   === "number" ? config.gradient.end   : 100,
      },

      zebra_color: config.zebra_color ?? "#f0f0f0",
      zebra_alpha: typeof config.zebra_alpha === "number" ? config.zebra_alpha : 0.4,

      lite_mode: config.lite_mode ?? false,

      ...config,
    };
  }

  set hass(hass) {
    this._hass = hass;
    const entityId = this.config.entity;
    const stateObj = hass.states[entityId];

    if (!stateObj) {
      this.innerHTML = "<ha-card>Encja nie istnieje.</ha-card>";
      return;
    }

    const matches = stateObj.attributes.matches || [];

    const zebraCSS =
      this.config.fill_mode === "zebra"
        ? `tr:nth-child(even){background-color:${this._rgba(this.config.zebra_color, this.config.zebra_alpha)};}`
        : "";

    const style = `
      <style>
        ha-card {
          padding: 10px 0;
          font-family: "Sofascore Sans", Arial, sans-serif;
        }
        table { width: 100%; border-collapse: collapse; }
        td { text-align:center; vertical-align:middle; padding:4px 6px; }
        tr { border-bottom:1px solid rgba(0,0,0,0.1); }

        .dual-cell {
          display:flex;
          flex-direction:column;
          justify-content:center;
          align-items:center;
        }
        .team-cell {
          text-align:left;
          padding-left:8px;
        }
        .team-row {
          display:flex;
          align-items:center;
          justify-content:flex-start;
          line-height:1.3em;
        }
        .bold { font-weight:600; }
        .dim  { opacity:0.8; }

        .result-circle {
          border-radius:50%;
          width:${this.config.icon_size.result}px;
          height:${this.config.icon_size.result}px;
          color:white;
          display:flex;
          justify-content:center;
          align-items:center;
          font-weight:bold;
          margin:0 auto;
        }

        ${zebraCSS}
      </style>
    `;

    const rows = matches.map((m) => this._renderRow(m)).join("");

    // LITE MODE – bez ha-card, bez nagłówka
    if (this.config.lite_mode) {
      this.innerHTML = `
        ${style}
        <table>${rows}</table>
      `;
      return;
    }

    const cardName =
      this.config.show_name === false
        ? ""
        : this.config.name || stateObj.attributes.friendly_name || "90minut Matches";

    this.innerHTML = `
      ${style}
      <ha-card ${cardName ? `header="${cardName}"` : ""}>
        <table>${rows}</table>
      </ha-card>
    `;
  }

  // ----------------------
  // POJEDYNCZY WIERSZ
  // ----------------------
  _renderRow(match) {
    const rawDate = match.date ? match.date.replace(" ", "T") : null;
    const dateObj = rawDate ? new Date(rawDate) : null;

    const dateStr = dateObj
      ? dateObj.toLocaleDateString("pl-PL", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "-";

    const timeStr = match.finished
      ? "KONIEC"
      : dateObj
      ? dateObj.toLocaleTimeString("pl-PL", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

    const fullNames = this.config.full_team_names ?? true;

    const homeTeam = fullNames ? match.home : (match.home || "").split(" ")[0];
    const awayTeam = fullNames ? match.away : (match.away || "").split(" ")[0];

    const [homeScore, awayScore] = (match.score || "-").split("-");

    const leagueIcon = this._leagueIcon(match.league);

    const gradientCSS =
      this.config.fill_mode === "gradient" && match.result
        ? this._gradientCSS(match.result)
        : "";

    const homeBold =
      match.result === "win" ? "bold" : match.result === "loss" ? "dim" : "";
    const awayBold =
      match.result === "loss" ? "bold" : match.result === "win" ? "dim" : "";

    return `
      <tr style="${gradientCSS}">
        <td style="width:10%;">
          <div style="font-size:${this.config.font_size.date}rem;">${dateStr}</div>
          <div style="font-size:${this.config.font_size.status}rem;">${timeStr}</div>
        </td>

        <td style="width:10%;">
          ${
            leagueIcon
              ? `<img src="${leagueIcon}" height="${this.config.icon_size.league}" style="margin:auto;">`
              : `<div style="font-size:0.9em;opacity:0.8;">${match.league}</div>`
          }
        </td>

        ${
          this.config.show_logos
            ? `<td class="dual-cell" style="width:10%;">
                 <div>
                   <img src="${match.logo_home}" height="${this.config.icon_size.crest}"
                        style="background:white;border-radius:6px;padding:2px;" />
                 </div>
                 <div>
                   <img src="${match.logo_away}" height="${this.config.icon_size.crest}"
                        style="background:white;border-radius:6px;padding:2px;" />
                 </div>
               </td>`
            : ""
        }

        <td class="team-cell">
          <div class="team-row ${homeBold}" style="font-size:${this.config.font_size.teams}rem;">
            ${homeTeam}
          </div>
          <div class="team-row ${awayBold}" style="font-size:${this.config.font_size.teams}rem;">
            ${awayTeam}
          </div>
        </td>

        <td class="dual-cell" style="width:10%;">
          <div class="${homeBold}" style="font-size:${this.config.font_size.score}rem;">
            ${homeScore}
          </div>
          <div class="${awayBold}" style="font-size:${this.config.font_size.score}rem;">
            ${awayScore}
          </div>
        </td>

        <td class="result-cell" style="width:8%;">
          ${
            this.config.show_result_symbols && match.result
              ? `<div class="result-circle" style="background-color:${this.config.colors[match.result]}">
                   ${match.result.charAt(0).toUpperCase()}
                 </div>`
              : ""
          }
        </td>
      </tr>
    `;
  }

  // ----------------------
  // HELPERY
  // ----------------------
  _rgba(hex, alpha) {
    const h = (hex || "").replace("#", "");
    if (h.length !== 6) {
      return `rgba(0,0,0,${alpha})`;
    }
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  _gradientCSS(result) {
    const col = this.config.colors[result] || "#000000";
    const g = this.config.gradient || {};

    const start = typeof g.start === "number" ? g.start : 35;
    const end   = typeof g.end   === "number" ? g.end   : 100;

    const aStart = typeof g.alpha_start === "number" ? g.alpha_start : 0.0;
    const aEnd   = typeof g.alpha_end   === "number" ? g.alpha_end   : 0.55;

    return `background: linear-gradient(to right,
      rgba(0,0,0,0) 0%,
      ${this._rgba(col, aStart)} ${start}%,
      ${this._rgba(col, aEnd)} ${end}%,
      rgba(0,0,0,0) 100%
    );`;
  }

  _leagueIcon(code) {
    if (!code) return null;

    const file =
      code === "L"  ? "ekstraklasa.png" :
      code === "PP" ? "puchar.png" :
      null;

    if (!file) return null;

    // tylko GitHub; jak nie znajdzie – pokaż tekst ligi
    return `https://raw.githubusercontent.com/GieOeRZet/matches-card/main/logo/${file}`;
  }

  // ----------------------
  // EDYTOR
  // ----------------------
  static getConfigElement() {
    return document.createElement("matches-card-editor");
  }

  static getStubConfig() {
    return {
      entity: "",
    };
  }

  getCardSize() {
    return 6;
  }
}

customElements.define("matches-card", MatchesCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "matches-card",
  name: "Matches Card (90minut)",
  description: "Karta pokazująca mecze z sensora 90minut.pl",
});

// ========== EDYTOR ========== 

// ============================================================================
//  Matches Card Editor – stable version for Matches Card 0.3.000+
//  Author: GieOeRZet
// ============================================================================

class MatchesCardEditor extends HTMLElement {
  constructor() {
    super();
    this._config = {};
    this._debounceTimer = null;
    this._openSections = {
      general: true,
      gradient: false,
      zebra: false,
      icons: false,
      fonts: false,
    };
    this.attachShadow({ mode: "open" });
  }

  setConfig(config) {
    // Nie nadpisujemy this._openSections – ma pamiętać stan między rerenderami
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

    // Gradient – dwa alfa
    const gradAlphaStart =
      typeof gradient.alpha_start === "number" ? gradient.alpha_start : 0.0;
    const gradAlphaEnd =
      typeof gradient.alpha_end === "number"
        ? gradient.alpha_end
        : (typeof gradient.alpha === "number" ? gradient.alpha : 0.55);

    const gradStart =
      typeof gradient.start === "number" ? gradient.start : 35;
    const gradEnd = typeof gradient.end === "number" ? gradient.end : 100;

    const zebra_color = cfg.zebra_color || "#f0f0f0";
    const zebra_alpha =
      typeof cfg.zebra_alpha === "number" ? cfg.zebra_alpha : 0.4;

    const lite_mode = !!cfg.lite_mode;

    const style = `
      <style>
        :host {
          display: block;
          padding-bottom: 16px;
        }

        .section {
          border: 1px solid var(--divider-color, rgba(0,0,0,0.12));
          border-radius: 8px;
          margin: 10px 0;
          overflow: hidden;
          background: var(--card-background-color, #fff0);
        }

        .section-header {
          padding: 10px 14px;
          background: var(--secondary-background-color);
          color: var(--primary-text-color);
          font-weight: 700;
          font-size: 0.9rem;
          cursor: pointer;
          user-select: none;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .section-header-title {
          flex: 1;
        }

        .section-header-chevron {
          margin-left: 8px;
        }

        .section:not(.open) .section-header-chevron {
          transform: rotate(-90deg);
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
      <div class="section" data-section-id="general">
        <div class="section-header">
          <span class="section-header-title">Ogólne</span>
          <span class="section-header-chevron">▼</span>
        </div>
        <div class="section-content">
          <div class="row">
            <div class="col">
              <label>Tryb wypełnienia</label>
              <select id="fill_mode">
                <option value="gradient"${
                  fill_mode === "gradient" ? " selected" : ""
                }>Gradient</option>
                <option value="zebra"${
                  fill_mode === "zebra" ? " selected" : ""
                }>Zebra</option>
              </select>
            </div>
          </div>
          <div class="row">
            <div class="col">
              <div class="checkbox-row">
                <input type="checkbox" id="lite_mode"${
                  lite_mode ? " checked" : ""
                }>
                <label for="lite_mode">Tryb LITE (bez tła karty i nagłówka)</label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- GRADIENT -->
      <div class="section" data-section-id="gradient">
        <div class="section-header">
          <span class="section-header-title">Gradient (W / R / P)</span>
          <span class="section-header-chevron">▼</span>
        </div>
        <div class="section-content">
          <div class="row">
            <div class="col">
              <label>Kolor WYGRANA (W)</label>
              <input type="color" id="color_win" value="${
                colors.win || "#3ba55d"
              }">
            </div>
            <div class="col">
              <label>Kolor REMIS (R)</label>
              <input type="color" id="color_draw" value="${
                colors.draw || "#468cd2"
              }">
            </div>
            <div class="col">
              <label>Kolor PORAŻKA (P)</label>
              <input type="color" id="color_loss" value="${
                colors.loss || "#e23b3b"
              }">
            </div>
          </div>

          <div class="row">
            <div class="col">
              <label>Początek gradientu (%)</label>
              <input type="number" id="grad_start" min="0" max="100" step="1"
                     value="${gradStart}">
            </div>
            <div class="col">
              <label>Koniec gradientu (%)</label>
              <input type="number" id="grad_end" min="0" max="100" step="1"
                     value="${gradEnd}">
            </div>
          </div>

          <div class="row">
            <div class="col">
              <label>Alfa na początku (0–1)</label>
              <input type="number" id="grad_alpha_start" min="0" max="1" step="0.05"
                     value="${gradAlphaStart}">
            </div>
            <div class="col">
              <label>Alfa na końcu (0–1)</label>
              <input type="number" id="grad_alpha_end" min="0" max="1" step="0.05"
                     value="${gradAlphaEnd}">
            </div>
          </div>
        </div>
      </div>

      <!-- ZEBRA -->
      <div class="section" data-section-id="zebra">
        <div class="section-header">
          <span class="section-header-title">Zebra</span>
          <span class="section-header-chevron">▼</span>
        </div>
        <div class="section-content">
          <div class="row">
            <div class="col">
              <label>Kolor zebry</label>
              <input type="color" id="zebra_color" value="${zebra_color}">
            </div>
            <div class="col">
              <label>Przezroczystość zebry (alpha 0–1)</label>
              <input type="number" id="zebra_alpha" min="0" max="1" step="0.05"
                     value="${zebra_alpha}">
            </div>
          </div>
        </div>
      </div>

      <!-- IKONY -->
      <div class="section" data-section-id="icons">
        <div class="section-header">
          <span class="section-header-title">Ikony (herb, liga, W/R/P)</span>
          <span class="section-header-chevron">▼</span>
        </div>
        <div class="section-content">
          <div class="row">
            <div class="col">
              <label>Rozmiar logo ligi (px)</label>
              <input type="number" id="icon_league" min="8" max="128" step="1"
                     value="${
                       typeof icon_size.league === "number"
                         ? icon_size.league
                         : 26
                     }">
            </div>
            <div class="col">
              <label>Rozmiar herbu drużyny (px)</label>
              <input type="number" id="icon_crest" min="8" max="128" step="1"
                     value="${
                       typeof icon_size.crest === "number"
                         ? icon_size.crest
                         : 24
                     }">
            </div>
            <div class="col">
              <label>Rozmiar symbolu wyniku (W/R/P) (px)</label>
              <input type="number" id="icon_result" min="8" max="128" step="1"
                     value="${
                       typeof icon_size.result === "number"
                         ? icon_size.result
                         : 26
                     }">
            </div>
          </div>
        </div>
      </div>

      <!-- CZCIONKI -->
      <div class="section" data-section-id="fonts">
        <div class="section-header">
          <span class="section-header-title">Czcionki</span>
          <span class="section-header-chevron">▼</span>
        </div>
        <div class="section-content">
          <div class="row">
            <div class="col">
              <label>Rozmiar daty (rem)</label>
              <input type="number" id="font_date" min="0.5" max="3" step="0.1"
                     value="${
                       typeof font_size.date === "number"
                         ? font_size.date
                         : 0.9
                     }">
            </div>
            <div class="col">
              <label>Rozmiar statusu (drugi wiersz, np. KONIEC) (rem)</label>
              <input type="number" id="font_status" min="0.5" max="3" step="0.1"
                     value="${
                       typeof font_size.status === "number"
                         ? font_size.status
                         : 0.8
                     }">
            </div>
          </div>

          <div class="row">
            <div class="col">
              <label>Rozmiar nazw drużyn (rem)</label>
              <input type="number" id="font_teams" min="0.5" max="3" step="0.1"
                     value="${
                       typeof font_size.teams === "number"
                         ? font_size.teams
                         : 1.0
                     }">
            </div>
            <div class="col">
              <label>Rozmiar wyniku (rem)</label>
              <input type="number" id="font_score" min="0.5" max="3" step="0.1"
                     value="${
                       typeof font_size.score === "number"
                         ? font_size.score
                         : 1.0
                     }">
            </div>
          </div>
        </div>
      </div>
    `;

    this.shadowRoot.innerHTML = html;

    this._restoreOpenState();
    this._attachSectionToggles();
    this._attachInputs();

    // Auto-expand tylko otwiera odpowiednią sekcję, nie zamyka innych
    this._autoExpand(fill_mode);
  }

  // -------------------------------
  //  Stan rozwiniętych sekcji
  // -------------------------------
  _restoreOpenState() {
    const sections = this.shadowRoot.querySelectorAll(".section");
    sections.forEach((sec) => {
      const id = sec.getAttribute("data-section-id");
      if (id && this._openSections[id]) {
        sec.classList.add("open");
      } else if (id === "general") {
        // Ogólne domyślnie otwarte
        sec.classList.add("open");
        this._openSections[id] = true;
      }
    });
  }

  _setSectionOpen(id, open) {
    this._openSections[id] = open;
    const sec = this.shadowRoot.querySelector(
      `.section[data-section-id="${id}"]`
    );
    if (!sec) return;
    if (open) sec.classList.add("open");
    else sec.classList.remove("open");
  }

  // -------------------------------
  //  Obsługa rozwijania sekcji
  // -------------------------------
  _attachSectionToggles() {
    const sections = this.shadowRoot.querySelectorAll(".section");
    sections.forEach((sec) => {
      const header = sec.querySelector(".section-header");
      const id = sec.getAttribute("data-section-id");
      if (!header || !id) return;

      header.addEventListener("click", (ev) => {
        // Kliknięcie nagłówka – toggle, ale nie rozwalamy configu
        const isOpen = !sec.classList.contains("open");
        this._setSectionOpen(id, isOpen);
      });
    });
  }

  _autoExpand(fill_mode) {
    if (fill_mode === "gradient") {
      this._setSectionOpen("gradient", true);
    }
    if (fill_mode === "zebra") {
      this._setSectionOpen("zebra", true);
    }
  }

  // -------------------------------
  //  Podpinanie inputów
  // -------------------------------
  _attachInputs() {
    const root = this.shadowRoot;

    const fillSelect = root.getElementById("fill_mode");
    if (fillSelect) {
      fillSelect.addEventListener("change", (e) => {
        const value = e.target.value;
        this._updateRoot("fill_mode", value);
        this._autoExpand(value);
      });
    }

    const liteCheckbox = root.getElementById("lite_mode");
    if (liteCheckbox) {
      liteCheckbox.addEventListener("change", (e) => {
        this._updateRoot("lite_mode", e.target.checked);
      });
    }

    // Gradient colors
    const colorWin = root.getElementById("color_win");
    const colorDraw = root.getElementById("color_draw");
    const colorLoss = root.getElementById("color_loss");

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

    // Gradient numeric (start / end / alpha_start / alpha_end)
    const gradStart = root.getElementById("grad_start");
    const gradEnd = root.getElementById("grad_end");
    const gradAlphaStart = root.getElementById("grad_alpha_start");
    const gradAlphaEnd = root.getElementById("grad_alpha_end");

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
    if (gradAlphaStart) {
      gradAlphaStart.addEventListener("input", (e) =>
        this._updateNested(
          "gradient",
          "alpha_start",
          Number(e.target.value)
        )
      );
    }
    if (gradAlphaEnd) {
      gradAlphaEnd.addEventListener("input", (e) =>
        this._updateNested(
          "gradient",
          "alpha_end",
          Number(e.target.value)
        )
      );
    }

    // Zebra
    const zebraColor = root.getElementById("zebra_color");
    const zebraAlpha = root.getElementById("zebra_alpha");

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
    const iconLeague = root.getElementById("icon_league");
    const iconCrest = root.getElementById("icon_crest");
    const iconResult = root.getElementById("icon_result");

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
    const fontDate = root.getElementById("font_date");
    const fontStatus = root.getElementById("font_status");
    const fontTeams = root.getElementById("font_teams");
    const fontScore = root.getElementById("font_score");

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

  get value() {
    return this._config;
  }
}

customElements.define("matches-card-editor", MatchesCardEditor);
