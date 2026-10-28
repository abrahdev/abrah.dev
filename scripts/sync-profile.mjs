import { writeFile } from "node:fs/promises";

const url =
  "https://raw.githubusercontent.com/abrahdev/abrahdev/main/profile.json";

const response = await fetch(`${url}?v=${Date.now()}`, { cache: "no-store" });
if (!response.ok) {
  throw new Error(`No se pudo descargar profile.json: HTTP ${response.status}`);
}

const text = await response.text();
const data = JSON.parse(text);
if (!data.profile || !Array.isArray(data.projects)) {
  throw new Error("profile.json no tiene el formato esperado");
}

await writeFile("src/data/profile.fallback.json", `${text.trim()}\n`, "utf8");
console.log(`Fallback actualizado (${data.projects.length} proyectos).`);
