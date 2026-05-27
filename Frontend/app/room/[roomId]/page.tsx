"use client";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect} from "react";
import { Lobby } from "@/components/Lobby";
import GamePage from "@/components/game/GamePage";
import { useRouter } from "next/navigation";
import { useGameStream } from '@/components/hooks/useGameStream';

export default function RoomPage() {
  const { roomId } = useParams() as { roomId?: string };
  const router = useRouter();
  const searchParams = useSearchParams();

  const eventsource = useGameStream(
    roomId,
    () => {
      router.push(`/room/${roomId}?started=true`);
    }
  );

   useEffect(() => {
    if (searchParams.get("started") === "true") {
      eventsource.setGameStarted(true);
    }
  }, [searchParams, eventsource.setGameStarted, eventsource]);

  return (
    <>
      {eventsource.gameStarted ? (
        <GamePage roomId={roomId!} eventsource={eventsource} />
      ) : (
        <Lobby roomId={roomId!} eventsource={eventsource} router={router} />
      )}
    </>
  );
}