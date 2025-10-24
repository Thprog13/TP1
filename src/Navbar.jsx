import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "./firebase";
import { signOut } from "firebase/auth";
import "./Navbar.css";
import { doc, updateDoc } from "firebase/firestore";

export default function Navbar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const logout = async () => {
    const user = auth.currentUser;

    if (user) {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        status: "offline",
        lastSeen: new Date(),
      });
    }

    await signOut(auth);
    navigate("/login");
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`app-navbar ${scrolled ? "scrolled" : ""}`} role="banner">
      <div className="nav-inner">
        <div className="brand">
          <Link to="/" className="brand-link" aria-label="Accueil">
            <span className="brand-text">Chat Party</span>
          </Link>
        </div>

        <nav className="nav-desktop" role="navigation" aria-label="Menu principal">
          <Link to="/" className="nav-link">Messages Publics</Link>
          <Link to="/dm" className="nav-link">Messages Privés</Link>
          <Link to="/profil" className="nav-link">Profil</Link>
          
          <button className="btn btn-logout" onClick={logout}>Déconnexion</button>
        </nav>

        <button
          className={`hamburger ${open ? "is-open" : ""}`}
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div className={`mobile-menu ${open ? "open" : ""}`} role="dialog" aria-modal="true">
        <div className="mobile-inner">
          <Link to="/" className="mobile-link" onClick={() => setOpen(false)}>Accueil</Link>
          <Link to="/profil" className="mobile-link" onClick={() => setOpen(false)}>Profil</Link>
          <Link to="/dm" className="mobile-link" onClick={() => setOpen(false)}>Messages</Link>
          <button className="mobile-link btn-logout" onClick={() => { setOpen(false); logout(); }}>Déconnexion</button>
        </div>
      </div>
    </header>
  );
}
