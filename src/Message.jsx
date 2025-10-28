export default function Message({ msg, currentUid }) {
  const isMine = msg.uid === currentUid;
  const defaultAvatar = "https://png.pngtree.com/png-vector/20210604/ourmid/pngtree-gray-avatar-placeholder-png-image_3416697.jpg";

  const formatDate = (ts) => {
    if (!ts) return "";
    const date = ts.toDate();
    const options = {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "short"
    };
    return date.toLocaleString("fr-CA", options);
  };

  return (
    <div className={`msg-block ${isMine ? "mine" : "other"}`}>
      <div className="msg-info">
        {!isMine && (
          <>
            <img 
              src={msg.photo || defaultAvatar} 
              alt={msg.photo ? "avatar" : "avatar anonyme"} 
              className="avatar" 
            />
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

      <div className={`msg-line ${isMine ? "mine" : "other"}`}>
        <div className="msg-bubble">
          <p className="msg-text">{msg.text}</p>
        </div>
      </div>
    </div>
  );
}