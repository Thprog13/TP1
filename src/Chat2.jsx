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

  // 🧩 Identifiant unique pour la conversation privée
  const convoId = [user.uid, targetUser.uid].sort().join("_");

  // 📡 Charger les messages privés en temps réel
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

  // 📨 Envoyer un message
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

  return (
    <div className="chat-page">
      <header className="chat-header">
        <h2>💬 Discussion privée avec {targetUser.displayName}</h2>
        <span className="username">{user?.displayName || "Anonyme"}</span>
      </header>

      <div className="messages">
        {messages.map((m) => (
          <Message key={m.id} msg={m} currentUid={user.uid} />
        ))}
      </div>

      <form className="message-form" onSubmit={sendMsg}>
        <input
          type="text"
          placeholder={`Message à ${targetUser.displayName}...`}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit">Envoyer</button>
      </form>
    </div>
  );
}
