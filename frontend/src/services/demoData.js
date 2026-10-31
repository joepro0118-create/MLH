/**
 * ILLUSTRATIVE DEMO DATA FOR PACT (Partnership Action & Collaboration Toolkit)
 * NOTE: All partner records, organisations, and outcomes in this file are 100%
 * illustrative and synthetic for the MLH Hacktoberfest Hack Day KL demonstration.
 */

export const DEMO_STARTUP_PROFILE = {
  company_name: 'SmartTONG (by EcoGenius MY)',
  country: 'Malaysia',
  sector: 'Cleantech / Smart Cities & Circular Economy',
  solution:
    'AI-powered edge computer-vision smart waste sorting bins and municipal collection route optimization platform designed for high-density Southeast Asian urban districts.',
  capabilities: [
    'Edge AI Waste Classification (94% accuracy)',
    'IoT Fill-Level & Contamination Telemetry',
    'Municipal Fleet Route Optimization Dashboard',
    'Bilingual Citizen Recycling Rewards App',
  ],
  needs: [
    'Municipal District Sandbox & Public Bin Permits',
    'Local Waste Collection Fleet Integration',
    'Vietnam Regulatory & Environmental Compliance Support',
    'Hardware Maintenance & Field Servicing Partner',
  ],
  target_markets: ['Vietnam', 'Thailand', 'Indonesia'],
  partnership_goals: [
    '30-Day Municipal Smart Waste Pilot in Vietnam',
    'Joint Grant Application for ASEAN Green Urban Innovation',
    'Local MRF (Material Recovery Facility) Data Integration',
  ],
};

export const DEMO_MATCHES = [
  {
    partner_id: 'vn-urban-green-lab',
    partner_name: 'Mekong Urban Circular Lab (Illustrative)',
    country: 'Vietnam',
    score: 94,
    reasons: [
      'Industry Compatibility (30%): Direct focus on Cleantech, Urban Waste Modernization, and Smart City infrastructure in Vietnam.',
      'Complementary Needs/Capabilities (30%): Provides municipal sandbox access and local collection fleet integration while seeking AI waste-sorting hardware.',
      'Target Market Alignment (20%): Operates active smart-district testbeds in Da Nang and Ho Chi Minh City.',
      'Partnership Objective Fit (20%): Actively co-funding 30-day municipal POCs with ASEAN climate-tech startups.',
    ],
    opportunity:
      'Deploy 15 SmartTONG AI-sorting units across a high-footfall municipal ward in Da Nang, integrating fill-level telemetry directly with local collection trucks.',
  },
  {
    partner_id: 'vn-ecocycle-logistics',
    partner_name: 'VietCycle EnviroLogistics Co. (Illustrative)',
    country: 'Vietnam',
    score: 86,
    reasons: [
      'Industry Compatibility (30%): Circular economy waste collection and Material Recovery Facility (MRF) operator.',
      'Complementary Needs/Capabilities (30%): Offers local hardware servicing and fleet operators; needs source-segregation technology to reduce contamination.',
      'Target Market Alignment (20%): Covers commercial and residential transit hubs in Southern Vietnam.',
      'Partnership Objective Fit (20%): Seeking automated sorting pilots to boost recyclable purity by 25%.',
    ],
    opportunity:
      'Co-pilot SmartTONG bins at 5 commercial transit hubs to supply pre-sorted PET and aluminum streams into VietCycle recovery facilities.',
  },
  {
    partner_id: 'asean-green-corridor',
    partner_name: 'ASEAN Smart Municipalities Sandbox (Illustrative)',
    country: 'Vietnam',
    score: 79,
    reasons: [
      'Industry Compatibility (30%): Cross-border public-private urban sustainability programme.',
      'Complementary Needs/Capabilities (30%): Fast-tracks regulatory permits and municipal stakeholder introductions for foreign cleantech.',
      'Target Market Alignment (20%): Bilateral Malaysia–Vietnam green innovation corridor.',
      'Partnership Objective Fit (20%): Structured 4-week outcome conversion framework for cross-border pilots.',
    ],
    opportunity:
      'Enter the bilateral regulatory fast-track to validate SmartTONG telemetry compliance with Vietnamese environmental standards.',
  },
];

