import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Add `debugShowPaths` to GameState interface
code = code.replace(
  `  debugInfiniteSatiety?: boolean;`,
  `  debugInfiniteSatiety?: boolean;\n  debugShowPaths?: boolean;`
);

// 2. Add to Dev Dashboard
const dashOld = `             <label className="flex items-center gap-2 text-[11px] cursor-pointer hover:text-white transition w-full">
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
             </label>`;

const dashNew = `             <label className="flex items-center gap-2 text-[11px] cursor-pointer hover:text-white transition w-full">
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
                 checked={!!s.debugShowPaths}
                 onChange={(e) => {
                   stateRef.current.debugShowPaths = e.target.checked;
                   forceRender();
                 }}
                 className="w-3 h-3 accent-blue-500"
               />
               显示全图寻路连接线
             </label>`;
code = code.replace(dashOld, dashNew);

// 3. Update the MAP_EDGES drawing in MapPanel
const edgesOld = `             {/* Connections */}
             <svg className="absolute inset-0 overflow-visible pointer-events-none">
               {MAP_EDGES.map(([u, v]) => {
                  const isActiveLine = u === s.playerLoc || v === s.playerLoc;
                  return (
                     <line 
                        key={\`\${u}-\${v}\`}
                        x1={ROOM_LAYOUT[u].x * G_SPACING} y1={ROOM_LAYOUT[u].y * G_SPACING} 
                        x2={ROOM_LAYOUT[v].x * G_SPACING} y2={ROOM_LAYOUT[v].y * G_SPACING} 
                        stroke={isActiveLine ? "var(--color-theme-cyan)" : "var(--color-theme-border)"}
                        strokeWidth={isActiveLine ? 2 : 1}
                        strokeDasharray={isActiveLine ? "none" : "4 4"}
                        opacity={isActiveLine ? 0.6 : 0.2}
                     />
                  );
               })}
             </svg>`;

const edgesNew = `             {/* Connections */}
             <svg className="absolute inset-0 overflow-visible pointer-events-none">
               {MAP_EDGES.map(([u, v]) => {
                  const isActiveLine = u === s.playerLoc || v === s.playerLoc;
                  if (!isActiveLine && !s.debugShowPaths) return null;
                  return (
                     <line 
                        key={\`\${u}-\${v}\`}
                        x1={ROOM_LAYOUT[u].x * G_SPACING} y1={ROOM_LAYOUT[u].y * G_SPACING} 
                        x2={ROOM_LAYOUT[v].x * G_SPACING} y2={ROOM_LAYOUT[v].y * G_SPACING} 
                        stroke={isActiveLine ? "var(--color-theme-cyan)" : "var(--color-theme-border)"}
                        strokeWidth={isActiveLine ? 2 : 1}
                        strokeDasharray={isActiveLine ? "none" : (s.debugShowPaths ? "none" : "4 4")}
                        opacity={isActiveLine ? 0.6 : (s.debugShowPaths ? 0.5 : 0.2)}
                     />
                  );
               })}
             </svg>`;

code = code.replace(edgesOld, edgesNew);

fs.writeFileSync('src/App.tsx', code, 'utf-8');
