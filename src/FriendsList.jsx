import { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import "./FriendsList.css";

export default function FriendsList({ onSelectFriend, currentUid }) {
  const [friends, setFriends] = useState([]);

  // 🔎 Récupérer les utilisateurs (autres que toi)
  useEffect(() => {
    const q = query(collection(db, "users"), orderBy("displayName"));
    const unsub = onSnapshot(q, (snap) => {
      const arr = [];
      snap.forEach((doc) => {
        const data = { id: doc.id, ...doc.data() };
        if (data.uid !== currentUid) arr.push(data);
      });
      setFriends(arr);
    });
    return () => unsub();
  }, [currentUid]);

  return (
    <aside className="friends-sidebar">
      <h3>👥 Amis</h3>
      <ul>
        {friends.map((f) => (
          <li key={f.uid} onClick={() => onSelectFriend(f)}>
            <img src={f.photoURL || "/default-avatar.png"} alt="" />
            <span>{f.displayName || "Utilisateur"}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
