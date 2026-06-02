import { useState } from "react";
import Button from "./ui/button";
import { leaveRoom } from "./api/leaveRoom";
import { Chat } from "./ui/chat";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { startGame } from "./api/startGame";
import { EventsourceTypes } from "./hooks/useGameStream";
import { buildInviteUrl } from "@/lib/invite";
import { useGetCurrentUser } from "./api/getCurrentUser";
import { Badge } from "./ui/badge";
import { Link } from "lucide-react";

type LobbyProps = {
  roomId: string;
  eventsource: EventsourceTypes;
  router: AppRouterInstance;
};

export function Lobby({ roomId, eventsource, router }: LobbyProps) {
  if (!eventsource.chatMessages) alert("Kann net sein")
  const [copied, setCopied] = useState(false);
  const currentUser = useGetCurrentUser();
  const currentUsername = currentUser.data?.username;

  const handleShare = async () => {
    const url = buildInviteUrl(roomId);
    try {
      if (navigator.share) {
        await navigator.share({ title: "Caesar's Gambit Invite", url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error("share failed", err);
    }
  };

  const handleLeaveRoom = async () => {
    try {
      await leaveRoom(Number(roomId));
      router.push('/');
    } catch (err) {
      console.error('Failed to leave room:', err);
    }
  };

  return <div className="min-h-dvh flex items-center justify-center text-white p-4">
    <div className="w-full max-w-6xl relative z-10">
      <div className="mb-8 text-center mt-4 lg:mt-0">
        <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-blue-400 via-blue-200 to-blue-500 bg-clip-text text-transparent italic uppercase drop-shadow-sm">Lobby</h1>
        <p className="text-[10px] text-blue-400/50 mt-1 font-black tracking-[0.2em] uppercase">Room #{roomId}</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10 items-stretch">

        <aside className="w-full max-w-md mx-auto order-2 lg:order-1">
          <div className="rounded-3xl border border-blue-500/10 bg-slate-900/40 p-6 shadow-2xl backdrop-blur-md w-full h-full min-h-[300px]">
            <h2 className="text-[10px] font-bold text-blue-300/70 uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              Aktive Spieler
            </h2>
            <div className="flex flex-col gap-3">
              {eventsource.playerNames.length === 0 && (
                <div className="text-sm text-slate-500 italic text-center py-8">Warte auf Truppen...</div>
              )}
              {eventsource.playerNames.map((name, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-xl border border-blue-500/10 bg-blue-500/5 hover:bg-blue-500/10 transition-colors group">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-sm text-white font-black shadow-inner group-hover:scale-105 transition-transform">{name.charAt(0).toUpperCase()}</div>
                  <div className="text-sm font-bold flex items-center gap-2 text-slate-200">
                    {name}
                    {name === currentUsername && <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-[9px] h-4">STAB</Badge>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <main className="flex flex-col items-center justify-center order-1 lg:order-2 py-4 lg:py-0">
          <div className="flex flex-col gap-4 w-full max-w-[280px]">
            <Button 
                variant="primary" 
                size="lg"
                className="w-full" 
                disabled={eventsource.playerNames.length < 2} 
                onClick={async () => { await startGame(Number(roomId)); eventsource.setGameStarted(true) }}
            >
              Spiel Starten
            </Button>

            <Button 
                variant="ghost" 
                className="w-full text-xs flex gap-2" 
                onClick={handleShare}
            >
              <Link className="w-4 h-4" />
              {copied ? "Link kopiert!" : "Einladung kopieren"}
            </Button>

            <Button variant="destructive" className="w-full" onClick={handleLeaveRoom}>
              Raum verlassen
            </Button>
          </div>
        </main>

        <aside className="w-full max-w-md mx-auto order-3 lg:order-3">
          <div className="rounded-3xl border border-blue-500/10 bg-slate-900/40 p-5 shadow-2xl backdrop-blur-md h-[400px] lg:h-[500px] flex flex-col overflow-hidden">
            <Chat msg={eventsource.chatMessages} roomId={roomId} />
          </div>
        </aside>

      </div>
    </div>
  </div>
}
