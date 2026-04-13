import React, { useMemo, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Command, Database, Download, SendHorizonal } from 'lucide-react';
import { useSovereignStream } from '../../../lib/useSovereignStream';
import { useFastPassTimer } from '../../../lib/useFastPassTimer';
import { sendChatMessage } from '../../../lib/api';

function chunkLabel(chunkType) {
  if (chunkType === 'threat') return 'Threat';
  if (chunkType === 'argument') return 'Argument';
  if (chunkType === 'synthesis') return 'Synthesis';
  if (chunkType === 'fast_pass') return 'Fast-Pass';
  if (chunkType === 'countdown') return 'Countdown';
  if (chunkType === 'veto') return 'Veto';
  if (chunkType === 'exec') return 'Execution';
  return 'Narrative';
}

export default function LiaisonConsoleView() {
  const [vetoReason, setVetoReason] = useState('Manual operator override');
  const [vetoPending, setVetoPending] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatReplies, setChatReplies] = useState([]); // synthetic feed entries from /api/chat
  const inputRef = useRef(null);

  const { isConnected, jScore, wR, wC, negotiations } = useSovereignStream();
  const { isArmed, secondsRemaining, threatInfo, triggerVeto } = useFastPassTimer(negotiations);

  const explainabilityFeed = useMemo(
    () => [
      // Synthetic entries from /api/chat responses (most recent first)
      ...chatReplies.slice(-8).reverse(),
      // Live WS NarrativeChunk events
      ...negotiations
        .filter((event) => event.event_type === 'NarrativeChunk')
        .slice(-12)
        .reverse(),
    ],
    [negotiations, chatReplies],
  );

  // Send message to /api/chat/ and inject the response as a synthetic event
  const handleChat = async () => {
    const message = vetoReason.trim();
    if (!message || chatLoading) return;
    setChatLoading(true);
    const result = await sendChatMessage(message);
    setChatLoading(false);

    if (result && !result.error) {
      // Build a synthetic NarrativeChunk-like event so it slots into the feed
      const syntheticEvent = {
        event_id: `chat-${Date.now()}`,
        event_type: 'NarrativeChunk',
        tick_timestamp: new Date().toISOString(),
        message_body: {
          chunk_type: 'synthesis',
          heading: `> ${message}`,
          body: result.answer || result.output || result.result || JSON.stringify(result),
          citation: '[AI Copilot]',
        },
      };
      setChatReplies((prev) => [...prev, syntheticEvent]);
      setVetoReason('Manual operator override'); // reset input
    }
  };

  const controllerWidth = Math.max(5, Math.min(100, Math.round(Number(wC || 0) * 100)));
  const sentryWidth = Math.max(5, Math.min(100, Math.round(Number(wR || 0) * 100)));

  const reviewWindow = Number(threatInfo?.fast_pass_meta?.accelerated_window_s) || Number(threatInfo?.seconds_remaining) || 60;
  const timerValue = isArmed ? secondsRemaining : reviewWindow;
  const ringPercent = Math.max(0, Math.min(1, timerValue / Math.max(reviewWindow, 1)));

  const handleVeto = async () => {
    if (!isArmed) return;
    setVetoPending(true);
    await triggerVeto(vetoReason);
    setVetoPending(false);
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.4, ease: "easeOut" }} className="flex-1 h-full flex flex-col bg-transparent overflow-hidden px-1 relative absolute inset-0 w-full md:pl-4">

      <div className="flex-1 bg-white/60 backdrop-blur-[30px] rounded-[24px] shadow-sm border border-white flex flex-col overflow-hidden relative mb-2 w-full text-slate-800 font-sans">

        <div className="flex justify-between items-center h-[55px] shrink-0 px-6 border-b border-white bg-white/70 relative z-10">
          <h2 className="text-[15px] font-bold tracking-widest text-blue-600 uppercase flex items-center gap-3">
            <img src="/copilot.png" className="w-7 h-7 object-contain drop-shadow-sm" alt="Copilot Avatar" />
            Liaison Console <span className="text-slate-400 font-bold ml-2 text-[12px]">v4.0.1</span>
          </h2>
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1 font-jetbrains font-bold text-[9px] rounded-sm border shadow-sm uppercase ${isConnected ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
              Sys_Link: {isConnected ? 'Stable' : 'Reconnecting'}
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col md:flex-row w-full relative z-10 p-6 gap-6 min-h-0">

          <div className="flex-[3] flex flex-col gap-6 w-full min-h-0 h-full">

            <div className="flex-1 bg-white/80 border border-white rounded-[20px] p-6 flex flex-col shadow-sm overflow-hidden min-h-0 backdrop-blur-md">
              <h3 className="text-blue-600 font-mono font-bold text-[10px] uppercase tracking-widest mb-6 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgb(59,130,246)]"></div> Explainability Feed
              </h3>

              <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col gap-6 pr-2">
                {explainabilityFeed.length === 0 && (
                  <div className="text-[12px] text-slate-500 font-jetbrains border border-slate-200 rounded-xl px-4 py-3 bg-white">
                    Waiting for NarrativeChunk events from /ws/war-room.
                  </div>
                )}

                {explainabilityFeed.map((event) => {
                  const body = event.message_body || {};
                  const label = chunkLabel(body.chunk_type);
                  const timestamp = String(event.tick_timestamp || '').split('T')[1]?.replace('Z', '') || '--:--:--';

                  return (
                    <div key={event.event_id} className="flex flex-col gap-2">
                      <div className="text-[10px] font-jetbrains text-blue-500 font-bold tracking-widest uppercase">
                        [{timestamp.slice(0, 8)}] {label}
                      </div>
                      <div className="text-[13px] text-slate-700 leading-relaxed font-sans font-medium pl-4 border-l-[3px] border-blue-400 rounded-l-sm py-1 bg-gradient-to-r from-blue-50 to-transparent">
                        {body.heading || body.body || 'No narrative body provided.'}
                      </div>
                      {body.body && body.heading && (
                        <div className="text-[12px] text-slate-600 pl-4">
                          {body.body}
                        </div>
                      )}
                      <div className="flex gap-2 pl-4 mt-1">
                        <span className="text-[9px] font-jetbrains font-bold bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-slate-500 shadow-sm uppercase">
                          {body.citation || '[Live Stream]'}
                        </span>
                      </div>
                    </div>
                  );
                })}

              </div>
            </div>

            <div className="shrink-0 flex flex-col gap-3">
              <div className="flex gap-2 text-[10px] font-mono font-bold text-blue-600">
                <div className="px-3 py-1.5 rounded-lg border border-blue-200 bg-white shadow-sm cursor-pointer hover:bg-blue-50 transition-colors uppercase tracking-wider">Show ROI Breakdown</div>
                <div className="px-3 py-1.5 rounded-lg border border-blue-200 bg-white shadow-sm cursor-pointer hover:bg-blue-50 transition-colors uppercase tracking-wider">Explain w_R Weighting</div>
                <div className="px-3 py-1.5 rounded-lg border border-blue-200 bg-white shadow-sm cursor-pointer hover:bg-blue-50 transition-colors uppercase tracking-wider">Expand Audit Matrix</div>
              </div>

              <div className="w-full bg-white border border-slate-200 rounded-[16px] p-5 flex items-center shadow-sm relative group focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <span className="text-blue-600 font-mono font-bold tracking-widest text-[12px] mr-3 shrink-0 group-focus-within:text-blue-700 transition-colors">sovereign@core:~ $</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={vetoReason}
                  onChange={(event) => setVetoReason(event.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleChat(); }}
                  placeholder="Ask the AI copilot or enter veto reason…"
                  disabled={chatLoading}
                  className="w-full bg-transparent outline-none text-slate-800 font-jetbrains font-bold text-[13px] placeholder:text-slate-400 focus:placeholder:opacity-0 disabled:opacity-60"
                />
                <button
                  onClick={handleChat}
                  disabled={chatLoading || !vetoReason.trim()}
                  className="ml-2 shrink-0 w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 flex items-center justify-center transition-colors disabled:opacity-40"
                >
                  {chatLoading
                    ? <span className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                    : <SendHorizonal size={13} className="text-blue-600" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex-[2] flex flex-col gap-5 w-full min-h-0 relative z-20">

            <div className="bg-white/90 backdrop-blur-md border border-white rounded-[20px] p-5 flex flex-col overflow-hidden relative shadow-sm shrink-0">
              <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-50"></div>
              <h3 className="text-slate-500 font-mono font-bold text-[10px] uppercase tracking-widest mb-4">Live J-Eq Breakout</h3>

              <div className="text-center font-mono font-bold text-[12px] text-blue-700 bg-blue-50 py-3 rounded-xl border border-blue-100 mb-6 shadow-inner tracking-widest">
                J<sub className="text-[8px]">forecast</sub> = min Σ (w<sub className="text-[8px]">R</sub>·P·R<sub className="text-[8px]">i</sub> + w<sub className="text-[8px]">C</sub>·C<sub className="text-[8px]">i</sub>)
              </div>

              <div className="text-center text-[12px] font-jetbrains font-bold text-slate-700 mb-5">
                Current J-Score: {Number(jScore || 0).toFixed(4)}
              </div>

              <div className="flex flex-col gap-5 relative px-2">
                <div className="absolute left-[50%] top-0 bottom-0 w-[2px] bg-slate-200 border-dashed z-0"></div>

                <div className="flex justify-between items-center gap-4 relative z-10 w-full">
                  <span className="font-mono font-bold text-[9px] text-blue-500 uppercase w-20 text-right tracking-wider">Controller</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden flex justify-end p-[2px] border border-slate-200 shadow-inner">
                    <motion.div animate={{ width: `${controllerWidth}%` }} transition={{ duration: 0.35, ease: 'easeOut' }} className="h-full bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.6)]"></motion.div>
                  </div>
                </div>

                <div className="flex justify-between items-center gap-4 relative z-10 w-full">
                  <span className="font-mono font-bold text-[9px] text-indigo-500 uppercase w-20 text-right tracking-wider">Sentry</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden p-[2px] border border-slate-200 shadow-inner">
                    <motion.div animate={{ width: `${sentryWidth}%` }} transition={{ duration: 0.35, ease: 'easeOut' }} className="h-full bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.6)]"></motion.div>
                  </div>
                </div>

                <div className="absolute left-[48%] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-emerald-400 border-[3px] border-white shadow-[0_0_20px_rgba(52,211,153,0.9)] z-20 flex items-center justify-center"></div>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-md border border-white rounded-[20px] p-5 flex flex-col md:flex-row items-center justify-between shadow-sm relative overflow-hidden gap-4 shrink-0">
              <div className="flex flex-col gap-4 relative z-20">
                <h3 className="text-slate-500 font-mono font-bold text-[10px] uppercase tracking-widest">Authority Bridge</h3>

                <div className="flex items-center bg-slate-100 p-1.5 rounded-[12px] border border-slate-200 w-max shadow-inner relative z-10">
                  <button className={`px-4 py-2 text-[10px] font-bold font-mono tracking-widest rounded-[8px] transition-all uppercase ${isArmed ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200'}`}>Sovereign</button>
                  <button className={`px-4 py-2 text-[10px] font-bold font-mono tracking-widest rounded-[8px] transition-all uppercase ${isArmed ? 'bg-rose-500 text-white shadow-md ml-1' : 'text-slate-400'}`}>Fast-Pass</button>
                </div>
              </div>

              <div className="relative w-24 h-24 flex items-center justify-center shrink-0 mr-4">
                <svg className="absolute inset-0 w-full h-full -rotate-90 block">
                  <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="5" />
                  <circle cx="48" cy="48" r="40" fill="none" stroke="#f43f5e" strokeWidth="5" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * ringPercent)} className="transition-all duration-300 ease-linear" strokeLinecap="round" />
                </svg>

                <motion.button
                  animate={isArmed ? { scale: 1 - ((reviewWindow - timerValue) / Math.max(reviewWindow, 1)) * 0.2 } : { scale: 1 }}
                  whileHover={isArmed ? { scale: 0.95 } : {}}
                  whileTap={isArmed ? { scale: 0.9 } : {}}
                  onClick={handleVeto}
                  disabled={!isArmed || vetoPending}
                  className={`w-16 h-16 rounded-full flex flex-col items-center justify-center font-bold tracking-widest text-[11px] uppercase z-10 transition-colors shadow-xl border-4 border-white ${isArmed ? 'bg-rose-500 text-white hover:bg-rose-600 shadow-[0_10px_25px_rgba(244,63,94,0.4)] cursor-pointer' : 'bg-slate-200 text-slate-400 cursor-not-allowed border-none shadow-none'
                    }`}
                >
                  {vetoPending ? '...' : 'Veto'}
                </motion.button>
              </div>
            </div>

            <div className="flex-1 bg-white rounded-[20px] p-6 flex flex-col overflow-hidden shadow-sm border border-slate-200 relative">
              <h3 className="text-blue-500 font-mono font-bold text-[9px] uppercase tracking-widest mb-auto flex items-center gap-2">
                <Database size={12} className="text-blue-600" /> H-MEM Audit Horizon
              </h3>

              <div className="w-full relative flex items-center my-8 px-4">
                <div className="w-full h-[1px] bg-slate-200"></div>

                <div className="absolute left-[20%] top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border border-slate-300 bg-slate-100"></div>

                <div className="absolute left-[50%] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-emerald-400 bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)] z-10 pointer-events-none"></div>

                <div className="absolute left-[80%] top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border border-slate-300 bg-slate-100"></div>
              </div>

              <div className="text-[11px] text-slate-600 font-jetbrains mb-4">
                {isArmed
                  ? `Fast-Pass armed: ${timerValue}s remaining, resource ${threatInfo?.resource_id || threatInfo?.target || 'unknown'}`
                  : 'No active Fast-Pass countdown.'}
              </div>

              <button className="w-full py-2.5 mt-auto bg-slate-100/50 text-slate-700 hover:bg-blue-50 border border-slate-200 hover:text-blue-600 transition-colors rounded-[8px] text-[9.5px] font-mono font-bold tracking-widest uppercase flex justify-center items-center gap-2">
                <Download size={14} /> Download Audit Payload
              </button>
            </div>

          </div>
        </div>
      </div>
    </motion.div>
  );
}
