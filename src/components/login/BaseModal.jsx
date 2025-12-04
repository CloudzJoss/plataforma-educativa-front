// src/components/login/BaseModal.jsx
import React, { useEffect, useRef } from "react";
import LoginModal from "./LoginModal";
import "../../styles/login/LoginModal.css";

export default function BaseModal({ onClose }) {
  const containerRef = useRef(null);
  const modalTitleId = "login-title";

  useEffect(() => {
    const handleKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handleKey);

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  useEffect(() => {
    setTimeout(() => {
      const first = containerRef.current?.querySelector("input, button, [tabindex]:not([tabindex='-1'])");
      first?.focus();
    }, 0);
  }, []);

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.currentTarget === e.target}
    >
      <div
        className="modal fixed-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={modalTitleId}
        ref={containerRef}
      >
        <button className="modal-close" onClick={onClose} aria-label="Cerrar">×</button>

        <div className="modal-body">
          <LoginModal onClose={onClose} />
        </div>
      </div>
    </div>
  );
}