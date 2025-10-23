import { useState } from "react";
import { useAuth } from "./context.jsx";
import FriendsList from "./FriendsList.jsx";
import Chat2 from "./Chat2.jsx";
import "./PrivateChatPage.css";

export default function PrivateChatPage() {
  const { user } = useAuth();
  const [selectedFriend, setSelectedFriend] = useState(null);

  return (
    <div className="private-chat-layout">
      {/* 🧭 Liste d'amis à gauche */}
      <FriendsList onSelectFriend={setSelectedFriend} currentUid={user.uid} />

      {/* 💬 Zone du chat à droite */}
      <div className="chat-area">
        {selectedFriend ? (
          <Chat2 targetUser={selectedFriend} />
        ) : (
          <div className="empty-chat">
            <h2>Sélectionne un ami 💬</h2>
            <p>Choisis quelqu’un dans la liste à gauche pour discuter en privé.</p>
          </div>
        )}
      </div>
    </div>
  );
}
