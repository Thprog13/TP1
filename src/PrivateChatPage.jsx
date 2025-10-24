import { useState } from "react";
import { useAuth } from "./context.jsx";
import UsersList from "./UserList.jsx";
import Chat2 from "./Chat2.jsx";
import "./PrivateChatPage.css";

export default function PrivateChatPage() {
  const { user } = useAuth();
  const [selectedUser, setSelectedUser] = useState(null);

  return (
    <div className="private-chat-layout">
      <UsersList onSelectUser={setSelectedUser} currentUid={user.uid} />

      <div className="chat-area">
        {selectedUser ? (
          <Chat2 targetUser={selectedUser} />
        ) : (
          <div className="empty-chat">
            <div className="empty-chat-icon">💬</div>
            <h2>Sélectionne un utilisateur</h2>
            <p>Choisis quelqu'un dans la liste à gauche pour commencer une conversation privée.</p>
          </div>
        )}
      </div>
    </div>
  );
}