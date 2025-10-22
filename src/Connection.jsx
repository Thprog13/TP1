import { useState } from "react";
import { auth, googleProvider } from "./firebase";
import { signInWithEmailAndPassword, signInWithPopup, signInAnonymously } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import "./Connection.css";

export default function Connection() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  // Connexion via email / mot de passe
  const handleLogin = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      navigate("/");
    } catch (err) {
      setMsg("Erreur: " + err.message);
    }
  };

  // Connexion Google
  const handleGoogle = async () => {
    setMsg("");
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/");
    } catch (err) {
      setMsg("Erreur Google: " + err.message);
    }
  };

  // Connexion anonyme
  const handleAnonymous = async () => {
    setMsg("");
    try {
      await signInAnonymously(auth);
      navigate("/");
    } catch (err) {
      setMsg("Erreur anonyme: " + err.message);
    }
  };

  return (
    <div>
      <h2>Connexion</h2>

      <form onSubmit={handleLogin}>
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
        <button type="submit">Se connecter</button>
      </form>

      <p>ou</p>

      <button onClick={handleGoogle}>Connexion avec Google</button>
      <button onClick={handleAnonymous}>Connexion anonyme</button>

      <p>
        Pas encore de compte ? <Link to="/signup">Inscris-toi ici</Link>
      </p>

      {msg && <p style={{ color: "red" }}>{msg}</p>}
    </div>
  );
}
