import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, FileText, Calendar, BookOpen, X } from "lucide-react";

export default function CommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const [dynamicSearchItems, setDynamicSearchItems] = useState([]);

  // Focus input when opened & load dynamic user laws
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 50);

      const savedUserLaws = localStorage.getItem("legis_user_laws") || "[]";
      try {
        const userLaws = JSON.parse(savedUserLaws);
        const mappedUserLaws = userLaws.map((ul) => ({
          id: ul.id,
          title: ul.title,
          type: "lei",
          subtitle: ul.description,
          path: `/lei/${ul.id}`,
        }));

        const defaultItems = [
          { id: "cf88", title: "Constituição Federal de 1988", type: "lei", subtitle: "Princípios Fundamentais, Direitos e Garantias", path: "/lei/cf88" },
          { id: "cf88-art5", title: "Constituição: Artigo 5º", type: "artigo", subtitle: "Direitos e Deveres Individuais e Coletivos", path: "/lei/cf88?focus=cf88-art-5" },
          { id: "cf88-art1", title: "Constituição: Artigo 1º", type: "artigo", subtitle: "Princípios Fundamentais da República", path: "/lei/cf88?focus=cf88-art-1" },
          { id: "cp40", title: "Código Penal (Decreto-Lei 2.848/1940)", type: "lei", subtitle: "Parte Geral, Crimes contra a Pessoa", path: "/lei/cp40" },
          { id: "resenha-hoje", title: "Resenha Diária: Atos de Hoje", type: "resenha", subtitle: "Novidades do Planalto sincronizadas", path: "/resenha" },
          { id: "planos", title: "Filtro de Questões de Bancas", type: "ferramenta", subtitle: "Ver estatísticas da FGV, VUNESP e CESPE", path: "/planos" },
        ];

        setDynamicSearchItems([...defaultItems, ...mappedUserLaws]);
      } catch (e) {
        console.error("Erro ao carregar itens da busca:", e);
      }
    }
  }, [isOpen]);

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const filteredItems = dynamicSearchItems.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
      item.type.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 15, 15, 0.4)",
        backdropFilter: "blur(2px)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: "15vh",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "540px",
          backgroundColor: "var(--notion-bg)",
          borderRadius: "var(--notion-radius-lg)",
          boxShadow: "var(--notion-shadow-popover)",
          border: "1px solid var(--notion-border)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          animation: "fadeIn 0.15s ease-out forwards",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input area */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "12px 16px",
            borderBottom: "1px solid var(--notion-border)",
            gap: "12px",
          }}
        >
          <Search size={18} style={{ color: "var(--notion-text-secondary)" }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Pesquisar leis, artigos, novidades..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: "1rem",
              color: "var(--notion-text)",
            }}
          />
          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              color: "var(--notion-text-secondary)",
              padding: "4px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Results area */}
        <div style={{ maxHeight: "320px", overflowY: "auto", padding: "6px" }}>
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelect(item.path)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "8px 12px",
                  borderRadius: "var(--notion-radius)",
                  cursor: "pointer",
                  transition: "background-color 0.1s",
                }}
                className="sidebar-item"
              >
                <div style={{ color: "var(--notion-text-secondary)", display: "flex" }}>
                  {item.type === "lei" && <BookOpen size={16} />}
                  {item.type === "artigo" && <FileText size={16} />}
                  {item.type === "resenha" && <Calendar size={16} />}
                  {item.type === "ferramenta" && <Search size={16} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.9rem", fontWeight: 500, color: "var(--notion-text)" }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--notion-text-secondary)" }}>
                    {item.subtitle}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: "0.7rem",
                    color: "var(--notion-text-secondary)",
                    backgroundColor: "var(--notion-hover)",
                    padding: "2px 6px",
                    borderRadius: "3px",
                    textTransform: "uppercase",
                    fontWeight: 600,
                  }}
                >
                  {item.type}
                </span>
              </div>
            ))
          ) : (
            <div
              style={{
                padding: "24px",
                textAlign: "center",
                color: "var(--notion-text-secondary)",
                fontSize: "0.9rem",
              }}
            >
              Nenhum resultado encontrado para "{query}"
            </div>
          )}
        </div>

        {/* Help footer */}
        <div
          style={{
            padding: "8px 16px",
            borderTop: "1px solid var(--notion-border)",
            backgroundColor: "var(--notion-sidebar-bg)",
            fontSize: "0.75rem",
            color: "var(--notion-text-secondary)",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span>Pressione <kbd style={{ background: "var(--notion-border)", padding: "1px 3px", borderRadius: "2px" }}>Esc</kbd> para fechar</span>
          <span>Selecione para navegar</span>
        </div>
      </div>
    </div>
  );
}
