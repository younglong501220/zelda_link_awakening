import { Bush, Enemy, Obstacle, SirenInstrument } from '../types/game';

export const WORLD_WIDTH = 2200;
export const WORLD_HEIGHT = 1600;

export const FOREST_BOUNDS = {
  minX: 60,
  maxX: 650,
  minY: 80,
  maxY: 680,
};

export const INITIAL_INSTRUMENTS: SirenInstrument[] = [
  {
    id: 0,
    name: '滿月大提琴',
    jpName: '満月のチェロ (Full Moon Cello)',
    icon: '🎻',
    x: 340,
    y: 1260,
    taken: false,
    region: '托隆波海灘 (Toronbo Shores)',
    description: '在南岸礁石與浪潮深處沉睡的弦樂器。',
    poeticNote: '「弦音迴盪，伴隨潮起潮落，輕撫著旅人初醒的夢。」',
  },
  {
    id: 1,
    name: '海螺號角',
    jpName: '巻き貝のホルン (Conch Horn)',
    icon: '🐚',
    x: 320,
    y: 420,
    taken: false,
    region: '迷失之森 (Mysterious Forest)',
    description: '在迷霧重重的林蔭深處所藏的深海螺角。',
    poeticNote: '「號音吹響，穿透層疊綠葉，指引迷途之靈破除薄霧。」',
  },
  {
    id: 2,
    name: '海百合之鈴',
    jpName: '海百合のベル (Sea Lily Bell)',
    icon: '🔔',
    x: 1840,
    y: 780,
    taken: false,
    region: '古代遺跡 (Ancient Ruins)',
    description: '佇立於東方沙岩遺跡風化石柱間的聖鈴。',
    poeticNote: '「鈴聲清脆，如夢似幻，敲響了沉眠者心湖的漣漪。」',
  },
];

export const EGG_ALTAR = {
  x: 1100,
  y: 200,
  width: 160,
  height: 140,
  name: '風之魚神聖巨蛋 (Mt. Tamaranch Egg)',
};

export const MARIN_INITIAL = {
  x: 740,
  y: 890,
  w: 26,
  h: 28,
  name: '瑪琳 (Marin)',
  role: '島上的歌姬',
  facing: 'down' as const,
};

export const TARIN_INITIAL = {
  x: 520,
  y: 840,
  w: 26,
  h: 28,
  name: '塔林 (Tarin)',
  role: '瑪琳的父親',
  facing: 'right' as const,
};

// Generate static obstacles (walls, houses, mountains, trees)
export function createWorldObstacles(): Obstacle[] {
  const obstacles: Obstacle[] = [];

  // Outer Map Boundaries (Oceans & Cliffs)
  obstacles.push({ x: 0, y: 0, w: WORLD_WIDTH, h: 50, type: 'wall' }); // Top
  obstacles.push({ x: 0, y: 0, w: 50, h: WORLD_HEIGHT, type: 'wall' }); // Left
  obstacles.push({ x: WORLD_WIDTH - 50, y: 0, w: 50, h: WORLD_HEIGHT, type: 'wall' }); // Right
  obstacles.push({ x: 0, y: WORLD_HEIGHT - 60, w: WORLD_WIDTH, h: 60, type: 'water' }); // Deep sea south

  // Mabe Village Houses (Clay cute diorama cottages)
  // Marin & Tarin's house
  obstacles.push({ x: 470, y: 760, w: 100, h: 80, type: 'house', color: '#ffedd5', roofColor: '#ea580c' });
  // Village Shop / Library
  obstacles.push({ x: 670, y: 750, w: 110, h: 80, type: 'house', color: '#fef08a', roofColor: '#dc2626' });
  // Madame MeowMeow's house (BowWow dog house)
  obstacles.push({ x: 840, y: 810, w: 90, h: 75, type: 'house', color: '#fed7aa', roofColor: '#0284c7' });
  // Village fences
  obstacles.push({ x: 440, y: 880, w: 20, h: 90, type: 'rock' });
  obstacles.push({ x: 940, y: 880, w: 20, h: 90, type: 'rock' });

  // Mysterious Forest (Northwest) - Dense clay pine trees
  for (let x = 80; x < 650; x += 70) {
    for (let y = 100; y < 650; y += 75) {
      // Clear a pathway and clearing around Conch Horn shrine (320, 420)
      const distToShrine = Math.hypot(x - 320, y - 420);
      const isPath = (x > 250 && x < 390 && y > 520);
      if (distToShrine > 85 && !isPath) {
        obstacles.push({ x, y, w: 48, h: 48, type: 'tree' });
      }
    }
  }

  // Mt. Tamaranch Mountain Ridge & Cliffs (North Central: 800 to 1400, y: 60 to 380)
  obstacles.push({ x: 850, y: 90, w: 500, h: 60, type: 'rock' });
  obstacles.push({ x: 820, y: 150, w: 70, h: 200, type: 'rock' });
  obstacles.push({ x: 1310, y: 150, w: 70, h: 200, type: 'rock' });

  // Ancient Ruins & Desert (East: 1600 to 2100, y: 400 to 1100)
  const pillarCoords = [
    { x: 1680, y: 520 }, { x: 1780, y: 520 }, { x: 1940, y: 520 },
    { x: 1680, y: 700 }, { x: 2000, y: 700 },
    { x: 1720, y: 920 }, { x: 1880, y: 920 }, { x: 1980, y: 920 },
  ];
  pillarCoords.forEach(p => {
    obstacles.push({ x: p.x, y: p.y, w: 38, h: 65, type: 'pillar', color: '#d4b996' });
  });

  // Coastal rocks & palm tree stumps on Toronbo beach
  obstacles.push({ x: 120, y: 1180, w: 60, h: 45, type: 'rock' });
  obstacles.push({ x: 520, y: 1320, w: 70, h: 40, type: 'rock' });
  obstacles.push({ x: 820, y: 1380, w: 90, h: 40, type: 'rock' });
  obstacles.push({ x: 1400, y: 1350, w: 80, h: 40, type: 'rock' });

  return obstacles;
}

