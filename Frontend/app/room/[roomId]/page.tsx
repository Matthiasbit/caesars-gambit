"use client";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Lobby } from "@/components/Lobby";
import GamePage from "@/components/game/GamePage";
import { useRouter } from "next/navigation";
import { useGetCurrentUser } from '@/components/api/getCurrentUser';
import { useGameStream } from '@/components/hooks/useGameStream';

export default function RoomPage() {
  const { roomId } = useParams() as { roomId?: string };
  const router = useRouter();
  const currentUser = useGetCurrentUser();
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const searchParams = useSearchParams();

  const {
    playerNames,
    chatMessages,
    gameStarted,
    gameStateJson,
    setGameStarted: setStreamGameStarted,
  } = useGameStream(
    roomId,
    currentUsername,
    () => alert("Du bist am Zug! Verteile deine Truppen."),
    () => {
      router.push(`/room/${roomId}?started=true`);
    }
  );


  useEffect(() => {
    if (currentUser.isSuccess && currentUser.data) {
      setCurrentUsername(currentUser.data.username);
    }
  }, [currentUser]);

  useEffect(() => {
    if (searchParams.get("started") === "true") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStreamGameStarted(true);
    }
  }, [searchParams, setStreamGameStarted]);

  function handleGameStarted() {
    setStreamGameStarted(true);
  }

  return (
    <>
      {gameStarted ? (
        <>
          <GamePage roomId={roomId!} gameStateJson={gameStateJson} playerNames={playerNames} chatMessages={chatMessages} />
        </>
      ) : (
        <Lobby roomId={roomId!} playerNames={playerNames} chatMessages={chatMessages} onGameStart={() => handleGameStarted()} router={router} />
      )}
    </>
  );
}