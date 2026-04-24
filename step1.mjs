import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Add GreenMidnightState interface and game fields
const typesOld = `interface GameState {
  status: 'setup' | 'playing' | 'gameover' | 'combat' | 'reading' | 'divination';
  combatData?: CombatData;`;

const typesNew = `interface GreenMidnightState {
  active: boolean;
  timer: number;
  angle: number;
  hitCooldown: number;
}

interface GameState {
  status: 'setup' | 'playing' | 'gameover' | 'combat' | 'reading' | 'divination';
  combatData?: CombatData;
  globalEventTimer: number;
  greenMidnight: GreenMidnightState;`;

code = code.replace(typesOld, typesNew);

// 2. Initial state
const initOld = `    beast: {
      satiety: 100,
      state: 'contained',
      loc: 'Dungeon',
      moveTimer: 0,
    },
    isFeedingBeast: false,`;

const initNew = `    globalEventTimer: 0,
    greenMidnight: { active: false, timer: 0, angle: 0, hitCooldown: 0 },
    beast: {
      satiety: 100,
      state: 'contained',
      loc: 'Dungeon',
      moveTimer: 0,
    },
    isFeedingBeast: false,`;

code = code.replace(initOld, initNew);

// 3. Game tick updates
const tickOld = `    // --- 绝对死局判定 ---
    const aliveNpcs = state.npcs.filter(n => !n.isDead);`;

const tickNew = `    // 5. Global Events - Green Midnight Check
    state.globalEventTimer += dt;
    if (state.globalEventTimer >= 60.0 && !state.greenMidnight.active) {
        state.globalEventTimer = 0;
        state.greenMidnight = { active: true, timer: 0, angle: 0, hitCooldown: 0 };
        addLog(state, \`🟩 [全局事件] 绿色的午夜 已启动！起居室生成了扫地机炮台！\`);
        playSound('warning');
    }

    if (state.greenMidnight.active) {
        state.greenMidnight.timer += dt;
        state.greenMidnight.angle = (state.greenMidnight.timer * 36) % 360; // 360 over 10s
        if (state.greenMidnight.hitCooldown > 0) {
            state.greenMidnight.hitCooldown -= dt;
        }

        if (state.greenMidnight.timer >= 10.0) {
            state.greenMidnight.active = false;
            state.greenMidnight.timer = 0;
            addLog(state, \`🟩 [事件结束] 绿色的午夜已结束，炮台沉入阴影。\`);
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
               const beams = [lAngle, (lAngle+90)%360, (lAngle+180)%360, (lAngle+270)%360];
               for (const beam of beams) {
                   let diff = Math.abs(angleToPlayer - beam);
                   if (diff > 180) diff = 360 - diff;
                   if (diff <= 15) { // 15 degrees tolerance
                       isHit = true;
                       break;
                   }
               }
            }

            if (isHit && state.invisibilityTimer <= 0 && !state.debugInfiniteInvisibility) {
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
                addLog(state, \`💥 [绿色的午夜] 致命绿光射中！你失去了总计 \${snapVal(toLoseTotal).toFixed(1)} 点属性！\`);
                playSound('hit');
            }
        }
    }

    // --- 绝对死局判定 ---
    const aliveNpcs = state.npcs.filter(n => !n.isDead);`;

code = code.replace(tickOld, tickNew);

// 4. Update DevPanel and MapPanel Rendering
fs.writeFileSync('src/App.tsx', code, 'utf-8');