// Generate cuttable bushes
export function createWorldBushes(): Bush[] {
  const bushes: Bush[] = [];
  let idCounter = 1;

  // Village bushes (around pathways and houses)
  const villageSpots = [
    { x: 600, y: 880 }, { x: 635, y: 880 }, { x: 670, y: 880 },
    { x: 790, y: 840 }, { x: 820, y: 840 },
    { x: 590, y: 980 }, { x: 625, y: 980 }, { x: 660, y: 980 },
    { x: 740, y: 980 }, { x: 775, y: 980 },
    { x: 480, y: 940 }, { x: 515, y: 940 },
  ];
  villageSpots.forEach(s => {
    bushes.push({ id: idCounter++, x: s.x, y: s.y, w: 28, h: 28, cut: false });
  });

  // Forest path bushes
  const forestSpots = [
    { x: 300, y: 560 }, { x: 335, y: 560 },
    { x: 260, y: 480 }, { x: 380, y: 480 },
    { x: 220, y: 380 }, { x: 420, y: 380 },
    { x: 320, y: 300 }, { x: 355, y: 300 },
  ];
  forestSpots.forEach(s => {
    bushes.push({ id: idCounter++, x: s.x, y: s.y, w: 28, h: 28, cut: false });
  });

  // Ruins & Trail bushes
  const trailSpots = [
    { x: 1100, y: 720 }, { x: 1140, y: 720 }, { x: 1180, y: 720 },
    { x: 1300, y: 820 }, { x: 1340, y: 820 },
    { x: 1620, y: 740 }, { x: 1655, y: 740 },
    { x: 1820, y: 640 }, { x: 1855, y: 640 },
  ];
  trailSpots.forEach(s => {
    bushes.push({ id: idCounter++, x: s.x, y: s.y, w: 28, h: 28, cut: false });
  });

  return bushes;
}

// Spawn cute enemies (bouncy Octoroks and wiggly Slimes)
export function createWorldEnemies(): Enemy[] {
  return [
    {
      id: 1,
      x: 780,
      y: 1150,
      originX: 780,
      originY: 1150,
      w: 26,
      h: 26,
      hp: 2,
      type: 'octorok',
      vx: 0,
      vy: 0,
      color: '#ef4444',
      facing: 'down',
      moveTimer: 60,
      shootTimer: 180,
      isHitTimer: 0,
    },
    {
      id: 2,
      x: 1200,
      y: 1180,
      originX: 1200,
      originY: 1180,
      w: 26,
      h: 26,
      hp: 2,
      type: 'octorok',
      vx: 0,
      vy: 0,
      color: '#ef4444',
      facing: 'left',
      moveTimer: 45,
      shootTimer: 200,
      isHitTimer: 0,
    },
    {
      id: 3,
      x: 240,
      y: 520,
      originX: 240,
      originY: 520,
      w: 24,
      h: 24,
      hp: 1,
      type: 'slime',
      vx: 0,
      vy: 0,
      color: '#22c55e',
      facing: 'right',
      moveTimer: 30,
      isHitTimer: 0,
    },
    {
      id: 4,
      x: 480,
      y: 350,
      originX: 480,
      originY: 350,
      w: 24,
      h: 24,
      hp: 1,
      type: 'slime',
      vx: 0,
      vy: 0,
      color: '#22c55e',
      facing: 'down',
      moveTimer: 50,
      isHitTimer: 0,
    },
    {
      id: 5,
      x: 1600,
      y: 650,
      originX: 1600,
      originY: 650,
      w: 24,
      h: 24,
      hp: 2,
      type: 'slime',
      vx: 0,
      vy: 0,
      color: '#eab308',
      facing: 'left',
      moveTimer: 40,
      isHitTimer: 0,
    },
  ];
}
