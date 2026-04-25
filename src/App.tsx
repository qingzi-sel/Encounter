/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Activity, Shield, Swords, User, Map as MapIcon, Footprints, RotateCw, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence, useDragControls } from 'motion/react';

// --- Global Audio Helper ---
const playSound = (type: 'start' | 'reveal' | 'tower' | 'read_start' | 'read_click' | 'read_clear' | 'read_corrupt' | 'warning' | 'move' | 'hit') => {
  try {
    const actx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (actx.state === 'suspended') actx.resume();
    const osc = actx.createOscillator();
    const gain = actx.createGain();

    if (type === 'start') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, actx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, actx.currentTime + 1.5);
      gain.gain.setValueAtTime(0, actx.currentTime);
      gain.gain.linearRampToValueAtTime(0.3, actx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, actx.currentTime + 1.5);
      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start();
      osc.stop(actx.currentTime + 1.5);
    } else if (type === 'reveal') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, actx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, actx.currentTime + 0.5);
      gain.gain.setValueAtTime(0, actx.currentTime);
      gain.gain.linearRampToValueAtTime(0.5, actx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, actx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start();
      osc.stop(actx.currentTime + 0.5);
    } else if (type === 'tower') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, actx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, actx.currentTime + 2);
      gain.gain.setValueAtTime(0, actx.currentTime);
      gain.gain.linearRampToValueAtTime(0.8, actx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, actx.currentTime + 2);
      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start();
      osc.stop(actx.currentTime + 2);
    } else if (type === 'read_start') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, actx.currentTime);
      osc.frequency.linearRampToValueAtTime(600, actx.currentTime + 1);
      gain.gain.setValueAtTime(0, actx.currentTime);
      gain.gain.linearRampToValueAtTime(0.1, actx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, actx.currentTime + 1);
      osc.connect(gain); gain.connect(actx.destination);
      osc.start(); osc.stop(actx.currentTime + 1);
    } else if (type === 'read_click') {
      // Magic collision: High chime + impact
      const osc2 = actx.createOscillator();
      const gain2 = actx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1600, actx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(2400, actx.currentTime + 0.15);
      gain.gain.setValueAtTime(0, actx.currentTime);
      gain.gain.linearRampToValueAtTime(0.4, actx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.01, actx.currentTime + 0.2);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(400, actx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(100, actx.currentTime + 0.1);
      gain2.gain.setValueAtTime(0, actx.currentTime);
      gain2.gain.linearRampToValueAtTime(0.3, actx.currentTime + 0.01);
      gain2.gain.exponentialRampToValueAtTime(0.01, actx.currentTime + 0.15);

      osc.connect(gain); gain.connect(actx.destination);
      osc2.connect(gain2); gain2.connect(actx.destination);

      osc.start(); osc.stop(actx.currentTime + 0.2);
      osc2.start(); osc2.stop(actx.currentTime + 0.15);
    } else if (type === 'read_clear') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, actx.currentTime);
      osc.frequency.setValueAtTime(800, actx.currentTime + 0.1);
      osc.frequency.setValueAtTime(1000, actx.currentTime + 0.2);
      gain.gain.setValueAtTime(0, actx.currentTime);
      gain.gain.linearRampToValueAtTime(0.3, actx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, actx.currentTime + 0.5);
      osc.connect(gain); gain.connect(actx.destination);
      osc.start(); osc.stop(actx.currentTime + 0.5);
    } else if (type === 'read_corrupt') {
      // Deep heavy failure: Detuned low frequencies with filter sweep
      const osc2 = actx.createOscillator();
      const lpf = actx.createBiquadFilter();

      lpf.type = 'lowpass';
      lpf.frequency.setValueAtTime(800, actx.currentTime);
      lpf.frequency.exponentialRampToValueAtTime(100, actx.currentTime + 1.5);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(80, actx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(20, actx.currentTime + 1.5);

      osc2.type = 'square';
      osc2.frequency.setValueAtTime(76, actx.currentTime); // heavily detuned
      osc2.frequency.exponentialRampToValueAtTime(18, actx.currentTime + 1.5);

      gain.gain.setValueAtTime(0, actx.currentTime);
      gain.gain.linearRampToValueAtTime(0.6, actx.currentTime + 0.05); // sharp attack
      gain.gain.exponentialRampToValueAtTime(0.01, actx.currentTime + 1.5); // long fade

      osc.connect(lpf);
      osc2.connect(lpf);
      lpf.connect(gain);
      gain.connect(actx.destination);

      osc.start(); osc.stop(actx.currentTime + 1.5);
      osc2.start(); osc2.stop(actx.currentTime + 1.5);
    } else if (type === 'warning') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(60, actx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(20, actx.currentTime + 4);
      gain.gain.setValueAtTime(0, actx.currentTime);
      gain.gain.linearRampToValueAtTime(0.8, actx.currentTime + 0.5);
      gain.gain.exponentialRampToValueAtTime(0.01, actx.currentTime + 4);
      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start();
      osc.stop(actx.currentTime + 4);
    } else if (type === 'move') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, actx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, actx.currentTime + 0.1);
      gain.gain.setValueAtTime(0, actx.currentTime);
      gain.gain.linearRampToValueAtTime(0.1, actx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, actx.currentTime + 0.1);
      osc.connect(gain); gain.connect(actx.destination);
      osc.start(); osc.stop(actx.currentTime + 0.1);
    } else if (type === 'hit') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, actx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, actx.currentTime + 0.2);
      gain.gain.setValueAtTime(0, actx.currentTime);
      gain.gain.linearRampToValueAtTime(0.3, actx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, actx.currentTime + 0.2);
      osc.connect(gain); gain.connect(actx.destination);
      osc.start(); osc.stop(actx.currentTime + 0.2);
    }
  } catch (e) {
    console.error("Audio block", e);
  }
};

// --- Types & Constants ---
type AttrType = 'stamina' | 'strength' | 'patience' | 'intelligence' | 'focus';
type RoomId =
  | 'LivingRoom' | 'GreatHall' | 'ThroneRoom'
  | 'MainGate' | 'Armory' | 'Watchtower' | 'Yard'
  | 'GrandLibrary' | 'AlchemyLab' | 'Observatory'
  | 'DressingRoom' | 'GuestQuarters' | 'Chapel' | 'Kitchen' | 'LordsChamber'
  | 'Dungeon' | 'BellTower' | 'ShadowCorridor' | 'Greenhouse' | 'WineCellar';

const ATTR_NAMES: Record<AttrType, string> = {
  stamina: '耐力',
  strength: '力量',
  patience: '耐心',
  intelligence: '智力',
  focus: '注意力',
};

interface RoomDef {
  id: RoomId;
  name: string;
  attrs: AttrType[];
  adj: RoomId[];
}

const ROOMS: Record<RoomId, RoomDef> = {
  LivingRoom: { id: 'LivingRoom', name: '起居室', attrs: ['stamina', 'focus'], adj: ['GreatHall', 'Yard', 'DressingRoom', 'GuestQuarters', 'Kitchen'] },
  GreatHall: { id: 'GreatHall', name: '大礼堂', attrs: ['strength', 'intelligence', 'focus'], adj: ['LivingRoom', 'ThroneRoom', 'LordsChamber', 'GrandLibrary'] },
  ThroneRoom: { id: 'ThroneRoom', name: '王座大厅', attrs: ['stamina', 'strength', 'patience', 'intelligence'], adj: ['GreatHall'] },
  LordsChamber: { id: 'LordsChamber', name: '领主卧房', attrs: ['intelligence', 'patience'], adj: ['GreatHall', 'BellTower'] },
  GrandLibrary: { id: 'GrandLibrary', name: '大图书馆', attrs: ['intelligence'], adj: ['GreatHall', 'AlchemyLab'] },
  Observatory: { id: 'Observatory', name: '占星塔', attrs: ['focus'], adj: ['AlchemyLab'] },
  BellTower: { id: 'BellTower', name: '钟楼', attrs: ['patience', 'focus'], adj: ['LordsChamber', 'ShadowCorridor'] },
  AlchemyLab: { id: 'AlchemyLab', name: '炼金室', attrs: ['intelligence', 'focus'], adj: ['GrandLibrary', 'Observatory', 'GuestQuarters'] },
  ShadowCorridor: { id: 'ShadowCorridor', name: '密道', attrs: ['stamina', 'patience'], adj: ['DressingRoom', 'BellTower', 'Greenhouse'] },
  DressingRoom: { id: 'DressingRoom', name: '更衣室', attrs: [], adj: ['LivingRoom', 'ShadowCorridor', 'Chapel'] }, // 唯一的纯绝对安全区
  GuestQuarters: { id: 'GuestQuarters', name: '贵宾室', attrs: ['stamina', 'focus'], adj: ['LivingRoom', 'AlchemyLab', 'WineCellar'] },
  Greenhouse: { id: 'Greenhouse', name: '温室废园', attrs: ['strength', 'patience'], adj: ['ShadowCorridor', 'Armory'] },
  Chapel: { id: 'Chapel', name: '礼拜堂', attrs: ['patience', 'intelligence', 'focus'], adj: ['DressingRoom', 'Yard', 'Armory'] },
  Yard: { id: 'Yard', name: '城门庭院', attrs: ['stamina', 'strength'], adj: ['LivingRoom', 'MainGate', 'Chapel', 'Kitchen'] },
  Kitchen: { id: 'Kitchen', name: '厨房', attrs: ['focus'], adj: ['LivingRoom', 'Yard', 'WineCellar'] },
  WineCellar: { id: 'WineCellar', name: '酒窖', attrs: ['stamina', 'patience'], adj: ['GuestQuarters', 'Kitchen', 'Dungeon'] },
  Armory: { id: 'Armory', name: '军械库', attrs: ['strength', 'stamina'], adj: ['Chapel', 'MainGate', 'Greenhouse'] },
  MainGate: { id: 'MainGate', name: '城堡大门', attrs: ['strength', 'patience'], adj: ['Yard', 'Armory', 'Watchtower'] },
  Watchtower: { id: 'Watchtower', name: '瞭望台', attrs: ['focus', 'intelligence'], adj: ['MainGate', 'Dungeon'] },
  Dungeon: { id: 'Dungeon', name: '地牢', attrs: ['stamina', 'patience'], adj: ['Watchtower', 'WineCellar'] },
};

const DIST_TO_BELL_TOWER: Partial<Record<RoomId, number>> = {};
const computeDistToBellTower = () => {
  if (Object.keys(DIST_TO_BELL_TOWER).length > 0) return;
  const queue: { id: RoomId, dist: number }[] = [{ id: 'BellTower', dist: 0 }];
  const visited = new Set<RoomId>();
  while (queue.length > 0) {
    const { id, dist } = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);
    DIST_TO_BELL_TOWER[id] = dist;
    ROOMS[id].adj.forEach(adj => {
      if (!visited.has(adj)) queue.push({ id: adj, dist: dist + 1 });
    });
  }
};
computeDistToBellTower();

type Attributes = Record<AttrType, number>;


interface CombatResult {
  attr: AttrType;
  playerVal: number;
  npcVal: number;
  winner: 'player' | 'npc' | 'draw';
  stealAmt: number;
}

interface CombatData {
  timer: number;
  phase: 'starting' | 'rolling' | 'resolving' | 'result';
  roomId: RoomId;
  npcId: number;
  attrsCompared: AttrType[];
  results: CombatResult[];
  dialogText: string;
  isFirstEncounter?: boolean;
}

interface BeastState {
  satiety: number;
  maxSatiety?: number;
  state: 'contained' | 'escaped';
  loc: RoomId;
  moveTimer: number;
  nextLoc: RoomId | null;
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
  encountered?: boolean;
  nextLoc: RoomId | null;
}

interface GreenMidnightState {
  active: boolean;
  timer: number;
  angle: number;
  hitCooldown: number;
}

interface ChaseData {
  playerRooms: number;
  monsterDistance: number;
  targetRooms: number;
  speed: number;
  isUpPath?: boolean;
  frontMonsterDistance?: number;
  frontMonsterActive?: boolean;
  safeRoomSpawned?: boolean;
  inSafeRoom?: boolean;
  skillState?: 'charging' | 'striking';
  skillTimer?: number;
  skillTargetRoom?: number;
  hasUsedSkill?: boolean;
}

interface GameState {
  status: 'playing' | 'gameover' | 'reading' | 'divination' | 'combat' | 'shop_intro' | 'shop' | 'passage_intro' | 'passage_failure' | 'passage_victory' | 'inventory' | 'belltower_intro' | 'belltower_rung' | 'watchtower_intro';
  combatData?: CombatData;
  chaseData?: ChaseData;
  globalEventTimer: number;
  greenMidnight: GreenMidnightState;
  readingData?: ReadingData;
  completedBooks: number[];
  inventory: ItemType[];
  divinationCooldown: number;
  invisibilityTimer: number;
  instantReallocActive: boolean;
  traps: RoomId[];
  trappedTimer: number;
  bellCooldownTimer: number;
  bellAttractTimer: number;
  lookoutMode: boolean;
  lookoutPanX: number;
  lookoutPanY: number;
  debugInfiniteInvisibility?: boolean;
  debugInvincibleCombat?: boolean;
  debugInfiniteSatiety?: boolean;
  debugShowPaths?: boolean;
  debugGodMode?: boolean;
  debugInfiniteCoins?: boolean;
  debugHideLogs?: boolean;
  debugShowIntentions?: boolean;
  debugForceSeal?: boolean;
  debugDisableGreenMidnight?: boolean;
  difficulty: 'easy' | 'normal' | 'nightmare';
  glitchCycle: number;
  rustedCoins: number;
  hasMetScavenger?: boolean;
  hasOmniscienceEye?: boolean;
  secretPassageCleared?: boolean;
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
}

// --- Logic Helpers ---

function snapVal(val: number): number {
  if (val < 1) return 0;
  return Math.round(val * 10) / 10;
}

function snapAll(attrs: Attributes): Attributes {
  const result = { ...attrs };
  (Object.keys(result) as AttrType[]).forEach(k => {
    result[k] = snapVal(result[k]);
  });
  return result;
}

function calcHP(attrs: Attributes): number {
  return Number(((Object.values(attrs) as number[]).reduce((sum, v) => sum + v, 0)).toFixed(1));
}

function getEffectivePlayerAttr(state: GameState, attr: AttrType): number {
  let val = state.playerAttrs[attr];
  if (attr === 'focus' && state.beast.state === 'contained' && state.beast.satiety < 30) {
    val *= 0.5;
  }
  return snapVal(val);
}

function adjustDistributed(draft: Attributes, targetKey: AttrType, targetDelta: number): Attributes {
  const current = {
    stamina: Math.round(draft.stamina * 10),
    strength: Math.round(draft.strength * 10),
    patience: Math.round(draft.patience * 10),
    intelligence: Math.round(draft.intelligence * 10),
    focus: Math.round(draft.focus * 10),
  };
  let deltaInt = Math.round(targetDelta * 10);

  let maxSubtract = current[targetKey];
  let maxAdd = 0;
  const others = (Object.keys(current) as AttrType[]).filter(k => k !== targetKey);
  for (const k of others) maxAdd += current[k];

  if (deltaInt < -maxSubtract) deltaInt = -maxSubtract;
  if (deltaInt > maxAdd) deltaInt = maxAdd;

  if (deltaInt === 0) return draft;

  current[targetKey] += deltaInt;

  let balanceToDistribute = -deltaInt;
  let activeOthers = [...others];

  while (balanceToDistribute !== 0 && activeOthers.length > 0) {
    let split = Math.round(balanceToDistribute / activeOthers.length);
    if (split === 0) {
      split = balanceToDistribute > 0 ? 1 : -1;
    }

    let nextActiveOthers: AttrType[] = [];
    for (const k of activeOthers) {
      if (balanceToDistribute === 0) break;

      let applied = split;
      if (current[k] + applied < 0) {
        applied = -current[k];
      }

      if ((balanceToDistribute > 0 && applied > balanceToDistribute) ||
        (balanceToDistribute < 0 && applied < balanceToDistribute)) {
        applied = balanceToDistribute;
      }

      current[k] += applied;
      balanceToDistribute -= applied;

      if (current[k] > 0) {
        nextActiveOthers.push(k);
      }
    }
    activeOthers = nextActiveOthers;
  }

  return {
    stamina: current.stamina / 10,
    strength: current.strength / 10,
    patience: current.patience / 10,
    intelligence: current.intelligence / 10,
    focus: current.focus / 10,
  };
}

function getInitialGameState(): GameState {
  return {
    status: 'setup',
    playerLoc: 'MainGate',
    playerAttrs: { stamina: 4, strength: 4, patience: 4, intelligence: 4, focus: 4 },
    pendingPlayerAttrs: null,
    reallocTimer: 0,
    completedBooks: [],
    inventory: [],
    divinationCooldown: 0,
    invisibilityTimer: 0,
    showWarningTimer: 0,
    instantReallocActive: false,
    traps: [],
    trappedTimer: 0,
    bellCooldownTimer: 0,
    bellAttractTimer: 0,
    lookoutMode: false,
    lookoutPanX: 0,
    lookoutPanY: 0,
    debugInfiniteInvisibility: false,
    debugForceSeal: false,
    debugInfiniteCoins: false,
    rustedCoins: 0,
    hasOmniscienceEye: false,
    secretPassageCleared: false,
    globalEventTimer: 0,
    difficulty: 'normal',
    greenMidnight: { active: false, timer: 0, angle: 0, hitCooldown: 0 },
    beast: {
      satiety: 100,
      maxSatiety: 100,
      state: 'contained',
      loc: 'Dungeon',
      moveTimer: 0,
      nextLoc: 'WineCellar',
    },
    isFeedingBeast: false,
    glitchCycle: 60,
    npcs: [
      { id: 0, color: 'white', name: '苍白幽影', loc: 'Watchtower', attrs: { stamina: 4, strength: 4, patience: 4, intelligence: 4, focus: 4 }, moveTimer: 0, nextMoveWait: 2.0, roomTimer: 0, adaptedInRoom: false, isDead: false, nextLoc: 'GreatHall' },
      { id: 1, color: '#2563eb', name: '深蓝巡卫', loc: 'WineCellar', attrs: { stamina: 8, strength: 8, patience: 8, intelligence: 8, focus: 8 }, moveTimer: 0, nextMoveWait: 2.2, roomTimer: 0, adaptedInRoom: false, isDead: false, nextLoc: 'Kitchen' },
      { id: 2, color: '#a855f7', name: '紫晶判官', loc: 'AlchemyLab', attrs: { stamina: 14, strength: 14, patience: 14, intelligence: 14, focus: 14 }, moveTimer: 0, nextMoveWait: 2.5, roomTimer: 0, adaptedInRoom: false, isDead: false, nextLoc: 'GuestQuarters' },
      { id: 3, color: '#ef4444', name: '深红渊主', loc: 'ThroneRoom', attrs: { stamina: 20, strength: 20, patience: 20, intelligence: 20, focus: 20 }, moveTimer: 0, nextMoveWait: 2.8, roomTimer: 0, adaptedInRoom: false, isDead: false, nextLoc: 'GreatHall' },
    ],
    logs: ['[系统] 欢迎来到《Encounter 遭遇》。由于处于超重力区域，总属性上限受限，请先分配你的初始 20 点属性。'],
  };
}

const addLog = (state: GameState, msg: string) => {
  const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });
  const newLog = `[${timeStr}] ${msg}`;
  state.logs = [...state.logs, newLog].slice(-100);
};

// --- Subcomponents ---

