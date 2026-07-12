import React from "react";

export default function Loader({ show, text = "Please wait" }) {
  if (!show) return null;

  return (
    <div
      aria-hidden={!show}
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(6,8,15,0.6)",
        zIndex: 9999,
        backdropFilter: "blur(4px)",
      }}
    >
      <div style={{ textAlign: "center", color: "#eef1f8" }}>
        <div
          style={{
            width: 64,
            height: 64,
            margin: "0 auto 12px",
            borderRadius: 9999,
            border: "6px solid rgba(255,255,255,0.12)",
            borderTopColor: "#ffb020",
            animation: "loader-spin 0.9s linear infinite",
          }}
        />
        <div style={{ fontSize: 15, fontWeight: 600 }}>{text}</div>
      </div>

      <style>{`
        @keyframes loader-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
