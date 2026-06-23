import React, { useState, useRef } from "react";
import { Download, Upload, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";

export default function BackupRestore() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  // Export all localStorage keys starting with "legis_"
  const handleExport = () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const backupData = {};
      
      // Gather legis_ items
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith("legis_") || key === "theme")) {
          backupData[key] = localStorage.getItem(key);
        }
      }

      const jsonString = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      
      const dateStr = new Date().toISOString().split("T")[0];
      const link = document.createElement("a");
      link.href = url;
      link.download = `legis_estudos_backup_${dateStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSuccess("Backup exportado com sucesso! Salve o arquivo baixado em um local seguro.");
    } catch (err) {
      console.error(err);
      setError("Falha ao exportar o backup: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Import JSON file and load into localStorage
  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setError("");
    setSuccess("");

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        
        // Basic validation
        const keys = Object.keys(data);
        const hasLegisKeys = keys.some(k => k.startsWith("legis_"));
        
        if (!hasLegisKeys && keys.length > 0) {
          throw new Error("O arquivo selecionado não contém dados válidos do LegisEstudos.");
        }

        // Write keys to localStorage
        keys.forEach(key => {
          if (key.startsWith("legis_") || key === "theme") {
            localStorage.setItem(key, data[key]);
          }
        });

        setSuccess("Progresso restaurado com sucesso! A página será reiniciada em instantes...");
        
        setTimeout(() => {
          window.location.reload();
        }, 2000);

      } catch (err) {
        console.error(err);
        setError("Erro ao processar o arquivo de backup: " + err.message);
      } finally {
        setLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };

    reader.onerror = () => {
      setError("Erro ao ler o arquivo selecionado.");
      setLoading(false);
    };

    reader.readAsText(file);
  };

  return (
    <div className="notion-page-frame animate-fade-in" style={{ paddingBottom: "120px" }}>
      <div className="notion-page-header-emoji">💾</div>
      <h1 style={{ fontSize: "2.2rem", fontWeight: 700, marginBottom: "8px" }}>
        Backup e Restauração de Dados
      </h1>
      <p style={{ color: "var(--notion-text-secondary)", fontSize: "0.95rem", marginBottom: "32px" }}>
        Todos os seus dados (anotações de estudo, trechos grifados, progresso de leitura e leis importadas) ficam salvos localmente no seu navegador. Use esta página para salvar cópias de segurança ou transferir seus estudos para outro dispositivo.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px", marginBottom: "32px" }}>
        {/* Export Card */}
        <div className="notion-card" style={{ padding: "24px", display: "flex", flexDirection: "column", height: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <Download size={24} style={{ color: "var(--notion-accent)" }} />
            <h3 style={{ margin: 0, fontSize: "1.15rem" }}>Exportar Progresso</h3>
          </div>
          <p style={{ color: "var(--notion-text-secondary)", fontSize: "0.85rem", flex: 1, marginBottom: "20px" }}>
            Gere um arquivo `.json` com todas as suas anotações, destaques coloridos, status de leitura dos artigos e legislações que você importou do Planalto.
          </p>
          <button
            onClick={handleExport}
            className="notion-btn notion-btn-primary"
            style={{ width: "100%", justifyContent: "center", padding: "10px", fontSize: "0.9rem" }}
            disabled={loading}
          >
            {loading ? <RefreshCw size={16} className="animate-spin" /> : <Download size={16} />}
            <span>Exportar Backup (JSON)</span>
          </button>
        </div>

        {/* Import Card */}
        <div className="notion-card" style={{ padding: "24px", display: "flex", flexDirection: "column", height: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <Upload size={24} style={{ color: "#27ae60" }} />
            <h3 style={{ margin: 0, fontSize: "1.15rem" }}>Restaurar Progresso</h3>
          </div>
          <p style={{ color: "var(--notion-text-secondary)", fontSize: "0.85rem", flex: 1, marginBottom: "20px" }}>
            Selecione um arquivo de backup `.json` exportado anteriormente para restaurar todas as suas leis e anotações. <strong>Atenção:</strong> Isso substituirá seus dados atuais no navegador.
          </p>
          
          <input
            type="file"
            accept=".json"
            ref={fileInputRef}
            onChange={handleImport}
            style={{ display: "none" }}
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="notion-btn"
            style={{ width: "100%", justifyContent: "center", padding: "10px", border: "1px dashed var(--notion-border)", fontSize: "0.9rem" }}
            disabled={loading}
          >
            {loading ? <RefreshCw size={16} className="animate-spin" /> : <Upload size={16} />}
            <span>Carregar arquivo de backup</span>
          </button>
        </div>
      </div>

      {/* Feedback Panels */}
      {error && (
        <div
          className="animate-fade-in"
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
            padding: "12px 16px",
            backgroundColor: "var(--notion-hl-red)",
            border: "1px solid rgba(235, 87, 87, 0.2)",
            borderRadius: "var(--notion-radius)",
            color: "#c0392b",
            fontSize: "0.85rem",
            marginBottom: "24px"
          }}
        >
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div
          className="animate-fade-in"
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
            padding: "12px 16px",
            backgroundColor: "var(--notion-hl-green)",
            border: "1px solid rgba(39, 174, 96, 0.2)",
            borderRadius: "var(--notion-radius)",
            color: "#1e824c",
            fontSize: "0.85rem",
            marginBottom: "24px"
          }}
        >
          <CheckCircle size={18} />
          <span>{success}</span>
        </div>
      )}

      {/* Informações Úteis */}
      <div className="notion-callout" style={{ backgroundColor: "var(--notion-hl-gray)", border: "1px solid var(--notion-border)" }}>
        <div className="notion-callout-icon">💡</div>
        <div className="notion-callout-content" style={{ fontSize: "0.85rem", lineHeight: "1.5" }}>
          <strong>Dica:</strong> Recomenda-se realizar o backup periodicamente (por exemplo, após sessões intensas de estudo) ou antes de limpar os cookies/dados de navegação do seu browser, para garantir que você nunca perca suas anotações.
        </div>
      </div>
    </div>
  );
}
