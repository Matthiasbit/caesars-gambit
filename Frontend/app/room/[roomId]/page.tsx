"use client";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect} from "react";
import { Lobby } from "@/components/Lobby";
import GamePage from "@/components/game/GamePage";
import { useRouter } from "next/navigation";
import { useGameStream } from '@/components/hooks/useGameStream';
import { useGetCurrentUser } from "@/components/api/getCurrentUser";

export default function RoomPage() {
  const { roomId } = useParams() as { roomId?: string };
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentUser = useGetCurrentUser();

  const eventsource = useGameStream(
    roomId,
    () => {
      router.push(`/room/${roomId}?started=true`);
    }
  );

  useEffect(() => {
    if (searchParams.get("started") === "true") {
      eventsource.setGameStarted(true);
    } else if (searchParams.get("started") === undefined || searchParams.get("started") === "false") {
      eventsource.setGameStarted(false);
    }
  }, [searchParams, eventsource.setGameStarted, eventsource]);

  useEffect(() => {
    if (currentUser.isSuccess && currentUser.data && eventsource.playerNames.length > 0) {
      const isPlayerInRoom = eventsource.playerNames.includes(currentUser.data.username);
      if (!isPlayerInRoom && !eventsource.gameStarted) {
        router.push(`/invite/${roomId}`);
      }
    }
  }, [currentUser, eventsource.playerNames, eventsource.gameStarted, roomId, router]);

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