export const DEMO_BRIEFS = {
  'vn-urban-green-lab': {
    objective:
      'Execute a 30-day municipal smart-waste pilot in Da Nang (Vietnam) between SmartTONG (Malaysia) and Mekong Urban Circular Lab (Illustrative) to validate AI source-segregation accuracy and reduce overflow collection trips by 30%.',
    collaboration_concept:
      'SmartTONG supplies 15 solar-powered edge-AI sorting bins and real-time telemetry APIs; Mekong Urban Circular Lab secures municipal ward permits, coordinates local sanitation crews, and provides baseline waste-audit data for comparative evaluation.',
    proposed_poc:
      'Install 15 SmartTONG units across 3 high-density public zones (1 waterfront promenade, 1 university transit hub, 1 night market corridor). Connect real-time fill-level and contamination alerts to the district sanitation dispatch dashboard for 4 weeks.',
    timeline: [
      'Week 1 — Alignment & Site Prep: Finalize MOU, map 3 Da Nang pilot zones, calibrate Gemma/Edge vision model on local Vietnamese packaging SKU samples, and brief municipal collection crews.',
      'Week 2 — Hardware Deployment & API Link: Install 15 SmartTONG units on-site, connect IoT cellular telemetry to the municipal dispatch dashboard, and run baseline contamination audits.',
      'Week 3 — Live Operations & Route Optimization: Activate AI sorting guidance and dynamic collection routing; conduct mid-pilot field tuning and citizen engagement tracking.',
      'Week 4 — Impact Evaluation & Scale Roadmap: Audit recyclable purity lift, collection fuel savings, and uptime; present Joint Outcome Report for Phase 2 city-wide expansion (150+ units).',
    ],
    success_metrics: [
      '>88% automated waste classification accuracy on local Vietnamese beverage & food packaging',
      '35% reduction in recyclable stream contamination compared to baseline municipal bins',
      '25% fewer unnecessary collection truck dispatches via IoT fill-level routing',
      'Signed Letter of Intent (LOI) for a 12-month, 150-bin Phase 2 municipal rollout',
    ],
  },
};

export const DEMO_GRAPH = {
  nodes: [
    { id: 'smarttong-my', label: 'SmartTONG (MY Startup)', type: 'startup', country: 'Malaysia' },
    { id: 'vn-urban-green-lab', label: 'Mekong Urban Circular Lab', type: 'programme', country: 'Vietnam' },
    { id: 'vn-ecocycle-logistics', label: 'VietCycle EnviroLogistics', type: 'organisation', country: 'Vietnam' },
    { id: 'asean-green-corridor', label: 'ASEAN Smart Municipalities', type: 'programme', country: 'Vietnam' },
    { id: 'th-bangkok-cleantech', label: 'Chao Phraya EcoHub', type: 'organisation', country: 'Thailand' },
    { id: 'id-nusantara-waste', label: 'Nusantara Circular Grid', type: 'startup', country: 'Indonesia' },
    { id: 'sg-asean-catalyst', label: 'ASEAN Green Catalyst Fund', type: 'programme', country: 'Singapore' },
  ],
  edges: [
    { source: 'smarttong-my', target: 'vn-urban-green-lab', relation: 'Top Match (94%)', weight: 0.94 },
    { source: 'smarttong-my', target: 'vn-ecocycle-logistics', relation: 'Strong Match (86%)', weight: 0.86 },
    { source: 'smarttong-my', target: 'asean-green-corridor', relation: 'Sandbox Match (79%)', weight: 0.79 },
    { source: 'smarttong-my', target: 'th-bangkok-cleantech', relation: 'Regional Fit (72%)', weight: 0.72 },
    { source: 'smarttong-my', target: 'id-nusantara-waste', relation: 'Tech Synergy (68%)', weight: 0.68 },
    { source: 'vn-urban-green-lab', target: 'asean-green-corridor', relation: 'Policy Partner', weight: 0.8 },
    { source: 'vn-urban-green-lab', target: 'vn-ecocycle-logistics', relation: 'Fleet Operator', weight: 0.75 },
    { source: 'sg-asean-catalyst', target: 'asean-green-corridor', relation: 'Grant Co-Funder', weight: 0.85 },
  ],
};

/**
 * Generates a realistic, high-contrast PNG pitch slide for SmartTONG (EcoGenius Malaysia)
 * so the "Use demo pitch" button produces a real image File that works with multipart upload
 * and Gemma 4 vision extraction.
 */
