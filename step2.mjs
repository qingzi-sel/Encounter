import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const mapSvgOld = `             {/* Rooms */}
             {(Object.values(ROOMS) as RoomDef[]).map((r) => {`;

const mapSvgNew = `             {/* Green Midnight Laser Rendering */}
             {s.greenMidnight.active && (() => {
                 const origin = ROOM_LAYOUT['LivingRoom'];
                 const oX = origin.x * G_SPACING;
                 const oY = origin.y * G_SPACING;
                 const length = 2000; // extend far out
                 const thicc = s.greenMidnight.hitCooldown > 0 ? 12 : 5;
                 return (
                     <g transform={\`rotate(\${s.greenMidnight.angle}, \${oX}, \${oY})\`} className={s.greenMidnight.hitCooldown > 0 ? 'animate-pulse' : ''}>
                         <line x1={oX - length} y1={oY} x2={oX + length} y2={oY} stroke="#22c55e" strokeWidth={thicc} opacity={0.8} filter="drop-shadow(0 0 10px #22c55e)"/>
                         <line x1={oX} y1={oY - length} x2={oX} y2={oY + length} stroke="#22c55e" strokeWidth={thicc} opacity={0.8} filter="drop-shadow(0 0 10px #22c55e)"/>
                         <circle cx={oX} cy={oY} r={16} fill="#000" stroke="#22c55e" strokeWidth={3} />
                         <circle cx={oX} cy={oY} r={6} fill="#22c55e" className="animate-ping" />
                     </g>
                 )
             })()}

             {/* Rooms */}
             {(Object.values(ROOMS) as RoomDef[]).map((r) => {`;

code = code.replace(mapSvgOld, mapSvgNew);

const devPanelOld = `             <label className="flex items-center gap-2 text-[11px] cursor-pointer hover:text-white transition w-full">
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

             <div className="flex items-center gap-2 mt-1 w-full justify-between">`;

const devPanelNew = `             <label className="flex items-center gap-2 text-[11px] cursor-pointer hover:text-white transition w-full">
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

             <div className="w-full flex items-center justify-between gap-2 border-t border-blue-500/30 pt-2 mt-1">
               <div className="text-[11px] shrink-0 text-green-400">随机事件调试:</div>
               <button
                  onClick={() => {
                     const isAc = stateRef.current.greenMidnight.active;
                     if (isAc) {
                        stateRef.current.greenMidnight.active = false;
                        stateRef.current.greenMidnight.timer = 0;
                        stateRef.current.logs.push(\`[开发者] 强制中止 [绿色的午夜]\`);
                     } else {
                        stateRef.current.greenMidnight = { active: true, timer: 0, angle: 0, hitCooldown: 0 };
                        stateRef.current.logs.push(\`[开发者] 强制触发 [绿色的午夜]\`);
                     }
                     forceRender();
                  }}
                  className="bg-green-900/40 hover:bg-green-700 border border-green-500 text-[10px] px-2 py-1 text-white transition flex-1"
               >
                 {s.greenMidnight.active ? '中止 绿色的午夜' : '触发 [绿色的午夜]'}
               </button>
             </div>

             <div className="flex items-center gap-2 mt-2 pt-2 border-t border-blue-500/30 w-full justify-between">`;

code = code.replace(devPanelOld, devPanelNew);

fs.writeFileSync('src/App.tsx', code, 'utf-8');
