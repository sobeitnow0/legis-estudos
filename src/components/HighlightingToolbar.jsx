import React from "react";
import { Bold, Italic, Underline, Trash2 } from "lucide-react";

export function HighlightingToolbar({ position, onApplyHighlight, onApplyFormat, onClose }) {
  const colors = [
    { name: "yellow", title: "Amarelo", colorCode: "#fff3a8" },
    { name: "green", title: "Verde", colorCode: "#cbf1d4" },
    { name: "blue", title: "Azul", colorCode: "#cbe6f7" },
    { name: "pink", title: "Rosa", colorCode: "#ffd5e8" },
    { name: "purple", title: "Roxo", colorCode: "#e5dbf9" },
    { name: "orange", title: "Laranja", colorCode: "#ffe2c5" },
    { name: "red", title: "Vermelho", colorCode: "#ffccd2" },
  ];

  return (
    <div
      className="floating-toolbar"
      style={{
        position: "absolute",
        top: `${position.top}px`,
        left: `${position.left}px`,
        display: "flex",
        alignItems: "center",
        gap: "4px",
        padding: "6px",
        backgroundColor: "var(--figma-bg)",
        border: "1px solid var(--figma-border)",
        borderRadius: "var(--figma-radius-lg)",
        boxShadow: "var(--figma-shadow-popover)",
        zIndex: 1000,
      }}
      onMouseDown={(e) => {
        // Prevent clearing the text selection when clicking the toolbar buttons
        e.preventDefault();
      }}
    >
      {/* Formatting Active buttons */}
      <button onClick={() => onApplyFormat("bold")} className="toolbar-btn" title="Negrito (B)">
        <Bold size={14} style={{ strokeWidth: 3 }} />
      </button>
      <button onClick={() => onApplyFormat("italic")} className="toolbar-btn" title="Itálico (I)">
        <Italic size={14} />
      </button>
      <button onClick={() => onApplyFormat("underline")} className="toolbar-btn" title="Sublinhado (U)">
        <Underline size={14} />
      </button>

      <div className="toolbar-divider" />

      {/* Highlighter Colors */}
      <div style={{ display: "flex", gap: "6px", padding: "0 4px" }}>
        {colors.map((c) => (
          <button
            key={c.name}
            onClick={() => onApplyHighlight(c.name)}
            title={`Grifar de ${c.title}`}
            style={{
              width: "18px",
              height: "18px",
              borderRadius: "50%",
              backgroundColor: c.colorCode,
              border: "1px solid rgba(55,53,47,0.15)",
              cursor: "pointer",
              padding: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "transform 0.1s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.2)")}
            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
          />
        ))}
      </div>

      <div className="toolbar-divider" />

      {/* Close/Remove selection */}
      <button
        onClick={() => onApplyHighlight("gray")}
        className="toolbar-btn"
        title="Remover marcações do trecho"
        style={{ color: "var(--figma-text-secondary)" }}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
