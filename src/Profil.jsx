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

  const updateName = async () => {
    try {
      await updateProfile(auth.currentUser, { displayName: newName });
      setMsg("Nom mis à jour !");
    } catch (err) {
      setMsg("Erreur : " + err.message);
    }
  };

  const uploadAvatar = async () => {
    try {
      if (!avatarFile) return setMsg("Choisissez une image avant !");
      const path = ref(storage, `avatars/${user.uid}.jpg`);
      await uploadBytes(path, avatarFile);
      const url = await getDownloadURL(path);
      await updateProfile(auth.currentUser, { photoURL: url });
      setMsg("Photo de profil mise à jour !");
    } catch (err) {
      setMsg("Erreur upload : " + err.message);
    }
  };

  const convertAccount = async () => {
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
    <div>
      <h2>Profil utilisateur</h2>

      {user && (
        <>
          <p>
            <strong>UID :</strong> {user.uid}
          </p>
          <p>
            <strong>Email :</strong> {user.email || "Compte anonyme"}
          </p>
          <p>
            <strong>Nom d’affichage :</strong>{" "}
            {user.displayName || "(non défini)"}
          </p>
          <p>
            <strong>Fournisseur :</strong>{" "}
            {user.providerData[0]?.providerId || "inconnu"}
          </p>
        </>
      )}

      <hr />

      <h3>Modifier le nom</h3>
      <input
        type="text"
        placeholder="Nouveau nom"
        value={newName}
        onChange={(e) => setNewName(e.target.value)}
      />
      <button onClick={updateName}>Mettre à jour</button>

      <hr />

      <h3>Photo de profil</h3>
      <input type="file" onChange={(e) => setAvatarFile(e.target.files[0])} />
      {preview && (
        <div>
          <p>Aperçu :</p>
          <img src={preview} alt="preview" width={120} />
        </div>
      )}
      <button onClick={uploadAvatar}>Téléverser</button>

      {isAnon && (
        <>
          <hr />
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
          <button onClick={convertAccount}>Convertir mon compte</button>
        </>
      )}

      {msg && <p style={{ color: "green" }}>{msg}</p>}
    </div>
  );
}
