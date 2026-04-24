import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// 3. Modify updateGame for Combat phases
const updateCombatOld = `       if (cd.phase === 'starting' && cd.timer > 1.0) {
          cd.phase = 'comparing';
          const roomName = ROOMS[state.playerLoc].name;
          cd.attrsCompared.forEach(attr => {
              const text = ACTION_TEXTS[npc.color]?.[attr]?.replace('{room}', roomName) || '进行了激烈的属性碰撞。';
              addLog(state, \`💥 \${text}\`);
          });
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
                addLog(state, \`💀 【抹灭殆尽】你将 \${npc.name} 彻底撕碎并吞噬了所有剩余 \${cd.stealTotal.toFixed(1)} 点资本。\`);
             } else {
                const text = SUCCESS_TEXTS[npc.color] || '反击成功获得优势。';
                addLog(state, \`🟢 \${text}\`);
                addLog(state, \`🏆 胜！汲取 \${cd.stealTotal.toFixed(1)} 点。\`);
             }
          } else if (cd.winner === 'npc') {
             if (state.debugInvincibleCombat) {
                 addLog(state, \`🔴 \${FAILURE_TEXTS[npc.color] || '遭到重创'}\`);
                 addLog(state, \`🤖 [开发者] 无敌模式已开启，免疫了 \${cd.stealTotal.toFixed(1)} 点剥夺。\`);
             } else {
                 (Object.keys(cd.stolenValues) as AttrType[]).forEach(a => {
                     state.playerAttrs[a] -= cd.stolenValues[a] || 0;
                     npc.attrs[a] += cd.stolenValues[a] || 0;
                 });
                 state.playerAttrs = snapAll(state.playerAttrs);
                 npc.attrs = snapAll(npc.attrs);
                 addLog(state, \`🔴 \${FAILURE_TEXTS[npc.color] || '遭到重创'}\`);
                 addLog(state, \`💀 败！被 \${npc.name} 剥夺 \${cd.stealTotal.toFixed(1)} 点。\`);
             }
          } else {
             addLog(state, \`🤝 双方僵持不下，力量相互抵消。\`);
          }
       } else if (cd.phase === 'result' && cd.timer > 4.5) {`;

const updateCombatNew = `       // Adjust timing based on if it's first encounter
       const startDuration = cd.isFirstEncounter ? 3.5 : 1.5;
       
       if (cd.phase === 'starting' && cd.timer > startDuration) {
          cd.phase = 'comparing';
          const roomName = ROOMS[state.playerLoc].name;
          const combatTextLines: string[] = [];
          cd.attrsCompared.forEach(attr => {
              const text = ACTION_TEXTS[npc.color]?.[attr]?.replace('{room}', roomName) || '在撕裂的空间中发生了激烈的属性碰撞。';
              combatTextLines.push(text);
          });
          cd.dialogText = combatTextLines.join('\\n');
       } else if (cd.phase === 'comparing' && cd.timer > startDuration + 2.5) {
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
                cd.dialogText = \`【抹灭殆尽】你将 \${npc.name} 彻底撕碎并吞噬了所有剩余的 \${cd.stealTotal.toFixed(1)} 点核心资本。它被彻底从这片维度抹除了。\`;
                addLog(state, \`💀 夺取全属性并抹杀了实体。\`);
             } else {
                cd.dialogText = SUCCESS_TEXTS[npc.color] || '反击成功获得优势。';
                addLog(state, \`🏆 共汲取 \${cd.stealTotal.toFixed(1)} 点参数。\`);
             }
          } else if (cd.winner === 'npc') {
             cd.dialogText = FAILURE_TEXTS[npc.color] || '遭到重创';
             if (state.debugInvincibleCombat) {
                 cd.dialogText += '\\n\\n[Dev] 不死身免疫开启，未被夺走属性！';
                 addLog(state, \`🤖 免疫 \${cd.stealTotal.toFixed(1)} 点削弱。\`);
             } else {
                 (Object.keys(cd.stolenValues) as AttrType[]).forEach(a => {
                     state.playerAttrs[a] -= cd.stolenValues[a] || 0;
                     npc.attrs[a] += cd.stolenValues[a] || 0;
                 });
                 state.playerAttrs = snapAll(state.playerAttrs);
                 npc.attrs = snapAll(npc.attrs);
                 addLog(state, \`🔴 失败，被剥夺 \${cd.stealTotal.toFixed(1)} 点参数。\`);
             }
          } else {
             cd.dialogText = "你们的力量在真空中相互抵消，谁也无法奈何对方。空间封锁暂时解除。";
          }
       } else if (cd.phase === 'result' && cd.timer > startDuration + 5.5) {`;

code = code.replace(updateCombatOld, updateCombatNew);
fs.writeFileSync('src/App.tsx', code, 'utf-8');
