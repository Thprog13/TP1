  import { useEffect, useState } from "react";
  import { db } from "./firebase.js";
  import {
    addDoc,
    collection,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
  } from "firebase/firestore";
  import { useAuth } from "./context.jsx";
  import Message from "./Message.jsx";
  import "./Chat.css";

 export default function Chat2({ targetUser }) {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);

  // Utiliser targetUser.id au lieu de targetUser.uid
  const convoId = [user.uid, targetUser.id].sort().join("_");

  useEffect(() => {
    const q = query(
      collection(db, "privateChats", convoId, "messages"),
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
      const arr = [];
      snap.forEach((doc) => arr.push({ id: doc.id, ...doc.data() }));
      setMessages(arr);
    });
    return () => unsub();
  }, [convoId]);

  const sendMsg = async (e) => {
    e.preventDefault();
    if (text.trim() === "") return;
    await addDoc(collection(db, "privateChats", convoId, "messages"), {
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
    <div className="chat2-container">
      <header className="chat2-header">
        <div className="chat2-user-info">
          {targetUser.photoURL ? (
            <img src={targetUser.photoURL} alt="avatar" className="chat2-avatar" />
          ) : (
            <div className="chat2-avatar-placeholder">
            </div>
          )}
          <div className="chat2-title">
            <h2>{targetUser.displayName || "Anonyme"}</h2>
          </div>
        </div>
      </header>

      <div className="chat2-messages">
        {messages.length === 0 ? (
          <div className="no-messages">
            <p>Aucun message encore. Commencez la conversation! </p>
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`message-bubble ${m.uid === user.uid ? "own" : "other"}`}
            >
              {m.uid !== user.uid && (
                <>
                  {m.photo ? (
                    <img src={m.photo} alt="pfp" className="msg-avatar" />
                  ) : (
                    <div className="msg-avatar-placeholder">
                      {m.name?.[0]?.toUpperCase() || "?"}
                    </div>
                  )}
                </>
              )}

              <div className="msg-content">
                {m.uid !== user.uid && (
                  <span className="msg-name">{m.name}</span>
                )}
                <p className="msg-text">{m.text}</p>
                <span className="msg-time">{formatDate(m.createdAt)}</span>
              </div>
            </div>
          ))
        )}
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