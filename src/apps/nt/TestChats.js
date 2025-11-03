
import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const SOCKET_URL = "http://10.0.0.167:3001"; // your server

export default function TestChats() {
  const socketRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  // Connect to Socket.IO
  useEffect(() => {
    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    socket.on("receiveMessage", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => socket.disconnect();
  }, []);

  const sendMessage = () => {
    if (text.trim() === "") return;

    const msg = { from: "WebUser", text };
    socketRef.current.emit("sendMessage", msg);
    setMessages((prev) => [...prev, msg]);
    setText("");
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>React Chat</h1>

      <div
        style={{
          border: "1px solid #ccc",
          padding: 10,
          height: 300,
          overflowY: "scroll",
          marginBottom: 10,
        }}
      >
        {messages.map((m, i) => (
          <div key={i}>
            <strong>{m.from}:</strong> {m.text}
          </div>
        ))}
      </div>

      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") sendMessage();
        }}
        placeholder="Type a message..."
        style={{ padding: 8, width: "80%", marginRight: 10 }}
      />
      <button onClick={sendMessage} style={{ padding: 8 }}>
        Send
      </button>
    </div>
  );
}

