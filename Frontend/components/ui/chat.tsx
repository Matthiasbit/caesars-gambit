import { useEffect, useRef, useState } from "react";
import { useSendMessage } from "../api/sendMessage";
import { useGetCurrentUser } from "../api/getCurrentUser";
import { Spinner } from "./spinner";

type ChatProps = {
  msg: { username: string; message: string }[];
  roomId?: string | number;
};

export function Chat({ msg, roomId }: ChatProps) {
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
      <div className="flex min-h-[240px] items-center justify-center p-4 text-slate-400">
        <div className="flex items-center gap-2 text-sm">
          <Spinner className="size-4" />
          <span>Chat wird geladen...</span>
        </div>
      </div>
    );
  }

  if (currentUser.isError) {
    return (
      <div className="flex min-h-[240px] items-center justify-center p-4 text-center text-slate-400">
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">
          Anwendung ist zur Zeit nicht verfügbar
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-700">Chat</h3>
        <span className="text-xs text-gray-500">{msg.length} messages</span>
      </div>

      <div
        ref={listRef}
        className="h-80 bg-white border rounded-md p-3 overflow-auto space-y-2 shadow-sm">
        {msg.length === 0 && (
          <div className="text-center text-sm text-gray-400">Kein Chatverlauf</div>
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
              {isOwnMessage ? (
                <div className="w-full flex justify-end">
                  <div className="max-w-xs px-3 bg-slate-50 py-2 rounded-md text-slate-800 text-sm">
                    {item.message}
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-sm font-semibold text-slate-700">
                    {initials}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-slate-500">{item.username}</div>
                    <div className="mt-1 bg-slate-50 px-3 py-2 rounded-md text-sm text-slate-800 border border-slate-100">
                      {item.message}
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })
      }
      </div>

      <div className="mt-3 flex gap-2">
        <input
          className="flex-1 rounded-md border px-3 py-2 bg-white text-black focus:outline-none focus:ring-2 focus:ring-violet-300"
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

        <button
          className={`px-4 py-2 rounded-md font-semibold text-white ${
            messageInput.trim() ? "bg-violet-600 hover:bg-violet-700" : "bg-violet-300 cursor-not-allowed"
          }`}
          onClick={() => void handleSend()}
          disabled={
            !messageInput.trim() || !numericRoomId || Number.isNaN(numericRoomId) || currentUser.isPending
          }>
          Senden
        </button>
      </div>
      {currentUser.isPending && (
        <div className="mt-2 text-sm text-red-400">Bitte melde dich an, um Nachrichten zu senden.</div>
      )}
    </div>
  );
}