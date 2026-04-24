import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// 6. NpcStatePanel replacement
code = code.replace(
  `const NpcStatePanel = ({ stateRef }: { stateRef: React.MutableRefObject<GameState> }) => {
  const s = stateRef.current;
  const hp = calcHP(s.npcAttrs);
  const room = ROOMS[s.npcLoc];

  return (
    <div className="flex flex-col shrink-0 mb-4 pb-4 border-b border-theme-border/50">
      <div className="text-[12px] text-theme-red uppercase border-b border-theme-red/40 pb-1 mb-3 shrink-0 flex items-center justify-between">
        <span className="flex items-center gap-1">
          <Activity size={14} /> 敌对目标探测
        </span>
        {s.status === 'playing' ? (
          <span className="text-[10px] animate-pulse">实时追踪</span>
        ) : (
          <span className="text-[10px] opacity-50">信号丢失</span>
        )}
      </div>

      <div className="flex justify-between items-center bg-black border border-theme-red/30 p-2 mb-3 relative overflow-hidden">
         <div className="absolute left-0 top-0 h-full bg-[linear-gradient(90deg,var(--color-theme-red),transparent)] opacity-20 transition-all duration-200" style={{ width: \`\${Math.min(100, Math.max(0, hp))}%\` }}></div>
         <span className="font-semibold text-theme-red text-[10px] z-10 relative">威胁总值 (HP)</span>
         <span className="text-[14px] font-bold z-10 relative text-theme-red">{hp.toFixed(1)}</span>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        {(Object.keys(ATTR_NAMES) as AttrType[]).map(key => (
          <div key={key} className="flex flex-col text-[11px] p-1.5 border border-theme-red/10 bg-[var(--color-theme-bg)]">
            <span className="text-theme-red/60 text-[9px] mb-[2px]">{ATTR_NAMES[key]}</span>
            <span className="text-theme-red font-bold font-mono">{s.npcAttrs[key].toFixed(1)}</span>
          </div>
        ))}
      </div>

      <div className="text-[10px] text-theme-red/70 bg-theme-red/5 px-2 py-1.5 border-l-2 border-theme-red/40 flex justify-between items-center">
        <span>当前所在区域:</span>
        <span className="font-bold tracking-widest">{room.name}</span>
      </div>
    </div>
  );
};`,
  `const NpcStatePanel = ({ stateRef }: { stateRef: React.MutableRefObject<GameState> }) => {
  const s = stateRef.current;
  const aliveNpcs = s.npcs.filter(n => !n.isDead);

  return (
    <div className="flex flex-col shrink-0 mb-4 pb-4 border-b border-theme-border/50">
      <div className="text-[12px] text-theme-red uppercase border-b border-theme-red/40 pb-1 mb-3 shrink-0 flex items-center justify-between">
        <span className="flex items-center gap-1">
          <Activity size={14} /> 敌对目标探测 ({aliveNpcs.length})
        </span>
        {s.status === 'playing' ? (
          <span className="text-[10px] animate-pulse">流感应追踪</span>
        ) : (
          <span className="text-[10px] opacity-50">信号遮蔽</span>
        )}
      </div>

      {aliveNpcs.length === 0 && (
         <div className="text-[10px] text-[#8b949e] italic text-center py-4 border border-theme-border/30">
           没有探测到任何敌意实体。
         </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
         {aliveNpcs.map(npc => {
            const hp = calcHP(npc.attrs);
            const room = ROOMS[npc.loc];
            return (
              <div key={npc.id} className="border border-theme-red/20 p-2 relative bg-black/40">
                <div className="absolute top-0 right-0 p-1 flex items-center justify-center">
                  <div style={{
                     borderLeft: '4px solid transparent',
                     borderRight: '4px solid transparent',
                     borderBottom: \`8px solid \${npc.color}\`,
                  }} />
                </div>
                <div className="text-[10px] font-bold text-theme-red mb-1 tracking-widest">{npc.name}</div>
                
                <div className="flex justify-between items-center bg-black border border-theme-red/30 p-1 mb-2 relative overflow-hidden">
                   <div className="absolute left-0 top-0 h-full bg-[linear-gradient(90deg,var(--color-theme-red),transparent)] opacity-20 transition-all duration-200" style={{ width: \`\${Math.min(100, Math.max(0, hp))}%\` }}></div>
                   <span className="font-semibold text-theme-red text-[9px] z-10 relative">HP</span>
                   <span className="text-[12px] font-bold z-10 relative text-theme-red">{hp.toFixed(1)}</span>
                </div>

                <div className="grid grid-cols-2 gap-1 mb-2">
                  {(Object.keys(ATTR_NAMES) as AttrType[]).map(key => (
                    <div key={key} className="flex justify-between items-end text-[9px] px-1 border-b border-theme-red/10">
                      <span className="text-theme-red/60">{ATTR_NAMES[key]}</span>
                      <span className="text-theme-red font-bold font-mono">{npc.attrs[key].toFixed(1)}</span>
                    </div>
                  ))}
                </div>

                <div className="text-[9px] text-theme-red/60 flex justify-between">
                  <span>区域信号:</span>
                  <span className="font-bold">{room.name}</span>
                </div>
              </div>
            );
         })}
      </div>
    </div>
  );
};`
);


fs.writeFileSync('src/App.tsx', code, 'utf-8');
