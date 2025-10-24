import { Routes, Route } from "react-router-dom";
import Chat from "./Chat.jsx";
import PrivateChatPage from "./PrivateChatPage.jsx";
import Profil from "./Profil.jsx";
import Connection from "./Connection.jsx";
import Inscription from "./inscription.jsx";
import Navbar from "./Navbar.jsx";

export default function Routage() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Chat />} />
        <Route path="/profil" element={<Profil />} />
        <Route path="/login" element={<Connection />} />
        <Route path="/signup" element={<Inscription />} />
        <Route path="/dm" element={<PrivateChatPage />} />
        <Route path="/signup" element={<Inscription />} />
      </Routes>
    </>
  );
}
