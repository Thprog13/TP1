import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context.jsx";
import Chat from "./Chat.jsx";
import PrivateChatPage from "./PrivateChatPage.jsx";
import Profil from "./Profil.jsx";
import Connection from "./Connection.jsx";
import Inscription from "./inscription.jsx";
import Navbar from "./Navbar.jsx";

function RequireAuth({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function GuestOnly({ children }) {
  const { user } = useAuth();
  if (user) return <Navigate to="/" replace />;
  return children;
}

export default function Routage() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={
            <RequireAuth>
              <Chat />
            </RequireAuth>
          }
        />
        <Route
          path="/dm"
          element={
            <RequireAuth>
              <PrivateChatPage />
            </RequireAuth>
          }
        />
        <Route
          path="/profil"
          element={
            <RequireAuth>
              <Profil />
            </RequireAuth>
          }
        />
        <Route path="/login" element={<GuestOnly><Connection /></GuestOnly>} />
        <Route path="/signup" element={<GuestOnly><Inscription /></GuestOnly>} />
      </Routes>
    </>
  );
}