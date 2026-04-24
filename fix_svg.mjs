import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const t = `             </svg>

             {/* Green Midnight Laser Rendering */}
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

             {/* Rooms */}`;

const r = `             {/* Green Midnight Laser Rendering */}
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
             </svg>

             {/* Rooms */}`;
code = code.replace(t, r);
fs.writeFileSync('src/App.tsx', code, 'utf-8');
