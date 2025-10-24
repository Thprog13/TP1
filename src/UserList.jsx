import { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, onSnapshot, query } from "firebase/firestore";
import "./UserList.css";

export default function UsersList({ onSelectUser, currentUid }) {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "users"));
    const unsub = onSnapshot(q, (snap) => {
      const arr = [];
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        if (docSnap.id !== currentUid) {
          arr.push({ id: docSnap.id, ...data });
        }
      });
      setUsers(arr);
    });
    return () => unsub();
  }, [currentUid]);

  const handleSelectUser = (user) => {
    setSelectedUserId(user.id);
    onSelectUser(user);
  };

  return (
    <div className="users-list">
      <div className="users-header">
        <h3>Utilisateurs</h3>
        <span className="users-count">{users.length}</span>
      </div>

      <div className="users-items">
        {users.length === 0 ? (
          <div className="no-users">
            <p>Aucun utilisateur disponible</p>
          </div>
        ) : (
          users.map((user) => {
            const avatar =
              user.photoURL ||
              user.photo ||
              user.avatar ||
              user.photoUrl ||
              null;

            return (
              <div
                key={user.id}
                className={`user-item ${selectedUserId === user.id ? "active" : ""}`}
                onClick={() => handleSelectUser(user)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleSelectUser(user);
                  }
                }}
              >
                {avatar ? (
                  <img
                    src={avatar}
                    alt={user.displayName ? `Avatar de ${user.displayName}` : "Avatar"}
                    className="user-item-avatar"
                  />
                ) : (
                  <div className="user-item-placeholder">
                    {user.displayName?.[0]?.toUpperCase() || "?"}
                  </div>
                )}
                <div className="user-item-info">
                  <span className="user-item-name">{user.displayName || "Anonyme"}</span>
                  <span className="user-item-status">{user.status || "Pas d'email"}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}