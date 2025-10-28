import { useAuth } from "./context.jsx";
import { useState, useEffect } from "react";
import {
  updateProfile,
  EmailAuthProvider,
  linkWithCredential,
  sendEmailVerification,
} from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, storage } from "./firebase";
import { doc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import "./Profil.css";

const defaultAvatar = "https://png.pngtree.com/png-vector/20210604/ourmid/pngtree-gray-avatar-placeholder-png-image_3416697.jpg";


export default function Profil() {
  const { user } = useAuth();
  const [newName, setNewName] = useState(user?.displayName || "");
  const [avatarFile, setAvatarFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [msg, setMsg] = useState("");
  const [emailConv, setEmailConv] = useState("");
  const [passConv, setPassConv] = useState("");
  const [passConv2, setPassConv2] = useState("");

  const isAnon = user?.isAnonymous;

  useEffect(() => {
    if (!avatarFile) {
      setPreview(null);
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(avatarFile);
  }, [avatarFile]);

  const updateName = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(auth.currentUser, { displayName: newName });
      setMsg("Nom mis à jour !");
    } catch (err) {
      setMsg("Erreur : " + err.message);
    }
  };

  const uploadAvatar = async (e) => {
    e.preventDefault();
    try {
      if (!avatarFile) return setMsg("Choisissez une image avant !");
      const path = ref(storage, `avatars/${user.uid}.jpg`);
      await uploadBytes(path, avatarFile);
      const url = await getDownloadURL(path);
      await updateProfile(auth.currentUser, { photoURL: url });
      await setDoc(
        doc(db, "users", user.uid),
        {
          photoURL: url,
          displayName: auth.currentUser.displayName || null,
          email: auth.currentUser.email || null,
        },
        { merge: true }
      );
      setMsg("Photo de profil mise à jour !");
    } catch (err) {
      setMsg("Erreur upload : " + err.message);
    }
  };

  const getInitial = (name) => {
    if (!name) return "?";
    return name.trim().charAt(0).toUpperCase();
  };

  const convertAccount = async (e) => {
    e.preventDefault();
    if (!isAnon) return;
    if (!emailConv || !passConv || !passConv2)
      return setMsg("Remplis tous les champs !");
    if (passConv !== passConv2)
      return setMsg("Les mots de passe ne correspondent pas !");
    try {
      const credential = EmailAuthProvider.credential(emailConv, passConv);
      await linkWithCredential(auth.currentUser, credential);
      await sendEmailVerification(auth.currentUser);
      setMsg("Compte converti ! Vérifie ton e-mail.");
    } catch (err) {
      setMsg("Erreur conversion : " + err.message);
    }
  };

  return (
    <div className="profil-container">
      <div className="user-card">
        {/* === AVATAR === */}
        <div className="current-avatar-wrap">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt="Photo de profil actuelle"
              className="current-avatar-preview"
            />
          ) : (
            <img
              src={defaultAvatar}
              alt="Photo de profil actuelle"
              className="current-avatar-preview"
            />
          )}
        </div>

        {/* === INFOS === */}
        {user && (
          <div className="user-info">
            <p>
              <strong>Email :</strong> {user.email || "Compte anonyme"}
            </p>
            <p>
              <strong>Nom d'affichage :</strong>{" "}
              {user.displayName || "(non défini)"}
            </p>
            <p>
              <strong>Fournisseur :</strong>{" "}
              {user.providerData[0]?.providerId || "inconnu"}
            </p>
          </div>
        )}

        {/* === FORMULAIRE PRINCIPAL === */}
        <form className="profil-form" onSubmit={updateName}>
          <h3>Modifier le nom</h3>
          <input
            type="text"
            placeholder="Nouveau nom"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <button type="submit">Mettre à jour</button>
        </form>

        <form className="profil-form" onSubmit={uploadAvatar}>
          <h3>Changer la photo de profil</h3>
          <input
            type="file"
            onChange={(e) => setAvatarFile(e.target.files[0])}
          />
          {preview && (
            <div className="preview-container">
              <img
                src={preview}
                alt="Prévisualisation"
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  marginTop: "10px",
                }}
              />
            </div>
          )}
          <button type="submit">Téléverser</button>
        </form>

        {isAnon && (
          <form className="profil-form" onSubmit={convertAccount}>
            <h3>Convertir le compte anonyme</h3>
            <input
              type="email"
              placeholder="Adresse e-mail"
              value={emailConv}
              onChange={(e) => setEmailConv(e.target.value)}
            />
            <input
              type="password"
              placeholder="Mot de passe"
              value={passConv}
              onChange={(e) => setPassConv(e.target.value)}
            />
            <input
              type="password"
              placeholder="Confirme le mot de passe"
              value={passConv2}
              onChange={(e) => setPassConv2(e.target.value)}
            />
            <button type="submit">Convertir mon compte</button>
          </form>
        )}

        {msg && (
          <p
            className={`message-alert ${
              msg.includes("Erreur") ? "error" : "success"
            }`}
          >
            {msg}
          </p>
        )}
      </div>
    </div>
  );
}
