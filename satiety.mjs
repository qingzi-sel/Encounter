import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Add `debugInfiniteSatiety` to GameState interface
code = code.replace(
  `  debugInfiniteInvisibility?: boolean;\n  debugInvincibleCombat?: boolean;`,
  `  debugInfiniteInvisibility?: boolean;\n  debugInvincibleCombat?: boolean;\n  debugInfiniteSatiety?: boolean;`
);

// 2. Modify updateGame to respect `debugInfiniteSatiety`
const beastOld = `    // 4. Process Beast
    const b = state.beast;
    if (b.state === 'contained') {
       if (state.isFeedingBeast && state.playerLoc === 'Dungeon') {
          b.satiety += 15 * dt;
          if (b.satiety > 100) b.satiety = 100;
       } else {
          b.satiety -= 2 * dt;
       }

       if (b.satiety <= 0) {
          b.satiety = 0;
          b.state = 'escaped';
          addLog(state, '🚨 警告：地牢怪物已突破收容！正在全区域猎杀！');
       }`;

const beastNew = `    // 4. Process Beast
    const b = state.beast;
    if (b.state === 'contained') {
       if (state.debugInfiniteSatiety) {
          b.satiety = 100;
       } else if (state.isFeedingBeast && state.playerLoc === 'Dungeon') {
          b.satiety += 15 * dt;
          if (b.satiety > 100) b.satiety = 100;
       } else {
          b.satiety -= 2 * dt;
       }

       if (b.satiety <= 0) {
          b.satiety = 0;
          b.state = 'escaped';
          addLog(state, '🚨 警告：地牢怪物已突破收容！正在全区域猎杀！');
       }`;
code = code.replace(beastOld, beastNew);

// 3. Add to Dev Dashboard
const devDashOld = `             <label className="flex items-center gap-2 text-[11px] cursor-pointer hover:text-white transition w-full">
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
             </label>`;

const devDashNew = `             <label className="flex items-center gap-2 text-[11px] cursor-pointer hover:text-white transition w-full">
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
             </label>`;
code = code.replace(devDashOld, devDashNew);

fs.writeFileSync('src/App.tsx', code, 'utf-8');
