import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BookOpen,
  Calendar,
  Search,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Sparkles,
  Award,
  HelpCircle,
  FileText,
  Plus,
  Database,
} from "lucide-react";

export default function Sidebar({
  collapsed,
  setCollapsed,
  darkMode,
  toggleDarkMode,
  onSearchClick,
}) {
  const location = useLocation();
  const [userLaws, setUserLaws] = useState([]);

  useEffect(() => {
    const savedUserLaws = localStorage.getItem("legis_user_laws") || "[]";
    try {
      setUserLaws(JSON.parse(savedUserLaws));
    } catch (e) {
      console.error(e);
    }
  }, [location.pathname]);

  const menuItems = [
    { path: "/", label: "Bem-vindo(a)", icon: Sparkles },
    { path: "/resenha", label: "Resenha Diária", icon: Calendar },
  ];

  const defaultLaws = [
    { id: "cf88", label: "Constituição Federal", emoji: "⚖️" },
    { id: "cp40", label: "Código Penal", emoji: "📕" },
  ];

  const allLaws = [
    ...defaultLaws,
    ...userLaws.map((ul) => ({ id: ul.id, label: ul.title, emoji: ul.emoji })),
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className={`notion-sidebar ${collapsed ? "collapsed" : ""}`}>
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <div className="workspace-selector">
          <span style={{ fontSize: "1.2rem" }}>📝</span>
          <span>LegisEstudos</span>
        </div>
        <button
          className="toolbar-btn"
          onClick={() => setCollapsed(true)}
          title="Fechar barra lateral (Ctrl+\)"
          id="btn-collapse-sidebar"
        >
          <ChevronLeft size={16} />
        </button>
      </div>

      {/* Quick Search */}
      <div style={{ padding: "0 8px 8px 8px" }}>
        <button
          onClick={onSearchClick}
          className="sidebar-item"
          style={{
            width: "100%",
            textAlign: "left",
            border: "none",
            background: "transparent",
            color: "var(--notion-text-secondary)",
            display: "flex",
            justifyContent: "space-between",
          }}
          id="btn-quick-search"
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Search size={16} />
            <span>Pesquisar</span>
          </div>
          <kbd
            style={{
              fontSize: "0.75rem",
              background: "var(--notion-border)",
              padding: "2px 4px",
              borderRadius: "3px",
              color: "var(--notion-text-secondary)",
            }}
          >
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Navigation Menu */}
      <div className="sidebar-menu-list">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-item ${isActive(item.path) ? "active" : ""}`}
              id={`nav-item-${item.label.toLowerCase().replace(/\s/g, "-")}`}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </Link>
          );
        })}


        <Link
          to="/importar"
          className={`sidebar-item ${isActive("/importar") ? "active" : ""}`}
          id="nav-item-importar"
        >
          <Plus size={16} />
          <span>Importar do Planalto</span>
        </Link>

        <Link
          to="/backup"
          className={`sidebar-item ${isActive("/backup") ? "active" : ""}`}
          id="nav-item-backup"
        >
          <Database size={16} />
          <span>Backup e Restauração</span>
        </Link>
      </div>

      {/* Legislation Section */}
      <div className="sidebar-section-title">Legislação</div>
      <div className="sidebar-menu-list">
        {allLaws.map((law) => (
          <Link
            key={law.id}
            to={`/lei/${law.id}`}
            className={`sidebar-item ${
              location.pathname === `/lei/${law.id}` ? "active" : ""
            }`}
            id={`nav-item-law-${law.id}`}
          >
            <span style={{ fontSize: "0.95rem" }}>{law.emoji}</span>
            <span
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {law.label}
            </span>
          </Link>
        ))}
      </div>



      {/* Bottom controls */}
      <div
        style={{
          marginTop: "auto",
          padding: "12px 16px",
          borderTop: "1px solid var(--notion-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <button
          onClick={toggleDarkMode}
          className="notion-btn"
          style={{ width: "100%", justifyContent: "flex-start", padding: "6px" }}
          id="btn-toggle-darkmode"
        >
          {darkMode ? (
            <>
              <Sun size={14} />
              <span>Modo Claro</span>
            </>
          ) : (
            <>
              <Moon size={14} />
              <span>Modo Escuro</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
