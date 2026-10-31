/**
 * Mock Ecosystem Data for Frontend Development & Offline Verification.
 * Matches output format of build_graph(startup) from backend/app/graph_service.py.
 */

export const MOCK_HIGHLIGHT_IDS = [
  "partner-vn-01", // Top 1: Saigon Green Urban Waste Board (illustrative)
  "partner-vn-02", // Top 2: VinaFleet EcoLogistics (illustrative)
  "partner-vn-03", // Top 3: Mekong Green Horizons Accelerator (illustrative)
];

export const MOCK_NODES = [
  {
    id: "startup-smarttong-illustrative",
    label: "SmartTONG (illustrative)",
    company_name: "SmartTONG (illustrative)",
    type: "startup",
    country: "Malaysia",
    city: "Kuala Lumpur",
    sector: "smart_waste",
    sectors: ["smart_waste", "cleantech", "iot_sensors"],
    capabilities: [
      "iot_fill_level_sensors",
      "route_optimization_software",
      "real_time_fleet_tracking",
      "data_analytics_dashboard"
    ],
    needs: [
      "municipal_waste_concessions",
      "vietnam_local_distribution",
      "electric_waste_truck_fleet",
      "vietnam_market_entry_support",
      "regulatory_approvals"
    ],
    target_markets: ["Vietnam", "Malaysia"],
    is_startup: true
  },
  {
    id: "partner-vn-01",
    label: "Saigon Green Urban Waste Board (illustrative)",
    type: "organisation",
    country: "Vietnam",
    city: "Ho Chi Minh City",
    sector: "smart_waste",
    sectors: ["smart_waste", "cleantech", "govtech", "circular_economy"],
    capabilities: [
      "municipal_waste_concessions",
      "landfill_management",
      "regulatory_approvals",
      "vietnam_local_distribution"
    ],
    needs: [
      "iot_fill_level_sensors",
      "route_optimization_software",
      "real_time_fleet_tracking"
    ],
    target_markets: ["Vietnam"],
    is_startup: false
  },
  {
    id: "partner-vn-02",
    label: "VinaFleet EcoLogistics (illustrative)",
    type: "startup",
    country: "Vietnam",
    city: "Hanoi",
    sector: "smart_waste",
    sectors: ["smart_waste", "logistics", "cleantech", "fleet_management"],
    capabilities: [
      "electric_waste_truck_fleet",
      "vietnam_local_distribution",
      "driver_workforce",
      "field_maintenance"
    ],
    needs: [
      "iot_fill_level_sensors",
      "route_optimization_software",
      "automated_dispatch_apis"
    ],
    target_markets: ["Vietnam"],
    is_startup: false
  },
  {
    id: "partner-vn-03",
    label: "Mekong Green Horizons Accelerator (illustrative)",
    type: "programme",
    country: "Vietnam",
    city: "Ho Chi Minh City",
    sector: "cleantech",
    sectors: ["cleantech", "smart_waste", "govtech", "cross_border_expansion"],
    capabilities: [
      "vietnam_market_entry_support",
      "pilot_project_subsidies",
      "regulatory_fast_track",
      "local_government_liaison"
    ],
    needs: [
      "proven_cleantech_scaleups",
      "asean_cross_border_innovators",
      "smart_city_solutions"
    ],
    target_markets: ["Vietnam", "Malaysia", "Singapore"],
    is_startup: false
  },
  {
    id: "partner-my-01",
    label: "CradleEco Cross-Border Hub (illustrative)",
    type: "programme",
    country: "Malaysia",
    city: "Kuala Lumpur",
    sector: "cleantech",
    sectors: ["cleantech", "smart_waste", "govtech", "cross_border_expansion"],
    capabilities: [
      "export_grant_funding",
      "asean_regulatory_advisory",
      "malaysian_pilot_references"
    ],
    needs: [
      "vietnam_channel_partners",
      "asean_deployment_track_record"
    ],
    target_markets: ["Malaysia", "Vietnam", "Indonesia", "Thailand"],
    is_startup: false
  },
  {
    id: "partner-sg-01",
    label: "LionCity Urban Solutions (illustrative)",
    type: "startup",
    country: "Singapore",
    city: "Singapore",
    sector: "govtech",
    sectors: ["govtech", "smart_waste", "iot_sensors", "smart_cities"],
    capabilities: [
      "smart_city_master_systems",
      "enterprise_cloud_dashboards",
      "asean_enterprise_sales_reach"
    ],
    needs: [
      "edge_iot_sensors",
      "route_optimization_software",
      "local_waste_operators_vietnam"
    ],
    target_markets: ["Singapore", "Vietnam", "Malaysia", "Thailand"],
    is_startup: false
  },
  {
    id: "partner-th-01",
    label: "Siam Sensortech Robotics (illustrative)",
    type: "startup",
    country: "Thailand",
    city: "Bangkok",
    sector: "iot_sensors",
    sectors: ["iot_sensors", "smart_waste", "hardware_manufacturing"],
    capabilities: [
      "rugged_ultrasonic_sensor_manufacturing",
      "ip68_hardware_enclosures",
      "cellular_nb_iot_modules"
    ],
    needs: [
      "cloud_analytics_platform",
      "dynamic_routing_engine"
    ],
    target_markets: ["Thailand", "Vietnam", "Malaysia", "Indonesia"],
    is_startup: false
  },
  {
    id: "partner-my-02",
    label: "Klang Valley Recycler Alliance (illustrative)",
    type: "organisation",
    country: "Malaysia",
    city: "Petaling Jaya",
    sector: "smart_waste",
    sectors: ["circular_economy", "smart_waste", "cleantech"],
    capabilities: ["e_waste_processing", "material_recovery_facilities"],
    needs: ["ai_waste_sorting_robotics", "b2b_scrap_traceability"],
    target_markets: ["Malaysia"],
    is_startup: false
  },
  {
    id: "partner-id-01",
    label: "Nusantara FastHaul Logistics (illustrative)",
    type: "startup",
    country: "Indonesia",
    city: "Jakarta",
    sector: "logistics",
    sectors: ["logistics", "e_commerce", "supply_chain"],
    capabilities: ["nationwide_2_wheeler_fleet", "last_mile_delivery_warehousing"],
    needs: ["urban_parcel_routing", "driver_incentive_algorithms"],
    target_markets: ["Indonesia"],
    is_startup: false
  },
  {
    id: "partner-id-02",
    label: "JavaAgro BioNutrients (illustrative)",
    type: "startup",
    country: "Indonesia",
    city: "Surabaya",
    sector: "agritech",
    sectors: ["agritech", "cleantech", "circular_economy"],
    capabilities: ["black_soldier_fly_processing", "organic_composting_facilities"],
    needs: ["organic_food_waste_feedstock", "moisture_iot_sensors"],
    target_markets: ["Indonesia", "Malaysia"],
    is_startup: false
  },
  {
    id: "partner-ph-01",
    label: "Barangay EcoPay Fintech (illustrative)",
    type: "startup",
    country: "Philippines",
    city: "Manila",
    sector: "fintech",
    sectors: ["fintech", "cleantech", "circular_economy"],
    capabilities: ["mobile_wallet_payments", "neighborhood_micro_agent_network"],
    needs: ["reverse_vending_machine_hardware", "plastic_scrap_offtakers"],
    target_markets: ["Philippines"],
    is_startup: false
  },
  {
    id: "partner-ph-02",
    label: "Luzon CivicGov Digital Labs (illustrative)",
    type: "startup",
    country: "Philippines",
    city: "Quezon City",
    sector: "govtech",
    sectors: ["govtech", "civic_tech"],
    capabilities: ["citizen_incident_reporting_apps", "lgu_permit_processing"],
    needs: ["gis_mapping_integrations", "cloud_hosting_credits"],
    target_markets: ["Philippines"],
    is_startup: false
  },
  {
    id: "partner-sg-02",
    label: "Equator Climate Exchange (illustrative)",
    type: "startup",
    country: "Singapore",
    city: "Singapore",
    sector: "fintech",
    sectors: ["fintech", "cleantech", "carbon_markets"],
    capabilities: ["carbon_credit_tokenization", "esg_audit_verifications"],
    needs: ["verified_methane_avoidance_data", "landfill_telemetry_streams"],
    target_markets: ["Singapore", "Global"],
    is_startup: false
  }
];

