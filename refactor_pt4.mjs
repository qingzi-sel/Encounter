import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// replace checkCombat and surrounding parts
const oldCombatCheckingAndResult = 
`    if (state.status === 'combat' && state.combatData) {
       const cd = state.combatData;
       cd.timer += dt;

       if (cd.phase === 'starting' && cd.timer > 1.0) {
          cd.phase = 'comparing';
          addLog(state, \`📊 属性比对开始...\`);
       } else if (cd.phase === 'comparing' && cd.timer > 2.5) {
          cd.phase = 'result';
          if (cd.winner === 'player') {
             (Object.keys(cd.stolenValues) as AttrType[]).forEach(a => {
                 state.npcAttrs[a] -= cd.stolenValues[a] || 0;
                 state.playerAttrs[a] += cd.stolenValues[a] || 0;
             });
             state.playerAttrs = snapAll(state.playerAttrs);
             state.npcAttrs = snapAll(state.npcAttrs);
             if (cd.isExecution) {
                addLog(state, \`💀 斩杀！目标全线溃败，你吸取了其全部剩余 \${cd.stealTotal.toFixed(1)} 点属性。\`);
             } else {
                addLog(state, \`🏆 胜！汲取 \${cd.stealTotal.toFixed(1)} 点。\`);
             }
          } else if (cd.winner === 'npc') {
             (Object.keys(cd.stolenValues) as AttrType[]).forEach(a => {
                 state.playerAttrs[a] -= cd.stolenValues[a] || 0;
                 state.npcAttrs[a] += cd.stolenValues[a] || 0;
             });
             state.playerAttrs = snapAll(state.playerAttrs);
             state.npcAttrs = snapAll(state.npcAttrs);
             addLog(state, \`💀 败！被夺走 \${cd.stealTotal.toFixed(1)} 点。\`);
          } else {
             addLog(state, \`🤝 平局！无属性变动。\`);
          }
       } else if (cd.phase === 'result' && cd.timer > 4.5) {
          if (calcHP(state.playerAttrs) <= 0 || calcHP(state.npcAttrs) <= 0) {
             state.status = 'playing'; 
             state.combatData = undefined;
             return;
          }
          const allRoomIds = Object.keys(ROOMS) as RoomId[];
          const validDestinations = allRoomIds.filter(r => r !== state.playerLoc);
          const dest = validDestinations[Math.floor(Math.random() * validDestinations.length)];
          state.playerLoc = dest;
          addLog(state, \`🌀 战后排斥引擎启动，系统自动执行紧急跳跃至 [\${ROOMS[dest].name}]。\`);

          state.status = 'playing';
          state.combatData = undefined;
       }
       return;
    }`;

const newCombatCheckingAndResult = 
`    if (state.status === 'combat' && state.combatData) {
       const cd = state.combatData;
       const npc = state.npcs.find(n => n.id === cd.npcId);
       if (!npc) { state.status = 'playing'; state.combatData = undefined; return; }

       cd.timer += dt;

       if (cd.phase === 'starting' && cd.timer > 1.0) {
          cd.phase = 'comparing';
          addLog(state, \`📊 属性比对开始...\`);
       } else if (cd.phase === 'comparing' && cd.timer > 2.5) {
          cd.phase = 'result';
          if (cd.winner === 'player') {
             (Object.keys(cd.stolenValues) as AttrType[]).forEach(a => {
                 npc.attrs[a] -= cd.stolenValues[a] || 0;
                 state.playerAttrs[a] += cd.stolenValues[a] || 0;
             });
             state.playerAttrs = snapAll(state.playerAttrs);
             npc.attrs = snapAll(npc.attrs);
             if (cd.isExecution) {
                npc.isDead = true;
                addLog(state, \`💀 斩杀！目标全线溃败，你吸取了其全部剩余 \${cd.stealTotal.toFixed(1)} 点属性。\`);
             } else {
                addLog(state, \`🏆 胜！汲取 \${cd.stealTotal.toFixed(1)} 点。\`);
             }
          } else if (cd.winner === 'npc') {
             (Object.keys(cd.stolenValues) as AttrType[]).forEach(a => {
                 state.playerAttrs[a] -= cd.stolenValues[a] || 0;
                 npc.attrs[a] += cd.stolenValues[a] || 0;
             });
             state.playerAttrs = snapAll(state.playerAttrs);
             npc.attrs = snapAll(npc.attrs);
             addLog(state, \`💀 败！被 \${npc.name} 夺走 \${cd.stealTotal.toFixed(1)} 点。\`);
          } else {
             addLog(state, \`🤝 平局！无属性变动。\`);
          }
       } else if (cd.phase === 'result' && cd.timer > 4.5) {
          if (calcHP(npc.attrs) <= 0) {
             npc.isDead = true;
             addLog(state, \`📉 \${npc.name} 信号永久消失。\`);
          }
          if (calcHP(state.playerAttrs) <= 0) {
             state.status = 'playing'; 
             state.combatData = undefined;
             return;
          }
          if (!npc.isDead) { // Both survived: random teleport player
             const allRoomIds = Object.keys(ROOMS) as RoomId[];
             const validDestinations = allRoomIds.filter(r => r !== state.playerLoc);
             const dest = validDestinations[Math.floor(Math.random() * validDestinations.length)];
             state.playerLoc = dest;
             addLog(state, \`🌀 战后排斥引擎启动，自动紧急跳跃飞至 [\${ROOMS[dest].name}]。\`);
          }
          state.status = 'playing';
          state.combatData = undefined;
       }
       return;
    }`;

code = code.replace(oldCombatCheckingAndResult, newCombatCheckingAndResult);

fs.writeFileSync('src/App.tsx', code, 'utf-8');