const SetupScreen = ({ stateRef, forceRender }: { stateRef: React.MutableRefObject<GameState>, forceRender: () => void }) => {
  const [draft, setDraft] = useState<Attributes>({ stamina: 4, strength: 4, patience: 4, intelligence: 4, focus: 4 });
  const totHP = calcHP(draft);

  const handleAdjust = (attr: AttrType, delta: number) => {
    setDraft(prev => adjustDistributed(prev, attr, delta));
  };

  const confirmSetup = () => {
    if (totHP <= 20 && totHP > 0) {
      stateRef.current.playerAttrs = snapAll(draft);
      stateRef.current.showWarningTimer = 4.0;
      stateRef.current.status = 'playing';
      playSound('warning');
      addLog(stateRef.current, `🚀 系统初始化成功。当前位置：城堡大门。`);
      forceRender();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 font-mono">
      <div className="max-w-md w-full bg-theme-card border border-theme-border p-8 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
        <h1 className="text-[24px] font-bold mb-2 text-center text-theme-cyan tracking-[4px] uppercase">ENCOUNTER // 遭遇</h1>
        <p className="text-[#8b949e] text-xs mb-6 text-center tracking-widest">系统检测到你的存在，请分配初始属性点</p>

        <div className="flex justify-between items-center bg-black border border-theme-border p-4 mb-6 relative overflow-hidden">
          {/* Simulating health bar gradient here */}
          <div className="absolute left-0 top-0 h-full bg-[linear-gradient(90deg,var(--color-theme-red),#ff9999)] opacity-30 transition-all" style={{ width: `${(totHP / 100) * 100}%` }}></div>
          <span className="font-semibold text-theme-text text-sm z-10 relative">总血量 (HP)</span>
          <span className={`text-xl font-bold z-10 relative ${totHP > 100 ? 'text-theme-red' : 'text-theme-green'}`}>{totHP.toFixed(1)} / 100.0</span>
        </div>

        <div className="space-y-4">
          {(Object.keys(ATTR_NAMES) as AttrType[]).map(key => (
            <div key={key} className="flex items-center gap-2">
              <label className="w-[80px] font-medium text-[14px] text-theme-text">{ATTR_NAMES[key]}</label>
              <div className="flex-1 flex items-center gap-1 min-w-0">
                <button onClick={() => handleAdjust(key, -10)} className="bg-transparent border border-theme-cyan text-theme-cyan hover:bg-theme-cyan/10 w-9 h-[32px] shrink-0 flex flex-col items-center justify-center transition-all text-[11px] leading-tight font-bold">-10</button>
                <button onClick={() => handleAdjust(key, -1)} className="bg-transparent border border-theme-cyan text-theme-cyan hover:bg-theme-cyan/10 w-8 h-[32px] shrink-0 flex items-center justify-center transition-all font-bold">-1</button>
                <div className="flex-1 min-w-[30px] border-b border-theme-border px-1 py-1 text-center text-theme-green font-bold h-[32px]">{draft[key].toFixed(1)}</div>
                <button onClick={() => handleAdjust(key, 1)} className="bg-transparent border border-theme-cyan text-theme-cyan hover:bg-theme-cyan/10 w-8 h-[32px] shrink-0 flex items-center justify-center transition-all font-bold">+1</button>
                <button onClick={() => handleAdjust(key, 10)} className="bg-transparent border border-theme-cyan text-theme-cyan hover:bg-theme-cyan/10 w-9 h-[32px] shrink-0 flex flex-col items-center justify-center transition-all text-[11px] leading-tight font-bold">+10</button>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={confirmSetup}
          disabled={totHP > 20 || totHP <= 0}
          className="mt-8 w-full bg-transparent border border-theme-cyan text-theme-cyan hover:bg-theme-cyan/10 disabled:opacity-30 disabled:cursor-not-allowed uppercase font-bold py-3 transition"
        >
          启动序列
        </button>
      </div>
    </div>
  );
};

const PlayerStatePanel = ({ stateRef, forceRender }: { stateRef: React.MutableRefObject<GameState>, forceRender: () => void }) => {
  const s = stateRef.current;
  const isReallocating = s.pendingPlayerAttrs !== null;
  const currentHP = calcHP(s.playerAttrs);

  // Draft local state for the sliders when NOT immediately reallocating
  const [draft, setDraft] = useState<Attributes>(s.playerAttrs);

  // Keep draft synced with actuals when not edited or after completion
  useEffect(() => {
    if (!isReallocating) {
      setDraft(s.playerAttrs);
    }
  }, [isReallocating, s.playerAttrs]);

  const handleAdjust = (attr: AttrType, delta: number) => {
    setDraft(prev => adjustDistributed(prev, attr, delta));
  };

  const handleApplyDraft = () => {
    if (calcHP(draft) <= currentHP) {
      if (stateRef.current.instantReallocActive) {
        stateRef.current.playerAttrs = snapAll(draft);
        stateRef.current.pendingPlayerAttrs = null;
        stateRef.current.reallocTimer = 0;
        stateRef.current.instantReallocActive = false;
        addLog(stateRef.current, `⏳ 时光沙漏被消耗：属性瞬间重组完成了！`);
      } else {
        stateRef.current.pendingPlayerAttrs = snapAll(draft);
        stateRef.current.reallocTimer = 0;
        addLog(stateRef.current, `⚙️ 开始重组属性，需要 4 秒生效时间...`);
      }
      forceRender();
    }
  };

  const handleCancelDraft = () => {
    stateRef.current.pendingPlayerAttrs = null;
    stateRef.current.reallocTimer = 0;
    addLog(stateRef.current, `🚫 放弃了属性重组。`);
    forceRender();
  };

  const draftHP = calcHP(draft);
  const progressPercent = isReallocating ? (s.reallocTimer / 4.0) * 100 : 0;

  return (
    <React.Fragment>


      <div className="text-[12px] text-theme-cyan uppercase border-b border-theme-border pb-1 mb-3">
        神经重组 [属性分配]
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto">
        {(Object.keys(ATTR_NAMES) as AttrType[]).map(key => {
          const baseVal = s.playerAttrs[key];
          const effVal = getEffectivePlayerAttr(s, key);
          const isDebuffed = effVal < baseVal;

          return (
            <div key={key} className="flex items-center gap-1 sm:gap-2 mb-3">
              <span className="w-[50px] sm:w-[60px] text-[13px] text-theme-text shrink-0">{ATTR_NAMES[key]}</span>
              <div className="w-[40px] flex flex-col justify-center items-start shrink-0 leading-[1.1]">
                {isDebuffed ? (
                  <>
                    <span className="line-through opacity-50 text-[9px] text-theme-red">{baseVal.toFixed(1)}</span>
                    <span className="text-[14px] font-bold text-purple-400">{effVal.toFixed(1)}</span>
                  </>
                ) : (
                  <span className="text-[13px] font-bold text-theme-green">{baseVal.toFixed(1)}</span>
                )}
              </div>

              <div className="flex-1 flex items-center gap-[2px] sm:gap-1 min-w-0">
                <button
                  onClick={() => handleAdjust(key, -10)}
                  disabled={isReallocating}
                  className="bg-transparent border border-theme-cyan text-theme-cyan hover:bg-theme-cyan/10 disabled:opacity-30 disabled:cursor-not-allowed w-7 sm:w-8 h-[30px] shrink-0 flex items-center justify-center transition-all text-[10px] font-bold"
                >-10</button>
                <button
                  onClick={() => handleAdjust(key, -1)}
                  disabled={isReallocating}
                  className="bg-transparent border border-theme-cyan text-theme-cyan hover:bg-theme-cyan/10 disabled:opacity-30 disabled:cursor-not-allowed w-6 sm:w-7 h-[30px] shrink-0 flex items-center justify-center transition-all font-bold"
                >-</button>

                <div className="flex-1 w-0 min-w-[30px] bg-transparent border-b border-theme-border px-1 py-1 text-center text-theme-green disabled:opacity-50 h-[30px] text-[12px] leading-tight flex items-center justify-center font-bold">
                  {draft[key].toFixed(1)}
                </div>

                <button
                  onClick={() => handleAdjust(key, 1)}
                  disabled={isReallocating}
                  className="bg-transparent border border-theme-cyan text-theme-cyan hover:bg-theme-cyan/10 disabled:opacity-30 disabled:cursor-not-allowed w-6 sm:w-7 h-[30px] shrink-0 flex items-center justify-center transition-all font-bold"
                >+</button>
                <button
                  onClick={() => handleAdjust(key, 10)}
                  disabled={isReallocating}
                  className="bg-transparent border border-theme-cyan text-theme-cyan hover:bg-theme-cyan/10 disabled:opacity-30 disabled:cursor-not-allowed w-7 sm:w-8 h-[30px] shrink-0 flex items-center justify-center transition-all text-[10px] font-bold"
                >+10</button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-auto pt-4 flex flex-col">
        <div className="text-[12px] mb-2 flex items-center gap-2">
          <span>剩余分配能力:</span>
          <span className={`font-bold ${draftHP > currentHP ? 'text-theme-red' : 'text-theme-cyan'}`}>
            {(currentHP - draftHP).toFixed(1)}
          </span>
        </div>

        <button
          onClick={handleApplyDraft}
          disabled={draftHP > currentHP || isReallocating}
          className="w-full bg-transparent border border-theme-cyan text-theme-cyan hover:bg-theme-cyan/10 disabled:opacity-30 disabled:cursor-not-allowed uppercase text-[12px] py-[10px] transition cursor-pointer mb-2"
        >
          确认属性重组
        </button>

        {/* Allocation Progress mimicking Immersive UI template */}
        <div className="h-[40px] border border-dashed border-theme-border flex items-center justify-center relative relative">
          <div className="absolute left-0 top-0 h-full bg-theme-cyan/20 transition-all duration-75" style={{ width: `${progressPercent}%` }}></div>
          <span className="relative z-10 text-[10px] text-theme-text shadow-sm">
            {isReallocating ? `重组中... ${Math.abs(4.0 - s.reallocTimer).toFixed(1)}s (点击取消)` : '就绪'}
          </span>
          {isReallocating && (
            <button
              onClick={handleCancelDraft}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
              title="点击取消重组"
            />
          )}
        </div>
      </div>

      {/* Inventory Section */}
      <div className="mt-4 border-t border-theme-border pt-4">
        <div className="flex justify-between items-center mb-2">
          <div className="text-[10px] text-theme-cyan/70 uppercase">快捷物品 (Quick Use)</div>
          <button
            onClick={() => {
              s.status = 'inventory';
              forceRender();
            }}
            className="text-[10px] text-theme-cyan hover:text-white border border-theme-cyan/50 hover:border-theme-cyan px-2 py-0.5 rounded-sm transition-colors cursor-pointer"
          >
            [ 展开背包 ]
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {s.inventory.length === 0 ? (
            <span className="text-[10px] text-theme-text/30">空无一物...</span>
          ) : (
            s.inventory.slice(0, 3).map((item, idx) => {
              return (
                <button
                  key={idx}
                  onClick={() => {
                    const itemIndex = s.inventory.indexOf(item);
                    if (itemIndex > -1) {
                      s.inventory.splice(itemIndex, 1);
                      if (item === 'ether_potion') {
                        s.invisibilityTimer = 5.0;
                        addLog(s, `✨ 你饮下了【隐世药剂】，获得了虚无状态！`);
                      } else if (item === 'hourglass') {
                        s.instantReallocActive = true;
                        addLog(s, `⏳ 【时光沙漏】已激活！下一次属性重组将瞬间完成！`);
                      } else if (item === 'straw_doll') {
                        s.traps.push(s.playerLoc as RoomId);
                        addLog(s, `🔥 你在 ${ROOMS[s.playerLoc as RoomId].name} 放置了【厄运稻草人】。`);
                        // Immediate trigger if any NPC is already in the room
                        const npcInRoom = s.npcs.find(n => !n.isDead && n.loc === s.playerLoc);
                        if (npcInRoom) {
                          s.traps = s.traps.filter(t => t !== s.playerLoc);
                          addLog(s, `🔥 刚放置的厄运稻草人立即被 ${npcInRoom.name} 触发，全属性强制削弱！`);
                          for (let key in npcInRoom.attrs) {
                            npcInRoom.attrs[key as AttrType] = Math.max(0, npcInRoom.attrs[key as AttrType] / 2);
                          }
                        }
                      }
                      forceRender();
                    }
                  }}
                  className="border border-yellow-500/50 bg-black text-yellow-500 p-1 px-2 text-[10px] hover:bg-yellow-500/20 uppercase cursor-pointer"
                >
                  [{item === 'ether_potion' ? '隐世药剂' : item === 'hourglass' ? '时光沙漏' : '厄运稻草人'}]
                </button>
              );
            })
          )}
          {s.inventory.length > 3 && (
            <span className="text-[10px] text-theme-text/50 self-center ml-1">+{s.inventory.length - 3} 更多...</span>
          )}
        </div>
      </div>
    </React.Fragment>
  );
};

const ROOM_LAYOUT: Record<RoomId, { x: number, y: number }> = {
  ThroneRoom: { x: 0, y: -2 },
  LordsChamber: { x: -1, y: -2 },
  GrandLibrary: { x: 1, y: -2 },
  Observatory: { x: 2, y: -2 },

  BellTower: { x: -2, y: -1 },
  GreatHall: { x: 0, y: -1 },
  AlchemyLab: { x: 2, y: -1 },

  ShadowCorridor: { x: -2, y: 0 },
  DressingRoom: { x: -1, y: 0 },
  LivingRoom: { x: 0, y: 0 },
  GuestQuarters: { x: 1, y: 0 },

  Greenhouse: { x: -2, y: 1 },
  Chapel: { x: -1, y: 1 },
  Yard: { x: 0, y: 1 },
  Kitchen: { x: 1, y: 1 },
  WineCellar: { x: 2, y: 1 },

  Armory: { x: -1, y: 2 },
  MainGate: { x: 0, y: 2 },
  Watchtower: { x: 1, y: 2 },
  Dungeon: { x: 2, y: 2 },
};

const MAP_EDGES: [RoomId, RoomId][] = [
  ['LivingRoom', 'GreatHall'],
  ['LivingRoom', 'Yard'],
  ['LivingRoom', 'DressingRoom'],
  ['LivingRoom', 'GuestQuarters'],
  ['LivingRoom', 'Kitchen'],
  ['GreatHall', 'ThroneRoom'],
  ['GreatHall', 'LordsChamber'],
  ['GreatHall', 'GrandLibrary'],
  ['LordsChamber', 'BellTower'],
  ['GrandLibrary', 'AlchemyLab'],
  ['AlchemyLab', 'Observatory'],
  ['AlchemyLab', 'GuestQuarters'],
  ['BellTower', 'ShadowCorridor'],
  ['ShadowCorridor', 'DressingRoom'],
  ['ShadowCorridor', 'Greenhouse'],
  ['DressingRoom', 'Chapel'],
  ['Chapel', 'Yard'],
  ['Chapel', 'Armory'],
  ['Yard', 'MainGate'],
  ['Yard', 'Kitchen'],
  ['Kitchen', 'WineCellar'],
  ['GuestQuarters', 'WineCellar'],
  ['Greenhouse', 'Armory'],
  ['Armory', 'MainGate'],
  ['MainGate', 'Watchtower'],
  ['Watchtower', 'Dungeon'],
  ['WineCellar', 'Dungeon'],
];

const BOOK_TEXTS: Record<number, string> = {
  20: "在遥远的虚空中，古老的意志正在复苏。生命的形式并非一成不变，而是充满了变动与诡秘的法则。通过对血液的引导，我们可以窥见进化的真相。这并非诅咒，而是进化的必经之路。然而，意志脆弱者往往会被初期的诱惑所吞噬。保持清醒，观察那些跳动在脉络中的真实色彩。不要相信你眼睛看到的，要相信你内心深处的本能。",
  50: "当克苏鲁从拉莱耶沉睡中醒来，群星将回归正确的位置。拉莱耶的石柱是由非欧几何构造而成的，即使是最聪明的学者也无法理解其逻辑。那不可名状的恐怖，正在现实的裂缝中悄然生长。当你阅读这些文字时，你的灵魂已经与那个禁忌的世界产生了联系。不要回头看，不要听那些回响在虚空中的耳语。虚空在注视着你，而你也正在成为虚空的一部分。献祭你的理智，换取那片刻的真实。"
};

const MapPanel = ({ stateRef, handlePlayerMove, startReading, startDivination, forceRender }: { stateRef: React.MutableRefObject<GameState>, handlePlayerMove: (targetId: RoomId) => void, startReading: (type: 20 | 50) => void, startDivination: () => void, forceRender: () => void }) => {
  const s = stateRef.current;
  const room = ROOMS[s.playerLoc];
  const [zoom, setZoom] = useState(1);
  const [dragDelta, setDragDelta] = useState({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ mx: 0, my: 0 });

  const G_SPACING = 140; // Use this variable to adjust perfect gap width between rooms

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(z => {
      const newZ = z - e.deltaY * 0.001;
      return Math.max(0.3, Math.min(newZ, 2.5));
    });
  };

  const getChaseCoord = (idx: number, isExpUp: boolean, isSafe?: boolean) => {
    if (isSafe) return { x: 9.3, y: -5 };
    if (idx <= 10) return { x: idx, y: 0 };
    if (isExpUp) return { x: 10, y: -(idx - 10) };
    return { x: idx, y: 0 };
  };

  const chaseNodesToRender: { i: number; isUp: boolean; isSafe?: boolean }[] = [];
  if (s.status === 'chasing' && s.chaseData) {
    for (let i = 0; i <= s.chaseData.targetRooms; i++) {
      if (s.chaseData.isUpPath) {
        if (i <= 10) chaseNodesToRender.push({ i, isUp: false });
        else chaseNodesToRender.push({ i, isUp: true });

        if (s.chaseData.safeRoomSpawned && i === 15) {
          chaseNodesToRender.push({ i, isUp: true, isSafe: true });
        }
      } else {
        chaseNodesToRender.push({ i, isUp: false });
        if (s.chaseData.playerRooms >= 10 && i > 10) {
          chaseNodesToRender.push({ i, isUp: true });
        }
      }
    }
  }

  const npcsByRoom = s.npcs.reduce((acc, n) => {
    if (!n.isDead) {
      if (!acc[n.loc]) acc[n.loc] = [];
      acc[n.loc].push(n);
    }
    return acc;
  }, {} as Record<string, typeof s.npcs[0][]>);

  let chaseCamCoord = { x: 0, y: 0 };
  if (s.status === 'chasing' && s.chaseData) {
    chaseCamCoord = getChaseCoord(s.chaseData.playerRooms, !!s.chaseData.isUpPath, !!s.chaseData.inSafeRoom);
  }

  return (
    <React.Fragment>
      <div className="text-[12px] text-theme-cyan uppercase border-b border-theme-border pb-1 mb-6 flex items-center justify-between shrink-0">
        <span>战术地图终端</span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-theme-cyan/50 font-mono">ZOOM: {(zoom * 100).toFixed(0)}%</span>
          <span className="text-[10px] text-[#8b949e]">区域全息投影</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full relative">
        {s.status === 'combat' && (
          <div className="absolute inset-0 bg-theme-bg/85 z-30 flex flex-col items-center justify-center backdrop-blur-[2px] shadow-[0_0_80px_var(--color-theme-red)_inset] animate-[pulse_2s_ease-in-out_infinite]">
            <Swords className="text-theme-red w-16 h-16 mb-4 animate-bounce" />
            <div className="text-[32px] sm:text-[44px] font-bold text-theme-red tracking-widest uppercase shadow-[0_0_20px_var(--color-theme-red)]">
              战斗中
            </div>
            <div className="text-theme-red/90 text-[12px] sm:text-[14px] mt-2 font-mono tracking-widest">
              / 系统强行锁定物理位移 /
            </div>
          </div>
        )}
        <div
          className={`relative w-full h-[360px] overflow-hidden bg-black/40 border border-theme-border/50 shadow-[0_0_20px_rgba(0,242,255,0.05)_inset] rounded-sm flex-shrink-0 ${s.lookoutMode ? 'cursor-grab active:cursor-grabbing' : 'cursor-crosshair'}`}
          onWheel={handleWheel}
          onMouseDown={(e) => {
            if (!s.lookoutMode) return;
            isDraggingRef.current = true;
            dragStartRef.current = { mx: e.clientX, my: e.clientY };
            e.preventDefault();
          }}
          onMouseMove={(e) => {
            if (!s.lookoutMode || !isDraggingRef.current) return;
            const dx = (e.clientX - dragStartRef.current.mx) / zoom;
            const dy = (e.clientY - dragStartRef.current.my) / zoom;
            setDragDelta({ x: -dx, y: -dy });
          }}
          onMouseUp={(e) => {
            if (!s.lookoutMode || !isDraggingRef.current) return;
            isDraggingRef.current = false;
            const dx = (e.clientX - dragStartRef.current.mx) / zoom;
            const dy = (e.clientY - dragStartRef.current.my) / zoom;
            s.lookoutPanX += -dx;
            s.lookoutPanY += -dy;
            setDragDelta({ x: 0, y: 0 });
          }}
          onMouseLeave={() => {
            if (!s.lookoutMode || !isDraggingRef.current) return;
            isDraggingRef.current = false;
            s.lookoutPanX += dragDelta.x;
            s.lookoutPanY += dragDelta.y;
            setDragDelta({ x: 0, y: 0 });
          }}
        >
          {/* 瞭望模式退出按钮 */}
          {s.lookoutMode && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-1">
              <button
                onClick={() => { s.lookoutMode = false; forceRender(); }}
                className="px-4 py-1 bg-black/80 border border-blue-500/60 text-blue-300 text-[11px] uppercase tracking-widest hover:bg-blue-900/40 transition cursor-pointer backdrop-blur-sm"
              >
                [ 收回视线 ] 退出瞭望
              </button>
              <span className="text-[10px] text-blue-400/50 font-mono animate-pulse">拖动地图以探查各区域</span>
            </div>
          )}
          <div
            className="absolute w-0 h-0 transition-transform duration-700 ease-out"
            style={{
              left: '50%', top: '50%',
              transform: s.status === 'chasing' && s.chaseData
                ? `scale(${zoom}) translate(${-chaseCamCoord.x * G_SPACING}px, ${-chaseCamCoord.y * G_SPACING}px)`
                : s.lookoutMode
                  ? `scale(${zoom}) translate(${-(s.lookoutPanX + dragDelta.x)}px, ${-(s.lookoutPanY + dragDelta.y)}px)`
                  : `scale(${zoom}) translate(${-ROOM_LAYOUT[s.playerLoc].x * G_SPACING}px, ${-ROOM_LAYOUT[s.playerLoc].y * G_SPACING}px)`
            }}
          >
            {/* Connections */}
            <svg className="absolute inset-0 overflow-visible pointer-events-none">
              {s.status === 'chasing' && s.chaseData ? (
                chaseNodesToRender.filter(n => n.i > 0 && !n.isSafe).map((node) => {
                  const prevI = node.i - 1;
                  const prevIsUp = (node.i === 11 && node.isUp) ? false : node.isUp;

                  const pCoord = getChaseCoord(prevI, prevIsUp);
                  const cCoord = getChaseCoord(node.i, node.isUp);

                  const isActiveLine =
                    (!s.chaseData!.inSafeRoom && s.chaseData!.playerRooms === prevI) ||
                    (!s.chaseData!.inSafeRoom && s.chaseData!.playerRooms === node.i && (s.chaseData!.isUpPath || false) === node.isUp);

                  return (
                    <line
                      key={`chase-line-${node.i}-${node.isUp}`}
                      x1={pCoord.x * G_SPACING} y1={pCoord.y * G_SPACING}
                      x2={cCoord.x * G_SPACING} y2={cCoord.y * G_SPACING}
                      stroke={isActiveLine ? "var(--color-theme-cyan)" : "var(--color-theme-border)"}
                      strokeWidth={isActiveLine ? 2 : 1}
                      strokeDasharray={isActiveLine ? "none" : "none"}
                      opacity={isActiveLine ? 0.6 : 0.2}
                    />
                  );
                }).concat(
                  s.chaseData.safeRoomSpawned ? [
                    <line
                      key="chase-safe-line"
                      x1={getChaseCoord(15, true).x * G_SPACING} y1={getChaseCoord(15, true).y * G_SPACING}
                      x2={getChaseCoord(15, true, true).x * G_SPACING} y2={getChaseCoord(15, true, true).y * G_SPACING}
                      stroke={s.chaseData!.inSafeRoom ? "var(--color-theme-cyan)" : "var(--color-theme-border)"}
                      strokeWidth={s.chaseData!.inSafeRoom ? 2 : 1}
                      strokeDasharray="none"
                      opacity={s.chaseData!.inSafeRoom ? 0.6 : 0.1}
                    />
                  ] : []
                )
              ) : MAP_EDGES.map(([u, v]) => {
                const isActiveLine = u === s.playerLoc || v === s.playerLoc;
                if (!isActiveLine && !s.debugShowPaths) return null;
                return (
                  <line
                    key={`${u}-${v}`}
                    x1={ROOM_LAYOUT[u].x * G_SPACING} y1={ROOM_LAYOUT[u].y * G_SPACING}
                    x2={ROOM_LAYOUT[v].x * G_SPACING} y2={ROOM_LAYOUT[v].y * G_SPACING}
                    stroke={isActiveLine ? "var(--color-theme-cyan)" : "var(--color-theme-border)"}
                    strokeWidth={isActiveLine ? 2 : 1}
                    strokeDasharray={isActiveLine ? "none" : (s.debugShowPaths ? "none" : "4 4")}
                    opacity={isActiveLine ? 0.6 : (s.debugShowPaths ? 0.5 : 0.2)}
                  />
                );
              })}
              {/* Green Midnight Laser Rendering */}
              {s.greenMidnight.active && s.status !== 'chasing' && (() => {
                const origin = ROOM_LAYOUT['LivingRoom'];
                const oX = origin.x * G_SPACING;
                const oY = origin.y * G_SPACING;
                const length = 2000; // extend far out
                const thicc = s.greenMidnight.hitCooldown > 0 ? 12 : 5;
                return (
                  <g transform={`rotate(${s.greenMidnight.angle}, ${oX}, ${oY})`} className={s.greenMidnight.hitCooldown > 0 ? 'animate-pulse' : ''}>
                    <line x1={oX - length} y1={oY} x2={oX + length} y2={oY} stroke="#22c55e" strokeWidth={thicc} opacity={0.8} style={{ filter: 'blur(2px)' }} />
                    <line x1={oX} y1={oY - length} x2={oX} y2={oY + length} stroke="#22c55e" strokeWidth={thicc} opacity={0.8} style={{ filter: 'blur(2px)' }} />
                    <circle cx={oX} cy={oY} r={16} fill="#000" stroke="#22c55e" strokeWidth={3} />
                    <circle cx={oX} cy={oY} r={6} fill="#22c55e" className="animate-ping" />
                  </g>
                )
              })()}
              {/* Top-level Intent Arrow Layer */}
              {(s.hasOmniscienceEye || s.debugShowIntentions) && s.status !== 'chasing' && (
                <g>
                  <defs>
                    <marker id="npc-arrowhead-top" markerWidth="6" markerHeight="6" refX="24" refY="3" orient="auto">
                      <polygon points="0 0, 6 3, 0 6" fill="currentColor" opacity="0.6" />
                    </marker>
                    <marker id="beast-arrowhead-top" markerWidth="6" markerHeight="6" refX="24" refY="3" orient="auto">
                      <polygon points="0 0, 6 3, 0 6" fill="purple" opacity="0.7" />
                    </marker>
                  </defs>
                  {(() => {
                    const arrows: React.ReactNode[] = [];
                    s.npcs.forEach(n => {
                      if (!n.isDead && n.nextLoc) {
                        const u = ROOM_LAYOUT[n.loc];
                        const v = ROOM_LAYOUT[n.nextLoc];
                        arrows.push(
                          <line
                            key={`intent-npc-top-${n.id}`}
                            x1={u.x * G_SPACING} y1={u.y * G_SPACING}
                            x2={v.x * G_SPACING} y2={v.y * G_SPACING}
                            stroke={n.color}
                            strokeWidth="2"
                            strokeDasharray="4 4"
                            markerEnd="url(#npc-arrowhead-top)"
                            className="animate-[pulse_2.1s_infinite]"
                            opacity="0.5"
                            style={{ filter: 'blur(1px)' }}
                          >
                            <animate attributeName="stroke-dashoffset" from="40" to="0" dur="4s" repeatCount="indefinite" />
                          </line>
                        );
                      }
                    });
                    if (s.beast.state === 'escaped' && s.beast.nextLoc) {
                      const u = ROOM_LAYOUT[s.beast.loc];
                      const v = ROOM_LAYOUT[s.beast.nextLoc];
                      arrows.push(
                        <line
                          key={`intent-beast-top`}
                          x1={u.x * G_SPACING} y1={u.y * G_SPACING}
                          x2={v.x * G_SPACING} y2={v.y * G_SPACING}
                          stroke="purple"
                          strokeWidth="2.5"
                          strokeDasharray="4 4"
                          markerEnd="url(#beast-arrowhead-top)"
                          className="animate-[pulse_1.6s_infinite]"
                          opacity="0.6"
                          style={{ filter: 'blur(1px)' }}
                        >
                          <animate attributeName="stroke-dashoffset" from="40" to="0" dur="3s" repeatCount="indefinite" />
                        </line>
                      );
                    }
                    return arrows;
                  })()}
                </g>
              )}
            </svg>

            {/* Rooms */}
            {s.status === 'chasing' && s.chaseData ? (
              chaseNodesToRender.map((node) => {
                const i = node.i;

                let isCurrent = false;
                if (s.chaseData!.inSafeRoom) {
                  if (node.isSafe) isCurrent = true;
                } else {
                  if (s.chaseData!.playerRooms === i && (s.chaseData!.isUpPath || false) === node.isUp && !node.isSafe) isCurrent = true;
                }

                let isAdj = false;
                if (s.chaseData!.inSafeRoom) {
                  if (i === 15 && !node.isSafe && node.isUp) isAdj = true;
                } else if (s.chaseData!.playerRooms === 15 && node.isSafe && s.chaseData!.isUpPath) {
                  isAdj = true;
                } else if (!node.isSafe) {
                  // Forward
                  if (s.chaseData!.playerRooms + 1 === i && (s.chaseData!.playerRooms === 10 ? true : (s.chaseData!.isUpPath || false) === node.isUp)) isAdj = true;
                  // Backward
                  if (s.chaseData!.playerRooms - 1 === i) {
                    if (i <= 10) isAdj = true; // can retreat freely in the initial 0-10 corridor
                    else if ((s.chaseData!.isUpPath || false) === node.isUp) isAdj = true; // otherwise must match path (Up vs Normal)
                  }
                }

                const isHellDeath = !s.chaseData!.isUpPath && i === 11 && !node.isUp && s.chaseData!.playerRooms >= 10;

                let boxCls = "border-theme-border/30 text-[#8b949e]";
                if (node.isSafe) {
                  boxCls = "border-theme-border/20 text-[#8b949e]/30 bg-transparent opacity-40 hover:opacity-100 hover:border-theme-cyan/50";
                  if (isCurrent) boxCls = "border-theme-cyan/30 bg-[rgba(0,242,255,0.05)] text-theme-cyan/50 z-20";
                  else if (isAdj) boxCls = "border-theme-cyan/30 bg-[rgba(0,242,255,0.02)] text-theme-cyan/60 hover:opacity-100 z-10 cursor-pointer";
                } else {
                  if (isCurrent) {
                    boxCls = "border-theme-cyan bg-theme-cyan/5 shadow-[0_0_15px_rgba(0,242,255,0.15)] z-20 text-theme-cyan";
                  } else if (isHellDeath) {
                    boxCls = "border-theme-red bg-theme-red/10 animate-[pulse_1s_ease-in-out_infinite] text-theme-red cursor-pointer z-10 shadow-[0_0_15px_rgba(255,0,0,0.4)]";
                  } else if (isAdj) {
                    boxCls = "border-theme-border hover:border-theme-cyan/80 hover:bg-theme-cyan/10 cursor-pointer z-10 text-theme-text";
                  }
                }

                const coord = getChaseCoord(i, node.isUp, node.isSafe);
                const roomName = node.isSafe ? '狭缝隐室' : (isHellDeath ? '地狱' : (i === s.chaseData!.targetRooms ? '出口' : (node.isUp ? '神秘阶梯' : '未知走廊')));

                return (
                  <button
                    key={`chase-room-${i}-${node.isUp}-${node.isSafe}`}
                    onClick={() => {
                      if (isHellDeath) {
                        s.status = 'passage_failure';
                        playSound('read_corrupt');
                        forceRender();
                      } else if (isAdj) {
                        if (node.isSafe) {
                          s.chaseData!.inSafeRoom = true;
                          addLog(s, `🌫️ 你挤入了一道极难被察觉的狭缝空间中，屏住了呼吸...`);
                        } else if (s.chaseData!.inSafeRoom) {
                          s.chaseData!.inSafeRoom = false;
                          addLog(s, `👣 你悄无声息地离开裂痕，重新踏上前路。`);
                        } else {
                          const isBackward = i < s.chaseData!.playerRooms;
                          s.chaseData!.playerRooms = i;
                          if (i === 11 && node.isUp) {
                            s.chaseData!.isUpPath = true;
                            addLog(s, `⬆️ 你踏上了向上蜿蜒的新路...`);
                          } else if (isBackward) {
                            addLog(s, `⬇️ 仓皇中，退回下方的阶梯...`);
                          }
                        }
                        playSound('move');
                      }
                    }}
                    disabled={!isAdj && !isCurrent && !isHellDeath}
                    className={`absolute flex flex-col items-center justify-center transition-all bg-[var(--color-theme-bg)] ${boxCls}`}
                    style={{
                      left: `${coord.x * G_SPACING}px`, top: `${coord.y * G_SPACING}px`,
                      transform: 'translate(-50%, -50%)',
                      width: '84px', height: '56px',
                      borderWidth: '1px'
                    }}
                  >
                    <span className={`text-[12px] font-bold tracking-widest leading-tight ${isHellDeath ? 'text-theme-red text-[14px]' : ''}`}>{roomName}</span>
                    <span className={`text-[9px] mt-[2px] leading-tight ${isHellDeath ? 'text-theme-red/80 font-bold' : 'text-[#8b949e]/50'}`}>{isHellDeath ? 'DO NOT ENTER' : '? ? ?'}</span>
                    {isCurrent && <div className="mt-[4px] w-[6px] h-[6px] bg-theme-cyan shadow-[0_0_8px_var(--color-theme-cyan)]" />}
                  </button>
                );
              })
            ) : (Object.values(ROOMS) as RoomDef[]).map((r) => {
              const layout = ROOM_LAYOUT[r.id];
              const isCurrent = s.playerLoc === r.id;
              const isAdj = ROOMS[s.playerLoc].adj.includes(r.id);
              const npcsInR = npcsByRoom[r.id] || [];
              const isBeast = s.beast.state === 'escaped' && s.beast.loc === r.id;

              let boxCls = "border-theme-border/30 text-[#8b949e]";
              if (isCurrent) {
                boxCls = "border-theme-cyan bg-theme-cyan/5 shadow-[0_0_15px_rgba(0,242,255,0.15)] z-20 text-theme-cyan";
              } else if (isAdj) {
                boxCls = "border-theme-border hover:border-theme-cyan/80 hover:bg-theme-cyan/10 cursor-pointer z-10 text-theme-text";
              }

              return (
                <button
                  key={r.id}
                  onClick={() => { if (isAdj) handlePlayerMove(r.id) }}
                  disabled={!isAdj && !isCurrent}
                  className={`absolute flex flex-col items-center justify-center transition-all bg-[var(--color-theme-bg)] ${boxCls}`}
                  style={{
                    left: `${layout.x * G_SPACING}px`, top: `${layout.y * G_SPACING}px`,
                    transform: 'translate(-50%, -50%)',
                    width: '84px', height: '56px',
                    borderWidth: '1px'
                  }}
                >
                  <span className="text-[12px] font-bold tracking-widest leading-tight">{r.name}</span>
                  {r.attrs.length > 0 ? (
                    <span className={`text-[9px] mt-[2px] leading-tight ${isCurrent ? 'text-theme-cyan/80' : 'text-[#8b949e]/80'}`}>
                      {r.attrs.map(a => ATTR_NAMES[a]).join(' ')}
                    </span>
                  ) : (
                    <span className="text-[9px] text-[#8b949e]/50 mt-[2px] leading-tight">安全区</span>
                  )}
                  <div className="flex gap-[6px] mt-[4px] h-[6px] items-center">
                    {isCurrent && <div className="w-[6px] h-[6px] bg-theme-cyan shadow-[0_0_8px_var(--color-theme-cyan)]" title="Player" />}
                    {npcsInR.map(n => (
                      <div key={n.id} className="flex items-center gap-0.5">
                        <div style={{
                          borderLeft: '4px solid transparent',
                          borderRight: '4px solid transparent',
                          borderBottom: `8px solid ${n.color}`,
                        }} className="animate-pulse" title={n.name} />
                        {(s.hasOmniscienceEye || s.debugShowIntentions) && (
                          <span className="text-[8px] font-bold leading-none" style={{ color: n.color }}>
                            {(n.nextMoveWait - n.moveTimer).toFixed(1)}s
                          </span>
                        )}
                      </div>
                    ))}
                    {isBeast && (
                      <div className="flex items-center gap-0.5">
                        <div className="w-[6px] h-[6px] bg-purple-500 rounded-full shadow-[0_0_8px_purple] animate-ping" title="Beast" />
                        {(s.hasOmniscienceEye || s.debugShowIntentions) && (
                          <span className="text-[8px] font-bold text-purple-400 leading-none">
                            {(1.0 - s.beast.moveTimer).toFixed(1)}s
                          </span>
                        )}
                      </div>
                    )}
                    {s.traps.includes(r.id as RoomId) && <div className="w-[6px] h-[6px] bg-yellow-500 rounded-sm shadow-[0_0_8px_yellow]" title="Trap" />}
                  </div>
                </button>
              );
            })}
            {s.status === 'chasing' && s.chaseData && (() => {
              const renderMonster = (mDist: number, label: string, isBackMonster?: boolean) => {
                const mIndex = Math.floor(mDist);
                const mFract = mDist - mIndex;
                const c1 = getChaseCoord(mIndex, s.chaseData!.isUpPath && mIndex >= 11);
                const c2 = getChaseCoord(mIndex + 1, s.chaseData!.isUpPath && (mIndex + 1) >= 11);
                const mX = c1.x + (c2.x - c1.x) * mFract;
                const mY = c1.y + (c2.y - c1.y) * mFract;

                const isCharging = isBackMonster && s.chaseData!.skillState === 'charging';

                return (
                  <div
                    key={`monster-${label}`}
                    className="absolute flex items-center justify-center pointer-events-none"
                    style={{
                      left: `${mX * G_SPACING}px`, top: `${mY * G_SPACING}px`,
                      transform: 'translate(-50%, -50%)',
                      width: '40px', height: '40px',
                      zIndex: 30
                    }}
                  >
                    <div className="w-[24px] h-[24px] bg-red-600 rounded-full animate-ping" />
                    <span className="absolute -top-[20px] text-[10px] text-red-500 font-bold whitespace-nowrap">{label}</span>
                    {isCharging && (
                      <span className="absolute -top-[35px] -right-[15px] text-red-500 font-bold text-[24px] animate-bounce">!</span>
                    )}
                  </div>
                );
              };

              // Strike Render
              const renderTentacleStrike = () => {
                if (s.chaseData!.skillState !== 'striking' || s.chaseData!.skillTargetRoom === undefined) return null;

                const mDist = s.chaseData!.monsterDistance;
                const mIndex = Math.floor(mDist);
                const mFract = mDist - mIndex;
                const c1 = getChaseCoord(mIndex, s.chaseData!.isUpPath && mIndex >= 11);
                const c2 = getChaseCoord(mIndex + 1, s.chaseData!.isUpPath && (mIndex + 1) >= 11);
                const mX = c1.x + (c2.x - c1.x) * mFract;
                const mY = c1.y + (c2.y - c1.y) * mFract;

                // Target centers
                const t1 = getChaseCoord(s.chaseData!.skillTargetRoom, s.chaseData!.isUpPath && s.chaseData!.skillTargetRoom >= 11);
                const t2 = getChaseCoord(s.chaseData!.skillTargetRoom! + 1, s.chaseData!.isUpPath && (s.chaseData!.skillTargetRoom! + 1) >= 11);

                // Render SVG lines from top/bottom holes
                return (
                  <svg className="absolute inset-0 overflow-visible pointer-events-none z-40">
                    <circle cx={mX * G_SPACING} cy={mY * G_SPACING - 30} r={15} fill="black" stroke="red" strokeWidth={2} className="animate-spin" />
                    <circle cx={mX * G_SPACING} cy={mY * G_SPACING + 30} r={15} fill="black" stroke="red" strokeWidth={2} className="animate-spin" />

                    <path
                      d={`M ${mX * G_SPACING} ${mY * G_SPACING - 30} L ${t2.x * G_SPACING} ${t2.y * G_SPACING}`}
                      stroke="darkred" strokeWidth={6} strokeDasharray="10, 5" fill="none" opacity={0.8}
                      className="animate-[pulse_0.1s_infinite]"
                    />
                    <path
                      d={`M ${mX * G_SPACING} ${mY * G_SPACING + 30} L ${t1.x * G_SPACING} ${t1.y * G_SPACING}`}
                      stroke="darkred" strokeWidth={6} strokeDasharray="10, 5" fill="none" opacity={0.8}
                      className="animate-[pulse_0.1s_infinite]"
                    />

                    <rect
                      x={t1.x * G_SPACING - 42} y={t1.y * G_SPACING - 28}
                      width={84} height={56} fill="red" opacity={0.3} className="animate-ping"
                    />
                    <rect
                      x={t2.x * G_SPACING - 42} y={t2.y * G_SPACING - 28}
                      width={84} height={56} fill="red" opacity={0.3} className="animate-ping"
                    />
                  </svg>
                );
              };

              return (
                <>
                  {renderMonster(s.chaseData!.monsterDistance, '追截虚无', true)}
                  {s.chaseData!.frontMonsterActive && s.chaseData!.frontMonsterDistance !== undefined &&
                    renderMonster(s.chaseData!.frontMonsterDistance, '降临虚无')}
                  {renderTentacleStrike()}
                </>
              );
            })()}
          </div>
        </div>

        {/* Current Room Info */}
        <div className="w-full max-w-[360px] flex flex-col gap-2 mt-[15px] shrink-0">
          {s.status === 'chasing' ? (
            <div className="bg-red-900/10 border border-red-500/50 p-3 text-center animate-pulse">
              <div className="flex items-center justify-center gap-2 mb-[4px]">
                <div className="w-2 h-2 bg-red-500 shadow-[0_0_5px_red]" />
                <div className="text-[16px] text-red-500 font-bold uppercase">正在逃亡</div>
              </div>
              <div className="text-[12px] opacity-80 text-red-400 font-mono">
                距离出口：{s.chaseData ? s.chaseData.targetRooms - s.chaseData.playerRooms : 0} 扇门
              </div>
            </div>
          ) : (
            <div className="bg-theme-cyan/5 border border-theme-border p-3 text-center">
              <div className="flex items-center justify-center gap-2 mb-[4px]">
                <div className="w-2 h-2 bg-theme-cyan shadow-[0_0_5px_var(--color-theme-cyan)]" />
                <div className="text-[16px] text-theme-text font-bold uppercase">{room.name}</div>
              </div>
              <div className="text-[12px] opacity-80 text-theme-cyan font-mono">
                {room.attrs.length > 0 ? `当前环境辐射 | ${room.attrs.map(a => ATTR_NAMES[a]).join(' · ')}` : '绝对安全区域 | 属性无变动'}
              </div>
            </div>
          )}

          {room.id === 'Dungeon' && s.beast.state === 'contained' && (
            <div className="bg-[#1a0000] border border-theme-red p-3 flex flex-col justify-center">
              <div className="flex justify-between items-center text-[10px] text-theme-red/80 mb-2 font-bold uppercase tracking-widest">
                <span>⚠️ 收容实体饱食度</span>
                <span>{Math.floor(s.beast.satiety)} / {s.beast.maxSatiety || 100}</span>
              </div>
              <div className="w-full bg-black h-1.5 mb-3 border border-theme-red/30 flex overflow-hidden">
                <div className="bg-theme-red h-full" style={{ width: `${Math.min(100, Math.max(0, s.beast.satiety / (s.beast.maxSatiety || 100) * 100))}%` }}></div>
              </div>
              <button
                onPointerDown={() => { s.isFeedingBeast = true; }}
                onPointerUp={() => { s.isFeedingBeast = false; }}
                onPointerLeave={() => { s.isFeedingBeast = false; }}
                onPointerCancel={() => { s.isFeedingBeast = false; }}
                className="w-full bg-transparent border border-theme-red text-theme-red hover:bg-theme-red/20 h-[36px] text-[12px] uppercase font-bold active:bg-theme-red active:text-white transition-colors cursor-pointer select-none"
              >
                [长按] 强制输送生体精华
              </button>
            </div>
          )}

          {room.id === 'GrandLibrary' && (
            <div className="flex flex-col gap-2 p-3 bg-theme-cyan/5 border border-theme-border">
              <div className="text-[10px] text-theme-cyan/80 uppercase font-bold text-center border-b border-theme-border/30 pb-1 mb-1">禁忌书架</div>

              {s.completedBooks.includes(20) ? (
                <button disabled className="w-full h-[36px] text-[12px] border border-theme-cyan/20 text-theme-cyan/30 uppercase cursor-not-allowed">
                  [ 已掌握 ] 《活体演化》
                </button>
              ) : (
                <button
                  disabled={s.playerAttrs.intelligence < 20}
                  onClick={() => startReading(20)}
                  className={`w-full h-[36px] text-[12px] border border-theme-cyan uppercase transition-colors ${s.playerAttrs.intelligence >= 20 ? 'text-theme-cyan hover:bg-theme-cyan/10 cursor-pointer' : 'text-theme-cyan/30 border-theme-cyan/20 cursor-not-allowed'}`}
                >
                  {s.playerAttrs.intelligence >= 20 ? '[ 研读 ] 《活体演化》' : `需要智力 20.0 (${s.playerAttrs.intelligence.toFixed(1)})`}
                </button>
              )}

              {s.completedBooks.includes(50) ? (
                <button disabled className="w-full h-[36px] text-[12px] border border-theme-cyan/20 text-theme-cyan/30 uppercase cursor-not-allowed">
                  [ 已掌握 ] 《拉莱耶残卷》
                </button>
              ) : (
                <button
                  disabled={s.playerAttrs.intelligence < 50}
                  onClick={() => startReading(50)}
                  className={`w-full h-[36px] text-[12px] border border-theme-cyan uppercase transition-colors ${s.playerAttrs.intelligence >= 50 ? 'text-theme-cyan hover:bg-theme-cyan/10 cursor-pointer' : 'text-theme-cyan/30 border-theme-cyan/20 cursor-not-allowed'}`}
                >
                  {s.playerAttrs.intelligence >= 50 ? '[ 研读 ] 《拉莱耶残卷》' : `需要智力 50.0 (${s.playerAttrs.intelligence.toFixed(1)})`}
                </button>
              )}
            </div>
          )}

          {room.id === 'Observatory' && (
            <div className="flex flex-col gap-2 p-3 bg-[#111] border border-[#555]">
              <div className="text-[10px] text-yellow-500/80 uppercase font-bold text-center border-b border-[#555]/50 pb-1 mb-1">星象仪占卜</div>
              <button
                disabled={s.divinationCooldown > 0}
                onClick={startDivination}
                className={`w-full h-[36px] text-[12px] border border-yellow-500 uppercase transition-colors ${s.divinationCooldown <= 0 ? 'text-yellow-500 hover:bg-yellow-500/10 cursor-pointer' : 'text-yellow-500/30 border-yellow-500/20 cursor-not-allowed'}`}
              >
                {s.divinationCooldown > 0 ? `星象紊乱 [ ${Math.ceil(s.divinationCooldown)}s ]` : '[ 凝注群星 ] 进行占卜'}
              </button>
            </div>
          )}

          {room.id === 'ShadowCorridor' && (
            <div className="flex flex-col gap-2 p-3 bg-[#1a0a0f] border border-[#552a2a] shadow-[0_0_15px_rgba(255,0,0,0.1)]">
              <div className="text-[10px] text-red-500 font-bold uppercase text-center border-b border-red-900/50 pb-1 mb-1 tracking-[2px]">
                空间裂缝：异界入口
              </div>

              {s.secretPassageCleared ? (
                <div className="w-full py-2 bg-black/40 border border-green-900/30 text-green-500/50 text-[11px] uppercase text-center tracking-widest">
                  [ 裂缝已愈合 ]
                </div>
              ) : (
                <button
                  onClick={() => {
                    s.status = 'passage_intro';
                    forceRender();
                  }}
                  className="w-full h-[36px] text-[12px] border border-red-600 text-red-500 uppercase transition-all hover:bg-red-600/20 hover:text-red-400 cursor-pointer font-bold shadow-[0_0_10px_rgba(255,0,0,0.2)]"
                >
                  [ 靠近裂缝 ] 窥视深渊
                </button>
              )}
            </div>
          )}

          {room.id === 'BellTower' && (
            <div className="flex flex-col gap-2 p-3 bg-[#110a14] border border-[#4a2a55] shadow-[0_0_15px_rgba(128,0,128,0.1)]">
              <div className="text-[10px] text-purple-400 font-bold uppercase text-center border-b border-purple-900/50 pb-1 mb-1 tracking-[2px]">
                骸骨巨钟
              </div>
              <button
                onClick={() => {
                  s.status = 'belltower_intro';
                  forceRender();
                }}
                className="w-full h-[36px] text-[12px] border border-purple-600 text-purple-400 uppercase transition-all hover:bg-purple-600/20 hover:text-purple-300 cursor-pointer font-bold shadow-[0_0_10px_rgba(128,0,128,0.2)]"
              >
                [ 靠近钟楼 ] 窥视高塔
              </button>
            </div>
          )}

          {room.id === 'Watchtower' && (
            <div className="flex flex-col gap-2 p-3 bg-[#060a12] border border-[#1a2a40] shadow-[0_0_15px_rgba(30,80,180,0.15)]">
              <div className="text-[10px] text-blue-400 font-bold uppercase text-center border-b border-blue-900/50 pb-1 mb-1 tracking-[2px]">
                瞭望塔
              </div>
              <button
                onClick={() => {
                  s.status = 'watchtower_intro';
                  forceRender();
                }}
                className="w-full h-[36px] text-[12px] border border-blue-700 text-blue-400 uppercase transition-all hover:bg-blue-700/20 hover:text-blue-300 cursor-pointer font-bold"
              >
                [ 登台瞭望 ] 俯瞰城堡全景
              </button>
            </div>
          )}

          {room.id === 'Armory' && (
            <div className="flex flex-col gap-2 p-3 bg-[#0a0f0a] border border-[#1a2f1a]">
              <div className="text-[10px] text-[#a0c5a0] uppercase font-bold text-center border-b border-[#1a2f1a]/50 pb-1 mb-1">废弃的行刑架</div>
              <button
                onClick={() => { s.status = s.hasMetScavenger ? 'shop' : 'shop_intro'; forceRender(); }}
                className="w-full h-[36px] text-[12px] border border-[#708070] text-[#a0c5a0] hover:bg-[#708070]/20 uppercase transition-colors cursor-pointer"
              >
                [ 与盲眼的提灯拾荒者交易 ]
              </button>
            </div>
          )}
        </div>

      </div>
    </React.Fragment>
  );
};

const CombatSidebarPanel = ({ stateRef }: { stateRef: React.MutableRefObject<GameState> }) => {
  const s = stateRef.current;
  const cd = s.combatData;
  if (!cd) return null;
  const roomName = ROOMS[cd.roomId].name;

  return (
    <div className="flex flex-col mb-4 pb-4 border-b border-theme-red/50 relative">
      <div className="absolute inset-0 bg-theme-red/5 animate-pulse rounded pointer-events-none"></div>

      <div className="text-[12px] text-theme-red font-bold uppercase border-b border-theme-red/40 pb-1 mb-3 shrink-0 flex items-center justify-between px-1 relative">
        <span className="flex items-center gap-1">
          <Swords size={16} /> 遭遇战探测
        </span>
        <span className="text-[10px] animate-pulse">锁门交火中...</span>
      </div>

      <div className="text-[11px] text-theme-text mb-2 px-1 text-center bg-black/40 py-1 relative">
        交战区域：<span className="text-theme-red font-bold tracking-widest">[{roomName}]</span>
      </div>

      <div className="text-center text-[10px] text-[#8b949e]">
        请查看位于画面中央的主视野分析面板。
      </div>
    </div>
  );
};

const NpcStatePanel = ({ stateRef }: { stateRef: React.MutableRefObject<GameState> }) => {
  const s = stateRef.current;
  const aliveNpcs = s.npcs.filter(n => !n.isDead);

  return (
    <div className="flex flex-col mb-4 pb-4 border-b border-theme-border/50">
      <div className="text-[12px] text-theme-red uppercase border-b border-theme-red/40 pb-1 mb-3 shrink-0 flex items-center justify-between">
        <span className="flex items-center gap-1">
          <Activity size={14} /> 敌对目标探测 ({aliveNpcs.length})
        </span>
        {s.status === 'playing' ? (
          <span className="text-[10px] animate-pulse">流感应追踪</span>
        ) : (
          <span className="text-[10px] opacity-50">信号遮蔽</span>
        )}
      </div>

      {aliveNpcs.length === 0 && (
        <div className="text-[10px] text-[#8b949e] italic text-center py-4 border border-theme-border/30">
          没有探测到任何敌意实体。
        </div>
      )}

      <div className="space-y-4 pr-1">
        {aliveNpcs.map(npc => {
          const hp = calcHP(npc.attrs);
          const room = ROOMS[npc.loc];
          return (
            <div key={npc.id} className="border border-theme-red/20 p-2 relative bg-black/40">
              <div className="absolute top-0 right-0 p-1 flex items-center justify-center">
                <div style={{
                  borderLeft: '4px solid transparent',
                  borderRight: '4px solid transparent',
                  borderBottom: `8px solid ${npc.color}`,
                }} />
              </div>
              <div className="text-[10px] font-bold text-theme-red mb-1 tracking-widest">{npc.name}</div>

              <div className="flex justify-between items-center bg-black border border-theme-red/30 p-1 mb-2 relative overflow-hidden">
                <div className="absolute left-0 top-0 h-full bg-[linear-gradient(90deg,var(--color-theme-red),transparent)] opacity-20 transition-all duration-200" style={{ width: `${Math.min(100, Math.max(0, hp))}%` }}></div>
                <span className="font-semibold text-theme-red text-[9px] z-10 relative">HP</span>
                <span className="text-[12px] font-bold z-10 relative text-theme-red">{hp.toFixed(1)}</span>
              </div>

              <div className="grid grid-cols-2 gap-1 mb-2">
                {(Object.keys(ATTR_NAMES) as AttrType[]).map(key => (
                  <div key={key} className="flex justify-between items-end text-[9px] px-1 border-b border-theme-red/10">
                    <span className="text-theme-red/60">{ATTR_NAMES[key]}</span>
                    <span className="text-theme-red font-bold font-mono">{npc.attrs[key].toFixed(1)}</span>
                  </div>
                ))}
              </div>

              <div className="text-[9px] text-theme-red/60 flex justify-between">
                <span>区域信号:</span>
                <span className="font-bold">{room.name}</span>
              </div>

              {(s.hasOmniscienceEye || s.debugShowIntentions) && (
                <div className="text-[9px] text-theme-red/80 mt-1 flex justify-between border-t border-theme-red/10 pt-1">
                  <span>下次位移:</span>
                  <span className="font-bold text-yellow-500">{(npc.nextMoveWait - npc.moveTimer).toFixed(1)}s</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const LogsPanel = ({ stateRef }: { stateRef: React.MutableRefObject<GameState> }) => {
  const logsEndRef = useRef<HTMLDivElement>(null);
  const s = stateRef.current;

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [s.logs]);

  return (
    <React.Fragment>
      <div className="text-[12px] text-theme-cyan uppercase border-b border-theme-border pb-1 mb-3 flex items-center gap-2">
        通信日志
      </div>

      <div className="pr-1 text-[12px] leading-[1.6] text-[#8b949e]">
        {s.logs.slice(-100).map((log, idx) => {
          const isDanger = log.includes('⚔️') || log.includes('💀') || log.includes('🔴');
          const isCombatSystem = log.includes('警告') || log.includes('遭遇战');
          let colorCls = "border-theme-border";
          let txtCls = "text-[#8b949e]";

          if (isDanger || isCombatSystem) {
            colorCls = "border-theme-red";
            txtCls = "text-theme-red";
          } else if (log.includes('系统') || log.includes('NPC') || log.includes('跳跃')) {
            colorCls = "border-theme-cyan";
            txtCls = "text-theme-cyan";
          }

          return (
            <div key={idx} className={`mb-2 pl-[10px] border-l-2 custom-scrollbar ${colorCls} break-words`}>
              <span className={txtCls}>{log}</span>
            </div>
          );
        })}
        <div ref={logsEndRef} />
      </div>
    </React.Fragment>
  );
};

const ReadingOverlay = ({ stateRef, forceRender }: { stateRef: React.MutableRefObject<GameState>, forceRender: () => void }) => {
  const s = stateRef.current;
  const rd = s.readingData;
  if (!rd) return null;

  const handleWordClick = (wordId: number) => {
    const word = rd.words.find(w => w.id === wordId);
    if (word && word.isCorrupt) {
      word.isCorrupt = false;
      // Provide a small instant relief to the bar as feedback
      rd.corruption = Math.max(0, rd.corruption - 2.5);
      playSound('read_click');
      forceRender();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 font-mono">
      <div className="absolute inset-0 bg-[#0a0000] opacity-30 pointer-events-none" />

      <div id="book-frame" className="relative w-full max-w-2xl bg-[#0f0a05] border-2 border-[#3d2b1f] p-8 sm:p-12 shadow-[0_0_50px_rgba(0,0,0,1)] overflow-hidden">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-theme-border/20">
          <div className="bg-theme-cyan h-full transition-all duration-300" style={{ width: `${(rd.timer / 10) * 100}%` }} />
        </div>

        {/* Corruption Bar */}
        <div className="absolute top-2 right-4 text-[10px] text-theme-red uppercase tracking-widest font-bold">
          腐蚀度: {rd.corruption.toFixed(0)}%
        </div>
        <div className="absolute top-1 right-0 w-full h-[2px] bg-theme-red/10 overflow-hidden">
          <div className="bg-theme-red h-full transition-all duration-100" style={{ width: `${rd.corruption}%` }} />
        </div>

        <div className="text-[12px] text-[#4d3a2b] uppercase mb-8 border-b border-[#3d2b1f] pb-2 flex justify-between items-center">
          <span>{rd.bookType === 50 ? '禁断典籍: 《拉莱耶残卷》' : '生体导论: 《活体演化》'}</span>
          <span className="text-theme-cyan animate-pulse">智力等级: {rd.bookType}</span>
        </div>

        <div className="relative leading-[1.8] text-[16px] sm:text-[18px] text-[#a08b7a] flex flex-wrap gap-x-2 gap-y-1 select-none">
          {rd.words.map((w) => (
            <span
              key={w.id}
              onClick={() => handleWordClick(w.id)}
              className={`transition-all duration-200 cursor-pointer relative ${w.isCorrupt ? 'text-theme-red font-bold animate-[pulse_0.4s_infinite]' : 'hover:text-theme-cyan'}`}
              style={{
                display: 'inline-block',
                transform: w.isCorrupt ? `translate(${Math.random() * 4 - 2}px, ${Math.random() * 4 - 2}px) rotate(${w.rot}deg)` : 'none',
                filter: w.isCorrupt ? `blur(${Math.random() * 2}px)` : 'none',
              }}
            >
              {w.isCorrupt ? 'ERR_CORRUPT' : w.text}
            </span>
          ))}
        </div>

        <div className="mt-12 text-center text-[11px] text-[#4d3a2b] uppercase tracking-[4px]">
          在文字崩溃前点击它们执行 [ 净化 ]
        </div>
      </div>
    </div>
  );
};

const ShopIntroOverlay = ({ stateRef, forceRender }: { stateRef: React.MutableRefObject<GameState>, forceRender: () => void }) => {
  const s = stateRef.current;
  if (s.status !== 'shop_intro') return null;

  return (
    <div className="absolute inset-0 z-[110] pointer-events-none flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm pointer-events-auto" />

      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-3xl flex flex-col gap-4 pointer-events-auto"
      >
        <div className="flex-1 bg-[#050a05] border border-[#1a2f1a] shadow-[0_0_40px_rgba(0,40,0,0.6)] overflow-hidden flex flex-col">
          <div className="h-1 w-full bg-[linear-gradient(90deg,transparent,#3a8f3a,transparent)]" />
          <div className="px-6 py-4 border-b border-[#1a2f1a] flex justify-between items-center bg-black/50">
            <span className="text-[12px] uppercase tracking-[0.2em] font-bold text-[#708070]">Entity Encounter</span>
            <span className="text-[11px] font-mono tracking-widest text-[#a0c5a0] animate-pulse">
              {'>>> THE_BLIND_SCAVENGER'}
            </span>
          </div>
          <div className="p-6 sm:p-10 flex-col items-center justify-center bg-[#030603]">
            <div className="text-[16px] sm:text-[18px] leading-[2.0] text-[#a0c5a0] font-sans font-medium tracking-wide w-full indent-8 text-justify">
              “在满是铁锈的墙角阴影里，一个佝偻的无面生物正在咀嚼着一柄断剑。它察觉到了你的靠近，缓缓放下了手中散发着惨绿幽光的提灯。”
              <br /><br />
              “这怪物长袍下延伸出来的，是由纯粹的影之触手所构成的密密麻麻的肢体。它那本该是脸的地方，只有一道深不可测的骇人裂口。”
              <br /><br />
              “裂口对准了你，发出空灵而多重的低语：”
              <br /><br />
              <span className="italic font-bold text-white">‘这座城堡正在被时间遗忘……交出那些锈蚀的记忆币，我愿意把我收集的小玩具借给你。’</span>
            </div>

            <div className="mt-10 flex justify-center w-full">
              <button
                onClick={() => {
                  s.status = 'shop';
                  s.hasMetScavenger = true;
                  playSound('absorb');
                  forceRender();
                }}
                className="px-8 py-3 bg-transparent border border-[#3a8f3a] text-[#3a8f3a] hover:bg-[#3a8f3a]/20 hover:text-white transition uppercase tracking-widest font-bold"
              >
                [ 继续 ]
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const WatchtowerIntroOverlay = ({ stateRef, forceRender }: { stateRef: React.MutableRefObject<GameState>, forceRender: () => void }) => {
  const s = stateRef.current;
  if (s.status !== 'watchtower_intro') return null;

  return (
    <div className="absolute inset-0 z-[110] pointer-events-none flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm pointer-events-auto" />

      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-3xl flex flex-col gap-4 pointer-events-auto"
      >
        <div className="flex-1 bg-[#050810] border border-[#1a2a40] shadow-[0_0_40px_rgba(30,80,180,0.4)] overflow-hidden flex flex-col">
          <div className="h-1 w-full bg-[linear-gradient(90deg,transparent,#3a7ab0,transparent)]" />
          <div className="px-6 py-4 border-b border-[#1a2a40] flex justify-between items-center bg-black/50">
            <span className="text-[12px] uppercase tracking-[0.2em] font-bold text-[#5a7090]">Watchtower Survey</span>
            <span className="text-[11px] font-mono tracking-widest text-[#90b0d0] animate-pulse">
              {'>>> PANORAMIC_SCAN_MODE'}
            </span>
          </div>
          <div className="p-6 sm:p-10 flex-col items-center justify-center bg-[#030508]">
            <div className="text-[16px] sm:text-[18px] leading-[2.0] text-[#90b0d0] font-sans font-medium tracking-wide w-full indent-8 text-justify">
              "你攀上瞭望台的最高处，用双手扚住冰冷的石坠，将目光投向那片浓稠如墨汁的黑暗。"
              <br /><br />
              "城堡在你脚下静静地腐机着，走廊里有光在不规律地闪烁——那不是火焰，也不是电光，而是某种拥有自主意识的发光体，正懒洋洋地在墙壁之间爬行。"
            </div>

            <div className="mt-10 flex justify-center w-full gap-4">
              <button
                onClick={() => {
                  s.status = 'playing';
                  forceRender();
                }}
                className="px-8 py-3 bg-transparent border border-[#555] text-[#555] hover:bg-[#555]/20 hover:text-white transition uppercase tracking-widest font-bold"
              >
                [ 收回目光 ]
              </button>
              <button
                onClick={() => {
                  s.lookoutMode = true;
                  s.lookoutPanX = ROOM_LAYOUT[s.playerLoc].x * 140;
                  s.lookoutPanY = ROOM_LAYOUT[s.playerLoc].y * 140;
                  s.status = 'playing';
                  forceRender();
                }}
                className="px-8 py-3 bg-transparent border border-[#3a7ab0] text-[#90b0d0] hover:bg-[#3a7ab0]/20 hover:text-white transition uppercase tracking-widest font-bold cursor-pointer"
              >
                [ 登上顶端 ] 开始瞭望
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const BellTowerIntroOverlay = ({ stateRef, forceRender }: { stateRef: React.MutableRefObject<GameState>, forceRender: () => void }) => {
  const s = stateRef.current;
  if (s.status !== 'belltower_intro') return null;
  const onCooldown = s.bellCooldownTimer > 0;

  return (
    <div className="absolute inset-0 z-[110] pointer-events-none flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm pointer-events-auto" />

      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-3xl flex flex-col gap-4 pointer-events-auto"
      >
        <div className="flex-1 bg-[#0a050f] border border-[#2f1a3a] shadow-[0_0_40px_rgba(80,0,120,0.5)] overflow-hidden flex flex-col">
          <div className="h-1 w-full bg-[linear-gradient(90deg,transparent,#8f3ab0,transparent)]" />
          <div className="px-6 py-4 border-b border-[#2f1a3a] flex justify-between items-center bg-black/50">
            <span className="text-[12px] uppercase tracking-[0.2em] font-bold text-[#7a6090]">Bell Tower Access</span>
            <span className="text-[11px] font-mono tracking-widest text-[#c5a0e0] animate-pulse">
              {'>>> RESONANCE_DETECTED'}
            </span>
          </div>
          <div className="p-6 sm:p-10 flex-col items-center justify-center bg-[#060309]">
            <div className="text-[16px] sm:text-[18px] leading-[2.0] text-[#c5a0e0] font-sans font-medium tracking-wide w-full indent-8 text-justify">
              "这并不是一座普通的钟楼。所谓的'钟'，是一颗由无数人类头骨和暗金矿石熔铸而成的庞大球体。每当有风吹过，头骨的眼眶里便会发出窃窃私语般的嘶嘶声。"
              <br /><br />
              "塔壁上沾满了干涸的黑色粘液，空气中弥漫着令人作呕的铁锈与绝望的气息。连接巨钟的钟绳浸泡在某种黏性液体中，你能感觉到它在你手心里轻微地颤抖——如同一个活物在等待被唤醒。"
            </div>

            {onCooldown && (
              <div className="mt-6 text-center text-[12px] text-purple-400/60 font-mono animate-pulse">
                ⏳ 钟声余波尚未散去... 冷却中 [ {Math.ceil(s.bellCooldownTimer)}s ]
              </div>
            )}

            <div className="mt-10 flex justify-center w-full gap-4">
              <button
                onClick={() => {
                  s.status = 'playing';
                  forceRender();
                }}
                className="px-8 py-3 bg-transparent border border-[#555] text-[#555] hover:bg-[#555]/20 hover:text-white transition uppercase tracking-widest font-bold"
              >
                [ 抑制疯狂 ]
              </button>
              <button
                disabled={onCooldown}
                onClick={() => {
                  if (!onCooldown) {
                    s.playerAttrs.intelligence = Math.max(0, s.playerAttrs.intelligence - 5);
                    s.playerAttrs = snapAll(s.playerAttrs);
                    playSound('read_corrupt');
                    s.bellAttractTimer = 20.0;
                    s.bellCooldownTimer = 30.0;
                    addLog(s, '🔔 [钟楼] 刺耳的灵魂嘶嚎声自塔顶炸裂而出，在整个城堡的走廊里回荡...');
                    s.status = 'belltower_rung';
                    forceRender();
                  }
                }}
                className={`px-8 py-3 bg-transparent border uppercase tracking-widest font-bold transition ${onCooldown ? 'border-[#4a2a55]/50 text-[#4a2a55]/50 cursor-not-allowed' : 'border-[#8f3ab0] text-[#c080e0] hover:bg-[#8f3ab0]/20 hover:text-white cursor-pointer'}`}
              >
                {onCooldown ? `[ 冷却中 ${Math.ceil(s.bellCooldownTimer)}s ]` : '[ 叩响巨钟 ] 消耗 5 智力'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const BellTowerRungOverlay = ({ stateRef, forceRender }: { stateRef: React.MutableRefObject<GameState>, forceRender: () => void }) => {
  const s = stateRef.current;
  if (s.status !== 'belltower_rung') return null;

  return (
    <div className="absolute inset-0 z-[110] pointer-events-none flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm pointer-events-auto" />

      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-3xl flex flex-col gap-4 pointer-events-auto"
      >
        <div className="flex-1 bg-[#0a050f] border border-[#2f1a3a] shadow-[0_0_50px_rgba(120,0,160,0.6)] overflow-hidden flex flex-col">
          <div className="h-1 w-full bg-[linear-gradient(90deg,transparent,#b060d0,transparent)]" />
          <div className="px-6 py-4 border-b border-[#2f1a3a] flex justify-between items-center bg-black/50">
            <span className="text-[12px] uppercase tracking-[0.2em] font-bold text-[#8a50a0]">Resonance Triggered</span>
            <span className="text-[11px] font-mono tracking-widest text-[#d0a0f0] animate-pulse">
              {'>>> ENTITY_CONVERGENCE_ACTIVE'}
            </span>
          </div>
          <div className="p-6 sm:p-10 flex-col items-center justify-center bg-[#060309]">
            <div className="text-[16px] sm:text-[18px] leading-[2.0] text-[#d0a0f0] font-sans font-medium tracking-wide w-full indent-8 text-justify">
              "你狠下心，拉动了那根沾满粘液的钟绳。"
              <br /><br />
              "刺耳的、不似人类能发出的恐怖尖啸声从'巨钟'内爆发出来，仿佛成百上千个灵魂在同时哀嚎。这凄厉的声波不仅刺痛了你的大脑，更直接穿透了虚空。你感觉到某些东西从你的意识深处被强行抽取——那是清醒，那是理智，那是你曾经以为牢不可破的认知边界。"
              <br /><br />
              "那些在城堡里游荡的扭曲畸变体听到了这如同进食信号般的呼唤，正迈着癫狂的步伐，从四面八方向你所在的塔楼涌来。"
            </div>
            <div className="mt-6 text-center text-[11px] text-purple-400/70 font-mono">
              ⚠️ 异响持续 20 秒 · 智力 -5 · 钟声吸引已激活
            </div>
            <div className="mt-10 flex justify-center w-full">
              <button
                onClick={() => {
                  s.status = 'playing';
                  forceRender();
                }}
                className="px-10 py-3 bg-transparent border border-[#8f3ab0] text-[#c080e0] hover:bg-[#8f3ab0]/20 hover:text-white transition uppercase tracking-widest font-bold cursor-pointer"
              >
                [ 继续探索 ]
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const PassageIntroOverlay = ({ stateRef, forceRender }: { stateRef: React.MutableRefObject<GameState>, forceRender: () => void }) => {

  const s = stateRef.current;
  if (s.status !== 'passage_intro') return null;

  return (
    <div className="absolute inset-0 z-[110] pointer-events-none flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm pointer-events-auto" />

      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-3xl flex flex-col gap-4 pointer-events-auto"
      >
        <div className="flex-1 bg-[#0a0505] border border-[#2f1a1a] shadow-[0_0_40px_rgba(40,0,0,0.6)] overflow-hidden flex flex-col">
          <div className="h-1 w-full bg-[linear-gradient(90deg,transparent,#8f3a3a,transparent)]" />
          <div className="px-6 py-4 border-b border-[#2f1a1a] flex justify-between items-center bg-black/50">
            <span className="text-[12px] uppercase tracking-[0.2em] font-bold text-[#807070]">Anomaly Detected</span>
            <span className="text-[11px] font-mono tracking-widest text-[#c5a0a0] animate-pulse">
              {'>>> SPATIAL_GLITCH_ENTRY'}
            </span>
          </div>
          <div className="p-6 sm:p-10 flex-col items-center justify-center bg-[#060303]">
            <div className="text-[16px] sm:text-[18px] leading-[2.0] text-[#c5a0a0] font-sans font-medium tracking-wide w-full indent-8 text-justify">
              “这里的空气粘稠得像腐烂的沼泽。墙壁上的一道裂缝正像伤口一样微微律动，从黑暗深处传来了某种极其古老且节奏错乱的呼吸声。”
              <br /><br />
              “你感觉到有什么东西正在裂缝后窥视。那不是眼睛，而是一种超越感知的恶意。每一个毛孔都在尖叫着让你离开，但一种扭曲的吸引力正把你拽向那深邃的虚无。”
            </div>

            <div className="mt-10 flex justify-center w-full gap-4">
              <button
                onClick={() => {
                  s.status = 'playing';
                  forceRender();
                }}
                className="px-8 py-3 bg-transparent border border-[#555] text-[#555] hover:bg-[#555]/20 hover:text-white transition uppercase tracking-widest font-bold"
              >
                [ 抑制好奇 ]
              </button>
              <button
                onClick={() => {
                  s.status = 'chasing';
                  s.chaseData = {
                    playerRooms: 0,
                    monsterDistance: -2,
                    targetRooms: 20,
                    speed: 1.5
                  };
                  addLog(s, `🏃 [警告] 你踏入了一条望不到尽头的长廊，身后传来令人不寒而栗的快速脚步声...`);
                  forceRender();
                }}
                className="px-8 py-3 bg-transparent border border-[#8f3a3a] text-[#8f3a3a] hover:bg-[#8f3a3a]/20 hover:text-white transition uppercase tracking-widest font-bold"
              >
                [ 踏入深渊 ]
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const PassageFailureOverlay = ({ stateRef, forceRender }: { stateRef: React.MutableRefObject<GameState>, forceRender: () => void }) => {
  const s = stateRef.current;
  if (s.status !== 'passage_failure') return null;

  return (
    <div className="absolute inset-0 z-[110] pointer-events-none flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm pointer-events-auto" />

      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-3xl flex flex-col gap-4 pointer-events-auto"
      >
        <div className="flex-1 bg-[#0a0505] border border-[#2f1a1a] shadow-[0_0_40px_rgba(40,0,0,0.6)] overflow-hidden flex flex-col">
          <div className="h-1 w-full bg-[linear-gradient(90deg,transparent,#8f3a3a,transparent)]" />
          <div className="px-6 py-4 border-b border-[#2f1a1a] flex justify-between items-center bg-black/50">
            <span className="text-[12px] uppercase tracking-[0.2em] font-bold text-[#807070]">Sequence Aborted</span>
            <span className="text-[11px] font-mono tracking-widest text-[#c5a0a0] animate-pulse">
              {'>>> SPATIAL_EJECTION'}
            </span>
          </div>
          <div className="p-6 sm:p-10 flex-col items-center justify-center bg-[#060303]">
            <div className="text-[16px] sm:text-[18px] leading-[2.0] text-[#c5a0a0] font-sans font-medium tracking-wide w-full indent-8 text-justify">
              “黑暗中的触手将你猛然拽回了起点，那冰冷的粘液让你打了个寒颤。你尚未被完全消化，但某种意志正逼迫你重新开始。”
              <br /><br />
              “那股力量在嘲弄你的软弱，虚无的低语在你脑海中回荡：‘回去……回到那无尽的循环中去。’”
            </div>

            <div className="mt-10 flex justify-center w-full">
              <button
                onClick={() => {
                  s.status = 'chasing';
                  s.chaseData = {
                    playerRooms: 0,
                    monsterDistance: -2,
                    targetRooms: 20,
                    speed: 1.5
                  };
                  addLog(s, `👣 你在战栗中重新站起，再次踏入那条被诅咒的长廊...`);
                  forceRender();
                }}
                className="px-8 py-3 bg-transparent border border-[#8f3a3a] text-[#8f3a3a] hover:bg-[#8f3a3a]/20 hover:text-white transition uppercase tracking-widest font-bold"
              >
                [ 再次尝试 ]
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const PassageVictoryOverlay = ({ stateRef, forceRender }: { stateRef: React.MutableRefObject<GameState>, forceRender: () => void }) => {
  const s = stateRef.current;
  if (s.status !== 'passage_victory') return null;

  return (
    <div className="absolute inset-0 z-[110] pointer-events-none flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm pointer-events-auto" />

      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-3xl flex flex-col gap-4 pointer-events-auto"
      >
        <div className="flex-1 bg-[#050a0a] border border-[#1a2f2f] shadow-[0_0_40px_rgba(0,40,40,0.6)] overflow-hidden flex flex-col">
          <div className="h-1 w-full bg-[linear-gradient(90deg,transparent,#3a8f8f,transparent)]" />
          <div className="px-6 py-4 border-b border-[#1a2f2f] flex justify-between items-center bg-black/50">
            <span className="text-[12px] uppercase tracking-[0.2em] font-bold text-[#708080]">Evolution Complete</span>
            <span className="text-[11px] font-mono tracking-widest text-[#a0c5c5] animate-pulse">
              {'>>> OMNISCIENCE_EYE_AQUIRED'}
            </span>
          </div>
          <div className="p-6 sm:p-10 flex-col items-center justify-center bg-[#030606]">
            <div className="text-[16px] sm:text-[18px] leading-[2.0] text-[#a0c5c5] font-sans font-medium tracking-wide w-full indent-8 text-justify">
              “一颗布满血丝、瞳孔不断收缩的眼球从虚空中跌落，在触碰你的一瞬间化作冰冷的液体渗入你的眼眶。一种沉重的‘知晓’感充斥了你的大脑。”
              <br /><br />
              “你的视线瞬间撕裂了现实的帷幕，那些怪物在迷宫中潜行的阴影、它们即将落下的脚步，都像墨水在清水中扩散般清晰可见。你从此不再盲目地奔逃，因为你已经看透了那些游荡者的舞步。”
            </div>

            <div className="mt-8 flex flex-col gap-2 w-full max-w-sm mx-auto">
              <div className="flex justify-between text-[14px] border-b border-[#1a2f2f] pb-1">
                <span className="text-[#708080]">智力 (INT)</span>
                <span className="text-[#a0c5c5] font-bold">+10.0</span>
              </div>
              <div className="flex justify-between text-[14px] border-b border-[#1a2f2f] pb-1">
                <span className="text-[#708080]">注意力 (FOC)</span>
                <span className="text-[#a0c5c5] font-bold">+10.0</span>
              </div>
            </div>

            <div className="mt-10 flex justify-center w-full">
              <button
                onClick={() => {
                  s.status = 'playing';
                  forceRender();
                }}
                className="px-8 py-3 bg-transparent border border-[#3a8f8f] text-[#3a8f8f] hover:bg-[#3a8f8f]/20 hover:text-white transition uppercase tracking-widest font-bold"
              >
                [ 彻底看穿 ]
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
const InventoryOverlay = ({ stateRef, forceRender }: { stateRef: React.MutableRefObject<GameState>, forceRender: () => void }) => {
  const s = stateRef.current;
  if (s.status !== 'inventory') return null;

  // Count items to group them
  const itemCounts = s.inventory.reduce((acc, item) => {
    acc[item] = (acc[item] || 0) + 1;
    return acc;
  }, {} as Record<ItemType, number>);

  const handleUseItem = (item: ItemType) => {
    const itemIndex = s.inventory.indexOf(item);
    if (itemIndex > -1) {
      s.inventory.splice(itemIndex, 1);
      if (item === 'ether_potion') {
        s.invisibilityTimer = 5.0;
        addLog(s, `✨ 你饮下了【隐世药剂】，获得了虚无状态！`);
      } else if (item === 'hourglass') {
        s.instantReallocActive = true;
        addLog(s, `⏳ 【时光沙漏】已激活！下一次属性重组将瞬间完成！`);
      } else if (item === 'straw_doll') {
        s.traps.push(s.playerLoc as RoomId);
        addLog(s, `🔥 你在 ${ROOMS[s.playerLoc as RoomId].name} 放置了【厄运稻草人】。`);
        const npcInRoom = s.npcs.find(n => !n.isDead && n.loc === s.playerLoc);
        if (npcInRoom) {
          s.traps = s.traps.filter(t => t !== s.playerLoc);
          addLog(s, `🔥 刚放置的厄运稻草人立即被 ${npcInRoom.name} 触发，全属性强制削弱！`);
          for (let key in npcInRoom.attrs) {
            npcInRoom.attrs[key as AttrType] = Math.max(0, npcInRoom.attrs[key as AttrType] / 2);
          }
        }
      }
      forceRender();
    }
  };

  const itemDetails: Record<ItemType, { name: string, desc: string, color: string }> = {
    'ether_potion': { name: '深渊浓缩液 [隐世药剂]', desc: '饮用后短暂脱离物质位面，屏蔽所有实体的感知与恶意。持续 5 秒。', color: 'cyan' },
    'hourglass': { name: '遗容碎片 [时光沙漏]', desc: '碾碎它以扭曲局部时间流速，使下一次属性重组不再需要时间读条，瞬间完成。', color: 'yellow' },
    'straw_doll': { name: '受诅咒的扎草体 [厄运稻草人]', desc: '将其遗弃在当前房间作为陷阱。踏入此地的第一个实体将遭到恐怖诅咒，其所有属性被强制削减 50%。', color: 'purple' }
  };

  return (
    <div className="absolute inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-4xl bg-[#0a0f14] border border-cyan-900/40 shadow-[0_0_50px_rgba(0,150,200,0.15)] overflow-hidden flex flex-col max-h-[85vh]"
      >
        <div className="h-1 w-full bg-[linear-gradient(90deg,transparent,#00ffff,transparent)] opacity-50" />
        <div className="px-6 py-4 border-b border-cyan-900/30 flex justify-between items-center bg-black/60">
          <span className="text-[14px] uppercase tracking-[0.3em] font-bold text-cyan-700/80">Void Repository</span>
          <span className="text-[11px] font-mono tracking-widest text-cyan-500/60 animate-pulse">
            {'>>> INVENTORY_ACCESS'}
          </span>
        </div>

        <div className="p-6 sm:p-8 flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-4 bg-[#05080a]">
          {Object.keys(itemCounts).length === 0 ? (
            <div className="flex-1 flex items-center justify-center min-h-[300px]">
              <span className="text-cyan-900/50 text-[14px] tracking-widest uppercase italic">空无一物... (Empty)</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(itemCounts).map(([itemKey, count]) => {
                const item = itemKey as ItemType;
                const details = itemDetails[item];
                if (!details) return null;

                return (
                  <div key={item} className={`border border-${details.color}-900/30 bg-black/40 p-4 flex flex-col gap-3 group hover:border-${details.color}-700/50 transition-colors`}>
                    <div className="flex justify-between items-start border-b border-[#1a2f3a] pb-2">
                      <span className={`text-${details.color}-500 font-bold tracking-wide text-[14px]`}>{details.name}</span>
                      <span className={`text-${details.color}-400/80 font-mono text-[12px] bg-${details.color}-950/30 px-2 py-0.5 rounded-sm border border-${details.color}-900/30`}>x{count}</span>
                    </div>
                    <div className="text-[12px] text-[#8a9fae] leading-relaxed text-justify min-h-[60px]">
                      {details.desc}
                    </div>
                    <div className="mt-auto pt-2">
                      <button
                        onClick={() => handleUseItem(item)}
                        className={`w-full py-2 bg-${details.color}-950/20 border border-${details.color}-900/50 text-${details.color}-500/80 hover:bg-${details.color}-900/40 hover:text-${details.color}-400 hover:border-${details.color}-600 uppercase text-[12px] tracking-widest font-bold transition-all`}
                      >
                        [ 提取并使用 ]
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 bg-black/80 border-t border-cyan-900/30 flex justify-center">
          <button
            onClick={() => { s.status = 'playing'; forceRender(); }}
            className="w-full max-w-[200px] bg-transparent border border-gray-700 text-gray-500 hover:border-gray-500 hover:text-gray-300 py-3 text-[12px] uppercase font-bold tracking-[0.2em] transition-all cursor-pointer"
          >
            [ 关闭屏障 ]
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const ShopOverlay = ({ stateRef, forceRender }: { stateRef: React.MutableRefObject<GameState>, forceRender: () => void }) => {
  const s = stateRef.current;
  if (s.status !== 'shop') return null;

  const handleBuy = (item: string, cost: number, onBuy: () => void) => {
    if (!s.debugInfiniteCoins && s.rustedCoins < cost) {
      addLog(s, `❌ 你的记忆币不足以支付代价...`);
      forceRender();
      return;
    }
    if (!s.debugInfiniteCoins) s.rustedCoins -= cost;
    onBuy();
    playSound('absorb');
    forceRender();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 font-mono">
      <div className="absolute inset-0 bg-[#0a0000] opacity-30 pointer-events-none" />

      <div className="relative w-full max-w-3xl bg-[#0a0f0a] border-2 border-[#1a2f1a] p-6 sm:p-10 shadow-[0_0_50px_rgba(0,40,0,0.5)] overflow-hidden flex flex-col gap-6">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,var(--color-theme-green)_10px,var(--color-theme-green)_11px)] opacity-[0.02] pointer-events-none" />

        <h2 className="text-[#a0c5a0] text-[24px] uppercase tracking-widest font-bold border-b border-[#1a2f1a] pb-2 text-center">
          【盲眼的提灯拾荒者】
        </h2>

        <div className="text-[14px] text-[#708070] italic text-center py-2">
          “交出你收集的记忆币... 我会把这些小玩具借给你...”
        </div>

        <div className="text-right text-[#d4c3b5] text-[16px] font-bold">
          当前持有: {s.debugInfiniteCoins ? '∞' : s.rustedCoins} 🪙 记忆币
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button onClick={() => handleBuy('+5 力量', 10, () => { s.playerAttrs.strength += 5; addLog(s, '📦 拾荒者刺入了一股狂暴的铁锈入你体内，力量+5。'); })} disabled={!s.debugInfiniteCoins && s.rustedCoins < 10} className={`p-3 border border-[#1a2f1a] hover:bg-[#1a2f1a]/50 text-left transition flex justify-between group ${(!s.debugInfiniteCoins && s.rustedCoins < 10) ? 'opacity-30 cursor-not-allowed' : ''}`}>
            <span className="text-[#a0c5a0] font-bold group-hover:text-white transition">+5 局部肢体强化 (力量)</span>
            <span className="text-[#d4c3b5]">10 🪙</span>
          </button>
          <button onClick={() => handleBuy('+5 耐力', 10, () => { s.playerAttrs.stamina += 5; addLog(s, '📦 拾荒者将粘稠的防腐剂灌入你的脉络，耐力+5。'); })} disabled={!s.debugInfiniteCoins && s.rustedCoins < 10} className={`p-3 border border-[#1a2f1a] hover:bg-[#1a2f1a]/50 text-left transition flex justify-between group ${(!s.debugInfiniteCoins && s.rustedCoins < 10) ? 'opacity-30 cursor-not-allowed' : ''}`}>
            <span className="text-[#a0c5a0] font-bold group-hover:text-white transition">+5 痛觉隔绝注射 (耐力)</span>
            <span className="text-[#d4c3b5]">10 🪙</span>
          </button>
          <button onClick={() => handleBuy('时光沙漏', 20, () => { s.inventory.push('hourglass'); addLog(s, '📦 获得了[时光沙漏]，可以直接瞬间重组属性。'); })} disabled={!s.debugInfiniteCoins && s.rustedCoins < 20} className={`p-3 border border-[#1a2f1a] hover:bg-[#1a2f1a]/50 text-left transition flex justify-between group ${(!s.debugInfiniteCoins && s.rustedCoins < 20) ? 'opacity-30 cursor-not-allowed' : ''}`}>
            <span className="text-yellow-600 font-bold group-hover:text-yellow-400 transition">遗容碎片 [时光沙漏]</span>
            <span className="text-[#d4c3b5]">20 🪙</span>
          </button>
          <button onClick={() => handleBuy('隐世药剂', 20, () => { s.inventory.push('ether_potion'); addLog(s, '📦 获得了[隐世药剂]，使用后隐身30秒避开灾厄。'); })} disabled={!s.debugInfiniteCoins && s.rustedCoins < 20} className={`p-3 border border-[#1a2f1a] hover:bg-[#1a2f1a]/50 text-left transition flex justify-between group ${(!s.debugInfiniteCoins && s.rustedCoins < 20) ? 'opacity-30 cursor-not-allowed' : ''}`}>
            <span className="text-cyan-600 font-bold group-hover:text-cyan-400 transition">深渊浓缩液 [隐世药剂]</span>
            <span className="text-[#d4c3b5]">20 🪙</span>
          </button>
          <button onClick={() => handleBuy('厄运稻草人', 30, () => { s.inventory.push('straw_doll'); addLog(s, '📦 获得了极度危险的[厄运稻草人]。'); })} disabled={!s.debugInfiniteCoins && s.rustedCoins < 30} className={`p-3 border border-[#1a2f1a] hover:bg-[#1a2f1a]/50 text-left transition flex justify-between group ${(!s.debugInfiniteCoins && s.rustedCoins < 30) ? 'opacity-30 cursor-not-allowed' : ''}`}>
            <span className="text-purple-600 font-bold group-hover:text-purple-400 transition">受诅咒的扎草体 [厄运稻草人]</span>
            <span className="text-[#d4c3b5]">30 🪙</span>
          </button>
          <button onClick={() => handleBuy('扩张血肉容槽', 25, () => { s.beast.maxSatiety = 150; s.beast.satiety += 50; addLog(s, '📦 拾荒者递给你一个扭动的肉块：[扩张血肉容槽]！地牢实体饱食度上限扩充至150%并回复了50。'); })} disabled={(s.beast.maxSatiety || 100) >= 150 || (!s.debugInfiniteCoins && s.rustedCoins < 25)} className={`p-3 border border-[#1a2f1a] hover:bg-[#1a2f1a]/50 text-left transition flex justify-between group ${((s.beast.maxSatiety || 100) >= 150 || (!s.debugInfiniteCoins && s.rustedCoins < 25)) ? 'opacity-30 cursor-not-allowed' : ''}`}>
            <span className="text-red-500 font-bold group-hover:text-red-400 transition">扩张血肉容槽 (上限150%) {(s.beast.maxSatiety || 100) >= 150 && '[已扩充]'}</span>
            <span className="text-[#d4c3b5]">25 🪙</span>
          </button>
        </div>

        <div className="mt-4 flex justify-center">
          <button onClick={() => { s.status = 'playing'; forceRender(); }} className="px-8 py-3 bg-transparent border border-[#708070] text-[#708070] hover:bg-[#708070]/20 hover:text-white transition uppercase tracking-widest font-bold">
            [ 离开交易 ]
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Corrupted Text Component for Cthulhu Aesthetic ---
const CORRUPTION_MAP: Record<string, Record<string, string>> = {
  'white': {
    '苍白幽影': '死寂之形',
    '雾气': '凝固的悲鸣',
    '虚假轮廓': '亵渎神像',
    '热量': '魂火',
    '残像': '诅咒'
  },
  '#2563eb': {
    '深蓝巡卫': '深渊狱卒',
    '深海生物': '寄生灵魂',
    '集体意识': '混乱虫群',
    '潮汐': '死亡搏动',
    '冷光': '引渡之火'
  },
  '#a855f7': {
    '紫晶判官': '亵渎监考官',
    '引力场': '灵魂绞肉机',
    '处决': '祭献',
    '审判': '凌迟',
    '晶体': '眼球'
  },
  '#ef4444': {
    '深红渊主': '血海真主',
    '多面体': '跳动的心房',
    '血色': '脓稠',
    '深渊': '子宫',
    '搏动': '咀嚼'
  }
};

const CorruptedText = ({ text, color, tick, stateRef }: { text: string, color: string, tick: number, stateRef?: React.MutableRefObject<GameState> }) => {
  const map = CORRUPTION_MAP[color];
  if (!map) return <span>{text}</span>;

  const keys = Object.keys(map);
  if (keys.length === 0) return <span>{text}</span>;

  // Use dynamic cycle from state or default to 60
  const cycle = stateRef?.current?.glitchCycle || 60;
  const glitchDuration = Math.max(10, Math.floor(cycle * 0.3)); // Glitch for 30% of the cycle, at least 0.2s
  
  const currentCycleIndex = Math.floor(tick / cycle);
  const cycleProgress = tick % cycle;
  
  const isGlitching = tick < glitchDuration || cycleProgress < glitchDuration; 
  
  let processedText = text;
  if (isGlitching) {
    const wordToCorruptIndex = currentCycleIndex % keys.length;
    const targetKey = keys[wordToCorruptIndex];
    const targetVal = map[targetKey];
    processedText = processedText.split(targetKey).join(targetVal);
  }

  return (
    <span className="transition-all duration-75">
      {processedText}
    </span>
  );
};

const CombatDialogOverlay = ({ stateRef, tick }: { stateRef: React.MutableRefObject<GameState>, tick: number }) => {
  const s = stateRef.current;
  if (s.status !== 'combat' || !s.combatData) return null;
  const cd = s.combatData;
  const npc = s.npcs.find(n => n.id === cd.npcId);
  if (!npc) return null;

  return (
    <div className="absolute inset-0 z-[50] pointer-events-none flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-4xl flex gap-4"
      >
        {/* Main Text Dialog */}
        <div className="flex-1 bg-[#0a0a0f] border border-theme-border/50 shadow-[0_0_40px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col">
          <div className="h-1 w-full" style={{ backgroundImage: `linear-gradient(90deg, transparent, ${npc.color}, transparent)` }} />
          <div className="px-6 py-4 border-b border-theme-border/30 flex justify-between items-center bg-black/50">
            <span className="text-[12px] uppercase tracking-[0.2em] font-bold text-gray-400">Encounter Data</span>
            <span className="text-[11px] font-mono tracking-widest animate-pulse" style={{ color: npc.color }}>
              {cd.phase === 'starting' ? '>>> DETECTED' : cd.phase === 'rolling' ? '>>> ROLLING' : '>>> RESOLVING'}
            </span>
          </div>
          <div className="p-6 sm:p-8 flex-1 flex items-center justify-center bg-black/80">
            <motion.div
              key={cd.phase}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-[15px] sm:text-[17px] leading-[1.8] text-[#e0e0e0] font-sans font-medium tracking-wide w-full"
            >
              {cd.dialogText.split('\n').map((para, idx) => (
                <p key={idx} className="mb-3 last:mb-0 indent-8">
                  <CorruptedText text={para} color={npc.color} tick={tick + idx * 12} stateRef={stateRef} />
                </p>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Roller Window */}
        {(cd.phase === 'rolling' || cd.phase === 'resolving') && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-[300px] shrink-0 bg-[#0a0a0f] border border-theme-border/50 shadow-[0_0_40px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col"
          >
            <div className="h-1 w-full" style={{ backgroundImage: `linear-gradient(90deg, transparent, ${npc.color}, transparent)` }} />
            <div className="px-4 py-3 border-b border-theme-border/30 bg-black/50 text-center text-[10px] uppercase tracking-widest text-gray-400">
              Attribute Roll
            </div>
            <div className="p-4 flex flex-col gap-4 bg-black/80 flex-1 justify-center">
              {cd.results.map(res => {
                const isRolling = cd.phase === 'rolling';
                const pRoll = isRolling ? (Math.random() * res.playerVal).toFixed(1) : res.playerVal.toFixed(1);
                const nRoll = isRolling ? (Math.random() * res.npcVal).toFixed(1) : res.npcVal.toFixed(1);

                const pWon = !isRolling && res.winner === 'player';
                const nWon = !isRolling && res.winner === 'npc';

                return (
                  <div key={res.attr} className="flex flex-col gap-1 relative">
                    <div className="text-center text-[11px] text-gray-500 uppercase tracking-wider">{ATTR_NAMES[res.attr]}</div>
                    <div className="flex justify-between items-center bg-black border border-theme-border/30 p-2">
                      <div className={`font-mono text-[16px] font-bold transition-colors ${pWon ? 'text-theme-cyan' : isRolling ? 'text-gray-400' : 'text-gray-600'}`}>
                        {pRoll}
                      </div>
                      <div className="text-[10px] text-gray-600">VS</div>
                      <div className={`font-mono text-[16px] font-bold transition-colors ${nWon ? 'text-theme-red' : isRolling ? 'text-gray-400' : 'text-gray-600'}`}>
                        {nRoll}
                      </div>
                    </div>

                    {/* Absorb Animation overlays */}
                    {pWon && (
                      <motion.div
                        initial={{ x: '100%', opacity: 1 }}
                        animate={{ x: '0%', opacity: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="absolute inset-0 bg-gradient-to-l from-theme-cyan/50 to-transparent pointer-events-none"
                      />
                    )}
                    {nWon && !(s.debugInvincibleCombat || s.debugGodMode) && (
                      <motion.div
                        initial={{ x: '0%', opacity: 1 }}
                        animate={{ x: '100%', opacity: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="absolute inset-0 bg-gradient-to-r from-theme-red/50 to-transparent pointer-events-none"
                      />
                    )}

                    {!isRolling && res.winner !== 'draw' && (
                      <div className="absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] z-10 w-full text-center drop-shadow-[0_0_5px_rgba(0,0,0,1)]">
                        <motion.span
                          initial={{ y: 0, opacity: 1, scale: 1.5 }}
                          animate={{ y: -15, opacity: 0, scale: 1 }}
                          transition={{ duration: 1.5 }}
                          className={`text-[11px] font-bold ${pWon ? 'text-theme-cyan' : 'text-theme-red'}`}
                        >
                          {pWon ? '+' : '-'}{res.stealAmt.toFixed(1)} 吸取!
                        </motion.span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

const DivinationOverlay = ({ stateRef }: { stateRef: React.MutableRefObject<GameState> }) => {
  const s = stateRef.current;
  if (s.status !== 'divination' || !s.divinationResult) return null;
  const res = s.divinationResult;

  const tarotNames = {
    hermit: '《 隐 者 》',
    wheel: '《 命 运 之 轮 》',
    hanged: '《 倒 吊 人 》',
    tower: '《 高 塔 》'
  };

  const isRevealed = res.timer > 1.0;
  const isTower = res.card === 'tower';
  const colorPrimary = isTower ? '#ef4444' : '#eab308'; // red-500 or yellow-500

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center font-mono bg-black/95 overflow-hidden">
      {/* Particles */}
      {isRevealed && Array.from({ length: 40 }).map((_, i) => {
        const angle = Math.random() * Math.PI * 2;
        const dist = 100 + Math.random() * (isTower ? 500 : 300);
        const x = Math.cos(angle) * dist;
        const y = Math.sin(angle) * dist;

        return (
          <motion.div
            key={i}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x, y, opacity: 0, scale: Math.random() * 2 }}
            transition={{ duration: 1 + Math.random() * 1.5, ease: "easeOut" }}
            className="absolute w-2 h-2 rounded-full z-10"
            style={{ backgroundColor: colorPrimary, top: '50%', left: '50%', marginTop: '-4px', marginLeft: '-4px' }}
          />
        );
      })}

      <div className="relative text-center flex flex-col items-center w-full max-w-sm z-20">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[14px] sm:text-[18px] mb-8 tracking-[1rem] uppercase animate-[pulse_2s_ease-out_infinite]"
          style={{ color: colorPrimary }}
        >星象剥落</motion.div>

        {/* Tarot Card */}
        <motion.div
          initial={{ rotateY: 180, scale: 0 }}
          animate={{
            rotateY: isRevealed ? 0 : 180,
            scale: isRevealed ? 1.1 : 0.9
          }}
          transition={{ duration: 1.0, type: "spring", bounce: 0.4 }}
          className="w-[180px] sm:w-[220px] aspect-[2/3] border-2 relative flex flex-col items-center justify-center"
          style={{
            transformStyle: 'preserve-3d',
            borderColor: isRevealed ? colorPrimary : '#333',
            boxShadow: isRevealed ? `0 0 80px ${colorPrimary}40` : 'none',
            background: isRevealed
              ? (isTower ? 'linear-gradient(to bottom, #2a0000, black)' : 'linear-gradient(to bottom, #1a1400, black)')
              : '#111'
          }}
        >

          {/* Front of card */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 transition-opacity duration-300" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(0deg)', opacity: isRevealed ? 1 : 0 }}>
            <h1 className="text-[28px] sm:text-[36px] font-bold tracking-widest leading-[1.2]" style={{ writingMode: 'vertical-rl', textOrientation: 'upright', color: colorPrimary }}>
              {tarotNames[res.card]}
            </h1>
          </div>

          {/* Back of Card */}
          <div className="absolute inset-0 bg-[#111] flex items-center justify-center transition-opacity duration-300" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', opacity: isRevealed ? 0 : 1 }}>
            <div className="w-[60px] h-[60px] border border-white/20 rounded-full flex flex-col items-center justify-center relative">
              <div className="absolute inset-[10px] border border-white/10 rotate-45"></div>
              <div className="absolute inset-[10px] border border-white/10"></div>
              <div className="w-2 h-2 rounded-full bg-white/30 animate-pulse"></div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// --- Warning Overlay Component ---
const WarningOverlay = ({ stateRef }: { stateRef: React.MutableRefObject<GameState> }) => {
  const s = stateRef.current;

  return (
    <AnimatePresence>
      {s.showWarningTimer > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 1.5 } }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black pointer-events-none"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
            transition={{ duration: 2.0, ease: "easeOut" }}
            className="text-theme-red font-bold text-center tracking-[0.5rem] sm:tracking-[1.5rem] text-[20px] sm:text-[32px]"
            style={{ textShadow: '0 0 30px rgba(255,0,0,1)' }}
          >
            入此门者<br /><br />当舍弃一切希望
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// --- Main App Component ---

const ENCOUNTER_TEXTS: Record<string, string> = {
  'white': "房间的温度毫无征兆地坠入了冰点。在微弱的光影交错间，一团苍白的雾气悄然凝聚成了模糊的三角锥形。它没有实体，没有动作，只有一个不断剥落又重组的虚假轮廓。仅仅是待在它附近，身上的热量就在被无声地抽走。相比觅食，它更像是一个迷失在高维度的悲哀残像，正试图将靠近的生者一同拖入死寂。",
  '#2563eb': "伴随着深海般潮湿且冰冷的威压，一个勉强维持人形的半透明薄膜实体拖着沉重的步履走来。那薄膜之下并非血肉，而是翻涌着的、发着幽蓝冷光的深海水体。无数细小的、带有复眼的深海生物在它体内疯狂游动，汇聚成某种混乱的集体意识，在注视你的瞬间，你仿佛听到了万米深渊下的沉闷回响。",
  '#a855f7': "极其强烈的精神撕裂感袭来，一尊散发着紫黑色微光的晶体凭空碾碎了前方的空间。当它悬浮在半空时，巨大且异样的引力场几乎要压断脊骨。处决式审判，已经降临。",
  '#ef4444': "视线所及之处，一切都被染成了作呕铁锈味的血色。那是一个正在空间中剧烈搏动的深红多面体，像是在吞咽着这片维度。目光交汇的瞬间，心脏泵血完全失控，仿佛深渊本身正向你敞开怀抱。"
};

const ACTION_TEXTS: Record<string, Record<AttrType, string>> = {
  'white': {
    stamina: "幽影化作不可见的刺骨寒流席卷了{room}，你死死咬紧牙关，在极度低温中强行维持心脏跳动。",
    strength: "苍白的虚影骤然膨胀狠狠撞来，你借助{room}内掩体死死撑住，对抗着那股试图将你推离当前维度的阴冷排斥力。",
    patience: "怪物在{room}的阴暗处闪烁试图耗尽理智；你在死寂中默默倒数，等待它露出破绽的零点一秒。",
    intelligence: "幽影扭曲了{room}的物理结构，你凭借记忆中的几何坐标进行心算，在倒错的瞬间找到唯一的平衡点躲过绞杀。",
    focus: "整个{room}充斥着灵魂折损残音与雪花，你强忍眩晕，将视线死死钉在几何体核心唯一的实体上。"
  },
  '#2563eb': {
    stamina: "巡卫体内的深蓝液体开始剧烈沸腾，放射出能灼伤灵魂的高能冷光，你拼尽全力在{room}这片被海水浸透的虚空压力中维持呼吸。",
    strength: "那团扭动的液态巨手狠狠拍落，你感觉自己不是在对抗生物，而是在{room}中对抗整个大洋的恐怖推力。",
    patience: "数万只发光小鱼的视线在{room}中盲目扫视；你躲在阴影里纹丝不动，直到那团扭动的蓝光在错觉中缓缓移开。",
    intelligence: "巡卫内部的流动频率暗示了某种不可名状的潮汐规律，你疯狂计算着压力差，试图在{room}的水压将你压扁前找到逃逸点。",
    focus: "在那片幽蓝的盲目光芒中，你强忍眩晕，死死感知着{room}空气中水汽的浓度变化，以此判定这个深渊化身的真实位置。"
  },
  '#a855f7': {
    stamina: "引力波将{room}气压翻倍，你顶着脏器破裂痛苦在极度缺氧的重压下艰难拉锯。",
    strength: "紫晶凝结晶簇刺向要害，你怒吼挥舞武器在{room}中将晶壁生生砸碎。",
    patience: "仿佛带污染的低语刺入脑海试图在{room}中同化你；你死死守着精神的最底层防线。",
    intelligence: "判官正折叠{room}的维度，你强行用抽象拓扑学解析并拆解了它的引力囚笼。",
    focus: "{room}被折射出数百重紫色幻象发起精神冲击，你专注过滤干扰，一击斩向本体的缝隙。"
  },
  '#ef4444': {
    stamina: "猩红血雾灌满了{room}每一个角落，每一次呼吸都如同吞咽灼热碎玻璃，你硬抗剥离。",
    strength: "血色多面体横扫了{room}，你在绝境中榨干爆发力，从正面硬生生扛下毁天灭地的一击。",
    patience: "在被血色吞没的{room}里，你死压想要尖叫逃走的本能，静滞在血泊中等待时机。",
    intelligence: "渊主无视{room}法则进行因果律抹杀，你榨干脑细胞在多维时间线上勉强推演生路。",
    focus: "深红威压让{room}的光线扭曲，即使双眼逼出鲜血你也一刻不敢将感知从深渊中心移开半寸。"
  }
};

const SUCCESS_TEXTS: Record<string, string> = {
  'white': "苍白轮廓溃散了一部分，寒气稍歇。你如饥似渴地吸取了散落的维度残骸。",
  '#2563eb': "那层脆弱的皮肤被你撕裂，冰冷的深海水体喷涌而出。你趁机掠夺了那些发光生物所携带的远古记忆碎片。",
  '#a855f7': "傲慢宣告戛然而止，引力囚笼崩塌。你抓住跌落间隙强行掠夺了部分法则。",
  '#ef4444': "猩红的怒涛竟被硬生生逼退，血色翻涌间你逆流而上，野蛮撕下并吞噬了它的权柄。"
};

const FAILURE_TEXTS: Record<string, string> = {
  'white': "彻骨阴寒穿透长空，轮廓在视觉中放大，带走了体温的同时也抽走了你的部分核心维系。",
  '#2563eb': "幽蓝的水光将你吞没，你感觉到自己的理智正在被那些微小的寄生生物啃食，连同你的存在本身也被拖向深海。",
  '#a855f7': "如同实质的紫色重压将你摁在地上，你的高维潜能被审判官强行抽出、剥夺。",
  '#ef4444': "血海倒灌进肺腑，渊主的威压让你无法反击，大量生存资本被无情碾碎吞噬。"
};

export default function App() {
  const stateRef = useRef<GameState>(getInitialGameState());
  const [renderTick, setRenderTick] = useState(0);
  const dragControls = useDragControls();
  const [isDashboardCollapsed, setIsDashboardCollapsed] = useState(false);

  // Forced re-render loop for UI sync
  useEffect(() => {
    let frameId: number;
    let lastTime = performance.now();
    let renderTimer = 0;

    const loop = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      updateGame(stateRef.current, dt);

      // Throttle UI updates to ~50fps to reduce React overhead
      renderTimer += dt;
      if (renderTimer >= 0.02) {
        setRenderTick(t => t + 1);
        renderTimer = 0;
      }
      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, []);

  const forceRender = () => setRenderTick(t => t + 1);

  const pickNextLoc = (adjRooms: RoomId[], isBellAttracting: boolean): RoomId => {
    if (isBellAttracting && Math.random() < 0.8) {
      let minDist = Infinity;
      let bestRooms: RoomId[] = [];
      adjRooms.forEach(r => {
        const dist = DIST_TO_BELL_TOWER[r] ?? Infinity;
        if (dist < minDist) {
          minDist = dist;
          bestRooms = [r];
        } else if (dist === minDist) {
          bestRooms.push(r);
        }
      });
      if (bestRooms.length > 0) {
        return bestRooms[Math.floor(Math.random() * bestRooms.length)];
      }
    }
    return adjRooms[Math.floor(Math.random() * adjRooms.length)];
  };

  // --- Realtime Game Loop Update ---
  const updateGame = (state: GameState, dt: number) => {
    if (state.status === 'gameover') return;

    // --- Global Timers (Moved to top for safety) ---
    if (state.showWarningTimer > 0) state.showWarningTimer = Math.max(0, state.showWarningTimer - dt);
    if (state.divinationCooldown > 0) state.divinationCooldown = Math.max(0, state.divinationCooldown - dt);
    if (state.invisibilityTimer > 0) state.invisibilityTimer = Math.max(0, state.invisibilityTimer - dt);
    if (state.trappedTimer > 0) state.trappedTimer = Math.max(0, state.trappedTimer - dt);
    if (state.bellCooldownTimer > 0) state.bellCooldownTimer = Math.max(0, state.bellCooldownTimer - dt);
    if (state.bellAttractTimer > 0) state.bellAttractTimer = Math.max(0, state.bellAttractTimer - dt);

    if (state.status === 'divination' && state.divinationResult) {
      state.divinationResult.timer += dt;
      if (state.divinationResult.timer > 3.0) {
        const card = state.divinationResult.card;
        state.divinationResult = undefined;
        state.status = 'playing';

        switch (card) {
          case 'hermit':
            playSound('reveal');
            state.inventory.push('ether_potion');
            addLog(state, `🎴 塔罗牌《隐者》。你获得了【隐世药剂】。`);
            break;
          case 'wheel':
            playSound('reveal');
            state.inventory.push('hourglass');
            addLog(state, `🎴 塔罗牌《命运之轮》。你获得了【时光沙漏】。`);
            break;
          case 'hanged':
            playSound('reveal');
            state.inventory.push('straw_doll');
            addLog(state, `🎴 塔罗牌《倒吊人》。你获得了【厄运稻草人】。`);
            break;
          case 'tower':
            playSound('tower');
            addLog(state, `🎴 塔罗牌《高塔》！你遭到反噬被定身！所有敌意实体被吸引到你的位置！`);
            state.trappedTimer = 4.0;
            state.npcs.forEach(npc => {
              if (!npc.isDead) {
                npc.loc = state.playerLoc; // attract all NPCs directly
                npc.adaptedInRoom = false;
                npc.roomTimer = 0;
              }
            });
            if (state.invisibilityTimer <= 0) {
              checkCombat(state);
            }
            break;
        }
      }
      return;
    }

    if (state.status === 'reading') {
      const rd = state.readingData;
      if (!rd) return;
      rd.timer += dt;

      // Increase spawn timer
      if (rd.spawnTimer === undefined) rd.spawnTimer = 0;
      rd.spawnTimer += dt;

      // Difficulty based on book: spawn interval
      const spawnInterval = rd.bookType === 50 ? 0.45 : 0.6;

      // Spawn corruptions at intervals
      if (rd.spawnTimer >= spawnInterval) {
        rd.spawnTimer -= spawnInterval;
        const normalWords = rd.words.filter(w => !w.isCorrupt);
        if (normalWords.length > 0) {
          const target = normalWords[Math.floor(Math.random() * normalWords.length)];
          target.isCorrupt = true;
        }
      }

      // Corruption is dynamically driven by the number of active corrupted words
      const corruptedWordsCount = rd.words.filter(w => w.isCorrupt).length;
      const rotRate = rd.bookType === 50 ? 2.2 : 2.0;

      // Suffer corruption growth based on how many words are currently corrupted over time
      rd.corruption += (corruptedWordsCount * rotRate) * dt;

      // If you reach or exceed 100%, you lose.
      if (rd.corruption >= 100) {
        rd.corruption = 100;
        playSound('read_corrupt');
        addLog(state, '🚫 [活体篡改失败] 书页彻底陷入疯狂。你的理智受到冲击。');
        state.status = 'playing';
        state.readingData = undefined;
        state.playerAttrs.focus = snapVal(Math.max(0, state.playerAttrs.focus - 5));
      } else if (rd.timer >= 10) {
        const reward = rd.bookType === 50 ? 10 : 5;
        playSound('read_clear');
        addLog(state, `✅ [活体篡改成功] 你成功驱逐了书页上的疯狂。智力提升了 ${reward} 点。`);
        state.playerAttrs.intelligence += reward;
        state.completedBooks.push(rd.bookType);
        state.status = 'playing';
        state.readingData = undefined;
      }
      return;
    }

    if (state.status === 'chasing') {
      const cd = state.chaseData;
      if (!cd) return;

      const deathRadius = 0.6;

      // Skill logic
      if (!cd.hasUsedSkill && cd.playerRooms - cd.monsterDistance >= 3.0) {
        cd.hasUsedSkill = true;
        cd.skillState = 'charging';
        cd.skillTimer = 0;
        cd.skillTargetRoom = cd.playerRooms;
        addLog(state, '⚠️ 身后的追截虚无突然停滞，狂暴的能量在它周身翻涌聚集！');
      }

      if (cd.skillState === 'charging') {
        cd.skillTimer! += dt;
        if (cd.skillTimer! >= 0.5) {
          cd.skillState = 'striking';
          cd.skillTimer = 0;
          playSound('tower');
          addLog(state, '⚔️ 虚无上下撕裂出漆黑的空洞，两股触手如利刃般暴射而出，完全锁死了前方和脚下的去路！');
        }
      } else if (cd.skillState === 'striking') {
        cd.skillTimer! += dt;

        if (cd.skillTimer! >= 0.3) {
          if (!cd.inSafeRoom && (cd.playerRooms === cd.skillTargetRoom || cd.playerRooms === cd.skillTargetRoom! + 1)) {
            if (!state.debugGodMode) {
              playSound('read_corrupt');
              state.status = 'passage_failure';
              return;
            }
          }
        }

        if (cd.skillTimer! >= 0.8) {
          cd.skillState = undefined;
          cd.skillTimer = undefined;
          addLog(state, '一阵令人骨寒的撕裂声后，触手缩回了空洞，追踪怪物重新开始逼近...');
        }
      } else {
        cd.monsterDistance += cd.speed * dt;
        if (!cd.inSafeRoom && Math.abs(cd.monsterDistance - cd.playerRooms) < deathRadius) {
          if (!state.debugGodMode) {
            playSound('read_corrupt');
            state.status = 'passage_failure';
            return;
          }
        }
      }

      if (cd.playerRooms >= 17 && cd.isUpPath && !cd.safeRoomSpawned) {
        addLog(state, `⚠️ 空间重组：台阶深处的黑暗中，另一道扭曲的阴影[降临虚无]凭空显现，正向下极速逼近！`);
        cd.frontMonsterDistance = 19;
        cd.frontMonsterActive = true;
        cd.safeRoomSpawned = true;
      }

      if (cd.frontMonsterActive && cd.frontMonsterDistance !== undefined) {
        cd.frontMonsterDistance -= cd.speed * dt;
        if (!cd.inSafeRoom && Math.abs(cd.frontMonsterDistance - cd.playerRooms) < deathRadius) {
          if (!state.debugGodMode) {
            playSound('read_corrupt');
            state.status = 'passage_failure';
            return;
          }
        }
      }

      if (!cd.inSafeRoom && cd.playerRooms >= cd.targetRooms) {
        // escaped
        state.rustedCoins += 30;
        state.hasOmniscienceEye = true;
        state.secretPassageCleared = true;
        state.playerAttrs.intelligence += 10;
        state.playerAttrs.focus += 10;
        state.playerAttrs = snapAll(state.playerAttrs);

        playSound('read_clear');
        state.status = 'passage_victory';
        state.chaseData = undefined;
      }
      return;
    }

    if (state.status === 'combat' && state.combatData) {
      const cd = state.combatData;
      const npc = state.npcs.find(n => n.id === cd.npcId);
      if (!npc) { state.status = 'playing'; state.combatData = undefined; return; }

      cd.timer += dt;

      // Adjust timing based on if it's first encounter
      const startDuration = cd.isFirstEncounter ? 3.5 : 1.5;

      if (cd.phase === 'starting' && cd.timer > startDuration) {
        cd.phase = 'rolling';
        playDiceSound();
        const roomName = ROOMS[state.playerLoc].name;
        const combatTextLines: string[] = [];
        cd.attrsCompared.forEach(attr => {
          const text = ACTION_TEXTS[npc.color]?.[attr]?.replace('{room}', roomName) || '在撕裂的空间中发生了激烈的属性碰撞。';
          combatTextLines.push(text);
        });
        cd.dialogText = combatTextLines.join('\n');
      } else if (cd.phase === 'rolling' && cd.timer > startDuration + 2.0) {
        cd.phase = 'resolving';
        playAbsorbSound();

        let pWins = 0;
        let nWins = 0;
        let totalStolen = 0;
        let totalLost = 0;

        cd.results.forEach(res => {
          if (res.winner === 'player') {
            npc.attrs[res.attr] -= res.stealAmt;
            state.playerAttrs[res.attr] += res.stealAmt;
            pWins++;
            totalStolen += res.stealAmt;
          } else if (res.winner === 'npc') {
            if (!(state.debugInvincibleCombat || state.debugGodMode)) {
              state.playerAttrs[res.attr] -= res.stealAmt;
              npc.attrs[res.attr] += res.stealAmt;
              totalLost += res.stealAmt;
            }
            nWins++;
          }
        });
        state.playerAttrs = snapAll(state.playerAttrs);
        npc.attrs = snapAll(npc.attrs);

        if (pWins > nWins) {
          const currentNpcHp = calcHP(npc.attrs);
          if (currentNpcHp <= 0.1) {
            npc.isDead = true;
            state.rustedCoins += 10;
            cd.dialogText = `【抹灭殆尽】你将 ${npc.name} 彻底撕碎。它被彻底从这片维度抹除了。获取了 10 枚记忆币。`;
            addLog(state, `💀 抹杀了实体，拾取了沉淀的光阴(记忆币) +10。`);
          } else {
            state.rustedCoins += 5;
            cd.dialogText = SUCCESS_TEXTS[npc.color] || '反击成功获得优势。获取了 5 枚记忆币。';
            addLog(state, `🏆 局部压制，汲取 ${totalStolen.toFixed(1)} 点。拾取了记忆币 +5。`);
          }
        } else if (nWins > pWins) {
          cd.dialogText = FAILURE_TEXTS[npc.color] || '遭到重创';
          if ((state.debugInvincibleCombat || state.debugGodMode)) {
            cd.dialogText += '\n\n[Dev] 不死身免疫开启，未被夺走属性！';
            addLog(state, `🤖 免疫 ${totalLost.toFixed(1)} 点削弱。`);
          } else {
            addLog(state, `🔴 失败，被剥夺 ${totalLost.toFixed(1)} 点参数。`);
          }
        } else {
          cd.dialogText = "你们的力量在真空中相互抵消，谁也无法奈何对方。空间封锁暂时解除。";
        }
      } else if (cd.phase === 'resolving' && cd.timer > startDuration + 6.0) {
        if (calcHP(npc.attrs) <= 0) {
          npc.isDead = true;
          addLog(state, `📉 ${npc.name} 信号永久消失。`);
        }
        if (calcHP(state.playerAttrs) <= 0) {
          state.status = 'playing';
          state.invisibilityTimer = Math.max(state.invisibilityTimer || 0, 3.0);
          addLog(state, '🛡️ 战后保护屏障激活，短期内隐身避敌。');
          state.combatData = undefined;
          return;
        }
        if (!npc.isDead) { // Both survived: random teleport player
          const allRoomIds = Object.keys(ROOMS) as RoomId[];
          const validDestinations = allRoomIds.filter(r => r !== state.playerLoc);
          const dest = validDestinations[Math.floor(Math.random() * validDestinations.length)];
          state.playerLoc = dest;
          addLog(state, `🌀 战后排斥引擎启动，自动紧急跳跃飞至 [${ROOMS[dest].name}]。`);
        }
        state.status = 'playing';
        state.invisibilityTimer = Math.max(state.invisibilityTimer || 0, 3.0);
        addLog(state, '🛡️ 战后保护屏障激活，短期内隐身避敌。');
        state.combatData = undefined;
      }
      return;
    }

    const pHP = calcHP(state.playerAttrs);

    // Check Death constraints independently
    if (pHP <= 0) {
      addLog(state, '🔴 生命归零，你死亡了。游戏结束。');
      state.status = 'gameover';
      return;
    }

    if (state.npcs.every(n => n.isDead)) {
      addLog(state, '🏆 所有危险实体生命归零，你获得了这场逃生试炼的最终胜利！');
      state.status = 'gameover';
      return;
    }

    // 5. Global Events - Green Midnight Check
    state.globalEventTimer += dt;
    if (state.globalEventTimer >= 60.0 && !state.greenMidnight.active && !state.debugDisableGreenMidnight) {
      state.globalEventTimer = 0;
      state.greenMidnight = { active: true, timer: 0, angle: 0, hitCooldown: 0 };
      addLog(state, `🟩 [全局事件] 绿色的午夜 已启动！起居室生成了扫地机炮台！`);
      playSound('warning');
    }

    if (state.greenMidnight.active) {
      state.greenMidnight.timer += dt;
      state.greenMidnight.angle = (state.greenMidnight.timer * 12) % 360; // 360 over 30s
      if (state.greenMidnight.hitCooldown > 0) {
        state.greenMidnight.hitCooldown -= dt;
      }

      if (state.greenMidnight.timer >= 15.0) {
        state.greenMidnight.active = false;
        state.greenMidnight.timer = 0;
        addLog(state, `🟩 [事件结束] 绿色的午夜已结束，炮台沉入阴影。`);
      } else if (state.greenMidnight.hitCooldown <= 0 && state.status === 'playing') {
        const origin = ROOM_LAYOUT['LivingRoom'];
        const pLoc = ROOM_LAYOUT[state.playerLoc];
        const dx = pLoc.x - origin.x;
        const dy = pLoc.y - origin.y;

        let isHit = false;
        if (dx === 0 && dy === 0) {
          isHit = true;
        } else {
          let angleToPlayer = Math.atan2(dy, dx) * 180 / Math.PI;
          if (angleToPlayer < 0) angleToPlayer += 360;
          const lAngle = state.greenMidnight.angle;
          const beams = [lAngle, (lAngle + 90) % 360, (lAngle + 180) % 360, (lAngle + 270) % 360];
          for (const beam of beams) {
            let diff = Math.abs(angleToPlayer - beam);
            if (diff > 180) diff = 360 - diff;
            if (diff <= 10) { // 10 degrees tolerance
              isHit = true;
              break;
            }
          }
        }

        if (isHit && state.invisibilityTimer <= 0 && !(state.debugInfiniteInvisibility || state.debugGodMode)) {
          const totalHP = calcHP(state.playerAttrs);
          const toLoseTotal = totalHP * 0.3;
          let toLose = toLoseTotal;
          const attrs: AttrType[] = ['stamina', 'strength', 'patience', 'intelligence', 'focus'];
          const shuffled = attrs.sort(() => 0.5 - Math.random());

          for (const attr of shuffled) {
            if (toLose <= 0.01) break;
            const cVal = state.playerAttrs[attr];
            if (cVal > 0.01) {
              if (cVal >= toLose) {
                state.playerAttrs[attr] -= toLose;
                toLose = 0;
              } else {
                toLose -= cVal;
                state.playerAttrs[attr] = 0;
              }
            }
          }
          state.playerAttrs = snapAll(state.playerAttrs);
          state.greenMidnight.hitCooldown = 1.0;
          addLog(state, `💥 [绿色的午夜] 致命绿光射中！你失去了总计 ${snapVal(toLoseTotal).toFixed(1)} 点属性！`);
          playSound('hit');
        }
      }
    }

    // --- 绝对死局判定 ---
    const aliveNpcs = state.npcs.filter(n => !n.isDead);
    let potentialDeadEnd = true;
    for (const npc of aliveNpcs) {
      const nHP = calcHP(npc.attrs);
      if (pHP >= (nHP / 2) - 0.05) {
        potentialDeadEnd = false; // Player can still fight at least this one
        break;
      }
    }

    if (potentialDeadEnd && aliveNpcs.length > 0) {
      addLog(state, `⚠️ 【高维重力警告】`);
      addLog(state, `💀 你的生命总额（${pHP.toFixed(1)}）已跌破所有存活敌人最低可用功率。`);
      addLog(state, `🔴 绝对死局触发！在毫无胜算的数值黑洞面前，你被规则强制抹除！`);
      state.playerAttrs = { stamina: 0, strength: 0, patience: 0, intelligence: 0, focus: 0 };
      state.status = 'gameover';
      return;
    }

    // 1. Process Player Reallocation
    if (state.pendingPlayerAttrs) {
      state.reallocTimer += dt;
      if (state.reallocTimer >= 4.0) {
        state.playerAttrs = snapAll(state.pendingPlayerAttrs);
        state.pendingPlayerAttrs = null;
        state.reallocTimer = 0;
        addLog(state, '✨ 属性重组完成。');
      }
    }

    // 2. Process NPC Adaptation Timers & Movement
    let npcMoved = false;
    state.npcs.forEach(npc => {
      if (npc.isDead) return;
      const npcRoomDef = ROOMS[npc.loc];
      if (npcRoomDef.attrs.length > 0 && !npc.adaptedInRoom) {
        npc.roomTimer += dt;
        if (npc.roomTimer >= 1.0) {
          const nHP = calcHP(npc.attrs);
          const splitAmount = snapVal(nHP / npcRoomDef.attrs.length);

          const newNpcAttrs: Attributes = { stamina: 0, strength: 0, patience: 0, intelligence: 0, focus: 0 };
          npcRoomDef.attrs.forEach(a => {
            newNpcAttrs[a] = splitAmount;
          });

          npc.attrs = snapAll(newNpcAttrs);
          npc.adaptedInRoom = true;
          // addLog(state, `🧟 ${npc.name} 在 ${npcRoomDef.name} 中完成了环境适应。`);
        }
      }

      // 3. Process NPC Movement
      npc.moveTimer += dt;
      if (npc.moveTimer >= npc.nextMoveWait) {
        npc.moveTimer = 0;
        npc.nextMoveWait = 5 + 1.5 + Math.random(); // Next tick

        const npcRoom = ROOMS[npc.loc];
        const nextRoomId = npc.nextLoc || pickNextLoc(npcRoom.adj, state.bellAttractTimer > 0);

        if (ROOMS[nextRoomId]) {
          npc.loc = nextRoomId;
          // Pre-calculate next destination for intent tracking
          const newNpcRoom = ROOMS[npc.loc];
          npc.nextLoc = pickNextLoc(newNpcRoom.adj, state.bellAttractTimer > 0);
        } else {
          console.error(`Invalid room target: ${nextRoomId}`);
          npc.nextLoc = pickNextLoc(npcRoom.adj, state.bellAttractTimer > 0);
        }

        npc.roomTimer = 0;
        npc.adaptedInRoom = false; // reset adaptation flag
        npcMoved = true;

        if (state.traps.includes(npc.loc)) {
          state.traps = state.traps.filter(t => t !== npc.loc);
          addLog(state, `🔥 [远处] 传来异响！${npc.name} 触发了厄运稻草人，全属性被强制削弱！`);
          for (let key in npc.attrs) {
            npc.attrs[key as AttrType] = Math.max(0, npc.attrs[key as AttrType] / 2);
          }
        }
      }
    });

    if (npcMoved) {
      addLog(state, `👣 检测到异常移动信号...`);
      checkCombat(state); // Immediately check after movement loop
    }

    // 4. Process Beast
    const b = state.beast;
    if (state.debugForceSeal) {
      b.state = 'contained';
      b.loc = 'Dungeon';
      b.satiety = b.maxSatiety || 100;
      b.nextLoc = null;
    }

    if (b.state === 'contained') {
      const bMax = b.maxSatiety || 100;
      if (state.debugInfiniteSatiety) {
        b.satiety = bMax;
      } else if (state.isFeedingBeast && state.playerLoc === 'Dungeon') {
        b.satiety += 15 * dt;
        if (b.satiety > bMax) b.satiety = bMax;
      } else {
        b.satiety -= 2 * dt;
      }

      if (b.satiety <= 0) {
        b.satiety = 0;
        b.state = 'escaped';
        addLog(state, '🚨 警告：地牢怪物已突破收容！正在全区域猎杀！');
      }
    } else if (b.state === 'escaped') {
      b.moveTimer += dt;
      if (b.moveTimer >= 1.0) { // moves 1 room per second
        b.moveTimer = 0;
        const r = ROOMS[b.loc];
        const nextId = b.nextLoc || pickNextLoc(r.adj, state.bellAttractTimer > 0);

        if (ROOMS[nextId]) {
          b.loc = nextId;
          const nextR = ROOMS[b.loc];
          b.nextLoc = pickNextLoc(nextR.adj, state.bellAttractTimer > 0);
        } else {
          b.nextLoc = pickNextLoc(r.adj, state.bellAttractTimer > 0);
        }

        addLog(state, `⚠️ 狂暴怪物移动到了 [${ROOMS[nextId].name}]。`);

        if (b.loc === state.playerLoc) {
          if ((state.debugInfiniteInvisibility || state.debugGodMode)) {
            // addLog(state, '⚠️ 狂暴怪物穿过了你，但未能察觉隐匿在阴影中的你。');
          } else {
            addLog(state, '💀 你被突脸的狂暴怪物瞬间撕碎。游戏结束。');
            state.status = 'gameover';
            return;
          }
        }
      }
    }
  };




  const playDiceSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      for (let i = 0; i < 15; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400 + Math.random() * 400, ctx.currentTime + i * 0.1);
        gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.1);
        gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + i * 0.1 + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.1 + 0.05);
        osc.start(ctx.currentTime + i * 0.1);
        osc.stop(ctx.currentTime + i * 0.1 + 0.06);
      }
    } catch (e) { }
  };

  const playAbsorbSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.6);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.6);
    } catch (e) { }
  };

  // --- Combat Processing ---
  const checkCombat = (state: GameState) => {
    if (state.status !== 'playing' || state.showWarningTimer > 0) return;

    // Find an enemy in the same room that isn't dead
    const npc = state.npcs.find(n => !n.isDead && n.loc === state.playerLoc);

    if (npc) {
      if (state.playerLoc === 'DressingRoom') {
        return;
      }

      if (state.invisibilityTimer > 0 || (state.debugInfiniteInvisibility || state.debugGodMode)) {
        return;
      }

      if (state.pendingPlayerAttrs) {
        state.pendingPlayerAttrs = null;
        state.reallocTimer = 0;
        addLog(state, `⚠️ 警告：重组进程因遭遇战被强制中断。`);
      }

      const activeAttrs = ROOMS[state.playerLoc].attrs;
      const results: CombatResult[] = [];
      activeAttrs.forEach(a => {
        const pVal = getEffectivePlayerAttr(state, a);
        const nVal = npc.attrs[a];
        let winner: 'player' | 'npc' | 'draw' = 'draw';
        let stealAmt = 0;

        if (pVal > nVal + 0.01) {
          winner = 'player';
          stealAmt = snapVal(nVal * 0.5);
        } else if (nVal > pVal + 0.01) {
          winner = 'npc';
          stealAmt = snapVal(pVal * 0.5);
        }

        results.push({ attr: a, playerVal: pVal, npcVal: nVal, winner, stealAmt });
      });

      state.status = 'combat';
      const isFirst = !npc.encountered;
      if (isFirst) {
        npc.encountered = true;
      }

      state.combatData = {
        timer: 0,
        phase: 'starting',
        roomId: state.playerLoc,
        npcId: npc.id,
        attrsCompared: activeAttrs,
        results,
        isFirstEncounter: isFirst,
        dialogText: isFirst ? (ENCOUNTER_TEXTS[npc.color] || `你遭遇了 ${npc.name}`) : `⚔️ 空间封锁，引力交汇！你与 ${npc.name} 展开了对峙！`
      };

      addLog(state, `[系统] 进入遭遇战状态。`);
    }
  };

  // --- User Actions ---
  const startReading = (type: 20 | 50) => {
    const s = stateRef.current;
    if (s.status !== 'playing') return;
    if (s.playerAttrs.intelligence < type) {
      addLog(s, `💡 你的智力未达到 ${type}，借阅被拒绝。`);
      forceRender();
      return;
    }

    const text = BOOK_TEXTS[type];
    // Split into smaller segments (like 4-5 characters) instead of full sentences for more click targets
    const rawWords = text.match(/.{1,4}/g) || [];
    const words = rawWords.map((t, idx) => ({
      id: idx,
      text: t,
      isCorrupt: false,
      rot: Math.random() * 6 - 3
    }));

    // Randomize initial corruption (1 or 2 segments)
    const initialCorrupt = type === 50 ? 2 : 1;
    for (let i = 0; i < initialCorrupt; i++) {
      if (words.length > 0) words[Math.floor(Math.random() * words.length)].isCorrupt = true;
    }

    s.readingData = {
      bookType: type,
      timer: 0,
      corruption: 0,
      spawnTimer: 0,
      words: words
    };
    s.status = 'reading';
    playSound('read_start');
    addLog(s, `📖 你打开了名为 [${type === 50 ? '拉莱耶残卷' : '活体演化'}] 的书，文字开始扭曲...`);
    forceRender();
  };

  const handlePlayerMove = (targetId: RoomId) => {
    const s = stateRef.current;
    if (s.status !== 'playing') return;
    if (s.lookoutMode) {
      addLog(s, `🔭 正在瞭望中，无法移动。点击地图上方的"收回视线"按钮退出瞭望。`);
      forceRender();
      return;
    }

    if (s.trappedTimer > 0) {
      addLog(s, `⛓️ 遭到高塔反噬，定身状态还有 ${Math.ceil(s.trappedTimer)} 秒解除。无法移动！`);
      forceRender();
      return;
    }

    if (s.beast.state === 'escaped' && targetId === s.beast.loc) {
      s.playerLoc = targetId;
      addLog(s, `💀 你冲进了狂暴怪物的房间，瞬间被撕碎。游戏结束。`);
      s.status = 'gameover';
      forceRender();
      return;
    }

    s.playerLoc = targetId;
    addLog(s, `🏃 移动至 ${ROOMS[targetId].name}。`);
    checkCombat(s);
    forceRender();
  };

  const startDivination = () => {
    const s = stateRef.current;
    // TEST FEATURE: Disabled divination cooldown check specifically
    if (s.status !== 'playing') return;

    s.divinationCooldown = 0; // Disabled cooldown
    const cards = ['hermit', 'wheel', 'hanged', 'tower'] as const;
    const selectedCard = cards[Math.floor(Math.random() * cards.length)];

    playSound('start');

    s.divinationResult = {
      card: selectedCard,
      timer: 0
    };
    s.status = 'divination';
    addLog(s, `✨ 开始星象仪占卜...`);
    forceRender();
  };

  // --- Main Render ---
  const s = stateRef.current;

  if (s.status === 'setup') {
    return <SetupScreen stateRef={stateRef} forceRender={forceRender} />;
  }

  if (s.status === 'gameover') {
    const pHP = calcHP(s.playerAttrs);
    const killedByBeast = s.beast.state === 'escaped' && s.playerLoc === s.beast.loc;
    const won = pHP > 0 && !killedByBeast;

    let titleText = won ? 'TERMINATED_NPC' : 'TERMINATED';
    let descText = won ? '系统已接管洋馆。生存任务达成。' : '生命维持系统崩溃。游戏结束。';

    if (killedByBeast) {
      titleText = 'SLAUGHTERED';
      descText = '你被狂暴的地牢实体撕碎，成为其腹中之物。生态收容彻底失败。';
    } else if (pHP === 0 && !won) {
      descText = '生命体征归零或落入绝对死局，意识被系统抹除。';
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 font-mono">
        <div className="max-w-md w-full bg-[#1a0000] border border-theme-red/50 p-8 shadow-[0_0_20px_rgba(255,0,0,0.2)] text-center relative overflow-hidden">
          {won ? (
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_20%,var(--color-theme-cyan)_50%,transparent_80%)] opacity-[0.03] pointer-events-none" />
          ) : (
            <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,var(--color-theme-red)_10px,var(--color-theme-red)_20px)] opacity-[0.03] pointer-events-none" />
          )}
          <h1 className={`text-[40px] sm:text-[48px] mb-6 tracking-[4px] sm:tracking-[8px] uppercase font-bold relative z-10 ${won ? 'text-theme-cyan' : 'text-theme-red'}`}>
            {titleText}
          </h1>
          <p className="text-[#8b949e] mb-8 text-[14px] relative z-10">
            {descText}
          </p>
          <button
            onClick={() => {
              stateRef.current = getInitialGameState();
              forceRender();
            }}
            className={`w-full bg-transparent border uppercase text-[12px] py-3 transition cursor-pointer font-bold relative z-10 ${won ? 'border-theme-cyan text-theme-cyan hover:bg-theme-cyan/10' : 'border-theme-red text-theme-red hover:bg-theme-red/10'}`}
          >
            重启终端
          </button>
        </div>
      </div>
    );
  }

  const currentHP = calcHP(s.playerAttrs);

  return (
    <div className="min-h-screen lg:h-screen bg-theme-bg p-2 sm:p-3 font-mono antialiased text-theme-text flex flex-col overflow-y-auto lg:overflow-hidden">

      {/* Global Immersive Header (matches template HTML layout) */}
      <header className="bg-theme-card border border-theme-border flex items-center justify-between px-3 sm:px-5 py-0 h-[60px] shadow-[0_0_20px_rgba(0,0,0,0.5)] shrink-0 mb-[12px]">
        <div className="flex items-center gap-3">
          <div className="text-[18px] sm:text-[24px] font-bold tracking-[2px] sm:tracking-[4px] text-theme-cyan uppercase">
            ENCOUNTER
          </div>
          {s.invisibilityTimer > 0 && (
            <div className="flex bg-cyan-900/50 border border-theme-cyan text-theme-cyan text-[10px] px-2 py-0.5 animate-pulse items-center gap-1 shadow-[0_0_10px_var(--color-theme-cyan)_inset]">
              ✨ 虚无状态 (隐身) {Math.ceil(s.invisibilityTimer)}s
            </div>
          )}
          {s.beast.state === 'contained' && s.beast.satiety < 30 && (
            <div className="hidden sm:flex bg-purple-900/50 border border-purple-500 text-purple-200 text-[10px] px-2 py-0.5 animate-pulse items-center gap-1 shadow-[0_0_10px_purple_inset]">
              📢 震耳嘶吼 (-50% 注意力)
            </div>
          )}
          {s.bellAttractTimer > 0 && (
            <div className="hidden sm:flex bg-purple-900/50 border border-purple-500 text-purple-200 text-[10px] px-2 py-0.5 animate-pulse items-center gap-1 shadow-[0_0_10px_purple_inset]">
              ⚠️ 异响回荡：实体正向钟楼汇聚... ({Math.ceil(s.bellAttractTimer)}s)
            </div>
          )}
        </div>
        <div className="flex items-center gap-[5px] sm:gap-[15px]">
          <div className="hidden sm:flex text-[10px] sm:text-[12px] bg-[#1a1410] border border-[#3d2b1f] text-[#a08b7a] px-2 py-1 items-center gap-2 shadow-[0_0_10px_rgba(61,43,31,0.5)_inset]">
            <span>🪙 记忆币:</span>
            <span className="font-bold text-[#d4c3b5]">{s.rustedCoins}</span>
          </div>
          <div className="flex bg-black border border-theme-border/50 h-[24px] items-center px-1 gap-1">
            <span className="text-[9px] text-[#8b949e] uppercase px-1 border-r border-theme-border/30 h-full flex items-center">难度</span>
            <select
              value={s.difficulty}
              onChange={(e) => {
                const diff = e.target.value as any;
                s.difficulty = diff;
                
                // Difficulty Logic
                if (diff === 'easy') {
                  s.debugInfiniteSatiety = true;
                  s.debugInfiniteCoins = true;
                  s.debugShowPaths = true;
                  s.debugDisableGreenMidnight = true;
                  s.debugShowIntentions = true;
                  s.debugHideLogs = true;
                  addLog(s, `⚙️ 难度切换：[简单模式] - 已开启全辅助系统。`);
                } else if (diff === 'normal') {
                  s.debugInfiniteSatiety = true;
                  s.debugInfiniteCoins = false;
                  s.debugShowPaths = false;
                  s.debugDisableGreenMidnight = true;
                  s.debugShowIntentions = false;
                  s.debugHideLogs = true;
                  addLog(s, `⚙️ 难度切换：[普通模式] - 已保留基础辅助系统。`);
                } else {
                  s.debugInfiniteSatiety = false;
                  s.debugInfiniteCoins = false;
                  s.debugShowPaths = false;
                  s.debugDisableGreenMidnight = false;
                  s.debugShowIntentions = false;
                  s.debugHideLogs = false;
                  addLog(s, `⚙️ 难度切换：[噩梦模式] - 已禁用所有辅助，祝你好运。`);
                }
                forceRender();
              }}
              className="bg-transparent text-[10px] text-theme-cyan outline-none cursor-pointer font-bold uppercase tracking-widest px-1"
            >
              <option value="easy" className="bg-[#0a0a0a] text-green-500">简单 (Easy)</option>
              <option value="normal" className="bg-[#0a0a0a] text-theme-cyan">普通 (Normal)</option>
              <option value="nightmare" className="bg-[#0a0a0a] text-red-500">噩梦 (Nightmare)</option>
            </select>
          </div>

          <span className="text-[12px] hidden sm:block">生命体征</span>
          {/* Health Bar using Immersive UI pattern structure inside Header */}
          <div className="w-[120px] sm:w-[300px] md:w-[400px] h-[24px] bg-black border border-theme-border relative">
            <div
              className="h-full bg-[linear-gradient(90deg,var(--color-theme-red),#ff9999)] transition-all ease-out duration-300"
              style={{ width: `${currentHP}%` }}
            ></div>
            <div className="absolute inset-0 w-full text-center text-[12px] leading-[24px] text-white pointer-events-none">
              {currentHP.toFixed(1)} / 100
            </div>
          </div>
        </div>
      </header>

      {/* Grid Viewport */}
      <div className="flex-1 lg:grid lg:grid-cols-[320px_1fr_280px] gap-[12px] relative w-full flex flex-col lg:min-h-0 lg:overflow-hidden pb-4 lg:pb-0">

        {/* Left Column: State & Allocation */}
        <aside className="bg-theme-card border border-theme-border p-3 sm:p-4 flex flex-col relative min-h-[420px] lg:h-full lg:overflow-hidden shrink-0">
          <PlayerStatePanel stateRef={stateRef} forceRender={forceRender} />
        </aside>

        {/* Center Column: Map & Actions */}
        <main className="bg-[radial-gradient(circle_at_center,#1a202c_0%,#0a0b10_100%)] border border-theme-border p-3 sm:p-4 flex flex-col min-h-[500px] lg:h-full lg:overflow-y-auto shrink-0">
          <MapPanel stateRef={stateRef} handlePlayerMove={handlePlayerMove} startReading={startReading} startDivination={startDivination} forceRender={forceRender} />
        </main>

        <InventoryOverlay stateRef={stateRef} forceRender={forceRender} />
        <ShopOverlay stateRef={stateRef} forceRender={forceRender} />
        <ShopIntroOverlay stateRef={stateRef} forceRender={forceRender} />
        <PassageIntroOverlay stateRef={stateRef} forceRender={forceRender} />
        <PassageFailureOverlay stateRef={stateRef} forceRender={forceRender} />
        <PassageVictoryOverlay stateRef={stateRef} forceRender={forceRender} />
        <WatchtowerIntroOverlay stateRef={stateRef} forceRender={forceRender} />
        <BellTowerIntroOverlay stateRef={stateRef} forceRender={forceRender} />
        <BellTowerRungOverlay stateRef={stateRef} forceRender={forceRender} />
        <ReadingOverlay stateRef={stateRef} forceRender={forceRender} />
        <DivinationOverlay stateRef={stateRef} />
        <WarningOverlay stateRef={stateRef} />
        <CombatDialogOverlay stateRef={stateRef} tick={(s.combatData?.timer || 0) * 50} />

        {/* Right Column: Logs */}
        <aside className="bg-theme-card border border-theme-border p-3 sm:p-4 flex flex-col min-h-[450px] lg:h-full lg:overflow-y-auto shrink-0 relative custom-scrollbar">
          {s.status === 'combat' ? (
            <CombatSidebarPanel stateRef={stateRef} />
          ) : (
            <NpcStatePanel stateRef={stateRef} />
          )}
          {!s.debugHideLogs && <LogsPanel stateRef={stateRef} />}

          {/* Developer Debug Panel */}
          <motion.div
            drag
            dragControls={dragControls}
            dragListener={false}
            dragMomentum={false}
            className="fixed top-[70px] right-2 z-[100] w-[260px] p-3 bg-black/80 backdrop-blur border border-blue-500/50 rounded flex flex-col gap-2 items-start text-blue-200 shadow-[0_0_15px_rgba(0,100,255,0.4)]"
          >
            <div className="flex justify-between items-center w-full border-b border-blue-500/30 pb-1 mb-1">
              <div
                onPointerDown={(e) => dragControls.start(e)}
                className="text-[10px] uppercase font-bold tracking-widest opacity-80 cursor-grab active:cursor-grabbing select-none touch-none flex-1"
              >
                /// Developer Dashboard ///
              </div>
              <button
                onClick={() => setIsDashboardCollapsed(!isDashboardCollapsed)}
                className="text-blue-400 hover:text-white transition p-0.5"
                title={isDashboardCollapsed ? "展开" : "收起"}
              >
                {isDashboardCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
              </button>
            </div>

            {!isDashboardCollapsed && (
              <div className="flex flex-col gap-2 items-start w-full">

                <label className="flex items-center gap-2 text-[11px] cursor-pointer hover:text-white transition w-full">
                  <input
                    type="checkbox"
                    checked={!!s.debugInfiniteInvisibility}
                    onChange={(e) => {
                      stateRef.current.debugInfiniteInvisibility = e.target.checked;
                      forceRender();
                    }}
                    className="w-3 h-3 accent-blue-500"
                  />
                  无限以太虚无 (绝对隐身)
                </label>

                <label className="flex items-center gap-2 text-[11px] cursor-pointer hover:text-white transition w-full">
                  <input
                    type="checkbox"
                    checked={!!s.debugGodMode}
                    onChange={(e) => {
                      stateRef.current.debugGodMode = e.target.checked;
                      forceRender();
                    }}
                    className="w-3 h-3 accent-red-500"
                  />
                  无敌状态 (隐身+免疫怪物与环境致死)
                </label>

                <label className="flex items-center gap-2 text-[11px] cursor-pointer hover:text-white transition w-full">
                  <input
                    type="checkbox"
                    checked={!!s.debugInvincibleCombat}
                    onChange={(e) => {
                      stateRef.current.debugInvincibleCombat = e.target.checked;
                      forceRender();
                    }}
                    className="w-3 h-3 accent-blue-500"
                  />
                  不死身 (战败不被夺走属性)
                </label>

                <label className="flex items-center gap-2 text-[11px] cursor-pointer hover:text-white transition w-full">
                  <input
                    type="checkbox"
                    checked={!!s.debugInfiniteSatiety}
                    onChange={(e) => {
                      stateRef.current.debugInfiniteSatiety = e.target.checked;
                      forceRender();
                    }}
                    className="w-3 h-3 accent-blue-500"
                  />
                  地牢饲育器 (无限饱食度)
                </label>

                <label className="flex items-center gap-2 text-[11px] cursor-pointer hover:text-white transition w-full">
                  <input
                    type="checkbox"
                    checked={!!s.debugInfiniteCoins}
                    onChange={(e) => {
                      stateRef.current.debugInfiniteCoins = e.target.checked;
                      forceRender();
                    }}
                    className="w-3 h-3 accent-yellow-600"
                  />
                  无尽财富 (无限记忆币)
                </label>

                <label className="flex items-center gap-2 text-[11px] cursor-pointer hover:text-white transition w-full">
                  <input
                    type="checkbox"
                    checked={!!s.debugShowPaths}
                    onChange={(e) => {
                      stateRef.current.debugShowPaths = e.target.checked;
                      forceRender();
                    }}
                    className="w-3 h-3 accent-blue-500"
                  />
                  显示全图寻路连接线
                </label>

                <label className="flex items-center gap-2 text-[11px] cursor-pointer hover:text-white transition w-full text-green-400">
                  <input
                    type="checkbox"
                    checked={!!s.debugDisableGreenMidnight}
                    onChange={(e) => {
                      stateRef.current.debugDisableGreenMidnight = e.target.checked;
                      if (e.target.checked && stateRef.current.greenMidnight.active) {
                        stateRef.current.greenMidnight.active = false;
                        stateRef.current.greenMidnight.timer = 0;
                      }
                      forceRender();
                    }}
                    className="w-3 h-3 accent-green-500"
                  />
                  禁止绿色午夜按钮
                </label>

                <label className="flex items-center gap-2 text-[11px] cursor-pointer hover:text-white transition w-full text-purple-400">
                  <input
                    type="checkbox"
                    checked={!!s.debugShowIntentions}
                    onChange={(e) => {
                      stateRef.current.debugShowIntentions = e.target.checked;
                      forceRender();
                    }}
                    className="w-3 h-3 accent-purple-500"
                  />
                  显示怪物意图追踪
                </label>

                <label className="flex items-center gap-2 text-[11px] cursor-pointer hover:text-white transition w-full text-gray-400">
                  <input
                    type="checkbox"
                    checked={!!s.debugHideLogs}
                    onChange={(e) => {
                      stateRef.current.debugHideLogs = e.target.checked;
                      forceRender();
                    }}
                    className="w-3 h-3 accent-gray-500"
                  />
                  隐藏通信日志
                </label>

                <label className="flex items-center gap-2 text-[11px] cursor-pointer hover:text-white transition w-full text-purple-400">
                  <input
                    type="checkbox"
                    checked={!!s.debugForceSeal}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      stateRef.current.debugForceSeal = checked;
                      if (checked) {
                        const b = stateRef.current.beast;
                        b.state = 'contained';
                        b.loc = 'Dungeon';
                        b.satiety = b.maxSatiety || 100;
                        b.nextLoc = null;
                        stateRef.current.logs.push(`[开发者] 强制封印 [地牢实体]`);
                      } else {
                        stateRef.current.logs.push(`[开发者] 解除 [地牢实体] 的绝对封印`);
                      }
                      forceRender();
                    }}
                    className="w-3 h-3 accent-purple-500"
                  />
                  绝对封印 (强制怪物回笼)
                </label>
                
                <div className="w-full flex flex-col gap-1 border-t border-blue-500/30 pt-2 mt-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-blue-300 uppercase font-bold tracking-widest">文本污染频率 (低 → 高)</span>
                    <span className="text-[10px] font-mono text-white bg-blue-900/50 px-1">{(1.0 / (s.glitchCycle * 0.02)).toFixed(1)} Hz</span>
                  </div>
                  <input 
                    type="range" 
                    min="20" 
                    max="500" 
                    step="10"
                    value={s.glitchCycle}
                    onChange={(e) => {
                      stateRef.current.glitchCycle = parseInt(e.target.value);
                      forceRender();
                    }}
                    className="w-full h-1 bg-blue-900 rounded-lg appearance-none cursor-pointer accent-blue-400"
                  />
                  <div className="flex justify-between text-[8px] text-blue-500/70">
                    <span>疯狂 (0.4s)</span>
                    <span>隐晦 (10s)</span>
                  </div>
                </div>

                <div className="w-full flex items-center justify-between gap-2 border-t border-blue-500/30 pt-2 mt-1">
                  <div className="text-[11px] shrink-0 text-green-400">随机事件调试:</div>
                  <button
                    onClick={() => {
                      const isAc = stateRef.current.greenMidnight.active;
                      if (isAc) {
                        stateRef.current.greenMidnight.active = false;
                        stateRef.current.greenMidnight.timer = 0;
                        stateRef.current.logs.push(`[开发者] 强制中止 [绿色的午夜]`);
                      } else {
                        stateRef.current.greenMidnight = { active: true, timer: 0, angle: 0, hitCooldown: 0 };
                        stateRef.current.logs.push(`[开发者] 强制触发 [绿色的午夜]`);
                      }
                      forceRender();
                    }}
                    className="bg-green-900/40 hover:bg-green-700 border border-green-500 text-[10px] px-2 py-1 text-white transition flex-1"
                  >
                    {s.greenMidnight.active ? '中止 绿色的午夜' : '触发 [绿色的午夜]'}
                  </button>
                </div>


                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-blue-500/30 w-full justify-between">
                  <input id="devInputTotal" type="number" placeholder="总属性 (例: 100)" className="w-[120px] bg-[#001] border border-blue-500/50 text-[11px] px-1.5 py-1 text-white outline-none" />
                  <button
                    onClick={() => {
                      const val = parseFloat((document.getElementById('devInputTotal') as HTMLInputElement).value);
                      if (val > 0) {
                        const each = snapVal(val / 5);
                        stateRef.current.playerAttrs = { stamina: each, strength: each, patience: each, intelligence: each, focus: each };
                        stateRef.current.logs.push(`[开发者] 强制均分总属性为 ${val} (${each}x5)`);
                        forceRender();
                      }
                    }}
                    className="bg-blue-900/50 hover:bg-blue-600 border border-blue-500 text-[11px] px-2 py-1 text-white transition flex-1 cursor-pointer"
                  >
                    设置总和
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </aside>

      </div>
    </div>
  );
}

