// ============================================================================
//  Matches Card (90minut) – v0.3.051
//  Author: GieOeRZet
//
//  Bazuje na 0.3.022 + poprawki:
//   1) Herby – równomierne rozłożenie w pionie (dual-cell, space-between)
//   2) Większy odstęp między logo ligi a herbami
//   3) Wynik w dwóch wierszach (jak nazwy drużyn), wyrównany wizualnie
//   4) Kolumna wyników W/P/R spójna z layoutem (flex, centrowanie)
//   5) Tryb lite_mode – całkowite usunięcie ha-card, zostaje tylko tabela
// ============================================================================

(function () {
  const DEFAULT_CONFIG = {
    name: "90minut Matches",
    show_name: true,
    show_logos: true,
    full_team_names: true,
    show_result_symbols: true,
    lite_mode: false,

    fill_mode: "gradient", // "gradient" | "zebra"

    font_size: {
      date: 0.9,
      status: 0.8,
      teams: 1.0,
      score: 1.0,
    },

    icon_size: {
      league: 26,
      crest: 24,
      result: 26,
    },

    colors: {
      win: "#3ba55d",
      draw: "#468cd2",
      loss: "#e23b3b",
    },

    gradient: {
      start: 35,
      end: 100,
      alpha_start: 0.0,
      alpha_end: 0.55,
    },

    zebra_color: "#f0f0f0",
    zebra_alpha: 0.4,
  };

  const deepMerge = (target, source) => {
    if (!source) return target;
    Object.keys(source).forEach((key) => {
      const sv = source[key];
      if (sv && typeof sv === "object" && !Array.isArray(sv)) {
        if (!target[key] || typeof target[key] !== "object") {
          target[key] = {};
        }
        deepMerge(target[key], sv);
      } else {
        target[key] = sv;
      }
    });
    return target;
  };

  class MatchesCard extends HTMLElement {
    setConfig(config) {
      if (!config.entity) {
        throw new Error(
          "Entity is required (np. sensor.90minut_gornik_zabrze_matches)"
        );
      }

      // głęboka kopia domyślnej konfiguracji + merge z YAML
      this.config = deepMerge(
        JSON.parse(JSON.stringify(DEFAULT_CONFIG)),
        config || {}
      );
    }

    set hass(hass) {
      this._hass = hass;
      this._render();
    }

    _render() {
      if (!this._hass || !this.config) return;

      const state = this._hass.states[this.config.entity];
      if (!state) {
        this.innerHTML = "<ha-card>Encja nie istnieje.</ha-card>";
        return;
      }

      const matches = state.attributes.matches || [];

      const zebraCSS =
        this.config.fill_mode === "zebra"
          ? `tr:nth-child(even){background-color:${this._rgba(
              this.config.zebra_color,
              this.config.zebra_alpha
            )};}`
          : "";

      const style = `
        <style>
          ha-card {
            padding: 10px 0;
            font-family: "Sofascore Sans", Arial, sans-serif;
          }
          table { width: 100%; border-collapse: collapse; }
          td { text-align:center; vertical-align:middle; padding:2px 3px; }
          tr { border-bottom:1px solid rgba(0,0,0,0.1); }

          .dual-cell {
            display:flex;
            flex-direction:column;
            justify-content:space-between;   /* ZMIANA 1: równe odstępy góra/dół */
            align-items:center;
            height:100%;
            padding:2px 0;
          }

          .crest-cell {
            padding-left: 6px;              /* ZMIANA 2: większy odstęp od logo ligi */
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

          .score-cell {
            display:flex;                    /* ZMIANA 3: wynik jak nazwy drużyn */
            flex-direction:column;
            justify-content:space-between;
            align-items:center;
            height:100%;
            padding:2px 0;
          }
          .score-row {
            line-height:1.3em;
          }

          .result-cell {
            display:flex;                    /* ZMIANA 4: spójny layout kolumny W/P/R */
            align-items:center;
            justify-content:center;
            height:100%;
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

      const rows = matches.map((m) => this._row(m)).join("");

      // ZMIANA 5 – tryb lite: całkowicie bez ha-card
      if (this.config.lite_mode) {
        while (this.firstChild) this.removeChild(this.firstChild);
        const wrapper = document.createElement("div");
        wrapper.innerHTML = `${style}<table>${rows}</table>`;
        this.appendChild(wrapper);
        return;
      }

      const header = this.config.show_name ? `header="${this.config.name}"` : "";

      this.innerHTML = `
        ${style}
        <ha-card ${header}>
          <table>${rows}</table>
        </ha-card>
      `;
    }

    _row(m) {
      const rawDate = m.date ? m.date.replace(" ", "T") : null;
      const d = rawDate ? new Date(rawDate) : null;

      const dateStr = d
        ? d.toLocaleDateString("pl-PL", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
        : "-";

      const timeStr = m.finished
        ? "KONIEC"
        : d
        ? d.toLocaleTimeString("pl-PL", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "";

      const full = this.config.full_team_names;
      const home = full ? m.home : m.home?.split(" ")[0];
      const away = full ? m.away : m.away?.split(" ")[0];

      const [hs, as] = (m.score || "-").split("-");

      const league = this._leagueIcon(m.league);
      const grad = this._gradCSS(m.result);

      const hb =
        m.result === "win" ? "bold" : m.result === "loss" ? "dim" : "";
      const ab =
        m.result === "loss" ? "bold" : m.result === "win" ? "dim" : "";

      return `
        <tr style="${grad}">
          <!-- DATA / STATUS -->
          <td style="width:10%;">
            <div style="font-size:${this.config.font_size.date}rem;">${dateStr}</div>
            <div style="font-size:${this.config.font_size.status}rem;">${timeStr}</div>
          </td>

          <!-- LIGA -->
          <td style="width:10%;">
            ${
              league
                ? `<img src="${league}" height="${this.config.icon_size.league}">`
                : `<div style="font-size:0.9em;opacity:0.8;">${m.league}</div>`
            }
          </td>

          <!-- HERBY -->
          ${
            this.config.show_logos
              ? `
          <td class="dual-cell crest-cell" style="width:10%;">
            <img
              src="${m.logo_home}"
              height="${this.config.icon_size.crest}"
              style="background:white;border-radius:6px;padding:2px;"
            >
            <img
              src="${m.logo_away}"
              height="${this.config.icon_size.crest}"
              style="background:white;border-radius:6px;padding:2px;"
            >
          </td>`
              : ""
          }

          <!-- NAZWY DRUŻYN -->
          <td class="team-cell">
            <div class="team-row ${hb}" style="font-size:${this.config.font_size.teams}rem;">
              ${home}
            </div>
            <div class="team-row ${ab}" style="font-size:${this.config.font_size.teams}rem;">
              ${away}
            </div>
          </td>

          <!-- WYNIK: jak nazwy (ZMIANA 3) -->
          <td class="score-cell" style="width:10%;">
            <div class="score-row ${hb}" style="font-size:${this.config.font_size.score}rem;">
              ${hs}
            </div>
            <div class="score-row ${ab}" style="font-size:${this.config.font_size.score}rem;">
              ${as}
            </div>
          </td>

          <!-- KÓŁKO W/P/R -->
          <td class="result-cell" style="width:8%;">
            ${
              this.config.show_result_symbols && m.result
                ? `<div class="result-circle" style="background-color:${this.config.colors[m.result]}">
                     ${m.result.charAt(0).toUpperCase()}
                   </div>`
                : ""
            }
          </td>
        </tr>
      `;
    }

    _rgba(hex, a) {
      const h = (hex || "").replace("#", "");
      if (h.length !== 6) return `rgba(0,0,0,${a})`;
      const r = parseInt(h.substring(0, 2), 16);
      const g = parseInt(h.substring(2, 4), 16);
      const b = parseInt(h.substring(4, 6), 16);
      return `rgba(${r},${g},${b},${a})`;
    }

    _gradCSS(result) {
      if (!result || this.config.fill_mode !== "gradient") return "";
      const col = this.config.colors[result];
      const g = this.config.gradient || {};
      const start = typeof g.start === "number" ? g.start : 35;
      const end = typeof g.end === "number" ? g.end : 100;
      const aStart =
        typeof g.alpha_start === "number" ? g.alpha_start : 0.0;
      const aEnd = typeof g.alpha_end === "number" ? g.alpha_end : 0.55;

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
        code === "L"
          ? "ekstraklasa.png"
          : code === "PP"
          ? "puchar.png"
          : null;
      if (!file) return null;

      // tylko GitHub – jeśli obrazka brak, pokaż tekst ligi
      return `https://raw.githubusercontent.com/GieOeRZet/matches-card/main/logo/${file}`;
    }

    static getConfigElement() {
      return document.createElement("matches-card-editor");
    }

    static getStubConfig() {
      return {
        entity: "sensor.90minut_gornik_zabrze_matches",
      };
    }

    getCardSize() {
      return 6;
    }
  }

  if (!customElements.get("matches-card")) {
    customElements.define("matches-card", MatchesCard);
  }

  window.customCards = window.customCards || [];
  if (!window.customCards.find((c) => c.type === "matches-card")) {
    window.customCards.push({
      type: "matches-card",
      name: "Matches Card (90minut)",
      description: "Karta pokazująca mecze z sensora 90minut.pl (v0.3.051)",
    });
  }
})();