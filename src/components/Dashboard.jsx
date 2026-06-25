import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, Calendar, BookOpen, Clock, ChevronRight, Tag, Bookmark } from "lucide-react";

export default function Dashboard() {
  const recentActs = [
    {
      id: "lei-15436",
      title: "Lei nº 15.436, de 17.06.2026",
      summary: "Institui a Política Nacional para Estudantes com Altas Habilidades ou Superdotação.",
      tags: [{ name: "Direitos Humanos", color: "purple" }, { name: "Educação", color: "blue" }],
      link: "http://www.planalto.gov.br/ccivil_03/_ato2023-2026/2026/lei/l15436.htm"
    },
    {
      id: "dec-13032",
      title: "Decreto nº 13.032, de 17.06.2026",
      summary: "Aprova a Estrutura Regimental do Ministério dos Povos Indígenas e remaneja cargos.",
      tags: [{ name: "Povos Indígenas", color: "green" }, { name: "Administrativo", color: "orange" }],
      link: "http://www.planalto.gov.br/ccivil_03/_ato2023-2026/2026/decreto/d13032.htm"
    },
    {
      id: "lei-15434",
      title: "Lei nº 15.434, de 16.06.2026",
      summary: "Cria o Departamento de Monitoramento e Fiscalização das Decisões dos Sistemas Internacionais de Direitos Humanos no CNJ.",
      tags: [{ name: "Judiciário", color: "blue" }, { name: "Direitos Humanos", color: "purple" }],
      link: "http://www.planalto.gov.br/ccivil_03/_ato2023-2026/2026/lei/l15434.htm"
    }
  ];

  const tagColors = {
    purple: { bg: "rgba(147, 51, 234, 0.1)", text: "#9333ea" },
    blue: { bg: "rgba(37, 99, 235, 0.1)", text: "#2563eb" },
    green: { bg: "rgba(22, 163, 74, 0.1)", text: "#16a34a" },
    orange: { bg: "rgba(234, 88, 12, 0.1)", text: "#ea580c" },
  };

  return (
    <div className="figma-page-frame animate-fade-in" style={{ paddingBottom: "80px" }}>
      {/* Header emoji and Title */}
      <div className="figma-page-header-emoji">✨</div>
      <h1 style={{ fontSize: "2.2rem", fontWeight: 700, marginBottom: "8px" }}>
        Bem-vindo(a) ao seu LegisEstudos
      </h1>
      <p style={{ color: "var(--figma-text-secondary)", fontSize: "0.95rem", marginBottom: "32px" }}>
        Seu Vade Mecum estruturado em blocos interativos. Seus grifos e anotações salvos de forma permanente.
      </p>

      {/* Figma Callout banner */}
      <div className="figma-callout">
        <div className="figma-callout-icon">🚀</div>
        <div className="figma-callout-content" style={{ fontSize: "0.9rem" }}>
          <strong>Dica de Produtividade:</strong> Use o atalho <kbd style={{ background: "var(--figma-border)", padding: "1px 4px", borderRadius: "3px" }}>Ctrl + K</kbd> em qualquer tela para abrir a barra de pesquisa rápida de leis e artigos.
        </div>
      </div>

      {/* Grid: Shortcuts */}
      <h2 style={{ fontSize: "1.3rem", marginTop: "40px", marginBottom: "16px" }}>Acesso Rápido</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
        <Link to="/lei/cf88" className="figma-card" style={{ textDecoration: "none", marginBottom: 0 }}>
          <div style={{ fontSize: "1.5rem", marginBottom: "8px" }}>⚖️</div>
          <strong style={{ display: "block", fontSize: "0.95rem", marginBottom: "4px" }}>Constituição Federal</strong>
          <span style={{ fontSize: "0.75rem", color: "var(--figma-text-secondary)" }}>
            CF/88 promulgada, Artigos 1º a 5º.
          </span>
        </Link>

        <Link to="/lei/cp40" className="figma-card" style={{ textDecoration: "none", marginBottom: 0 }}>
          <div style={{ fontSize: "1.5rem", marginBottom: "8px" }}>📕</div>
          <strong style={{ display: "block", fontSize: "0.95rem", marginBottom: "4px" }}>Código Penal</strong>
          <span style={{ fontSize: "0.75rem", color: "var(--figma-text-secondary)" }}>
            Decreto-Lei 2.848/1940 estruturado.
          </span>
        </Link>

        <Link to="/planos" className="figma-card" style={{ textDecoration: "none", marginBottom: 0 }}>
          <div style={{ fontSize: "1.5rem", marginBottom: "8px" }}>🎯</div>
          <strong style={{ display: "block", fontSize: "0.95rem", marginBottom: "4px" }}>Foco de Banca</strong>
          <span style={{ fontSize: "0.75rem", color: "var(--figma-text-secondary)" }}>
            Filtre por incidência de provas (FGV, CESPE...).
          </span>
        </Link>
      </div>

      {/* Section: Resenha Diária (Novidades recentes) */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: "50px",
          marginBottom: "16px",
          borderBottom: "1px solid var(--figma-border)",
          paddingBottom: "8px",
        }}
      >
        <h2 style={{ fontSize: "1.3rem", margin: 0, border: "none", padding: 0 }}>
          Atualizações Recentes do Planalto (Resenha Diária)
        </h2>
        <Link
          to="/resenha"
          style={{
            fontSize: "0.8rem",
            color: "var(--figma-accent)",
            fontWeight: 500,
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "2px",
          }}
        >
          <span>Ver todas</span>
          <ChevronRight size={14} />
        </Link>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {recentActs.map((act) => (
          <div
            key={act.id}
            className="figma-card"
            style={{ marginBottom: 0, cursor: "default", padding: "16px" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "8px" }}>
              <strong style={{ fontSize: "0.95rem", color: "var(--figma-text)" }}>{act.title}</strong>
              <div style={{ display: "flex", gap: "6px" }}>
                {act.tags.map((t) => (
                  <span
                    key={t.name}
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      padding: "2px 6px",
                      borderRadius: "3px",
                      backgroundColor: tagColors[t.color]?.bg || "var(--figma-hover)",
                      color: tagColors[t.color]?.text || "var(--figma-text-secondary)",
                    }}
                  >
                    {t.name}
                  </span>
                ))}
              </div>
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--figma-text-secondary)", margin: "8px 0 12px 0", lineHeight: "1.5" }}>
              {act.summary}
            </p>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <a
                href={act.link}
                target="_blank"
                rel="noreferrer"
                style={{
                  fontSize: "0.75rem",
                  color: "var(--figma-accent)",
                  textDecoration: "none",
                  fontWeight: 500,
                }}
              >
                Ver texto oficial no Planalto 🌐
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Figma Status / Statistics Widget */}
      <h2 style={{ fontSize: "1.3rem", marginTop: "50px", marginBottom: "16px" }}>Progresso de Estudos</h2>
      <div
        style={{
          display: "flex",
          gap: "16px",
          padding: "16px",
          borderRadius: "var(--figma-radius-lg)",
          border: "1px solid var(--figma-border)",
          backgroundColor: "var(--figma-sidebar-bg)",
          alignItems: "center",
          flexWrap: "wrap"
        }}
      >
        <div style={{ flex: 1, minWidth: "140px", textAlign: "center" }}>
          <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--figma-accent)" }}>CF/88</div>
          <span style={{ fontSize: "0.75rem", color: "var(--figma-text-secondary)" }}>Legislação Ativa</span>
        </div>
        <div style={{ width: "1px", height: "40px", backgroundColor: "var(--figma-border)" }} className="hidden-mobile" />
        <div style={{ flex: 1, minWidth: "140px", textAlign: "center" }}>
          <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#e28743" }}>4 grifos</div>
          <span style={{ fontSize: "0.75rem", color: "var(--figma-text-secondary)" }}>Salvos Localmente</span>
        </div>
        <div style={{ width: "1px", height: "40px", backgroundColor: "var(--figma-border)" }} className="hidden-mobile" />
        <div style={{ flex: 1, minWidth: "140px", textAlign: "center" }}>
          <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#27ae60" }}>100%</div>
          <span style={{ fontSize: "0.75rem", color: "var(--figma-text-secondary)" }}>Sincronizado</span>
        </div>
      </div>
    </div>
  );
}
