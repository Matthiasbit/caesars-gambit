import { useEffect, useRef, useState } from "react";
import { useSendMessage } from "../api/sendMessage";
import { useGetCurrentUser } from "../api/getCurrentUser";
import { Spinner } from "./spinner";
import Button from "./button";

type ChatProps = {
  msg: { username: string; message: string }[];
  roomId?: string | number;
  isDark?: boolean;
};

export function Chat({ msg, roomId, isDark = true}: ChatProps) {
  const [messageInput, setMessageInput] = useState<string>("");
  const listRef = useRef<HTMLDivElement | null>(null);
  const numericRoomId = typeof roomId === "string" ? Number(roomId) : (roomId as number | undefined);
  const currentUser = useGetCurrentUser();
  const sendMessageMutation = useSendMessage();

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [msg]);

  const handleSend = async () => {
    if (!messageInput.trim()) return;
    if (!numericRoomId || Number.isNaN(numericRoomId)) return;

    try {
      await sendMessageMutation.mutateAsync({ id: numericRoomId, message: messageInput.trim() });
      setMessageInput("");
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  if (currentUser.isPending) {
    return (
      <div className={`flex min-h-[240px] items-center justify-center p-4 ${isDark ? 'text-slate-400' : 'text-gray-400'}`}>
        <div className="flex items-center gap-2 text-sm">
          <Spinner className="size-4" />
          <span>Chat wird geladen...</span>
        </div>
      </div>
    );
  }

  if (currentUser.isError) {
    return (
      <div className="flex min-h-[240px] items-center justify-center p-4 text-center">
        <div className={`rounded-lg border px-4 py-3 text-sm ${isDark ? 'border-red-500/20 bg-red-500/5 text-red-300' : 'border-red-200 bg-red-50 text-red-600'}`}>
          Anwendung ist zur Zeit nicht verfügbar
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <h3 className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Chat</h3>
        <span className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>{msg.length} Nachrichten</span>
      </div>

      <div
        ref={listRef}
        className={`flex-grow border rounded-lg p-3 overflow-auto space-y-3 min-h-[200px] ${
          isDark 
            ? 'bg-slate-900/50 border-slate-700/30' 
            : 'bg-gray-50 border-gray-100 shadow-inner'
        }`}>
        {msg.length === 0 && (
          <div className={`text-center text-sm py-4 italic ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>Kein Chatverlauf</div>
        )}

        {msg.map((item, index) => {
          const initials = item.username
            ? item.username
                .split(" ")
                .map((s) => s.charAt(0))
                .join("")
                .slice(0, 2)
                .toUpperCase()
            : "?";

          const isOwnMessage = currentUser.data?.username === item.username;

          return (
            <div key={index} className="flex items-start gap-3">
              {!isOwnMessage && (
                <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-[10px] font-black flex-shrink-0 ${
                  isDark ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-gray-100 border-gray-200 text-gray-600'
                }`}>
                  {initials}
                </div>
              )}
              <div className={`flex-1 flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                {!isOwnMessage && <div className={`text-[10px] font-bold mb-1 ml-1 uppercase tracking-tight ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>{item.username}</div>}
                <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${
                  isOwnMessage 
                    ? 'bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-600/10' 
                    : isDark 
                      ? 'bg-slate-800 text-slate-200 border border-slate-700/50 rounded-tl-none'
                      : 'bg-white text-gray-800 border border-gray-200 shadow-sm rounded-tl-none'
                }`}>
                  {item.message}
                </div>
              </div>
            </div>
          );
        })
      }
      </div>

      <div className="mt-3 flex gap-2">
        <input
          className={`flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
            isDark 
              ? 'border-slate-700/50 bg-slate-900 text-white placeholder:text-slate-600' 
              : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 shadow-sm'
          }`}
          placeholder="Nachricht schreiben..."
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void handleSend();
            }
          }}
          disabled={currentUser.isPending}
        />

        <Button
          variant="primary"
          className="h-auto py-2 px-4 text-xs font-bold uppercase tracking-widest border-none"
          onClick={() => void handleSend()}
          disabled={
            !messageInput.trim() || !numericRoomId || Number.isNaN(numericRoomId) || currentUser.isPending
          }>
          Senden
        </Button>
      </div>
    </div>
  );
}