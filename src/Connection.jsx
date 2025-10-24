import { useState, useEffect, useRef } from "react";
import { auth, googleProvider, githubProvider } from "./firebase";
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
} from "firebase/auth";
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
  const navigate = useNavigate();

  const [pendingCredential, setPendingCredential] = useState(null);
  const [expectedEmail, setExpectedEmail] = useState("");
  const [showLinkingFlow, setShowLinkingFlow] = useState(false);
  const [existingProviderId, setExistingProviderId] = useState("");

  const recaptchaVerifierRef = useRef(null);

  useEffect(() => {
    const initRecaptcha = async () => {

      const container = document.getElementById("recaptcha-container");
      if (container) {

        if (!auth.settings) {
          console.warn("auth.settings était undefined. Initialisation pour la compatibilité.");
          auth.settings = {};
        }
        auth.settings.appVerificationDisabledForTesting = true;

        if (!recaptchaVerifierRef.current) {
          try {
            const verifier = new RecaptchaVerifier(container, { size: "invisible" }, auth);
            await verifier.render();
            recaptchaVerifierRef.current = verifier;
            console.log("reCAPTCHA verifier initialisé en mode test.");
          } catch (e) {
            console.error("Erreur lors de la création ou du rendu de RecaptchaVerifier:", e);
            setMsg("Erreur d'initialisation reCAPTCHA. Veuillez réessayer.");
          }
        }
      } else {
        console.warn("Le conteneur 'recaptcha-container' n'a pas été trouvé dans le DOM.");
      }
    };

    initRecaptcha();

    return () => {
      if (recaptchaVerifierRef.current && typeof recaptchaVerifierRef.current.clear === 'function') {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
        console.log("RecaptchaVerifier nettoyé.");
      }
    };
  }, []);

  const handleError = (err) => {
    console.error(err);
    setMsg(err.message || "Une erreur est survenue");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
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
      navigate("/");
    } catch (err) {
      if (err.code === "auth/account-exists-with-different-credential") {
        const email = err.customData.email;
        const pendingCred = err.credential;

        setExpectedEmail(email);
        setPendingCredential(pendingCred);

        try {
          const signInMethods = await fetchSignInMethodsForEmail(auth, email);

          if (signInMethods && signInMethods.length > 0) {
            const firstExistingMethod = signInMethods[0];
            setExistingProviderId(firstExistingMethod);
            setShowLinkingFlow(true);

            setMsg(
              `Un compte existe déjà avec cet e-mail (${email}) via ${firstExistingMethod}. ` +
              `Veuillez vous reconnecter avec votre compte ${firstExistingMethod} pour lier votre compte ${providerName}.`
            );
          } else {
            setMsg("Un compte existe avec cette adresse e-mail mais la méthode de connexion existante est introuvable.");
          }
        } catch (innerErr) {
          handleError({ message: `Erreur lors de la recherche des méthodes de connexion existantes: ${innerErr.message}` });
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
      navigate("/");
    } catch (err) {
      handleError(err);
    }
    setLoading(false);
  };

  const handleSendSMS = async () => {
    setMsg("");
    if (!phone) return setMsg("Veuillez entrer un numéro de téléphone valide");
    setLoading(true);
    try {
      if (!recaptchaVerifierRef.current) {
        setMsg("reCAPTCHA n'est pas initialisé. Veuillez recharger la page.");
        setLoading(false);
        return;
      }
      const appVerifier = recaptchaVerifierRef.current;
      const confirmation = await signInWithPhoneNumber(auth, phone, appVerifier);
      setConfirmationResult(confirmation);
      setMsg("Code envoyé par SMS !");
    } catch (err) {
      handleError({ message: "Erreur SMS: " + err.message + ". Assurez-vous que reCAPTCHA est bien chargé et que votre numéro de test est configuré." });

      if (recaptchaVerifierRef.current && typeof recaptchaVerifierRef.current.clear === 'function') {
         recaptchaVerifierRef.current.clear();
         recaptchaVerifierRef.current = null;
      }
    }
    setLoading(false);
  };

  const handleVerifyCode = async () => {
    setMsg("");
    if (!confirmationResult) return setMsg("Aucun code envoyé");
    if (!otp) return setMsg("Veuillez entrer le code reçu par SMS");
    setLoading(true);
    try {
      await confirmationResult.confirm(otp);
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
        setMsg("Informations de liaison manquantes. Veuillez réessayer la connexion.");
        setLoading(false);
        return;
      }

      let userCredential;

      if (existingProviderId === GoogleAuthProvider.PROVIDER_ID) {
        userCredential = await signInWithPopup(auth, googleProvider);
      } else if (existingProviderId === GithubAuthProvider.PROVIDER_ID) {

        userCredential = await signInWithPopup(auth, githubProvider);
      } else if (existingProviderId === EmailAuthProvider.EMAIL_PASSWORD_SIGN_IN_METHOD) {

        setMsg("Veuillez vous reconnecter avec votre email/mot de passe existant. Cette fonctionnalité n'est pas encore implémentée pour la liaison.");
        setLoading(false);
        return;
      } else {
        setMsg(`Méthode de connexion existante (${existingProviderId}) non supportée pour la re-connexion.`);
        setLoading(false);
        return;
      }

      if (userCredential && userCredential.user) {
        await linkWithCredential(userCredential.user, pendingCredential);
        setMsg("Compte lié avec succès ! Vous pouvez maintenant vous connecter avec les deux fournisseurs.");
        setShowLinkingFlow(false);
        setPendingCredential(null);
        setExpectedEmail("");
        setExistingProviderId("");
        navigate("/");
      } else {
        setMsg("Échec de la re-connexion ou aucun utilisateur après la re-connexion.");
      }

    } catch (err) {
      handleError({ message: `Erreur lors de la re-connexion ou de la liaison: ${err.message}` });
    }
    setLoading(false);
  };

  return (
    <div className="connection-container">
      <h2>Connexion</h2>

      {}
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
        <button type="submit" disabled={loading}>
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>

      <p className="divider">ou</p>

      {}
      <div className="phone-login">
        <h3>Connexion par téléphone</h3>
        <input
          type="tel"
          placeholder="+33 6 12 34 56 78"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <button onClick={handleSendSMS} disabled={loading}>
          {loading ? "Envoi..." : "Envoyer le code"}
        </button>

        {}
        {confirmationResult && (
          <>
            <input
              type="text"
              placeholder="Code reçu par SMS"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <button onClick={handleVerifyCode} disabled={loading}>
              {loading ? "Vérification..." : "Vérifier le code"}
            </button>
          </>
        )}
      </div>

      {}
      <div className="alt-buttons">
        <button onClick={() => handlePopupLogin(googleProvider, "Google")} disabled={loading}>
          Connexion avec Google
        </button>
        <button onClick={() => handlePopupLogin(githubProvider, "GitHub")} disabled={loading}>
          Connexion avec GitHub
        </button>
        <button onClick={handleAnonymous} disabled={loading}>
          Connexion anonyme
        </button>
      </div>

      <p className="link">
        Pas encore de compte ? <Link to="/signup">Inscris-toi ici</Link>
      </p>

      {}
      {showLinkingFlow && (
        <div className="linking-flow-container">
          <h3>Liaison de compte requise</h3>
          <p className="error">{msg}</p> {}
          <button onClick={handleReAuthenticateAndLink} disabled={loading}>
            {loading ? "Re-connexion..." : `Reconnectez-vous avec ${existingProviderId}`}
          </button>
        </div>
      )}

      {}
      <div id="recaptcha-container"></div>

      {}
      {msg && !showLinkingFlow && <p className="error">{msg}</p>} {}
    </div>
  );
}
