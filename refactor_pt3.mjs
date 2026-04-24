import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// 7. Update updateGame NPC processing (lines 1457-1501 aprox)
const oldNpcProcessing = `    // 2. Process NPC Adaptation Timer
    const npcRoomDef = ROOMS[state.npcLoc];
    if (npcRoomDef.attrs.length > 0 && !state.npcAdaptedInRoom) {
      state.npcRoomTimer += dt;
      if (state.npcRoomTimer >= 1.0) {
        const nHP = calcHP(state.npcAttrs);
        const splitAmount = snapVal(nHP / npcRoomDef.attrs.length);

        const newNpcAttrs: Attributes = { stamina: 0, strength: 0, patience: 0, intelligence: 0, focus: 0 };
        npcRoomDef.attrs.forEach(a => {
          newNpcAttrs[a] = splitAmount;
        });

        // Remaining dust floats away or accumulates to correct total due to snap
        state.npcAttrs = snapAll(newNpcAttrs);
        state.npcAdaptedInRoom = true;
        addLog(state, \`🧟 NPC 在 \${npcRoomDef.name} 中完成了环境适应，属性已重新分配至: \${npcRoomDef.attrs.map(a => ATTR_NAMES[a]).join('与')}。\`);
      }
    }

    // 3. Process NPC Movement
    state.npcMoveTimer += dt;
    if (state.npcMoveTimer >= state.npcNextMoveWait) {
      state.npcMoveTimer = 0;
      state.npcNextMoveWait = 5+1.5 + Math.random(); // Next tick between 1.5s and 2.5s

      const npcRoom = ROOMS[state.npcLoc];
      const nextRoomId = npcRoom.adj[Math.floor(Math.random() * npcRoom.adj.length)];
      
      state.npcLoc = nextRoomId;
      state.npcRoomTimer = 0;
      state.npcAdaptedInRoom = false; // reset adaptation flag
      addLog(state, \`👣 检测到异常移动信号信号... (NPC 移动到了未知房间)\`);

      if (state.traps.includes(state.npcLoc)) {
         state.traps = state.traps.filter(t => t !== state.npcLoc);
         addLog(state, \`🔥 [远处] 传来异响！NPC触发了厄运稻草人，全属性被强制削弱！\`);
         for (let key in state.npcAttrs) {
            state.npcAttrs[key as AttrType] = Math.max(0, state.npcAttrs[key as AttrType] / 2);
         }
      }

      checkCombat(state); // Immediately check after movement
    }`;

const newNpcProcessing = `    // 2. Process NPC Adaptation Timers & Movement
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
            // addLog(state, \`🧟 \${npc.name} 在 \${npcRoomDef.name} 中完成了环境适应。\`);
          }
        }

        // 3. Process NPC Movement
        npc.moveTimer += dt;
        if (npc.moveTimer >= npc.nextMoveWait) {
          npc.moveTimer = 0;
          npc.nextMoveWait = 5 + 1.5 + Math.random(); // Next tick

          const npcRoom = ROOMS[npc.loc];
          const nextRoomId = npcRoom.adj[Math.floor(Math.random() * npcRoom.adj.length)];
          
          npc.loc = nextRoomId;
          npc.roomTimer = 0;
          npc.adaptedInRoom = false; // reset adaptation flag
          npcMoved = true;

          if (state.traps.includes(npc.loc)) {
             state.traps = state.traps.filter(t => t !== npc.loc);
             addLog(state, \`🔥 [远处] 传来异响！\${npc.name} 触发了厄运稻草人，全属性被强制削弱！\`);
             for (let key in npc.attrs) {
                npc.attrs[key as AttrType] = Math.max(0, npc.attrs[key as AttrType] / 2);
             }
          }
        }
    });
    
    if (npcMoved) {
       addLog(state, \`👣 检测到异常移动信号...\`);
       checkCombat(state); // Immediately check after movement loop
    }`;

code = code.replace(oldNpcProcessing, newNpcProcessing);
fs.writeFileSync('src/App.tsx', code, 'utf-8');
