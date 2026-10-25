"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const sourcesFile = path.join(__dirname, "fuentes.json");
const handbookHost = "handbook.gitlab.com";
const maxHtmlBytes = 4 * 1024 * 1024;
const maxRedirects = 5;

class UpdateError extends Error {}

function requireValue(condition, message) {
  if (!condition) throw new UpdateError(message);
}

function readSources() {
  let sources;
  try {
    sources = JSON.parse(fs.readFileSync(sourcesFile, "utf8"));
  } catch (error) {
    throw new UpdateError(`No se pudo leer agente/fuentes.json: ${error.message}`);
  }

  requireValue(Array.isArray(sources) && sources.length === 8, "fuentes.json debe contener exactamente 8 temas.");
  const ids = new Set();
  for (const source of sources) {
    requireValue(source && typeof source.id === "string" && source.id.trim(), "Cada fuente debe tener un id.");
    requireValue(!ids.has(source.id), `Id de fuente duplicado: ${source.id}.`);
    ids.add(source.id);
    requireValue(typeof source.titulo === "string" && source.titulo.trim(), `Falta el título de ${source.id}.`);
    validateSourceUrl(source.url, source.id);
    requireValue(
      source.hash === "" || /^[a-f0-9]{64}$/.test(source.hash),
      `El hash guardado de ${source.id} debe estar vacío o ser un SHA-256 hexadecimal.`
    );
  }
  return sources;
}

function validateSourceUrl(value, topicId) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new UpdateError(`URL no válida para ${topicId}.`);
  }
  requireValue(
    url.protocol === "https:" &&
      url.hostname === handbookHost &&
      url.pathname.startsWith("/handbook/") &&
      !url.username &&
      !url.password,
    `La URL de ${topicId} debe pertenecer a https://${handbookHost}/handbook/.`
  );
  return url;
}

function decodeEntities(text) {
  const named = {
    amp: "&",
    apos: "'",
    gt: ">",
    hellip: "…",
    ldquo: "“",
    lsquo: "‘",
    lt: "<",
    mdash: "—",
    nbsp: " ",
    ndash: "–",
    quot: '"',
    rdquo: "”",
    rsquo: "’"
  };
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z][a-z0-9]+);/gi, (entity, value) => {
    if (value[0] === "#") {
      const codePoint = value[1].toLowerCase() === "x"
        ? Number.parseInt(value.slice(2), 16)
        : Number.parseInt(value.slice(1), 10);
      return Number.isFinite(codePoint) && codePoint > 0 && codePoint <= 0x10ffff
        ? String.fromCodePoint(codePoint)
        : " ";
    }
    return named[value] ?? " ";
  });
}

function extractMainText(html) {
  const mainMatch = html.match(/<main\b[^>]*>([\s\S]*?)<\/main\s*>/i);
  const articleMatch = html.match(/<article\b[^>]*>([\s\S]*?)<\/article\s*>/i);
  const bodyMatch = html.match(/<body\b[^>]*>([\s\S]*?)<\/body\s*>/i);
  let content = mainMatch?.[1] ?? articleMatch?.[1] ?? bodyMatch?.[1] ?? html;

  content = content
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(script|style|svg|noscript|nav|header|footer|aside|form)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, " ")
    .replace(/<(br|hr)\b[^>]*\/?>/gi, "\n")
    .replace(/<\/(p|div|section|article|h[1-6]|li|tr|td|th|blockquote|pre|ul|ol|table)\s*>/gi, "\n")
    .replace(/<[^>]*>/g, " ");

  return decodeEntities(content)
    .replace(/\u00a0/g, " ")
    .replace(/[ \t\f\v]+/g, " ")
    .replace(/\s*\n\s*/g, "\n")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

