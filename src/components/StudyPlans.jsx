import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Award, Search, BookOpen, AlertTriangle, ArrowRight, Eye } from "lucide-react";

export default function StudyPlans() {
  const [selectedBanca, setSelectedBanca] = useState("all");

  const database = [
    {
      id: "cf88-art-5",
      lawId: "cf88",
      lawTitle: "Constituição Federal",
      title: "Artigo 5º - Direitos e Deveres Individuais e Coletivos",
      description: "Todos são iguais perante a lei, sem distinção de qualquer natureza...",
      bancas: [
        { name: "fgv", rate: "Altíssima (88%)", year: "2026" },
        { name: "cespe", rate: "Altíssima (85%)", year: "2025" },
        { name: "vunesp", rate: "Alta (72%)", year: "2025" }
      ]
    },
    {
      id: "cf88-art-1",
      lawId: "cf88",
      lawTitle: "Constituição Federal",
      title: "Artigo 1º - Fundamentos da República",
      description: "A República Federativa do Brasil constituída em Estado Democrático...",
      bancas: [
        { name: "cespe", rate: "Alta (78%)", year: "2025" },
        { name: "vunesp", rate: "Média (60%)", year: "2024" }
      ]
    },
    {
      id: "cf88-art-2",
      lawId: "cf88",
      lawTitle: "Constituição Federal",
      title: "Artigo 2º - Poderes da União",
      description: "São Poderes da União, independentes e harmônicos entre si...",
      bancas: [
        { name: "vunesp", rate: "Alta (75%)", year: "2025" },
        { name: "fgv", rate: "Média (52%)", year: "2024" }
      ]
    },
    {
      id: "cp-art-1",
      lawId: "cp40",
      lawTitle: "Código Penal",
      title: "Artigo 1º - Anterioridade da Lei",
      description: "Não há crime sem lei anterior que o defina. Não há pena sem prévia cominação...",
      bancas: [
        { name: "fgv", rate: "Alta (80%)", year: "2025" },
        { name: "cespe", rate: "Alta (74%)", year: "2025" }
      ]
    },
    {
      id: "cp-art-2",
      lawId: "cp40",
      lawTitle: "Código Penal",
      title: "Artigo 2º - Lei Penal no Tempo",
      description: "Ninguém pode ser punido por fato que lei posterior deixa de considerar crime...",
      bancas: [
        { name: "cespe", rate: "Altíssima (90%)", year: "2026" },
        { name: "fgv", rate: "Média (58%)", year: "2024" }
      ]
    }
  ];

  const filteredItems = selectedBanca === "all"
    ? database
    : database.filter(item => item.bancas.some(b => b.name === selectedBanca));

  const getBancaBadgeColor = (bancaName) => {
    switch (bancaName) {
      case "fgv": return { bg: "rgba(147, 51, 234, 0.1)", text: "#9333ea" };
      case "cespe": return { bg: "rgba(37, 99, 235, 0.1)", text: "#2563eb" };
      case "vunesp": return { bg: "rgba(234, 88, 12, 0.1)", text: "#ea580c" };
      default: return { bg: "var(--notion-hover)", text: "var(--notion-text-secondary)" };
    }
  };

  return (
    <div className="notion-page-frame animate-fade-in" style={{ paddingBottom: "80px" }}>
      {/* Page Header */}
      <div className="notion-page-header-emoji">🎯</div>
      <h1 style={{ fontSize: "2.2rem", fontWeight: 700, marginBottom: "8px" }}>
        Foco de Incidência por Banca
      </h1>
      <p style={{ color: "var(--notion-text-secondary)", fontSize: "0.95rem", marginBottom: "32px" }}>
        Filtre a base de dados de artigos para destacar apenas o que é cobrado nas provas da sua banca.
      </p>

      {/* Notion-style Board Selection Tabs */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid var(--notion-border)",
          gap: "16px",
          marginBottom: "24px",
          overflowX: "auto",
          paddingBottom: "8px"
        }}
      >
        <button
          onClick={() => setSelectedBanca("all")}
          style={{
            border: "none",
            background: "transparent",
            fontSize: "0.9rem",
            fontWeight: selectedBanca === "all" ? 600 : 400,
            color: selectedBanca === "all" ? "var(--notion-text)" : "var(--notion-text-secondary)",
            borderBottom: selectedBanca === "all" ? "2px solid var(--notion-text)" : "none",
            padding: "8px 12px",
            cursor: "pointer",
            whiteSpace: "nowrap"
          }}
        >
          Mostrar Todos
        </button>
        <button
          onClick={() => setSelectedBanca("fgv")}
          style={{
            border: "none",
            background: "transparent",
            fontSize: "0.9rem",
            fontWeight: selectedBanca === "fgv" ? 600 : 400,
            color: selectedBanca === "fgv" ? "var(--notion-text)" : "var(--notion-text-secondary)",
            borderBottom: selectedBanca === "fgv" ? "2px solid var(--notion-text)" : "none",
            padding: "8px 12px",
            cursor: "pointer",
            whiteSpace: "nowrap"
          }}
        >
          FGV
        </button>
        <button
          onClick={() => setSelectedBanca("cespe")}
          style={{
            border: "none",
            background: "transparent",
            fontSize: "0.9rem",
            fontWeight: selectedBanca === "cespe" ? 600 : 400,
            color: selectedBanca === "cespe" ? "var(--notion-text)" : "var(--notion-text-secondary)",
            borderBottom: selectedBanca === "cespe" ? "2px solid var(--notion-text)" : "none",
            padding: "8px 12px",
            cursor: "pointer",
            whiteSpace: "nowrap"
          }}
        >
          CESPE/Cebraspe
        </button>
        <button
          onClick={() => setSelectedBanca("vunesp")}
          style={{
            border: "none",
            background: "transparent",
            fontSize: "0.9rem",
            fontWeight: selectedBanca === "vunesp" ? 600 : 400,
            color: selectedBanca === "vunesp" ? "var(--notion-text)" : "var(--notion-text-secondary)",
            borderBottom: selectedBanca === "vunesp" ? "2px solid var(--notion-text)" : "none",
            padding: "8px 12px",
            cursor: "pointer",
            whiteSpace: "nowrap"
          }}
        >
          VUNESP
        </button>
      </div>

      {/* Callout information */}
      <div className="notion-callout" style={{ backgroundColor: "var(--notion-sidebar-bg)" }}>
        <div className="notion-callout-icon">📊</div>
        <div className="notion-callout-content" style={{ fontSize: "0.85rem" }}>
          Ao clicar no botão de <strong>Leitura Focada</strong> de um artigo, o leitor abrirá filtrando as métricas da banca selecionada e destacando a linha da lei seca correspondente.
        </div>
      </div>

      {/* Notion database-like table listing filtered elements */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
        {filteredItems.map((item) => {
          const activeBancaInfo = selectedBanca !== "all"
            ? item.bancas.find(b => b.name === selectedBanca)
            : item.bancas[0]; // defaults to first

          return (
            <div
              key={item.id}
              className="notion-card animate-fade-in"
              style={{
                marginBottom: 0,
                cursor: "default",
                padding: "20px",
                borderLeft: "4px solid var(--notion-border)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", flexWrap: "wrap" }}>
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    padding: "2px 6px",
                    borderRadius: "3px",
                    backgroundColor: "var(--notion-hl-gray)",
                    color: "var(--notion-text-secondary)"
                  }}
                >
                  {item.lawTitle}
                </span>

                {/* All associated bancas metrics */}
                <div style={{ display: "flex", gap: "6px" }}>
                  {item.bancas.map(b => (
                    <span
                      key={b.name}
                      style={{
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        padding: "2px 6px",
                        borderRadius: "3px",
                        backgroundColor: getBancaBadgeColor(b.name).bg,
                        color: getBancaBadgeColor(b.name).text,
                      }}
                    >
                      {b.name.toUpperCase()}: {b.rate.split(" ")[0]}
                    </span>
                  ))}
                </div>
              </div>

              <h3 style={{ fontSize: "1rem", margin: "8px 0 4px 0", color: "var(--notion-text)" }}>
                {item.title}
              </h3>
              <p
                className="notion-quote"
                style={{
                  fontSize: "0.85rem",
                  color: "var(--notion-text-secondary)",
                  margin: "8px 0 16px 0",
                  paddingLeft: "8px",
                }}
              >
                {item.description}
              </p>

              {/* Action: Open Reader with parameters */}
              <Link
                to={`/lei/${item.lawId}?focus=${item.id}${selectedBanca !== "all" ? `&banca=${selectedBanca}` : ""}`}
                className="notion-btn notion-btn-primary"
                style={{ fontSize: "0.8rem", padding: "6px 12px" }}
              >
                <Eye size={14} />
                <span>Leitura Focada no Artigo</span>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
