export default function Message({ msg, currentUid }) {
  const isMine = msg.uid === currentUid;

  // 🕒 Conversion Firestore Timestamp → format lisible
  const formatDate = (ts) => {
    if (!ts) return "";
    const date = ts.toDate();
    const options = { 
      hour: "2-digit", 
      minute: "2-digit", 
      day: "2-digit", 
      month: "short" 
    };
    return date.toLocaleString("fr-CA", options); // ex: "22 oct., 21:37"
  };

  return (
    <div className={`msg-block ${isMine ? "mine" : "other"}`}>
      {/* 🧠 En-tête du message */}
      <div className="msg-info">
        {!isMine && (
          <>
            {msg.photo ? (
              <img src={msg.photo} alt="avatar" className="avatar" />
            ) : (
              <div className="avatar placeholder">👤</div>
            )}
            <span className="msg-name">{msg.name}</span>
            <span className="msg-time">{formatDate(msg.createdAt)}</span>
          </>
        )}

        {isMine && (
          <>
            <span className="msg-time mine-time">{formatDate(msg.createdAt)}</span>
          </>
        )}
      </div>

      {/* 💬 Contenu du message */}
      <div className={`msg-line ${isMine ? "mine" : "other"}`}>
        <div className="msg-bubble">
          <p className="msg-text">{msg.text}</p>
        </div>
      </div>
    </div>
  );
}