export const MOCK_EDGES = [
  // High-value complementary matches with startup
  {
    source: "startup-smarttong-illustrative",
    target: "partner-vn-01",
    relation: "complements",
    weight: 0.95,
    details: ["iot_fill_level_sensors", "route_optimization_software", "municipal_waste_concessions"]
  },
  {
    source: "startup-smarttong-illustrative",
    target: "partner-vn-01",
    relation: "same market",
    weight: 0.8,
    details: ["vietnam"]
  },
  {
    source: "startup-smarttong-illustrative",
    target: "partner-vn-02",
    relation: "complements",
    weight: 0.9,
    details: ["electric_waste_truck_fleet", "route_optimization_software", "iot_fill_level_sensors"]
  },
  {
    source: "startup-smarttong-illustrative",
    target: "partner-vn-03",
    relation: "complements",
    weight: 0.85,
    details: ["vietnam_market_entry_support", "smart_city_solutions"]
  },
  {
    source: "startup-smarttong-illustrative",
    target: "partner-my-01",
    relation: "same market",
    weight: 0.7,
    details: ["malaysia", "vietnam"]
  },
  {
    source: "startup-smarttong-illustrative",
    target: "partner-sg-01",
    relation: "complements",
    weight: 0.75,
    details: ["route_optimization_software", "edge_iot_sensors"]
  },
  {
    source: "startup-smarttong-illustrative",
    target: "partner-th-01",
    relation: "complements",
    weight: 0.7,
    details: ["cloud_analytics_platform", "rugged_ultrasonic_sensor_manufacturing"]
  },
  // Partner to partner links
  {
    source: "partner-vn-01",
    target: "partner-vn-02",
    relation: "complements",
    weight: 0.85,
    details: ["electric_waste_truck_fleet", "municipal_waste_concessions"]
  },
  {
    source: "partner-vn-01",
    target: "partner-vn-03",
    relation: "same sector",
    weight: 0.6,
    details: ["cleantech", "govtech"]
  },
  {
    source: "partner-my-01",
    target: "partner-vn-03",
    relation: "same sector",
    weight: 0.75,
    details: ["cleantech", "cross_border_expansion"]
  },
  {
    source: "partner-sg-01",
    target: "partner-th-01",
    relation: "same sector",
    weight: 0.6,
    details: ["iot_sensors", "smart_cities"]
  },
  {
    source: "partner-vn-01",
    target: "partner-my-02",
    relation: "same sector",
    weight: 0.5,
    details: ["circular_economy", "smart_waste"]
  },
  {
    source: "partner-id-01",
    target: "partner-vn-02",
    relation: "same sector",
    weight: 0.5,
    details: ["logistics"]
  },
  {
    source: "partner-ph-01",
    target: "partner-sg-02",
    relation: "same sector",
    weight: 0.55,
    details: ["fintech", "cleantech"]
  }
];