async function fetchMainText(source) {
  let url = validateSourceUrl(source.url, source.id);

  for (let redirects = 0; redirects <= maxRedirects; redirects += 1) {
    let response;
    try {
      response = await fetch(url, {
        redirect: "manual",
        signal: AbortSignal.timeout(30_000),
        headers: {
          accept: "text/html",
          "user-agent": "GitLabAcademicOnboardingUpdater/1.0"
        }
      });
    } catch (error) {
      throw new UpdateError(`No se pudo consultar ${source.id}: ${error.message}`);
    }

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      requireValue(location && redirects < maxRedirects, `Demasiadas redirecciones al consultar ${source.id}.`);
      url = validateSourceUrl(new URL(location, url).href, source.id);
      continue;
    }

    requireValue(response.ok, `No se pudo consultar ${source.id}: HTTP ${response.status}.`);
    const contentType = response.headers.get("content-type") ?? "";
    requireValue(contentType.toLowerCase().includes("text/html"), `La fuente ${source.id} no devolvió HTML.`);
    const declaredLength = Number(response.headers.get("content-length") ?? 0);
    requireValue(declaredLength <= maxHtmlBytes, `La página de ${source.id} supera el límite de tamaño permitido.`);
    const bytes = Buffer.from(await response.arrayBuffer());
    requireValue(bytes.length <= maxHtmlBytes, `La página de ${source.id} supera el límite de tamaño permitido.`);

    const text = extractMainText(bytes.toString("utf8"));
    requireValue(text.length >= 100, `No se pudo extraer suficiente texto principal de ${source.id}.`);
    return text;
  }

  throw new UpdateError(`No se pudo resolver la URL de ${source.id}.`);
}

function sha256(text) {
  return crypto.createHash("sha256").update(text, "utf8").digest("hex");
}

function atomicWrite(filePath, content) {
  const temporaryPath = `${filePath}.${process.pid}.tmp`;
  try {
    fs.writeFileSync(temporaryPath, content, { flag: "wx" });
    fs.renameSync(temporaryPath, filePath);
  } catch (error) {
    try {
      fs.unlinkSync(temporaryPath);
    } catch (cleanupError) {
      if (cleanupError.code !== "ENOENT") throw cleanupError;
    }
    throw error;
  }
}

function writeGitHubOutput(values) {
  if (!process.env.GITHUB_OUTPUT) return;
  const lines = Object.entries(values).map(([key, value]) => `${key}=${value}`);
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `${lines.join("\n")}\n`);
}

function parseArguments(args) {
  const options = { initialize: false };
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === "--inicializar") {
      requireValue(!options.initialize, "La opción --inicializar no debe repetirse.");
      options.initialize = true;
    } else if (args[index] === "--output") {
      requireValue(!options.output && args[index + 1], "La opción --output requiere una ruta.");
      options.output = path.resolve(args[index + 1]);
      index += 1;
    } else {
      throw new UpdateError(`Opción no reconocida: ${args[index]}.`);
    }
  }
  return options;
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  const sources = readSources();
  const latestHashes = new Map();

  for (const source of sources) {
    const text = await fetchMainText(source);
    latestHashes.set(source.id, sha256(text));
  }

  if (options.initialize) {
    for (const source of sources) source.hash = latestHashes.get(source.id);
    atomicWrite(sourcesFile, `${JSON.stringify(sources, null, 2)}\n`);
    console.log(`Hashes iniciales guardados para ${sources.length} fuentes.`);
    writeGitHubOutput({ changed: "false", initialized: "true" });
    return;
  }

  const changed = sources
    .filter((source) => source.hash !== latestHashes.get(source.id))
    .map((source) => ({
      id: source.id,
      titulo: source.titulo,
      url: source.url,
      hash: latestHashes.get(source.id)
    }));

  if (changed.length === 0) {
    console.log("No se detectaron cambios en las páginas fuente.");
    writeGitHubOutput({ changed: "false" });
    return;
  }

  const outputFile = options.output ?? process.env.ONBOARDING_OUTPUT_FILE
    ? path.resolve(options.output ?? process.env.ONBOARDING_OUTPUT_FILE)
    : path.join(os.tmpdir(), `onboarding-temas-cambiados-${process.pid}.json`);
  atomicWrite(outputFile, `${JSON.stringify(changed, null, 2)}\n`);

  for (const source of sources) {
    if (changed.some((topic) => topic.id === source.id)) source.hash = latestHashes.get(source.id);
  }
  atomicWrite(sourcesFile, `${JSON.stringify(sources, null, 2)}\n`);

  console.log(`Cambios detectados en ${changed.length} tema(s). Resultado: ${outputFile}`);
  writeGitHubOutput({
    changed: "true",
    changes_file: outputFile,
    topics: changed.map((topic) => topic.id).join(",")
  });
}

main().catch((error) => {
  console.error(`Error al actualizar hashes de fuentes: ${error.message}`);
  process.exitCode = 1;
});
