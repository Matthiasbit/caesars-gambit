import { useEffect, useRef, useState } from 'react';

type ChatMessage = { username: string; message: string };

export function useGameStream(
  roomId?: string,
  currentUsername?: string | null,
  onYourTurn?: () => void,
  onGameStarted?: () => void
) {
  const [playerNames, setPlayerNames] = useState<string[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameStateJson, setGameStateJson] = useState<string | null>(null);
  const [pendingDistCount, setPendingDistCount] = useState<number | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const currentUsernameRef = useRef<string | null>(currentUsername);
  const onYourTurnRef = useRef<() => void | undefined>(onYourTurn);
  const onGameStartedRef = useRef<() => void | undefined>(onGameStarted);

  useEffect(() => {
    currentUsernameRef.current = currentUsername;
  }, [currentUsername]);

  useEffect(() => {
    onYourTurnRef.current = onYourTurn;
  }, [onYourTurn]);

  useEffect(() => {
    onGameStartedRef.current = onGameStarted;
  }, [onGameStarted]);

  useEffect(() => {
    if (!roomId) return;

    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const url = `${apiBase}/api/game/stream/${roomId}`;
    const eventSource = new EventSource(url, { withCredentials: true } as EventSourceInit);

    const playerListUpdated = (e: MessageEvent) => {
      try {
        const data: { username: string; host: boolean }[] = JSON.parse(e.data);
        setPlayerNames(data.map(p => p.username));
      } catch (err) {
        console.error('failed parse player list', err);
      }
    };

    eventSource.addEventListener('init', playerListUpdated as EventListener);
    eventSource.addEventListener('playerJoined', playerListUpdated as EventListener);
    eventSource.addEventListener('playerLeft', playerListUpdated as EventListener);

    eventSource.addEventListener('gameStarted', () => {
      setGameStarted(true);
      onGameStartedRef.current?.();
    });

    eventSource.addEventListener('gameStateUpdate', (e: MessageEvent) => setGameStateJson(e.data));

    eventSource.addEventListener('askDistTroops', (e: MessageEvent) => {
      try {
        const data: number = JSON.parse(e.data);
        setPendingDistCount(data);
      } catch (err) {
        console.error('failed parse askDistTroops', err);
      }
    });

    eventSource.addEventListener('chatMessage', (e: MessageEvent) => {
      try {
        const data: ChatMessage = JSON.parse(e.data);
        setChatMessages(prev => [...prev, data]);
      } catch (err) {
        console.error('failed parse chat message', err);
      }
    });

    eventSource.addEventListener('currentPlayer', (e: MessageEvent) => {
      if (currentUsernameRef.current && currentUsernameRef.current === e.data) {
        onYourTurnRef.current?.();
      }
    });

    eventSource.onerror = (err) => {
      console.error('SSE error', err);
      eventSource.close();
    };

    eventSourceRef.current = eventSource;

    return () => {
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [roomId]);

  return {
    playerNames,
    chatMessages,
    gameStarted,
    gameStateJson,
    pendingDistCount,
    setPendingDistCount,
    setGameStarted,
  } as const;
}
