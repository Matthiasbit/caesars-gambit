import { useEffect, useRef, useState } from 'react';

type ChatMessage = { username: string; message: string };

export type AttackResult = {
  attackerDice: number[];
  defenderDice: number[];
  lostTroopsAttack: number;
  lostTroopsDefense: number;
  territoryFrom: string;
  territoryTo: string;
  territoryWon: boolean;
};

export type EventsourceTypes = {
  playerNames: string[];
  chatMessages: ChatMessage[];
  gameStarted: boolean;
  gameStateJson: string | null;
  pendingDistCount: number | null;
  currentPlayer: string | null;
  continentConquered: { player: string; continent: string } | null;
  attackResult: AttackResult | null;
  setContinentConquered: (data: { player: string; continent: string } | null) => void;
  setAttackResult: (data: AttackResult | null) => void;
  setPendingDistCount: (count: number | null) => void;
  setGameStarted: (started: boolean) => void;

};

export function useGameStream(
  roomId?: string,
  onGameStarted?: () => void
) {
  const [playerNames, setPlayerNames] = useState<string[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameStateJson, setGameStateJson] = useState<string | null>(null);
  const [pendingDistCount, setPendingDistCount] = useState<number | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<string | null>(null);
  const [continentConquered, setContinentConquered] = useState<{ player: string; continent: string } | null>(null);
  const [attackResult, setAttackResult] = useState<AttackResult | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const onGameStartedRef = useRef<() => void | undefined>(onGameStarted);
 
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
      setCurrentPlayer(e.data);
    });

    eventSource.addEventListener('continentConquered', (e: MessageEvent) => {
      try {
        const data: { player: string; continent: string } = JSON.parse(e.data);
        setContinentConquered(data);
        setTimeout(() => setContinentConquered(null), 5000);
      } catch (err) {
        console.error('failed parse continentConquered', err);
      }
    });

    eventSource.addEventListener('attackResult', (e: MessageEvent) => {
      try {
        const data: AttackResult = JSON.parse(e.data);
        setAttackResult(data);
        setTimeout(() => setAttackResult(null), 6000);
      } catch (err) {
        console.error('failed parse attackResult', err);
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
    currentPlayer,
    continentConquered,
    attackResult,
    setContinentConquered,
    setAttackResult,
    setPendingDistCount,
    setGameStarted,
  } as EventsourceTypes;
}
