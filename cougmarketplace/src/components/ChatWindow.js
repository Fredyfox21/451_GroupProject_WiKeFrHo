import { useEffect, useRef, useState } from "react";
import { supabase } from "../utils/supabase";

export default function ChatWindow({ chat, sessionUser }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!chat?.chat_id) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("message")
        .select("*")
        .eq("chat_id", chat.chat_id)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
      } else {
        //console.log("Fetched messages:", data);
        setMessages(data);

        // After fetching, mark messages as viewed
        const unviewed = data.filter(
            (msg) => msg.sender_id !== sessionUser.id && !msg.viewed
        );

        if (unviewed.length > 0) {
            const idsToUpdate = unviewed.map((msg) => msg.created_at);

            const { error: updateError } = await supabase
            .from("message")
            .update({ viewed: true })
            .in("created_at", idsToUpdate);

            if (updateError) {
            console.error("Error updating viewed messages:", updateError);
            }
        }
      }
    };

    fetchMessages();

    const channel = supabase
      .channel(`chat-${chat.chat_id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "message", filter: `chat_id=eq.${chat.chat_id}` },
        (payload) => {
          console.log("New message received:", payload.new);
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chat]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    if (!chat?.chat_id || !sessionUser?.id) return;

    const { error } = await supabase.from("message").insert([
      {
        chat_id: chat.chat_id,
        sender_id: sessionUser.id,
        message: newMessage.trim(),
      },
    ]);

    if (error) {
      console.error("Error sending message:", error);
    } else {
      //console.log("Message sent:", newMessage.trim());
      setNewMessage("");
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
  
    // Add 5 hours safely
    date.setTime(date.getTime() + 5 * 60 * 60 * 1000); // add 5 hours in milliseconds
  
    // Format with proper AM/PM
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false, 
    });
  };

  return (
    <div className="flex flex-col h-[80vh] max-w-[700px] w-full mx-auto border border-gray-200 rounded-2xl shadow-lg p-4 bg-white">
      <div className="flex-1 overflow-y-auto space-y-2 px-2">
        {messages.map((msg) => {
          const isUser = msg.sender_id === sessionUser.id;
          return (
            <div key={msg.created_at} className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
              <div
                className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
                  isUser
                    ? "bg-red-100 text-red-900"
                    : "bg-gray-100 text-gray-900"
                }`}
                key={msg.created_at + "message"}
              >
                {msg.message}
              </div>
              <div
                key={msg.created_at + "timestamp"}
                className={`text-xs text-gray-500 flex ${
                  isUser ? "justify-end" : "justify-start"
                } w-full`}
              >
                {formatTimestamp(msg.created_at)}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-4 w-full">
        <div className="flex items-end gap-2">
            <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault(); // prevent newline if just Enter is pressed
                sendMessage();
                }
            }}
            maxLength={500}
            rows={1}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none resize-none overflow-hidden"
            placeholder="Type a message..."
            style={{ minHeight: "2.5rem", maxHeight: "8rem" }}
            />
            <button
            onClick={sendMessage}
            className="bg-red-400 text-white px-4 py-2 rounded-full text-sm"
            >
            Send
            </button>
        </div>
        <div className="text-xs text-gray-500 text-right mt-1">
            {newMessage.length}/500
        </div>
      </div>
    </div>
  );
}
