# Ecosystem Data Sources & Schema Documentation

## 1. Overview & Disclaimer

> [!IMPORTANT]
> **All records contained in [`data/demo_ecosystem.json`](../data/demo_ecosystem.json) are completely synthetic, illustrative, and fictional.**
> Every record explicitly contains `"illustrative": true` and all organization names carry the `"(illustrative)"` suffix. These records are designed specifically for offline demonstration, unit testing, and matchmaking algorithm validation without relying on real corporate entities or proprietary private data.

This dataset represents key ecosystem actors across ASEAN member states (Vietnam, Singapore, Indonesia, Thailand, Philippines, Malaysia) across sectors including:
- Smart waste management & circular economy
- Urban logistics & fleet electrification
- Cleantech & ESG compliance
- GovTech & municipal administration
- Cross-border accelerators & soft-landing programmes
- Industrial IoT sensors & hardware engineering
- Micro-fintech & agritech bioconversion

---

## 2. Real-World Inspiration Sources

While all individual organization names, emails, and URLs are fictional, their operational profiles, capabilities, and partnership needs are inspired by verified ASEAN regional public development frameworks:

1. **ASEAN Smart Cities Network (ASCN)**:
   - Municipal solid waste management challenges in Tier-1 cities (Ho Chi Minh City, Hanoi, Jakarta, Bangkok, Manila, Kuala Lumpur).
   - Cross-border tech transfer frameworks supporting smart sensor telematics and municipal routing optimization.
2. **Vietnam National Green Growth Strategy & Urban Waste Reforms**:
   - Modernization of municipal waste concessions in Ho Chi Minh City (e.g., transition from manual neighborhood collection to IoT-monitored bins and electric compactor fleets).
3. **Bilateral Tech Scaleup Programs (Malaysia to Vietnam)**:
   - Malaysian cleantech and IoT scaleups seeking overseas commercialization pilots in Vietnam, supported by soft-landing accelerators and cross-border innovation grants.
4. **Circular Economy & ESG Compliance Initiatives**:
   - Traceability mandates for extended producer responsibility (EPR) and industrial recycling across Southeast Asia.

---

## 3. Schema Specification: `Partner`

Each item in [`data/demo_ecosystem.json`](../data/demo_ecosystem.json) complies with the shared team contract:

| Field | Type | Description | Example |
|---|---|---|---|
| `id` | `string` | Unique identifier prefixed by country | `"partner-vn-01"` |
| `name` | `string` | Organization name with `(illustrative)` suffix | `"Saigon Green Urban Waste Board (illustrative)"` |
| `country` | `string` | ASEAN nation (`Vietnam`, `Singapore`, `Indonesia`, `Thailand`, `Philippines`, `Malaysia`) | `"Vietnam"` |
| `type` | `string` | Organization category (`"organisation"`, `"programme"`, `"startup"`) | `"organisation"` |
| `sector` | `string` | Primary sector domain | `"smart_waste"` |
| `description` | `string` | Brief operational background | `"Government-supervised municipal agency..."` |
| `capabilities` | `string[]` | Verified assets, concessions, technologies, or services provided | `["municipal_waste_concessions", "vietnam_local_distribution"]` |
| `needs` | `string[]` | Operational gaps, technologies, or partner requirements sought | `["iot_fill_level_sensors", "route_optimization_software"]` |
| `target_markets`| `string[]` | Geographic markets served or targeted | `["Vietnam"]` |
| `partnership_goals` | `string[]` | Concrete partner objectives or pilot ambitions | `["Pilot IoT smart bin sensors across District 1 and 3"]` |
| `illustrative` | `boolean` | Must be strictly `true` for all mock records | `true` |

---

## 4. `StartupProfile` Schema Specification

When evaluating network graph topology and partner matching, a target startup is modeled with the corresponding schema:

```json
{
  "company_name": "SmartTONG (illustrative)",
  "country": "Malaysia",
  "sector": "smart_waste",
  "solution": "IoT ultrasonic fill-level sensors and dynamic fleet dispatch algorithms for municipal waste containers",
  "capabilities": [
    "iot_fill_level_sensors",
    "route_optimization_software",
    "real_time_fleet_tracking",
    "data_analytics_dashboard"
  ],
  "needs": [
    "municipal_waste_concessions",
    "vietnam_local_distribution",
    "electric_waste_truck_fleet",
    "vietnam_market_entry_support",
    "regulatory_approvals"
  ],
  "target_markets": ["Vietnam", "Malaysia"],
  "partnership_goals": [
    "Deploy 500 smart bin sensors in Ho Chi Minh City municipal pilots",
    "Partner with Vietnamese municipal concession holders and fleet operators"
  ]
}
```

---

## 5. Matchmaking Calibration & Ranking Baseline

To ensure the ranking and recommendation engines produce statistically valid differentiations, the 12 records are deliberately distributed into 3 tiers:

1. **Tier 1: High Relevance (Smart Waste: Malaysia -> Vietnam)**:
   - `partner-vn-01` (*Saigon Green Urban Waste Board*): High complementary need for IoT sensors & route optimization; provides local municipal concessions.
   - `partner-vn-02` (*VinaFleet EcoLogistics*): Commercial fleet operator in Vietnam seeking automated dynamic dispatch and bin sensors.
   - `partner-vn-03` (*Mekong Green Horizons Accelerator*): Vietnam-focused cross-border expansion funding and regulatory fast-track.
2. **Tier 2: Moderate Relevance (Regional Catalysts & Complementary Hardware)**:
   - `partner-my-01` (*CradleEco Cross-Border Hub*): Malaysian home-market export grants and ASEAN expansion soft-landing.
   - `partner-sg-01` (*LionCity Urban Solutions*): Regional GovTech integrator with municipal enterprise presence.
   - `partner-th-01` (*Siam Sensortech Robotics*): Hardware sensor manufacturer looking to bundle route optimization software.
3. **Tier 3: Low Relevance / Weak Baseline (Contrast & Discriminating Power)**:
   - `partner-my-02` (*Klang Valley Recycler Alliance*): Domestic Malaysian physical scrap sorting.
   - `partner-id-01` (*Nusantara FastHaul Logistics*): E-commerce courier delivery in Jakarta.
   - `partner-id-02` (*JavaAgro BioNutrients*): Indonesian insect protein agritech.
   - `partner-ph-01` (*Barangay EcoPay Fintech*): Manila micro-recycling trash-for-cash tokens.
   - `partner-ph-02` (*Luzon CivicGov Digital Labs*): Philippine citizen reporting portal.
   - `partner-sg-02` (*Equator Climate Exchange*): Blockchain carbon credit verification platform.

---

## 6. License & Distribution

- **License**: MIT License.
- **Fair Use**: Free for open-source development, automated CI testing, and educational hackathons. Zero external network calls or API token expenditures are required to consume this dataset.
