import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Interfaces
code = code.replace(
  `interface CombatData {
  timer: number;
  phase: CombatPhase;
  roomId: RoomId;
  attrsCompared: AttrType[];
  playerSum: number;
  npcSum: number;
  winner: 'player' | 'npc' | 'draw';
  stealTotal: number;
  stolenValues: Partial<Attributes>;
  playerPreAttrs: Partial<Attributes>;
  npcPreAttrs: Partial<Attributes>;
  isExecution?: boolean;
}

interface BeastState {
  satiety: number;
  state: 'contained' | 'escaped';
  loc: RoomId;
  moveTimer: number;
}

type ItemType = 'ether_potion' | 'hourglass' | 'straw_doll';

interface ReadingData {
  bookType: 20 | 50;
  timer: number;
  corruption: number;
  spawnTimer: number;
  words: { id: number; text: string; isCorrupt: boolean; rot: number }[];
}

interface GameState {
  status: 'setup' | 'playing' | 'gameover' | 'combat' | 'reading' | 'divination';
  combatData?: CombatData;
  readingData?: ReadingData;
  completedBooks: number[];
  inventory: ItemType[];
  divinationCooldown: number;
  invisibilityTimer: number;
  instantReallocActive: boolean;
  traps: RoomId[];
  trappedTimer: number;
  divinationResult?: {
    card: 'hermit' | 'wheel' | 'hanged' | 'tower';
    timer: number;
  };

  playerLoc: RoomId;
  playerAttrs: Attributes;
  pendingPlayerAttrs: Attributes | null;
  reallocTimer: number;

  beast: BeastState;
  isFeedingBeast: boolean;

  npcLoc: RoomId;
  npcAttrs: Attributes;
  npcMoveTimer: number;
  npcNextMoveWait: number;
  npcRoomTimer: number;
  npcAdaptedInRoom: boolean;

  logs: string[];
  showWarningTimer: number;
}`,
  `interface CombatData {
  timer: number;
  phase: CombatPhase;
  roomId: RoomId;
  npcId: number;
  attrsCompared: AttrType[];
  playerSum: number;
  npcSum: number;
  winner: 'player' | 'npc' | 'draw';
  stealTotal: number;
  stolenValues: Partial<Attributes>;
  playerPreAttrs: Partial<Attributes>;
  npcPreAttrs: Partial<Attributes>;
  isExecution?: boolean;
}

interface BeastState {
  satiety: number;
  state: 'contained' | 'escaped';
  loc: RoomId;
  moveTimer: number;
}

type ItemType = 'ether_potion' | 'hourglass' | 'straw_doll';

interface ReadingData {
  bookType: 20 | 50;
  timer: number;
  corruption: number;
  spawnTimer: number;
  words: { id: number; text: string; isCorrupt: boolean; rot: number }[];
}

interface NpcState {
  id: number;
  color: string;
  name: string;
  loc: RoomId;
  attrs: Attributes;
  moveTimer: number;
  nextMoveWait: number;
  roomTimer: number;
  adaptedInRoom: boolean;
  isDead: boolean;
}

interface GameState {
  status: 'setup' | 'playing' | 'gameover' | 'combat' | 'reading' | 'divination';
  combatData?: CombatData;
  readingData?: ReadingData;
  completedBooks: number[];
  inventory: ItemType[];
  divinationCooldown: number;
  invisibilityTimer: number;
  instantReallocActive: boolean;
  traps: RoomId[];
  trappedTimer: number;
  divinationResult?: {
    card: 'hermit' | 'wheel' | 'hanged' | 'tower';
    timer: number;
  };

  playerLoc: RoomId;
  playerAttrs: Attributes;
  pendingPlayerAttrs: Attributes | null;
  reallocTimer: number;

  beast: BeastState;
  isFeedingBeast: boolean;

  npcs: NpcState[];

  logs: string[];
  showWarningTimer: number;
}`
);

// 2. getInitialGameState
code = code.replace(
  `    isFeedingBeast: false,
    npcLoc: 'Dungeon',
    npcAttrs: { stamina: 20, strength: 20, patience: 20, intelligence: 20, focus: 20 },
    npcMoveTimer: 0,
    npcNextMoveWait: 1.5 + Math.random(), // 1.5 to 2.5s
    npcRoomTimer: 0,
    npcAdaptedInRoom: false,
    logs: ['[系统] 欢迎来到《Encounter 遭遇》。请先分配你的初始属性点。'],`,
  `    isFeedingBeast: false,
    npcs: [
      { id: 0, color: 'white', name: '苍白幽影', loc: 'Watchtower', attrs: { stamina: 4, strength: 4, patience: 4, intelligence: 4, focus: 4 }, moveTimer: 0, nextMoveWait: 2.0, roomTimer: 0, adaptedInRoom: false, isDead: false },
      { id: 1, color: '#ADD8E6', name: '淡蓝巡卫', loc: 'WineCellar', attrs: { stamina: 8, strength: 8, patience: 8, intelligence: 8, focus: 8 }, moveTimer: 0, nextMoveWait: 2.2, roomTimer: 0, adaptedInRoom: false, isDead: false },
      { id: 2, color: '#a855f7', name: '紫晶判官', loc: 'AlchemyLab', attrs: { stamina: 14, strength: 14, patience: 14, intelligence: 14, focus: 14 }, moveTimer: 0, nextMoveWait: 2.5, roomTimer: 0, adaptedInRoom: false, isDead: false },
      { id: 3, color: '#ef4444', name: '深红渊主', loc: 'ThroneRoom', attrs: { stamina: 20, strength: 20, patience: 20, intelligence: 20, focus: 20 }, moveTimer: 0, nextMoveWait: 2.8, roomTimer: 0, adaptedInRoom: false, isDead: false },
    ],
    logs: ['[系统] 欢迎来到《Encounter 遭遇》。由于处于超重力区域，总属性上限受限，请先分配你的初始 20 点属性。'],`
);

