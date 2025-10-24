import { useState } from "react";
import { auth, db } from "./firebase";
import {
  createUserWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
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
      
      await setDoc(doc(db, "users", res.user.uid), {
        displayName: pseudo,
        email: email,
        photoURL: null,
        createdAt: serverTimestamp(),
        lastSeen: serverTimestamp()
      });
      
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