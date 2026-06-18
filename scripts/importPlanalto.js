import https from "https";
import fs from "fs";
import path from "path";

// Usage check
const url = process.argv[2];
const lawId = process.argv[3] || "nova-lei";

if (!url) {
  console.log("Uso: node scripts/importPlanalto.js <URL_PLANALTO> <ID_DA_LEI>");
  console.log("Exemplo: node scripts/importPlanalto.js https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm cf88");
  process.exit(1);
}

console.log(`Iniciando importação de: ${url}...`);

const urlObj = new URL(url);
const requestOptions = {
  hostname: urlObj.hostname,
  path: urlObj.pathname + urlObj.search,
  method: "GET",
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7"
  }
};

https.get(requestOptions, (res) => {
  // Check redirects
  if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
    console.log(`Redirecionando para: ${res.headers.location}`);
    // Recurse once if redirected
    https.get(res.headers.location, requestOptions, (redirectRes) => {
      readResponse(redirectRes);
    });
  } else {
    readResponse(res);
  }
}).on("error", (err) => {
  console.error("Erro ao fazer requisição:", err.message);
});

function readResponse(res) {
  // Planalto typically uses ISO-8859-1 (latin1) encoding
  const chunks = [];
  res.on("data", (chunk) => chunks.push(chunk));
  res.on("end", () => {
    const buffer = Buffer.concat(chunks);
    // Decode as latin1 to preserve portuguese accents
    const html = buffer.toString("latin1");

    console.log("HTML recebido. Iniciando processamento do texto...");
    parseHtml(html);
  });
}

function cleanHtml(text) {
  return text
    // Replace HTML entities
    .replace(/&nbsp;/g, " ")
    .replace(/&ordm;/g, "º")
    .replace(/&ordf;/g, "ª")
    .replace(/&middot;/g, "·")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&ndash;/g, "-")
    .replace(/&amp;/g, "&")
    .replace(/&aacute;/g, "á")
    .replace(/&eacute;/g, "é")
    .replace(/&iacute;/g, "í")
    .replace(/&oacute;/g, "ó")
    .replace(/&uacute;/g, "ú")
    .replace(/&atilde;/g, "ã")
    .replace(/&otilde;/g, "õ")
    .replace(/&acirc;/g, "â")
    .replace(/&ecirc;/g, "ê")
    .replace(/&ocirc;/g, "ô")
    .replace(/&ccedil;/g, "ç")
    .replace(/&Aacute;/g, "Á")
    .replace(/&Eacute;/g, "É")
    .replace(/&Iacute;/g, "Í")
    .replace(/&Oacute;/g, "Ó")
    .replace(/&Uacute;/g, "Ú")
    .replace(/&Atilde;/g, "Ã")
    .replace(/&Otilde;/g, "Õ")
    .replace(/&Acirc;/g, "Â")
    .replace(/&Ecirc;/g, "Ê")
    .replace(/&Ocirc;/g, "Ô")
    .replace(/&Ccedil;/g, "Ç")
    // Remove inline scripts / styles / tags
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]*>/g, "")
    // Collapse multiple spaces
    .replace(/\s+/g, " ")
    .trim();
}

function parseHtml(html) {
  const blocks = [];
  
  // Extract all <p> tags
  const pRegex = /<p[\s\S]*?>([\s\S]*?)<\/p>/gi;
  let match;
  let blockIndex = 0;

  // Attempt to parse Title from HTML
  let title = "Legislação Importada";
  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
  if (titleMatch && titleMatch[1]) {
    title = cleanHtml(titleMatch[1]);
  }

  while ((match = pRegex.exec(html)) !== null) {
    const rawContent = match[1];
    const cleaned = cleanHtml(rawContent);

    // Skip empty lines or standard Planalto footer/header signatures
    if (!cleaned || cleaned.length < 3) continue;
    if (cleaned.includes("Este texto não substitui") || cleaned.includes("Presidência da República")) continue;

    // Detect structural block types
    let type = "paragraph";
    if (cleaned.startsWith("TÍTULO") || cleaned.startsWith("TItulo") || cleaned.startsWith("Título")) {
      type = "heading-2";
    } else if (cleaned.startsWith("CAPÍTULO") || cleaned.startsWith("Capítulo")) {
      type = "heading-3";
    } else if (cleaned.startsWith("Seção") || cleaned.startsWith("SEÇÃO")) {
      type = "heading-3";
    }

    blocks.push({
      id: `${lawId}-block-${blockIndex++}`,
      type,
      content: cleaned
    });
  }

  if (blocks.length === 0) {
    console.warn("Nenhum bloco de texto pôde ser extraído. Verifique a estrutura do HTML.");
    process.exit(1);
  }

  const newLaw = {
    id: lawId,
    title: title,
    emoji: lawId === "cf88" ? "⚖️" : "📕",
    type: lawId === "cf88" ? "Constituição Federal" : "Lei Ordinária",
    description: `Texto integral importado diretamente do Planalto.gov.br em ${new Date().toLocaleDateString("pt-BR")}.`,
    blocks
  };

  // Write or update lawsDemo.json
  const filePath = path.join(process.cwd(), "src", "data", "lawsDemo.json");
  let currentData = { laws: [] };

  if (fs.existsSync(filePath)) {
    try {
      currentData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } catch (e) {
      console.error("Erro ao ler lawsDemo.json existente:", e.message);
    }
  }

  // Replace existing law or add new
  const existingIdx = currentData.laws.findIndex((l) => l.id === lawId);
  if (existingIdx > -1) {
    currentData.laws[existingIdx] = newLaw;
    console.log(`Substituindo lei existente "${lawId}"...`);
  } else {
    currentData.laws.push(newLaw);
    console.log(`Adicionando nova lei "${lawId}"...`);
  }

  fs.writeFileSync(filePath, JSON.stringify(currentData, null, 2), "utf-8");
  console.log(`Importação concluída com sucesso! ${blocks.length} blocos salvos em src/data/lawsDemo.json`);
}
