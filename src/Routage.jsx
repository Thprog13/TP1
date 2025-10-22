import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context.jsx";
import Navbar from "./Navbar.jsx";
import Connection from "./Connection.jsx";
import Inscription from "./inscription.jsx";
import Chat from "./Chat.jsx";
import Profil from "./Profil.jsx";

export default function Routage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Connection />} />
        <Route path="/signup" element={<Inscription />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/chat" element={<Chat />} />
        <Route path="/profil" element={<Profil />} />
        <Route path="*" element={<Navigate to="/chat" />} />
      </Routes>
    </>
  );
}
