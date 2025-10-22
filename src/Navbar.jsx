import { Link, useNavigate } from "react-router-dom";
import { auth } from "./firebase";
import { signOut } from "firebase/auth";

export default function Navbar() {
  const navigate = useNavigate();

  const logout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <nav>
      <h2>Chat Party</h2>
      <div>
        <Link to="/">Accueil</Link>
        <Link to="/create">Créer</Link>
        <Link to="/profil">Profil</Link>
        <button onClick={logout}>Déconnexion</button>
      </div>
    </nav>
  );
}
