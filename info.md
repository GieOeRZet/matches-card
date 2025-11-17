[README.md](https://github.com/user-attachments/files/23591611/README.md)

# 🇵🇱 Matches Card & League Table Card (90minut)

Kompletny zestaw frontendowych kart Home Assistant dla integracji **90minut.pl**:
- **Matches Card** – mecze, herby, premium gradient
- **League Table Card** – tabela z kolorami stref
- **Premium Gradient**, **Premium DOUBLE**, **Aura Glow**
- **Edytory YAML Sync** (UI <-> YAML)

## Funkcje
### Matches Card
- Gradient / Zebra / Clear
- Premium gradient (pastel + nasycony)
- Premium DOUBLE
- Glow aura
- Białe boxy pod herbami
- Pełne nazwy drużyn
- Ikony lig
- Ikony wyników (W/D/P)
- Pionowy pasek koloru wyniku

### League Table Card
- Premium gradient & DOUBLE
- Trend (▲▼•)
- Legenda automatyczna
- Pogrubienie mojej drużyny
- Tryb LITE

---

# 🇬🇧 Matches Card & League Table Card (90minut)

Complete set of Home Assistant frontend cards for **90minut.pl**:
- **Matches Card** – fixtures, logos, premium visuals  
- **League Table Card** – standings with colored zones  
- **Premium Gradient**, **Premium DOUBLE**, **Aura Glow**  
- **Full YAML Sync editors**

---

# 📝 YAML Schema (Matches Card)

```yaml
type: custom:matches-card
entity: sensor.90minut_gornik_zabrze_matches
name: "90minut Matches"
show_name: true
show_logos: true
full_team_names: true
show_result_symbols: true
lite_mode: false

fill_mode: premium     # gradient | premium | zebra | clear

font_size:
  date: 0.9
  status: 0.8
  teams: 1.0
  score: 1.0

icon_size:
  league: 26
  crest: 24
  result: 26

colors:
  win: "#3ba55d"
  draw: "#468cd2"
  loss: "#e23b3b"

premium:
  start_alpha: 0.85
  mid_alpha: 0.35
  end_alpha: 0.0
  pastel_pos: 15
```

---

# 📝 YAML Schema (League Table Card)

```yaml
type: custom:league-table-card
entity: sensor.90minut_gornik_zabrze_table
name: "Tabela ligowa"

fill_mode: premium    # gradient | premium | zebra | clear

colors:
  top: "#3ba55d"
  conf: "#468cd2"
  bottom: "#e23b3b"

highlight:
  top_count: 2
  conf_count: 2
  bottom_count: 3

premium:
  start_alpha: 0.85
  mid_alpha: 0.35
  end_alpha: 0.0
  pastel_pos: 15
```

---

# 📦 Installation
- Add via HACS as custom frontend repository
- Refresh dashboard with **CTRL+F5**
