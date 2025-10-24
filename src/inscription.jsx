import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import "./inscription.css";

export default function Inscription() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!email || !pass || !confirmPass || !pseudo) {
      setMsg("Tous les champs sont obligatoires.");
      return;
    }

    if (pass.length < 6) {
      setMsg("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    if (pass !== confirmPass) {
      setMsg("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);

    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);

      await updateProfile(res.user, { displayName: pseudo });
      
       sendEmailVerification(res.user);

      await setDoc(doc(db, "users", res.user.uid), {
        uid: res.user.uid,
        pseudo: pseudo,
        email: email,
        status: "online",
        createdAt: new Date(),
      });

      setMsg("Compte créé avec succès ! Vérifie ton e-mail avant de te connecter.");

      setTimeout(() => navigate("/login"), 4000);
    } catch (err) {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        setMsg("Cet e-mail est déjà utilisé.");
      } else if (err.code === "auth/invalid-email") {
        setMsg("L’adresse e-mail est invalide.");
      } else {
        setMsg("Erreur: " + err.message);
      }
    } finally {
      setLoading(false);
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
        <input
          type="password"
          placeholder="Confirmer le mot de passe"
          value={confirmPass}
          onChange={(e) => setConfirmPass(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Création en cours..." : "S'inscrire"}
        </button>
      </form>

      <p className="link">
        Déjà un compte ? <Link to="/login">Connecte-toi ici</Link>
      </p>

      {msg && <p className={msg.includes("succès") ? "success" : "error"}>{msg}</p>}
    </div>
  );
}
