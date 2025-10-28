import { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, onSnapshot } from "firebase/firestore";
import "./UserList.css";

const defaultAvatar = "https://png.pngtree.com/png-vector/20210604/ourmid/pngtree-gray-avatar-placeholder-png-image_3416697.jpg";

export default function UsersList({ onSelectUser, currentUid }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snap) => {
      const arr = [];
      snap.forEach((doc) => {
        const data = doc.data();
        if (doc.id !== currentUid) {
          arr.push({ id: doc.id, ...data });
        }
      });
      setUsers(arr);
    });
    return () => unsub();
  }, [currentUid]);

  return (
    <div className="users-list">
      <div className="users-header">
        <h3>Utilisateurs</h3>
        <div className="users-count">{users.length}</div>
      </div>

      <div className="users-items scrollable">
        {users.map((u) => (
          <div key={u.id} className="user-item" onClick={() => onSelectUser(u)}>
            <div className="user-avatar">
              {u.photoURL ? (
                <img src={u.photoURL} alt={u.displayName || "User"} />
              ) : (
                <img src={defaultAvatar} alt="avatar anonyme" className="anonyme-avatar" />
              )}
              <span
                className={`user-status ${
                  u.status === "online" ? "online" : "offline"
                }`}
              />
            </div>
            <div>
              <div className="user-name">{u.displayName || "Anonyme"}</div>
              <div className="user-status-text">
                {u.status === "online" ? "en ligne" : "hors ligne"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}