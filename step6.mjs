import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// 4. Create and inject the prominent Central Combat Dialog Overlay
const dialogOverlayNew = `const CombatDialogOverlay = ({ stateRef }: { stateRef: React.MutableRefObject<GameState> }) => {
  const s = stateRef.current;
  if (s.status !== 'combat' || !s.combatData) return null;
  const cd = s.combatData;
  const npc = s.npcs.find(n => n.id === cd.npcId);
  if (!npc) return null;

  return (
    <div className="absolute inset-0 z-[50] pointer-events-none flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <motion.div 
         key={cd.phase + '_' + cd.timer}
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
        <div className="p-6 sm:p-8 min-h-[160px] flex items-center justify-center">
          <div className="text-[14px] sm:text-[16px] leading-[1.8] text-gray-200 indent-8 font-serif" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
            {cd.dialogText.split('\\n').map((para, idx) => (
              <p key={idx} className="mb-2 last:mb-0">{para}</p>
            ))}
          </div>
        </div>

        {/* Bottom bar indicator */}
        <div className="px-6 py-2 bg-black/30 border-t border-theme-border/20 flex justify-end">
           <span className="animate-[pulse_1s_infinite] text-[10px] text-gray-500">_ _ _</span>
        </div>
      </motion.div>
    </div>
  );
};
`;

code = code.replace(`        <WarningOverlay stateRef={stateRef} />`, `        <WarningOverlay stateRef={stateRef} />\n        <CombatDialogOverlay stateRef={stateRef} />`);

const componentInjectionPoint = `const DivinationOverlay =`;
code = code.replace(componentInjectionPoint, dialogOverlayNew + '\n' + componentInjectionPoint);

fs.writeFileSync('src/App.tsx', code, 'utf-8');
