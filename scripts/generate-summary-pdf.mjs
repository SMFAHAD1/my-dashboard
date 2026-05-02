import fs from "node:fs";
import path from "node:path";

const inputPath = path.resolve("docs", "Site-Build-Process-Summary.md");
const outputPath = path.resolve("docs", "Site-Build-Process-Summary.pdf");

const source = fs.readFileSync(inputPath, "utf8");

function normalizeMarkdown(markdown) {
  return markdown
    .replace(/^#\s+/gm, "")
    .replace(/^##\s+/gm, "")
    .replace(/^###\s+/gm, "")
    .replace(/^- /gm, "- ")
    .replace(/^\d+\.\s+/gm, (match) => match)
    .replace(/`([^`]+)`/g, "$1")
    .split(/\r?\n/)
    .map((line) => line.trimEnd());
}

function wrapLine(line, maxChars = 88) {
  if (!line) return [""];
  const words = line.split(/\s+/);
  const lines = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxChars) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }

  if (current) lines.push(current);
  return lines;
}

function escapePdfText(text) {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

const rawLines = normalizeMarkdown(source);
const wrappedLines = rawLines.flatMap((line) => {
  if (!line.trim()) return [""];
  return wrapLine(line);
});

const pageWidth = 612;
const pageHeight = 792;
const marginLeft = 54;
const marginTop = 58;
const lineHeight = 16;
const maxLinesPerPage = 42;

const pages = [];
for (let i = 0; i < wrappedLines.length; i += maxLinesPerPage) {
  pages.push(wrappedLines.slice(i, i + maxLinesPerPage));
}

const objects = [];

function addObject(content) {
  objects.push(content);
  return objects.length;
}

const fontId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");

const pageIds = [];
for (const pageLines of pages) {
  const commands = ["BT", `/F1 11 Tf`, "0 g"];
  let y = pageHeight - marginTop;

  for (const line of pageLines) {
    commands.push(`1 0 0 1 ${marginLeft} ${y} Tm (${escapePdfText(line)}) Tj`);
    y -= lineHeight;
  }

  commands.push("ET");
  const stream = commands.join("\n");
  const contentId = addObject(`<< /Length ${Buffer.byteLength(stream, "utf8")} >>\nstream\n${stream}\nendstream`);
  const pageId = addObject(
    `<< /Type /Page /Parent PAGES_ID 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentId} 0 R >>`
  );
  pageIds.push(pageId);
}

const pagesId = addObject(`<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`);
const catalogId = addObject(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);

objects.forEach((object, index) => {
  if (pageIds.includes(index + 1)) {
    objects[index] = object.replace("PAGES_ID", String(pagesId));
  }
});

let pdf = "%PDF-1.4\n";
const offsets = [0];

for (let i = 0; i < objects.length; i++) {
  offsets.push(Buffer.byteLength(pdf, "utf8"));
  pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
}

const xrefOffset = Buffer.byteLength(pdf, "utf8");
pdf += `xref\n0 ${objects.length + 1}\n`;
pdf += "0000000000 65535 f \n";

for (let i = 1; i < offsets.length; i++) {
  pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
}

pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

fs.writeFileSync(outputPath, pdf, "binary");
console.log(`Created ${outputPath}`);
