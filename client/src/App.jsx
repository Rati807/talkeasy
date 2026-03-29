import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import "./App.css";

const socket = io("http://localhost:3001");

function App() {
  const [username, setUsername] = useState("");
  const [joined, setJoined] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.on("message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on("userList", (userList) => {
      setUsers(userList);
    });

    return () => {
      socket.off("message");
      socket.off("userList");
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const joinChat = () => {
    if (username.trim()) {
      socket.emit("join", username);
      setJoined(true);
    }
  };

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("message", { user: username, text: message });
      setMessage("");
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  if (!joined) {
    return (
      <div className="login-screen">
        <div className="login-card">
          <div className="login-logo">💬</div>
          <h1>TalkEasy</h1>
          <p>Connect & Chat Instantly</p>
          <input
            type="text"
            placeholder="Enter your name..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && joinChat()}
            autoFocus
          />
          <button onClick={joinChat}>Join Chat →</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="sidebar">
        <div className="sidebar-header">
          <span className="logo">💬 TalkEasy</span>
        </div>
        <div className="online-section">
          <p className="section-label">Online — {users.length}</p>
          {users.map((u, i) => (
            <div className="user-item" key={i}>
              <div className="user-avatar">{u[0].toUpperCase()}</div>
              <span className={u === username ? "you" : ""}>{u === username ? `${u} (You)` : u}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="chat-area">
        <div className="chat-header">
          <span>🌐 Global Chat</span>
          <span className="online-badge">{users.length} online</span>
        </div>

        <div className="messages">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`message ${msg.type === "system" ? "system" : msg.user === username ? "own" : "other"}`}
            >
              {msg.type !== "system" && msg.user !== username && (
                <div className="msg-avatar">{msg.user[0].toUpperCase()}</div>
              )}
              <div className="msg-content">
                {msg.type !== "system" && msg.user !== username && (
                  <span className="msg-user">{msg.user}</span>
                )}
                <div className="msg-bubble">
                  <span>{msg.text}</span>
                  <span className="msg-time">{msg.time}</span>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-area">
          <input
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKey}
          />
          <button onClick={sendMessage}>Send ➤</button>
        </div>
      </div>
    </div>
  );
}

export default App;