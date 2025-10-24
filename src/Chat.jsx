import { useEffect, useState } from "react";
import { db } from "./firebase";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "./context.jsx";
import "./Chat.css";
import { useNavigate } from "react-router-dom";

export default function Chat() {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const navigate = useNavigate();
  const goToProfile = () => navigate("/profil");
  const onProfileKey = (e) => { if (e.key === "Enter" || e.key === " ") goToProfile(); }
 

  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const arr = [];
      snap.forEach((doc) => arr.push({ id: doc.id, ...doc.data() }));
      setMessages(arr);
    });
    return () => unsub();
  }, []);

  const sendMsg = async (e) => {
    e.preventDefault();
    if (text.trim() === "") return;
    await addDoc(collection(db, "messages"), {
      text,
      uid: user.uid,
      name: user.displayName || "Anonyme",
      photo: user.photoURL || null,
      createdAt: serverTimestamp(),
    });
    setText("");
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return date.toLocaleString("fr-CA", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="chat-container">
      <header className="chat-header">
        <div className="chat-title">
          <h2> Chat Général</h2>
        </div>
        <div
          className="chat-user"
          role="button"
          tabIndex={0}
          onClick={goToProfile}
          onKeyDown={onProfileKey}
          aria-label="Aller à la page profil"
          title="Voir mon profil"
        >
          {user?.photoURL ? (
            <img src={user.photoURL} alt="avatar" className="user-avatar" />
          ) : (
            <div className="avatar-placeholder">
              {user?.displayName?.[0] || "?"}
            </div>
          )}
          <span>{user?.displayName || "Anonyme"}</span>
        </div>
      </header>

      <div className="chat-messages">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`message-bubble ${m.uid === user.uid ? "own" : ""}`}
          >
            {m.photo ? (
              <img src={m.photo} alt="pfp" className="msg-avatar" />
            ) : (
              <div className="msg-avatar-placeholder">
                {m.name?.[0]?.toUpperCase() || "?"}
              </div>
            )}

            <div className="msg-content">
              <div className="msg-header">
                <span className="msg-name">{m.name}</span>
                <span className="msg-time">{formatDate(m.createdAt)}</span>
              </div>
              <p className="msg-text">{m.text}</p>
            </div>
          </div>
        ))}
      </div>

      <form className="chat-form" onSubmit={sendMsg}>
        <input
          type="text"
          placeholder="💭 Écris ton message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit">Envoyer </button>
      </form>
    </div>
  );
}