code = code.replace(
  `    playerAttrs: { stamina: 20, strength: 20, patience: 20, intelligence: 20, focus: 20 },`,
  `    playerAttrs: { stamina: 4, strength: 4, patience: 4, intelligence: 4, focus: 4 },`
);


// 3. SetupScreen
code = code.replace(
  `const [draft, setDraft] = useState<Attributes>({ stamina: 20, strength: 20, patience: 20, intelligence: 20, focus: 20 });`,
  `const [draft, setDraft] = useState<Attributes>({ stamina: 4, strength: 4, patience: 4, intelligence: 4, focus: 4 });`
);

code = code.replace(
  `if (totHP <= 100 && totHP > 0) {`,
  `if (totHP <= 20 && totHP > 0) {`
);

code = code.replace(
  `          <div className="absolute left-0 top-0 h-full bg-[linear-gradient(90deg,var(--color-theme-red),#ff9999)] opacity-30 transition-all" style={{ width: \`\${(totHP / 100) * 100}%\` }}></div>
          <span className="font-semibold text-theme-text text-sm z-10 relative">总血量 (HP)</span>
          <span className={\`text-xl font-bold z-10 relative \${totHP > 100 ? 'text-theme-red' : 'text-theme-green'}\`}>{\`\${totHP.toFixed(1)} / 100.0\`}</span>`,
  `          <div className="absolute left-0 top-0 h-full bg-[linear-gradient(90deg,var(--color-theme-cyan),#99ffff)] opacity-30 transition-all" style={{ width: \`\${(totHP / 20) * 100}%\` }}></div>
          <span className="font-semibold text-theme-text text-sm z-10 relative">初诞者潜能评级</span>
          <span className={\`text-xl font-bold z-10 relative \${totHP > 20 ? 'text-theme-red' : 'text-theme-cyan'}\`}>{\`\${totHP.toFixed(1)} / 20.0\`}</span>`
);

code = code.replace(
  `disabled={totHP > 100 || totHP <= 0}`,
  `disabled={totHP > 20 || totHP <= 0}`
);

// 4. Trap activation (lines 607-613 approximately)
code = code.replace(
  `                                // Immediate trigger if NPC is already in the room
                                if (s.npcLoc === s.playerLoc) {
                                   s.traps = s.traps.filter(t => t !== s.npcLoc);
                                   addLog(s, \`🔥 刚放置的厄运稻草人立即被NPC触发，其全属性被强制削弱！\`);
                                   for (let key in s.npcAttrs) {
                                      s.npcAttrs[key as AttrType] = Math.max(0, s.npcAttrs[key as AttrType] / 2);
                                   }
                                }`,
  `                                // Immediate trigger if any NPC is already in the room
                                const npcInRoom = s.npcs.find(n => !n.isDead && n.loc === s.playerLoc);
                                if (npcInRoom) {
                                   s.traps = s.traps.filter(t => t !== s.playerLoc);
                                   addLog(s, \`🔥 刚放置的厄运稻草人立即被 \${npcInRoom.name} 触发，全属性强制削弱！\`);
                                   for (let key in npcInRoom.attrs) {
                                      npcInRoom.attrs[key as AttrType] = Math.max(0, npcInRoom.attrs[key as AttrType] / 2);
                                   }
                                }`
);

// 5. MapPanel rendering (lines 764 and 797)
code = code.replace(
  `const isNpc = s.npcLoc === r.id;`,
  `const npcsInR = s.npcs.filter(n => !n.isDead && n.loc === r.id);`
);

code = code.replace(
  `{isNpc && <div className="w-[6px] h-[6px] bg-theme-red rounded-full shadow-[0_0_8px_var(--color-theme-red)] animate-[pulse_1s_ease-in-out_infinite]" title="NPC" />}`,
  `{npcsInR.map(n => (
                             <div key={n.id} style={{ 
                               borderLeft: '4px solid transparent',
                               borderRight: '4px solid transparent',
                               borderBottom: \`8px solid \${n.color}\`,
                               filter: \`drop-shadow(0 0 5px \${n.color})\`
                             }} className="animate-pulse" title={n.name} />
                         ))}`
);

fs.writeFileSync('src/App.tsx', code, 'utf-8');
