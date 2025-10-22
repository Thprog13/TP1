import { useState } from "react";
import { auth, googleProvider } from "./firebase";
import { createUserWithEmailAndPassword, signInWithPopup, signInAnonymously, updateProfile } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import "./inscription.css";


export default function Inscription() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  // Création compte Email/Password
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

  // Connexion Google
  const handleGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/");
    } catch (err) {
      setMsg("Erreur Google: " + err.message);
    }
  };

  // Connexion anonyme
  const handleAnonymous = async () => {
    try {
      await signInAnonymously(auth);
      navigate("/");
    } catch (err) {
      setMsg("Erreur anonyme: " + err.message);
    }
  };

  return (
    <div>
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

      <p>ou</p>

      <button onClick={handleGoogle}>Connexion avec Google</button>
      <button onClick={handleAnonymous}>Connexion anonyme</button>

      <p>
        Déjà un compte ? <Link to="/login">Connecte-toi ici</Link>
      </p>

      {msg && <p style={{ color: "red" }}>{msg}</p>}
    </div>
  );
}