export async function generateDemoPitchFile() {
  const canvas = document.createElement('canvas');
  canvas.width = 1280;
  canvas.height = 720;
  const ctx = canvas.getContext('2d');

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, 1280, 720);
  grad.addColorStop(0, '#06131f');
  grad.addColorStop(0.6, '#0b2239');
  grad.addColorStop(1, '#072d28');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1280, 720);

  // Subtle decorative grid circle
  ctx.strokeStyle = 'rgba(16, 185, 129, 0.15)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(1120, 140, 220, 0, Math.PI * 2);
  ctx.stroke();

  // Top Pill Badge
  ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
  ctx.beginPath();
  ctx.roundRect(60, 45, 470, 38, 19);
  ctx.fill();
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#34d399';
  ctx.font = 'bold 16px Inter, sans-serif';
  ctx.fillText('ASEAN CROSS-BORDER PITCH DECK • ILLUSTRATIVE DEMO', 82, 70);

  // Main Title & Subtitle
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 46px Inter, sans-serif';
  ctx.fillText('SmartTONG by EcoGenius', 60, 140);

  ctx.fillStyle = '#38bdf8';
  ctx.font = '600 22px Inter, sans-serif';
  ctx.fillText('Origin: Malaysia  |  Sector: Cleantech / Smart Cities & AI Waste Management', 60, 180);

  // Solution Box
  ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
  ctx.beginPath();
  ctx.roundRect(60, 210, 1160, 115, 14);
  ctx.fill();
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
  ctx.stroke();

  ctx.fillStyle = '#34d399';
  ctx.font = 'bold 18px Inter, sans-serif';
  ctx.fillText('SOLUTION OVERVIEW', 85, 242);

  ctx.fillStyle = '#e2e8f0';
  ctx.font = '20px Inter, sans-serif';
  ctx.fillText(
    'AI-powered edge computer-vision smart waste sorting bins and municipal collection route',
    85,
    275
  );
  ctx.fillText(
    'optimization platform reducing recyclable contamination by 35% in dense ASEAN cities.',
    85,
    303
  );

  // Four structured cards for Gemma Vision extraction
  const cards = [
    {
      x: 60,
      y: 350,
      w: 560,
      h: 150,
      title: 'CORE CAPABILITIES',
      color: '#10b981',
      items: [
        '• Edge AI Waste Classification (94% accuracy)',
        '• IoT Fill-Level & Contamination Telemetry',
        '• Municipal Fleet Route Optimization Dashboard',
      ],
    },
    {
      x: 660,
      y: 350,
      w: 560,
      h: 150,
      title: 'PARTNERSHIP NEEDS',
      color: '#f59e0b',
      items: [
        '• Municipal District Sandbox & Public Bin Permits',
        '• Local Waste Collection Fleet Integration',
        '• Vietnam Regulatory & Field Servicing Partner',
      ],
    },
    {
      x: 60,
      y: 525,
      w: 560,
      h: 140,
      title: 'TARGET ASEAN MARKETS',
      color: '#38bdf8',
      items: [
        '• Primary Expansion: Vietnam (Da Nang / HCMC)',
        '• Secondary Markets: Thailand, Indonesia',
      ],
    },
    {
      x: 660,
      y: 525,
      w: 560,
      h: 140,
      title: 'PARTNERSHIP GOALS (30-DAY POC)',
      color: '#a78bfa',
      items: [
        '• Launch 30-Day Municipal Smart Waste Pilot in Vietnam',
        '• Joint ASEAN Green Urban Innovation Grant',
        '• Local Material Recovery Facility (MRF) Integration',
      ],
    },
  ];

  cards.forEach((c) => {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.82)';
    ctx.beginPath();
    ctx.roundRect(c.x, c.y, c.w, c.h, 14);
    ctx.fill();
    ctx.strokeStyle = c.color;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = c.color;
    ctx.font = 'bold 17px Inter, sans-serif';
    ctx.fillText(c.title, c.x + 24, c.y + 32);

    ctx.fillStyle = '#f1f5f9';
    ctx.font = '18px Inter, sans-serif';
    c.items.forEach((line, idx) => {
      ctx.fillText(line, c.x + 24, c.y + 66 + idx * 28);
    });
  });

  const dataUrl = canvas.toDataURL('image/png');
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  const file = new File([blob], 'smarttong_vietnam_pilot_pitch.png', { type: 'image/png' });

  return { file, dataUrl };
}
