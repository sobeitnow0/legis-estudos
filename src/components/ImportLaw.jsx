import React, { useState } from "react";
import { Download, AlertCircle, CheckCircle, RefreshCw, BookOpen, FileText } from "lucide-react";

export default function ImportLaw({ onLawImported }) {
  const [url, setUrl] = useState("");
  const [lawId, setLawId] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const suggestions = [
    {
      id: "cc02",
      name: "Código Civil (Lei 10.406/2002)",
      url: "https://www.planalto.gov.br/ccivil_03/leis/2002/l10406compilada.htm",
      emoji: "📕",
      type: "Código",
    },
    {
      id: "cpc15",
      name: "Código de Processo Civil (Lei 13.105/2015)",
      url: "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13105.htm",
      emoji: "📘",
      type: "Código",
    },
    {
      id: "cpp41",
      name: "Código de Processo Penal (Decreto-Lei 3.689/1941)",
      url: "https://www.planalto.gov.br/ccivil_03/decreto-lei/del3689compilado.htm",
      emoji: "📙",
      type: "Código",
    },
    {
      id: "lei9099",
      name: "Juizados Especiais (Lei 9.099/1995 - Jecrim)",
      url: "https://www.planalto.gov.br/ccivil_03/leis/l9099.htm",
      emoji: "📗",
      type: "Lei Especial",
    },
    {
      id: "lei8429",
      name: "Lei de Improbidade Administrativa (Lei 8.429/1992)",
      url: "https://www.planalto.gov.br/ccivil_03/leis/l8429.htm",
      emoji: "⚖️",
      type: "Lei Administrativa",
    },
  ];

  const handleSuggestionClick = (suggest) => {
    setUrl(suggest.url);
    setLawId(suggest.id);
  };

  const handleImport = async (e) => {
    if (e) e.preventDefault();
    if (!url || !lawId) {
      setError("Preencha todos os campos.");
      return;
    }

    setLoading(true);
    setError("");
    setStatus("Conectando ao proxy seguro para acessar o Planalto...");

    try {
      // Use corsproxy.io to bypass CORS issues on client-side
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
      
      const response = await fetch(proxyUrl);
      if (!response.ok) {
        throw new Error(`Erro de conexão: Código HTTP ${response.status}`);
      }

      setStatus("HTML obtido. Decodificando codificação original (Windows-1252/ISO-8859-1)...");
      const arrayBuffer = await response.arrayBuffer();
      
      // Planalto text encoding is Windows-1252
      const decoder = new TextDecoder("windows-1252");
      const htmlText = decoder.decode(arrayBuffer);

      setStatus("Processando texto estrutural da lei no navegador...");
      
      // Parse HTML natively using DOMParser
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlText, "text/html");
      const pElements = doc.querySelectorAll("p, table, h4, h3, h2, h1");
      
      const blocks = [];
      let blockIndex = 0;

      pElements.forEach((el) => {
        const text = el.innerText || el.textContent || "";
        const cleaned = text.replace(/\s+/g, " ").trim();

        // Skip empty paragraphs or metadata sections
        if (!cleaned || cleaned.length < 3) return;
        if (cleaned.includes("Este texto não substitui") || cleaned.includes("Presidência da República")) return;

        // Classify block type
        let type = "paragraph";
        const isHeading2 = /^(TÍTULO|TItulo|Título|TÍTULOS)/i.test(cleaned);
        const isHeading3 = /^(CAPÍTULO|Capítulo|SEÇÃO|Seção|SUBSEÇÃO|Subseção)/i.test(cleaned);
        const isArticle = /^Art\.\s*/i.test(cleaned);
        const isParagraphItem = /^(§|Parágrafo\s+único)/.test(cleaned);
        const isInciso = /^[IVXLCDM]+\s*[-–]/i.test(cleaned);
        const isAlinea = /^[a-z]\)\s*/.test(cleaned);

        // Detect if revoked (based on styling or tag patterns)
        const rawHtml = el.innerHTML;
        const isRevoked = /<(strike|s|del)>|color="#808080"|color="gray"|color="#7f7f7f"|style="[^"]*text-decoration:\s*line-through/i.test(rawHtml) || 
                          /\(revogado/i.test(cleaned) || 
                          /declarado(a)?\s+inconstitucional/i.test(cleaned);

        if (isHeading2) {
          type = "heading-2";
        } else if (isHeading3) {
          type = "heading-3";
        } else if (isArticle) {
          type = "article";
        } else if (isParagraphItem) {
          type = "paragraph-item";
        } else if (isInciso) {
          type = "inciso";
        } else if (isAlinea) {
          type = "alinea";
        }

        blocks.push({
          id: `${lawId}-block-${blockIndex++}`,
          type,
          revoked: isRevoked,
          content: cleaned,
        });
      });

      if (blocks.length === 0) {
        throw new Error("Nenhum bloco de texto pôde ser extraído da página. Verifique a URL do Planalto.");
      }

      setStatus(`Lei carregada! Salvando ${blocks.length} blocos na base de dados...`);

      // Resolve Title
      let title = suggestions.find((s) => s.id === lawId)?.name || doc.title || "Legislação Importada";
      title = title.split("(")[0].trim(); // clean details

      const newLaw = {
        id: lawId,
        title: title,
        emoji: suggestions.find((s) => s.id === lawId)?.emoji || "📖",
        type: lawId.startsWith("cc") || lawId.startsWith("cp") ? "Código" : "Legislação Federal",
        description: `Importada diretamente em ${new Date().toLocaleDateString("pt-BR")} via Planalto.gov.br.`,
        blocks,
      };

      // Save full content separately
      localStorage.setItem(`legis_law_content_${lawId}`, JSON.stringify(newLaw));

      // Save metadata only to the list
      const savedUserLaws = localStorage.getItem("legis_user_laws") || "[]";
      const userLawsList = JSON.parse(savedUserLaws);

      const lawMeta = {
        id: newLaw.id,
        title: newLaw.title,
        emoji: newLaw.emoji,
        type: newLaw.type,
        description: newLaw.description,
      };

      const existingIdx = userLawsList.findIndex((l) => l.id === lawId);
      if (existingIdx > -1) {
        userLawsList[existingIdx] = lawMeta;
      } else {
        userLawsList.push(lawMeta);
      }

      localStorage.setItem("legis_user_laws", JSON.stringify(userLawsList));
      
      // Invalidate mention cache so the newly imported law is available for @mentions
      try {
        const { invalidateMentionCache } = await import("./editor/suggestion");
        invalidateMentionCache();
      } catch (cacheErr) {
        console.error("Erro ao invalidar cache de menções:", cacheErr);
      }
      
      setStatus(`Importação concluída com sucesso! ${blocks.length} blocos cadastrados.`);
      setUrl("");
      setLawId("");

      // Notify parent app to refresh sidebar
      if (onLawImported) {
        onLawImported();
      }

    } catch (err) {
      console.error(err);
      setError(`Falha ao importar: ${err.message}. Certifique-se de que a URL está correta e tente novamente.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="figma-page-frame animate-fade-in" style={{ paddingBottom: "120px" }}>
      <div className="figma-page-header-emoji">📥</div>
      <h1 style={{ fontSize: "2.2rem", fontWeight: 700, marginBottom: "8px" }}>
        Importar Leis e Códigos do Planalto
      </h1>
      <p style={{ color: "var(--figma-text-secondary)", fontSize: "0.95rem", marginBottom: "32px" }}>
        Digite ou cole qualquer link de legislação compilada do Planalto.gov.br para integrá-lo instantaneamente ao seu espaço de estudos.
      </p>

      {/* Sugestões Rápidas */}
      <h2 style={{ fontSize: "1.2rem", border: "none", marginBottom: "12px", padding: 0 }}>
        Sugestões de Importação Rápida
      </h2>
      <p style={{ color: "var(--figma-text-secondary)", fontSize: "0.85rem", marginBottom: "16px" }}>
        Clique em um dos atalhos das principais leis cobradas em concursos e exames para preencher os dados de importação:
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px", marginBottom: "32px" }}>
        {suggestions.map((suggest) => (
          <div
            key={suggest.id}
            onClick={() => handleSuggestionClick(suggest)}
            className="figma-card"
            style={{
              padding: "16px",
              marginBottom: 0,
              border: lawId === suggest.id ? "1.5px solid var(--figma-accent)" : "1px solid var(--figma-border)",
              backgroundColor: lawId === suggest.id ? "var(--figma-active)" : "var(--figma-bg)",
            }}
          >
            <div style={{ fontSize: "1.4rem", marginBottom: "6px" }}>{suggest.emoji}</div>
            <strong style={{ fontSize: "0.85rem", display: "block", color: "var(--figma-text)", marginBottom: "4px" }}>
              {suggest.name.split("(")[0]}
            </strong>
            <span style={{ fontSize: "0.7rem", color: "var(--figma-text-secondary)", textTransform: "uppercase", fontWeight: 600 }}>
              {suggest.type}
            </span>
          </div>
        ))}
      </div>

      {/* Form */}
      <div className="figma-card" style={{ cursor: "default", padding: "24px" }}>
        <h3 style={{ margin: "0 0 16px 0", fontSize: "1.1rem" }}>Configurações de Importação</h3>
        
        <form onSubmit={handleImport} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "6px" }}>
              URL da Lei Compilada (Planalto)
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Ex: https://www.planalto.gov.br/ccivil_03/leis/2002/l10406compilada.htm"
              required
              disabled={loading}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "var(--figma-radius)",
                border: "1px solid var(--figma-border)",
                backgroundColor: "var(--figma-bg)",
                color: "var(--figma-text)",
                fontSize: "0.85rem",
                outline: "none"
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "6px" }}>
              Identificador (ID Único da Lei)
            </label>
            <input
              type="text"
              value={lawId}
              onChange={(e) => setLawId(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ""))}
              placeholder="Ex: cc02 (use letras e números, sem espaços)"
              required
              disabled={loading}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "var(--figma-radius)",
                border: "1px solid var(--figma-border)",
                backgroundColor: "var(--figma-bg)",
                color: "var(--figma-text)",
                fontSize: "0.85rem",
                outline: "none"
              }}
            />
          </div>

          {/* Error and Status panels */}
          {error && (
            <div
              style={{
                display: "flex",
                gap: "8px",
                alignItems: "center",
                padding: "10px",
                backgroundColor: "var(--figma-hl-red)",
                border: "1px solid rgba(235, 87, 87, 0.2)",
                borderRadius: "var(--figma-radius)",
                color: "#c0392b",
                fontSize: "0.8rem"
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {status && !error && (
            <div
              style={{
                display: "flex",
                gap: "8px",
                alignItems: "center",
                padding: "10px",
                backgroundColor: status.includes("sucesso") ? "var(--figma-hl-green)" : "var(--figma-hl-gray)",
                border: "1px solid var(--figma-border)",
                borderRadius: "var(--figma-radius)",
                color: status.includes("sucesso") ? "#1e824c" : "var(--figma-text)",
                fontSize: "0.8rem"
              }}
            >
              {status.includes("sucesso") ? (
                <CheckCircle size={16} style={{ color: "#27ae60" }} />
              ) : (
                <RefreshCw size={14} className="animate-spin" />
              )}
              <span>{status}</span>
            </div>
          )}

          <button
            type="submit"
            className="figma-btn figma-btn-primary"
            disabled={loading}
            style={{ padding: "10px", width: "100%", marginTop: "8px", fontSize: "0.9rem" }}
          >
            <Download size={16} />
            <span>{loading ? "Importando Legislação..." : "Iniciar Importação"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
