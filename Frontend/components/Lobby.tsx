import { useState } from "react";
import Button from "./ui/button";
import { leaveRoom } from "./api/leaveRoom";
import { Chat } from "./ui/chat";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { startGame } from "./api/startGame";
import { EventsourceTypes } from "./hooks/useGameStream";

type LobbyProps = {
  roomId: string;
  eventsource: EventsourceTypes;
  router: AppRouterInstance;
};

export function Lobby({ roomId, eventsource, router }: LobbyProps) {
  if (!eventsource.chatMessages) alert("Kann net sein")
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Risiko online", url });
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

  return <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="w-full max-w-6xl px-6 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold  ">Risiko online</h1>
        <p className="text-sm  mt-2">#{roomId}</p>
      </div>
      <div className="grid grid-cols-3 gap-10 items-start">

        <aside className="col-span-1 max-w-[20rem] ">
          <div className="bg-white border rounded-md p-3 shadow-sm w-full mx-auto">
            <h2 className="text-sm font-semibold text-gray-600 mb-4">Spieler</h2>
            <div className="flex flex-col gap-2">
              {eventsource.playerNames.length === 0 && (
                <div className="text-sm text-gray-400">Noch keine Spieler</div>
              )}
              {eventsource.playerNames.map((name, index) => (
                <div key={index} className="flex items-center gap-3 p-2 rounded-md border">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm text-slate-700">{name.charAt(0).toUpperCase()}</div>
                  <div className="text-sm font-medium">{name}</div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <main className="col-span-1 self-center flex flex-col items-center">
          <div className="flex flex-col gap-4 w-48">
            <Button variant="primary" className="w-full" disabled={eventsource.playerNames.length < 2} onClick={async () => { await startGame(Number(roomId)); eventsource.setGameStarted(true) }}>
              Start
            </Button>

            <Button variant="default" className="w-full" onClick={handleShare}>
              {copied ? "Kopiert!" : "Raumlink kopieren"}
            </Button>

            <Button variant="destructive" className="w-full" onClick={handleLeaveRoom}>
              Raum verlassen
            </Button>
          </div>
        </main>

        <aside className="col-span-1 max-w-[20rem]">
          <div className="bg-white border rounded-md p-3 shadow-sm">
            <Chat msg={eventsource.chatMessages} roomId={roomId} />
          </div>
        </aside>

      </div>
    </div>
  </div>
}