import { useState, useEffect, useRef } from "react";
import { auth, googleProvider, githubProvider, db } from "./firebase";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  signInAnonymously,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  fetchSignInMethodsForEmail,
  linkWithCredential,
  GoogleAuthProvider,
  GithubAuthProvider,
  EmailAuthProvider,
  onAuthStateChanged
} from "firebase/auth";
import { doc, setDoc, updateDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import "./Connection.css";

export default function Connection() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [msg, setMsg] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const [pendingCredential, setPendingCredential] = useState(null);
  const [expectedEmail, setExpectedEmail] = useState("");
  const [showLinkingFlow, setShowLinkingFlow] = useState(false);
  const [existingProviderId, setExistingProviderId] = useState("");

  const recaptchaVerifierRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const initRecaptcha = async () => {
      const container = document.getElementById("recaptcha-container");
      if (container && !recaptchaVerifierRef.current) {
        const verifier = new RecaptchaVerifier(container, { size: "invisible" }, auth);
        await verifier.render();
        recaptchaVerifierRef.current = verifier;
      }
    };
    initRecaptcha();
    return () => {
      if (recaptchaVerifierRef.current?.clear) recaptchaVerifierRef.current.clear();
      recaptchaVerifierRef.current = null;
    };
  }, []);

  const handleError = (err) => {
    console.error(err);
    setMsg(err.message || "Une erreur est survenue");
  };

  const setUserOnlineStatus = async (user) => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      await updateDoc(userRef, {
        status: "online",
        lastSeen: serverTimestamp(),
      });
    } else {
      await setDoc(userRef, {
        email: user.email || null,
        status: "online",
        online: true,
        lastSeen: serverTimestamp(),
        createdAt: serverTimestamp(),
      });
    }
  };


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await setUserOnlineStatus(user);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      await setUserOnlineStatus(auth.currentUser);
      navigate("/");
    } catch (err) {
      handleError(err);
    }
    setLoading(false);
  };

  const handlePopupLogin = async (provider, providerName) => {
    setMsg("");
    setLoading(true);
    setShowLinkingFlow(false);
    try {
      await signInWithPopup(auth, provider);
      await setUserOnlineStatus(auth.currentUser);
      navigate("/");
    } catch (err) {
      if (err.code === "auth/account-exists-with-different-credential") {
        const email = err.customData.email;
        const pendingCred = err.credential;
        setExpectedEmail(email);
        setPendingCredential(pendingCred);
        try {
          const signInMethods = await fetchSignInMethodsForEmail(auth, email);
          if (signInMethods?.length > 0) {
            setExistingProviderId(signInMethods[0]);
            setShowLinkingFlow(true);
            setMsg(
              `Un compte existe déjà avec cet e-mail (${email}) via ${signInMethods[0]}. ` +
              `Veuillez vous reconnecter avec ce compte pour lier ${providerName}.`
            );
          } else {
            setMsg("Compte existant trouvé mais méthode de connexion introuvable.");
          }
        } catch (innerErr) {
          handleError({ message: `Erreur récupération méthodes: ${innerErr.message}` });
        }
      } else {
        handleError({ message: `Erreur ${providerName}: ${err.message}` });
      }
    }
    setLoading(false);
  };

  const handleAnonymous = async () => {
    setMsg("");
    setLoading(true);
    try {
      await signInAnonymously(auth);
      await setUserOnlineStatus(auth.currentUser);
      navigate("/");
    } catch (err) {
      handleError(err);
    }
    setLoading(false);
  };

  const handleSendSMS = async () => {
    setMsg("");
    if (!phone) return setMsg("Veuillez entrer un numéro valide");
    setLoading(true);
    try {
      if (!recaptchaVerifierRef.current) throw new Error("reCAPTCHA non initialisé");
      const confirmation = await signInWithPhoneNumber(auth, phone, recaptchaVerifierRef.current);
      setConfirmationResult(confirmation);
      setMsg("Code envoyé !");
    } catch (err) {
      handleError({ message: "Erreur SMS: " + err.message });
      recaptchaVerifierRef.current?.clear();
      recaptchaVerifierRef.current = null;
    }
    setLoading(false);
  };

  const handleVerifyCode = async () => {
    setMsg("");
    if (!confirmationResult) return setMsg("Aucun code envoyé");
    if (!otp) return setMsg("Veuillez entrer le code reçu");
    setLoading(true);
    try {
      await confirmationResult.confirm(otp);
      await setUserOnlineStatus(auth.currentUser);
      navigate("/");
    } catch (err) {
      handleError({ message: "Code invalide: " + err.message });
    }
    setLoading(false);
  };

  const handleReAuthenticateAndLink = async () => {
    setMsg("");
    setLoading(true);
    try {
      if (!pendingCredential || !expectedEmail) {
        setMsg("Infos de liaison manquantes.");
        setLoading(false);
        return;
      }
      let userCredential;
      if (existingProviderId === GoogleAuthProvider.PROVIDER_ID) {
        userCredential = await signInWithPopup(auth, googleProvider);
      } else if (existingProviderId === GithubAuthProvider.PROVIDER_ID) {
        userCredential = await signInWithPopup(auth, githubProvider);
      } else if (existingProviderId === EmailAuthProvider.EMAIL_PASSWORD_SIGN_IN_METHOD) {
        setMsg("Veuillez vous reconnecter avec votre email/mot de passe existant. Non implémenté pour l'instant.");
        setLoading(false);
        return;
      } else {
        setMsg(`Méthode (${existingProviderId}) non supportée.`);
        setLoading(false);
        return;
      }
      if (userCredential?.user) {
        await linkWithCredential(userCredential.user, pendingCredential);
        await setUserOnlineStatus(auth.currentUser);
        setMsg("Compte lié avec succès !");
        setShowLinkingFlow(false);
        setPendingCredential(null);
        setExpectedEmail("");
        setExistingProviderId("");
        navigate("/");
      } else {
        setMsg("Échec de la liaison.");
      }
    } catch (err) {
      handleError({ message: `Erreur liaison: ${err.message}` });
    }
    setLoading(false);
  };

  return (
    <div className="connection-container">
      <h2>Connexion</h2>
      <form onSubmit={handleLogin}>
        <input type="email" placeholder="Adresse e-mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Mot de passe" value={pass} onChange={(e) => setPass(e.target.value)} required />
        <button type="submit" disabled={loading}>{loading ? "Connexion..." : "Se connecter"}</button>
      </form>
      <p className="divider">ou</p>
      <div className="phone-login">
        <h3>Connexion par téléphone</h3>
        <input type="tel" placeholder="+33 6 12 34 56 78" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <button onClick={handleSendSMS} disabled={loading}>{loading ? "Envoi..." : "Envoyer le code"}</button>
        {confirmationResult && (
          <>
            <input type="text" placeholder="Code reçu par SMS" value={otp} onChange={(e) => setOtp(e.target.value)} />
            <button onClick={handleVerifyCode} disabled={loading}>{loading ? "Vérification..." : "Vérifier le code"}</button>
          </>
        )}
      </div>
      <div className="alt-buttons">
        <button onClick={() => handlePopupLogin(googleProvider, "Google")} disabled={loading}>Connexion avec Google</button>
        <button onClick={() => handlePopupLogin(githubProvider, "GitHub")} disabled={loading}>Connexion avec GitHub</button>
        <button onClick={handleAnonymous} disabled={loading}>Connexion anonyme</button>
      </div>
      <p className="link">Pas encore de compte ? <Link to="/signup">Inscris-toi ici</Link></p>
      {showLinkingFlow && (
        <div className="linking-flow-container">
          <h3>Liaison de compte requise</h3>
          <p className="error">{msg}</p>
          <button onClick={handleReAuthenticateAndLink} disabled={loading}>{loading ? "Re-connexion..." : `Reconnectez-vous avec ${existingProviderId}`}</button>
        </div>
      )}
      <div id="recaptcha-container"></div>
      {!showLinkingFlow && msg && <p className="error">{msg}</p>}
    </div>
  );
}
