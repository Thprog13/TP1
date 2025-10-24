import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "./firebase";
import { signOut } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";

export default function Navbar() {
  const navigate = useNavigate();

  const logout = async () => {
    const user = auth.currentUser;

    if (user) {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        status: "offline",
        lastSeen: new Date(),
      });
    }

    await signOut(auth);
    navigate("/login");
  };

  return (
    <nav>
      <h2>Chat Party</h2>
      <div>
        <Link to="/">Accueil</Link>
        <Link to="/profil">Profil</Link>
        <Link to="/dm">💌 Messages Privés</Link>
        <button onClick={logout}>Déconnexion</button>
      </div>
    </nav>
  );
}
