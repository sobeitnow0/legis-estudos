import React from "react";
import { Bold, Italic, Underline, Trash2 } from "lucide-react";

export function HighlightingToolbar({ position, onApplyHighlight, onClose }) {
  const colors = [
    { name: "yellow", title: "Amarelo", colorCode: "#fdecb4" },
    { name: "green", title: "Verde", colorCode: "#ddedea" },
    { name: "blue", title: "Azul", colorCode: "#ddebfa" },
    { name: "pink", title: "Rosa", colorCode: "#f4dfeb" },
    { name: "purple", title: "Roxo", colorCode: "#eae4f2" },
    { name: "orange", title: "Laranja", colorCode: "#faebdd" },
    { name: "red", title: "Vermelho", colorCode: "#fbe4e4" },
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
        backgroundColor: "var(--notion-bg)",
        border: "1px solid var(--notion-border)",
        borderRadius: "var(--notion-radius-lg)",
        boxShadow: "var(--notion-shadow-popover)",
        zIndex: 1000,
      }}
      onMouseDown={(e) => {
        // Prevent clearing the text selection when clicking the toolbar buttons
        e.preventDefault();
      }}
    >
      {/* Formatting Mock buttons */}
      <button className="toolbar-btn" title="Negrito">
        <Bold size={14} />
      </button>
      <button className="toolbar-btn" title="Itálico">
        <Italic size={14} />
      </button>
      <button className="toolbar-btn" title="Sublinhado">
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
        style={{ color: "var(--notion-text-secondary)" }}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
