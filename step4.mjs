import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const overlayOld = `const CombatDialogOverlay = ({ stateRef }: { stateRef: React.MutableRefObject<GameState> }) => {
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
         className="relative z-10 w-full max-w-2xl bg-[#0a0a0f] border border-theme-border/50 shadow-[0_0_40px_rgba(0,0,0,0.8)] overflow-hidden"
      >
        {/* Top Header decoration */}
        <div 
          className="h-1 w-full" 
          style={{ backgroundImage: \`linear-gradient(90deg, transparent, \${npc.color}, transparent)\` }}
        />
        <div className="px-6 py-4 border-b border-theme-border/30 flex justify-between items-center bg-black/50">
           <span className="text-[12px] uppercase tracking-[0.2em] font-bold text-gray-400">
             Encounter Data
           </span>
           <span className="text-[11px] font-mono tracking-widest animate-pulse" style={{ color: npc.color }}>
             {cd.phase === 'starting' ? '>>> DETECTED' : cd.phase === 'comparing' ? '>>> CLASHING' : '>>> RESULT'}
           </span>
        </div>
        
        {/* Content area */}
        <div className="p-6 sm:p-8 min-h-[200px] flex items-center justify-center bg-black/80">
          <motion.div 
            key={cd.phase}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-[15px] sm:text-[17px] leading-[1.8] text-[#e0e0e0] font-sans font-medium tracking-wide w-full"
          >
            {cd.dialogText.split('\\n').map((para, idx) => (
              <p key={idx} className="mb-3 last:mb-0 indent-8">{para}</p>
            ))}
          </motion.div>
        </div>

        {/* Bottom bar indicator */}
        <div className="px-6 py-2 bg-black/30 border-t border-theme-border/20 flex justify-end">
           <span className="animate-[pulse_1s_infinite] text-[10px] text-gray-500">_ _ _</span>
        </div>
      </motion.div>
    </div>
  );
};`;

const overlayNew = `const CombatDialogOverlay = ({ stateRef }: { stateRef: React.MutableRefObject<GameState> }) => {
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
            <div className="h-1 w-full" style={{ backgroundImage: \`linear-gradient(90deg, transparent, \${npc.color}, transparent)\` }} />
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
                {cd.dialogText.split('\\n').map((para, idx) => (
                  <p key={idx} className="mb-3 last:mb-0 indent-8">{para}</p>
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
               <div className="h-1 w-full" style={{ backgroundImage: \`linear-gradient(90deg, transparent, \${npc.color}, transparent)\` }} />
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
                                <div className={\`font-mono text-[16px] font-bold transition-colors \${pWon ? 'text-theme-cyan' : isRolling ? 'text-gray-400' : 'text-gray-600'}\`}>
                                   {pRoll}
                                </div>
                                <div className="text-[10px] text-gray-600">VS</div>
                                <div className={\`font-mono text-[16px] font-bold transition-colors \${nWon ? 'text-theme-red' : isRolling ? 'text-gray-400' : 'text-gray-600'}\`}>
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
                             {nWon && !s.debugInvincibleCombat && (
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
                                      className={\`text-[11px] font-bold \${pWon ? 'text-theme-cyan' : 'text-theme-red'}\`}
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
};`;
code = code.replace(overlayOld, overlayNew);

const uiSidebarOld = `      {/* Result Phase */}
      {(cd.phase === 'resolving' || cd.phase === 'result') && (
         <div className="bg-theme-bg/90 border border-theme-text/20 p-2 text-center text-[12px] font-bold mt-2 shadow-[0_0_10px_rgba(0,0,0,0.5)] relative">
            {cd.winner === 'player' ? (`;

const uiSidebarNew = `      {/* Result Phase */}
      {(cd.phase === 'resolving') && (
         <div className="bg-theme-bg/90 border border-theme-text/20 p-2 text-center text-[12px] font-bold mt-2 shadow-[0_0_10px_rgba(0,0,0,0.5)] relative">
            {cd.results.filter(r => r.winner === 'player').length > cd.results.filter(r => r.winner === 'npc').length ? (`;

// Only minimal replacement in case it exists, actually it looks like the sidebar logic is tightly coupled, let's remove the sidebar result text to avoid conflicts
const sidebarKillOld = `      {/* Result Phase */}
      {cd.phase === 'result' && (
         <div className="bg-theme-bg/90 border border-theme-text/20 p-2 text-center text-[12px] font-bold mt-2 shadow-[0_0_10px_rgba(0,0,0,0.5)] relative">
            {cd.winner === 'player' ? (
               <div className="text-theme-cyan">
                 {cd.isExecution ? '⭐ 目标被制裁拔除！' : '战胜目标！'}<br/>
                 <span className="text-[10px] font-normal leading-tight block mt-1">
                   {cd.isExecution ? \`已全功率吸收全部残余能量 \${cd.stealTotal.toFixed(1)} 点。\` : \`成功剥夺 \${cd.stealTotal.toFixed(1)} 点。\`}
                 </span>
               </div>
            ) : cd.winner === 'npc' ? (
               <div className="text-theme-red">
                 战力不敌！<br/>
                 <span className="text-[10px] font-normal leading-tight block mt-1">
                   被强行夺走 {cd.stealTotal.toFixed(1)} 点。
                 {s.debugInvincibleCombat && <span className="text-yellow-500 block mt-1">[Dev免疫生效]</span>}
                 </span>
               </div>
            ) : (
               <div className="text-gray-400">旗鼓相当</div>
            )}
         </div>
      )}`;
      
code = code.replace(sidebarKillOld, '');

fs.writeFileSync('src/App.tsx', code, 'utf-8');
