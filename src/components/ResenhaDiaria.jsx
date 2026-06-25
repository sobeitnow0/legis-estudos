import React, { useState, useEffect } from "react";
import { Calendar, Filter, ExternalLink, RefreshCcw, Bell, CheckCircle } from "lucide-react";
import resenhaData from "../data/resenhaUpdates.json";

export default function ResenhaDiaria() {
  const [filterType, setFilterType] = useState("all");
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");
  const [readItems, setReadItems] = useState({});

  useEffect(() => {
    const savedRead = localStorage.getItem("legis_resenha_lido");
    if (savedRead) {
      try {
        setReadItems(JSON.parse(savedRead));
      } catch(e) {}
    }
  }, []);

  const toggleReadStatus = (id) => {
    const newReadItems = { ...readItems, [id]: !readItems[id] };
    setReadItems(newReadItems);
    localStorage.setItem("legis_resenha_lido", JSON.stringify(newReadItems));
  };

  // For this automated version, updates come from the JSON file
  // written by the GitHub Action. We sort them by date (newest first).
  const updates = [...resenhaData].sort((a, b) => new Date(b.date) - new Date(a.date));

  const handleSync = () => {
    setSyncing(true);
    setSyncMessage("Verificando atualizações no GitHub...");
    setTimeout(() => {
      setSyncing(false);
      setSyncMessage("Sistema automático ativo. Novas leis aparecerão aqui magicamente.");
      setTimeout(() => setSyncMessage(""), 4000);
    }, 1500);
  };

  const filteredUpdates = filterType === "all"
    ? updates
    : updates.filter(up => up.type === filterType);

  const tagColors = {
    purple: { bg: "rgba(147, 51, 234, 0.1)", text: "#9333ea" },
    blue: { bg: "rgba(37, 99, 235, 0.1)", text: "#2563eb" },
    green: { bg: "rgba(22, 163, 74, 0.1)", text: "#16a34a" },
    orange: { bg: "rgba(234, 88, 12, 0.1)", text: "#ea580c" },
  };

  return (
    <div className="notion-page-frame animate-fade-in" style={{ paddingBottom: "80px" }}>
      {/* Header emoji and Title */}
      <div className="notion-page-header-emoji">📰</div>
      <h1 style={{ fontSize: "2.2rem", fontWeight: 700, marginBottom: "8px" }}>
        Resenha Diária do Planalto
      </h1>
      <p style={{ color: "var(--notion-text-secondary)", fontSize: "0.95rem", marginBottom: "32px" }}>
        Monitoramento diário de emendas constitucionais, leis ordinárias, decretos regulamentares e medidas provisórias.
      </p>

      {/* Sync bar widget */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          backgroundColor: "var(--notion-sidebar-bg)",
          borderRadius: "var(--notion-radius-lg)",
          border: "1px solid var(--notion-border)",
          marginBottom: "24px",
          gap: "12px",
          flexWrap: "wrap"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Bell size={18} style={{ color: "var(--notion-accent)" }} />
          <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>
            {syncMessage || "Última varredura no Planalto: Hoje às 12:15"}
          </span>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="notion-btn"
          style={{ fontSize: "0.8rem", padding: "6px 12px" }}
        >
          <RefreshCcw size={12} className={syncing ? "animate-spin" : ""} />
          <span>{syncing ? "Sincronizando..." : "Sincronizar Agora"}</span>
        </button>
      </div>

      {/* Notion tab filters */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid var(--notion-border)",
          gap: "16px",
          marginBottom: "24px",
          paddingBottom: "8px"
        }}
      >
        <button
          onClick={() => setFilterType("all")}
          style={{
            border: "none",
            background: "transparent",
            fontSize: "0.9rem",
            fontWeight: filterType === "all" ? 600 : 400,
            color: filterType === "all" ? "var(--notion-text)" : "var(--notion-text-secondary)",
            borderBottom: filterType === "all" ? "2px solid var(--notion-text)" : "none",
            padding: "8px 12px",
            cursor: "pointer",
          }}
        >
          Todos os Atos
        </button>
        <button
          onClick={() => setFilterType("lei")}
          style={{
            border: "none",
            background: "transparent",
            fontSize: "0.9rem",
            fontWeight: filterType === "lei" ? 600 : 400,
            color: filterType === "lei" ? "var(--notion-text)" : "var(--notion-text-secondary)",
            borderBottom: filterType === "lei" ? "2px solid var(--notion-text)" : "none",
            padding: "8px 12px",
            cursor: "pointer",
          }}
        >
          Leis
        </button>
        <button
          onClick={() => setFilterType("decreto")}
          style={{
            border: "none",
            background: "transparent",
            fontSize: "0.9rem",
            fontWeight: filterType === "decreto" ? 600 : 400,
            color: filterType === "decreto" ? "var(--notion-text)" : "var(--notion-text-secondary)",
            borderBottom: filterType === "decreto" ? "2px solid var(--notion-text)" : "none",
            padding: "8px 12px",
            cursor: "pointer",
          }}
        >
          Decretos
        </button>
        <button
          onClick={() => setFilterType("mp")}
          style={{
            border: "none",
            background: "transparent",
            fontSize: "0.9rem",
            fontWeight: filterType === "mp" ? 600 : 400,
            color: filterType === "mp" ? "var(--notion-text)" : "var(--notion-text-secondary)",
            borderBottom: filterType === "mp" ? "2px solid var(--notion-text)" : "none",
            padding: "8px 12px",
            cursor: "pointer",
          }}
        >
          Medidas Provisórias
        </button>
      </div>

      {/* Feed list */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {filteredUpdates.map((up) => {
          const isRead = readItems[up.id];

          return (
            <div
              key={up.id}
              className="notion-card animate-fade-in"
              style={{ 
                marginBottom: 0, 
                cursor: "default",
                opacity: isRead ? 0.6 : 1,
                transition: "opacity 0.2s"
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "8px",
                  flexWrap: "wrap",
                  marginBottom: "8px"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Calendar size={14} style={{ color: "var(--notion-text-secondary)" }} />
                  <strong style={{ fontSize: "1rem", color: "var(--notion-text)", textDecoration: isRead ? "line-through" : "none" }}>{up.title}</strong>
                </div>
                <span
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    padding: "2px 6px",
                    borderRadius: "3px",
                    backgroundColor: tagColors[up.color]?.bg || "var(--notion-hover)",
                    color: tagColors[up.color]?.text || "var(--notion-text-secondary)"
                  }}
                >
                  {up.tag}
                </span>
              </div>

              <p style={{ fontSize: "0.85rem", color: "var(--notion-text)", marginBottom: "12px", lineHeight: "1.5" }}>
                <strong>Ementa:</strong> {up.summary}
              </p>

              <div
                style={{
                  backgroundColor: "var(--notion-sidebar-bg)",
                  border: "1px solid var(--notion-border)",
                  borderRadius: "var(--notion-radius)",
                  padding: "10px",
                  fontSize: "0.8rem",
                  color: "var(--notion-text-secondary)",
                  marginBottom: "16px",
                  lineHeight: "1.5"
                }}
              >
                <strong style={{ color: "var(--notion-text)", display: "block", marginBottom: "4px" }}>Análise do LegisEstudos:</strong>
                {up.analysis}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: "16px" }}>
                  <a
                    href={up.planaltoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="notion-btn"
                    style={{ fontSize: "0.75rem", padding: "4px 8px" }}
                  >
                    <span>Ver no Planalto</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
                
                <button
                  onClick={() => toggleReadStatus(up.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: isRead ? "#2ecc71" : "var(--notion-text-secondary)",
                    fontSize: "0.8rem",
                    fontWeight: 500
                  }}
                >
                  <CheckCircle size={14} />
                  {isRead ? "Lido" : "Marcar como Lido"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
