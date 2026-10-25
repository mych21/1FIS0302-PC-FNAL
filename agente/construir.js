"use strict";

const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const sourceFile = path.join(__dirname, "fuentes.json");
const slidesFile = path.join(root, "datos", "slides.json");
const quizFile = path.join(root, "datos", "quiz.json");
const templateFile = path.join(__dirname, "plantilla.html");
const version = "1.1.0";
const now = new Date();
const generatedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    throw new Error(`No se pudo leer o interpretar ${path.relative(root, filePath)}: ${error.message}`);
  }
}

function requireValue(condition, message) {
  if (!condition) throw new Error(message);
}

function validate(sources, slides, quiz) {
  requireValue(Array.isArray(sources) && sources.length === 8, "fuentes.json debe contener exactamente 8 temas.");
  requireValue(Array.isArray(slides) && slides.length === 8, "slides.json debe contener exactamente 8 diapositivas.");
  requireValue(Array.isArray(quiz), "quiz.json debe ser una lista de preguntas.");

  const sourceIds = new Set();
  for (const source of sources) {
    requireValue(source && typeof source.id === "string" && source.id.trim(), "Cada fuente debe tener un id.");
    requireValue(!sourceIds.has(source.id), `Id de tema duplicado en fuentes.json: ${source.id}.`);
    sourceIds.add(source.id);
    requireValue(typeof source.titulo === "string" && source.titulo.trim(), `Falta título para la fuente ${source.id}.`);
    requireValue(typeof source.url === "string" && source.url.startsWith("https://handbook.gitlab.com/handbook/"), `URL oficial no válida para ${source.id}.`);
    requireValue(source.hash === "", `El hash de ${source.id} debe quedar vacío.`);
  }

  const slidesById = new Map();
  for (const slide of slides) {
    requireValue(slide && sourceIds.has(slide.id), `La diapositiva ${slide?.id ?? "(sin id)"} no corresponde a un tema de fuentes.json.`);
    requireValue(!slidesById.has(slide.id), `Hay más de una diapositiva para el tema ${slide.id}.`);
    requireValue(typeof slide.titulo === "string" && slide.titulo.trim(), `Falta título para la diapositiva ${slide.id}.`);
    requireValue(Array.isArray(slide.puntos) && slide.puntos.length >= 3 && slide.puntos.length <= 4, `${slide.id} debe tener 3 o 4 viñetas.`);
    requireValue(slide.puntos.every((point) => typeof point === "string" && point.trim()), `Hay una viñeta vacía en ${slide.id}.`);
    requireValue(slide.visual && ["flujo", "ciclo", "cuadricula", "red", "ruta", "cronologia"].includes(slide.visual.tipo), `Falta un tipo de diagrama válido para ${slide.id}.`);
    requireValue(typeof slide.visual.titulo === "string" && slide.visual.titulo.trim(), `Falta el título del diagrama para ${slide.id}.`);
    requireValue(Array.isArray(slide.visual.elementos) && slide.visual.elementos.length >= 3 && slide.visual.elementos.length <= 6, `${slide.id} debe tener entre 3 y 6 elementos visuales.`);
    const source = sources.find((entry) => entry.id === slide.id);
    requireValue(slide.url === source.url, `El enlace de ${slide.id} debe coincidir con su URL de fuentes.json.`);
    slidesById.set(slide.id, slide);
  }
  requireValue(slidesById.size === sourceIds.size, "Debe existir exactamente una diapositiva por cada tema de fuentes.json.");

  requireValue(quiz.length >= 25, "El banco debe contener al menos 25 preguntas.");
  const questionIds = new Set();
  const countsByTopic = new Map([...sourceIds].map((id) => [id, 0]));
  for (const question of quiz) {
    requireValue(question && typeof question.id === "string" && question.id.trim(), "Cada pregunta debe tener un id.");
    requireValue(!questionIds.has(question.id), `Id de pregunta duplicado: ${question.id}.`);
    questionIds.add(question.id);
    requireValue(sourceIds.has(question.tema), `La pregunta ${question.id} usa un tema desconocido.`);
    requireValue(typeof question.pregunta === "string" && question.pregunta.trim(), `Falta el enunciado de ${question.id}.`);
    requireValue(Array.isArray(question.opciones) && question.opciones.length === 4, `${question.id} debe tener exactamente 4 opciones.`);
    requireValue(question.opciones.every((option) => typeof option === "string" && option.trim()), `Hay una opción vacía en ${question.id}.`);
    requireValue(new Set(question.opciones).size === 4, `${question.id} debe tener cuatro opciones distintas.`);
    requireValue(Number.isInteger(question.indiceCorrecta) && question.indiceCorrecta >= 0 && question.indiceCorrecta < 4, `El índice de respuesta correcta no es válido en ${question.id}.`);
    requireValue(typeof question.explicacion === "string" && question.explicacion.trim(), `Falta explicación para ${question.id}.`);
    countsByTopic.set(question.tema, countsByTopic.get(question.tema) + 1);
  }

  for (const [id, count] of countsByTopic) {
    requireValue(count >= 3, `El tema ${id} tiene ${count} preguntas; necesita al menos 3.`);
  }
}

function replaceOnce(template, marker, value) {
  requireValue(template.includes(marker), `No se encontró el marcador ${marker} en plantilla.html.`);
  return template.replace(marker, () => value);
}

function buildIndex(relativeUrl) {
  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta http-equiv="refresh" content="0; url=${relativeUrl}">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Onboarding de GitLab</title>
  <script>window.location.replace(${JSON.stringify(relativeUrl)});</script>
</head>
<body>
  <p>Abriendo la <a href="${relativeUrl}">última versión del onboarding</a>…</p>
</body>
</html>
`;
}

function main() {
  const sources = readJson(sourceFile);
  const slides = readJson(slidesFile);
  const quiz = readJson(quizFile);
  validate(sources, slides, quiz);

  let html = fs.readFileSync(templateFile, "utf8");
  html = replaceOnce(html, "/*SLIDES*/", JSON.stringify(slides));
  html = replaceOnce(html, "/*QUIZ*/", JSON.stringify(quiz));
  html = replaceOnce(html, "/*VERSION*/", version);
  html = replaceOnce(html, "/*FECHA*/", generatedDate);

  const versionDir = path.join(root, "versiones", `v${version}`);
  const outputFile = path.join(versionDir, "onboarding.html");
  const historyFile = path.join(root, "versiones", "historial.json");
  const indexFile = path.join(root, "index.html");
  const history = fs.existsSync(historyFile) ? readJson(historyFile) : { versiones: [] };
  requireValue(Array.isArray(history.versiones), "versiones/historial.json debe incluir una lista de versiones.");
  const currentEntry = {
    version,
    fecha: generatedDate,
    temasCambiados: sources.map((source) => source.id)
  };
  const existingVersion = history.versiones.findIndex((entry) => entry.version === version);
  if (existingVersion === -1) history.versiones.push(currentEntry);
  else history.versiones[existingVersion] = currentEntry;

  fs.mkdirSync(versionDir, { recursive: true });
  fs.writeFileSync(outputFile, html);
  fs.writeFileSync(historyFile, `${JSON.stringify(history, null, 2)}\n`);
  fs.writeFileSync(indexFile, buildIndex(`versiones/v${version}/onboarding.html`));
  console.log(`Onboarding ${version} generado en ${path.relative(root, outputFile)}.`);
}

try {
  main();
} catch (error) {
  console.error(`Error al construir el onboarding: ${error.message}`);
  process.exitCode = 1;
}
