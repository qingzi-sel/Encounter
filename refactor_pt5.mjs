import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const oldCheck1 = \`    const pHP = calcHP(state.playerAttrs);
    const nHP = calcHP(state.npcAttrs);

    // Check Death constraints independently
    if (pHP <= 0) {
       addLog(state, '🔴 生命归零，你死亡了。游戏结束。');
       state.status = 'gameover';
       return;
    }
    if (nHP <= 0) {
       addLog(state, '🏆 NPC生命归零，你取得了胜利！');
       state.status = 'gameover';
       return;
    }

    // --- 绝对死局（斩杀线）判定 ---
    // 本地图最多双属性房间。NPC处于最高分散的房间时，最低输出界限也是总HP的50%
    // 换言之：如果玩家现在的总血量 < NPC总血量的一半。玩家将永远无法在任何遭遇战中吸取哪怕0.1点HP。
    // 在这局绝对不可能生还的猫鼠游戏中，将直接触发系统级的抹杀。
    if (pHP > 0 && pHP < (nHP / 2) - 0.05) {
       addLog(state, \`⚠️ 【高维重力警告】\`);
       addLog(state, \`💀 你的生命总额（\${pHP.toFixed(1)}）已跌破敌人最低可用功率（\${(nHP/2).toFixed(1)}）。\`);
       addLog(state, \`🔴 绝对死局触发！在毫无胜算的数值黑洞面前，你被规则强制抹除！\`);
       state.status = 'gameover';
       return;
    }\`;

const newCheck1 = \`    const pHP = calcHP(state.playerAttrs);

    // Check Death constraints independently
    if (pHP <= 0) {
       addLog(state, '🔴 生命归零，你死亡了。游戏结束。');
       state.status = 'gameover';
       return;
    }
    
    // Check if player won
    if (state.npcs.every(n => n.isDead)) {
       addLog(state, '🏆 所有敌对实体生命归零，你夺取了最后的胜利！');
       state.status = 'gameover';
       return;
    }

    const aliveNpcs = state.npcs.filter(n => !n.isDead);
    let potentialDeadEnd = true;
    for (const npc of aliveNpcs) {
        const nHP = calcHP(npc.attrs);
        if (pHP >= (nHP / 2) - 0.05) {
           potentialDeadEnd = false;
        }
    }

    if (potentialDeadEnd && aliveNpcs.length > 0) {
       addLog(state, \`⚠️ 【高维重力警告】\`);
       addLog(state, \`💀 你的生命总额已跌破所有剩余敌人的最低可用功率。\`);
       addLog(state, \`🔴 绝对死局触发！毫无胜算的局面下，系统启动自毁逻辑！\`);
       state.status = 'gameover';
       return;
    }\`;

code = code.replace(oldCheck1, newCheck1);

const oldCheckCombat = \`  const checkCombat = (state: GameState) => {
    if (state.status !== 'playing') return;
    if (state.playerLoc === state.npcLoc) {
      if (state.playerLoc === 'DressingRoom') {
         return; 
      }

      if (state.invisibilityTimer > 0) {
         addLog(state, \`👻 NPC进入了房间，但由于处于以太虚无状态，它无法察觉你的存在。\`);
         return;
      }

      if (state.pendingPlayerAttrs) {
         state.pendingPlayerAttrs = null;
         state.reallocTimer = 0;
         addLog(state, \`⚠️ 警告：重组进程因遭遇战被强制中断。\`);
      }

      const activeAttrs = ROOMS[state.playerLoc].attrs;
      let pScore = 0;
      let nScore = 0;
      const playerPreAttrs: Partial<Attributes> = {};
      const npcPreAttrs: Partial<Attributes> = {};

      activeAttrs.forEach(a => {
        const effP = getEffectivePlayerAttr(state, a);
        pScore += effP;
        nScore += state.npcAttrs[a];
        playerPreAttrs[a] = effP;
        npcPreAttrs[a] = state.npcAttrs[a];
      });

      let winner: 'player' | 'npc' | 'draw' = 'draw';
      let stealTotal = 0;
      const stolenValues: Partial<Attributes> = {};
      let isExecution = false;
      const currentNpcHp = calcHP(state.npcAttrs);
      
      if (pScore > nScore + 0.01) {
        winner = 'player';
        if (currentNpcHp < 20) {
           isExecution = true;
           (Object.keys(state.npcAttrs) as AttrType[]).forEach(a => {
              if (state.npcAttrs[a] > 0) {
                 stolenValues[a] = state.npcAttrs[a];
                 stealTotal += state.npcAttrs[a];
              }
           });
        } else {
           activeAttrs.forEach(a => {
              let stolenAmt = snapVal((state.npcAttrs[a] || 0) * 0.5);
              stolenValues[a] = stolenAmt;
              stealTotal += stolenAmt;
           });
        }
      } else if (nScore > pScore + 0.01) {
        winner = 'npc';
        activeAttrs.forEach(a => {
           let stolenAmt = snapVal((state.playerAttrs[a] || 0) * 0.5);
           stolenValues[a] = stolenAmt;
           stealTotal += stolenAmt;
        });
      }
      
      state.status = 'combat';
      state.combatData = {
         timer: 0,
         phase: 'starting',
         roomId: state.playerLoc,
         attrsCompared: activeAttrs,
         playerSum: pScore,
         npcSum: nScore,
         winner,
         stealTotal,
         stolenValues,
         playerPreAttrs,
         npcPreAttrs,
         isExecution
      };
      
      addLog(state, \`⚔️ 遭遇战触发！战斗期间禁止移动。\`);
    }
  };\`;

const newCheckCombat = \`  const checkCombat = (state: GameState) => {
    if (state.status !== 'playing') return;
    
    // Find an enemy in the same room that isn't dead
    const npc = state.npcs.find(n => !n.isDead && n.loc === state.playerLoc);

    if (npc) {
      if (state.playerLoc === 'DressingRoom') {
         return; 
      }

      if (state.invisibilityTimer > 0) {
         // addLog(state, \`👻 NPC进入了房间，但由于处于以太虚无状态，它无法察觉你的存在。\`);
         return;
      }

      if (state.pendingPlayerAttrs) {
         state.pendingPlayerAttrs = null;
         state.reallocTimer = 0;
         addLog(state, \`⚠️ 警告：重组进程因遭遇战被强制中断。\`);
      }

      const activeAttrs = ROOMS[state.playerLoc].attrs;
      let pScore = 0;
      let nScore = 0;
      const playerPreAttrs: Partial<Attributes> = {};
      const npcPreAttrs: Partial<Attributes> = {};

      activeAttrs.forEach(a => {
        const effP = getEffectivePlayerAttr(state, a);
        pScore += effP;
        nScore += npc.attrs[a];
        playerPreAttrs[a] = effP;
        npcPreAttrs[a] = npc.attrs[a];
      });

      let winner: 'player' | 'npc' | 'draw' = 'draw';
      let stealTotal = 0;
      const stolenValues: Partial<Attributes> = {};
      let isExecution = false;
      const currentNpcHp = calcHP(npc.attrs);
      
      if (pScore > nScore + 0.01) {
        winner = 'player';
        if (currentNpcHp < 20) {
           isExecution = true;
           (Object.keys(npc.attrs) as AttrType[]).forEach(a => {
              if (npc.attrs[a] > 0) {
                 stolenValues[a] = npc.attrs[a];
                 stealTotal += npc.attrs[a];
              }
           });
        } else {
           activeAttrs.forEach(a => {
              let stolenAmt = snapVal((npc.attrs[a] || 0) * 0.5);
              stolenValues[a] = stolenAmt;
              stealTotal += stolenAmt;
           });
        }
      } else if (nScore > pScore + 0.01) {
        winner = 'npc';
        activeAttrs.forEach(a => {
           let stolenAmt = snapVal((state.playerAttrs[a] || 0) * 0.5);
           stolenValues[a] = stolenAmt;
           stealTotal += stolenAmt;
        });
      }
      
      state.status = 'combat';
      state.combatData = {
         timer: 0,
         phase: 'starting',
         roomId: state.playerLoc,
         npcId: npc.id,
         attrsCompared: activeAttrs,
         playerSum: pScore,
         npcSum: nScore,
         winner,
         stealTotal,
         stolenValues,
         playerPreAttrs,
         npcPreAttrs,
         isExecution
      };
      
      addLog(state, \`⚔️ 遭遇战触发！与 \${npc.name} 交火！战斗期间禁止移动。\`);
    }
  };\`;

code = code.replace(oldCheckCombat, newCheckCombat);

fs.writeFileSync('src/App.tsx', code, 'utf-8');
