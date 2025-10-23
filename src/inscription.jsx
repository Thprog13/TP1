import { useState } from "react";
import { auth } from "./firebase";
import {
  createUserWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import "./inscription.css";

export default function Inscription() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(res.user, { displayName: pseudo });
      navigate("/");
    } catch (err) {
      setMsg("Erreur: " + err.message);
    }
  };

  return (
    <div className="inscription-container">
      <h2>Créer un compte</h2>

      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Pseudonyme"
          value={pseudo}
          onChange={(e) => setPseudo(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Adresse e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          required
        />
        <button type="submit">S'inscrire</button>
      </form>

      <p className="link">
        Déjà un compte ? <Link to="/login">Connecte-toi ici</Link>
      </p>

      {msg && <p className="error">{msg}</p>}
    </div>
  );
}
