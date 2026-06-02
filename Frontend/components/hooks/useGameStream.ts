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
  attackerTroopsCount: number;
};

export type EventsourceTypes = {
  playerNames: string[];
  chatMessages: ChatMessage[];
  gameStarted: boolean;
  gameStateJson: string | null;
  pendingDistCount: number | null;
  currentPlayer: string | null;
  initialPhase: boolean;
  continentConquered: { player: string; continent: string } | null;
  attackResult: AttackResult | null;
  gameEnded: string | null;
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
  const [initialPhase, setInitialPhase] = useState<boolean>(false);
  const [continentConquered, setContinentConquered] = useState<{ player: string; continent: string } | null>(null);
  const [attackResult, setAttackResult] = useState<AttackResult | null>(null);
  const [gameEnded, setGameEnded] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const onGameStartedRef = useRef<() => void | undefined>(onGameStarted);
  const timeoutIdsRef = useRef<NodeJS.Timeout[]>([]);
  const isAttackResultProcessingRef = useRef(false);
  const queuedEventsRef = useRef<Array<{ type: string; data: unknown }>>([]);
 
  useEffect(() => {
    onGameStartedRef.current = onGameStarted;
  }, [onGameStarted]);

  useEffect(() => {
    if (!roomId) return;

    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const url = `${apiBase}/api/game/stream/${roomId}`;
    const eventSource = new EventSource(url, { withCredentials: true } as EventSourceInit);

    eventSource.onerror = async (err) => {
      console.error('SSE error:', err);
      eventSource.close();
    };

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

    eventSource.addEventListener('initialPhase', (e: MessageEvent) => {
      setInitialPhase(e.data === 'true');
    });

    const flushQueuedEvents = () => {
      const queuedEvents = queuedEventsRef.current;
      queuedEventsRef.current = [];

      const queuedGameState = queuedEvents
        .filter((event) => event.type === 'gameStateUpdate')
        .map((event) => event.data as string)
        .at(-1);

      const queuedContinentConquered = queuedEvents
        .filter((event) => event.type === 'continentConquered')
        .map((event) => event.data as string)
        .at(-1);

      if (queuedGameState) {
        setGameStateJson(queuedGameState);
      }

      if (queuedContinentConquered) {
        try {
          const data: { player: string; continent: string } = JSON.parse(queuedContinentConquered);
          setContinentConquered(data);
          const timeoutId = setTimeout(() => setContinentConquered(null), 5000);
          timeoutIdsRef.current.push(timeoutId);
        } catch (err) {
          console.error('failed parse queued continentConquered', err);
        }
      }
    };

    eventSource.addEventListener('gameStateUpdate', (e: MessageEvent) => {
      if (isAttackResultProcessingRef.current) {
        queuedEventsRef.current.push({ type: 'gameStateUpdate', data: e.data });
        return;
      }
      setGameStateJson(e.data);
    });

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
      if (isAttackResultProcessingRef.current) {
        queuedEventsRef.current.push({ type: 'continentConquered', data: e.data });
        return;
      }
      try {
        const data: { player: string; continent: string } = JSON.parse(e.data);
        setContinentConquered(data);
        const timeoutId = setTimeout(() => setContinentConquered(null), 5000);
        timeoutIdsRef.current.push(timeoutId);
      } catch (err) {
        console.error('failed parse continentConquered', err);
      }
    });

    eventSource.addEventListener('attackResult', (e: MessageEvent) => {
      try {
        const data: AttackResult = JSON.parse(e.data);
        setAttackResult(data);

        isAttackResultProcessingRef.current = true;

        const timeoutId = setTimeout(() => {
          setAttackResult(null);
          isAttackResultProcessingRef.current = false;
          flushQueuedEvents();
        }, 5500);
        timeoutIdsRef.current.push(timeoutId);
      } catch (err) {
        console.error('failed parse attackResult', err);
      }
    });

    eventSource.addEventListener('gameEnded', (e: MessageEvent) => {
      const winner = e.data.replace(/^Player /, '').replace(/ has won the game!$/, '');
      setGameEnded(winner);
    });

    eventSourceRef.current = eventSource;

    return () => {
      eventSource.close();
      eventSourceRef.current = null;
      timeoutIdsRef.current.forEach(timeoutId => clearTimeout(timeoutId));
      timeoutIdsRef.current = [];
      queuedEventsRef.current = [];
      isAttackResultProcessingRef.current = false;
    };
  }, [roomId]);

  return {
    playerNames,
    chatMessages,
    gameStarted,
    gameStateJson,
    pendingDistCount,
    currentPlayer,
    initialPhase,
    continentConquered,
    attackResult,
    gameEnded,
    setContinentConquered,
    setAttackResult,
    setPendingDistCount,
    setGameStarted,
  } as EventsourceTypes;
}
