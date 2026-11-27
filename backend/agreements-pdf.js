// Agreements: the signed PDF, made on the server with pdfkit (free, MIT). It holds the letterhead, the
// agreement text with the filled fields, the signature on the "Authorized Signature" line and, on every
// page, an audit footer (document ID, SHA-256 of the signed text, time). A last section lists the signing
// record (verification, IP, consent). The PDF uses the built-in Helvetica font, so it prints Latin text.
import PDFDocument from "pdfkit";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parseBody, dhakaTime, dhakaDate } from "./agreements-text.js";

const LOGO = readFileSync(fileURLToPath(new URL("./assets/mark-blue.png", import.meta.url)));
const NAVY = "#041c31";
const BLUE = "#0b426d";
const INK = "#1b3554";
const MUTED = "#4f6775";
const LINE = "#dbe5ee";

// Helvetica only has Latin (Windows-1252) letters. Anything else would print as a wrong glyph.
const WINANSI = /[^ -~ -ÿ‘’“”–—•…€™\n]/g;
export const pdfSafe = (s) => String(s ?? "").replace(WINANSI, "?");

/**
 * @param {object} a
 * @returns {Promise<Buffer>}
 */
export function agreementPdf(a) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 56, bottom: 72, left: 60, right: 60 },
      bufferPages: true,
      info: {
        Title: pdfSafe(`${a.title} (${a.docId})`),
        Author: "Scholars' Cafe",
        Subject: "Signed agreement",
        CreationDate: new Date(a.signedAt),
        ModDate: new Date(a.signedAt),
      },
    });
    const chunks = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    try {
      draw(doc, a);
      doc.end();
    } catch (e) {
      reject(e);
    }
  });
}

function draw(doc, a) {
  const left = doc.page.margins.left;
  const width = doc.page.width - left - doc.page.margins.right;
  // Letterhead: mark + name on the left, REF and issue date on the right.
  const top = doc.y;
  doc.image(LOGO, left, top, { width: 30 });
  doc
    .font("Helvetica-Bold")
    .fontSize(14)
    .fillColor(NAVY)
    .text("Scholars' Cafe", left + 40, top + 7);
  doc
    .font("Courier")
    .fontSize(9)
    .fillColor(BLUE)
    .text(pdfSafe(`REF ${a.ref}`), left, top + 2, { width, align: "right" });
  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor(MUTED)
    .text(pdfSafe(`Issued ${a.issued}`), left, top + 15, { width, align: "right" });
  doc
    .moveTo(left, top + 40)
    .lineTo(left + width, top + 40)
    .strokeColor(LINE)
    .lineWidth(1)
    .stroke();
  doc.x = left;
  doc.y = top + 60;
  doc.font("Helvetica-Bold").fontSize(20).fillColor(NAVY).text(pdfSafe(a.title), { width });
  if (a.subtitle)
    doc.moveDown(0.2).font("Helvetica").fontSize(10).fillColor(MUTED).text(pdfSafe(a.subtitle));
  doc.moveDown(1);

  // Body with the filled-in fields in bold blue (as on the signing page).
  const values = { ...a.values, date: a.values.date || dhakaDate(a.signedAt) };
  for (const block of parseBody(a.body)) {
    if (block.heading) {
      doc.moveDown(0.4).font("Helvetica-Bold").fontSize(11.5).fillColor(NAVY);
      doc.text(pdfSafe(block.heading), { width });
      doc.moveDown(0.15);
      continue;
    }
    const parts = block.parts.filter((p) => p.text !== "");
    parts.forEach((p, i) => {
      const last = i === parts.length - 1;
      if (p.key) {
        const v = values[p.key];
        doc
          .font("Helvetica-Bold")
          .fillColor(BLUE)
          .fontSize(10.5)
          .text(pdfSafe(v && String(v).trim() ? String(v).trim() : "Not provided"), {
            width,
            continued: !last,
            lineGap: 3,
          });
      } else
        doc
          .font("Helvetica")
          .fillColor(INK)
          .fontSize(10.5)
          .text(pdfSafe(p.text), { width, continued: !last, lineGap: 3 });
    });
    doc.moveDown(0.6);
  }

  // Signature box: the image sits on the "Authorized Signature" line.
  if (doc.y > doc.page.height - doc.page.margins.bottom - 150) doc.addPage();
  doc.moveDown(1);
  const boxTop = doc.y;
  const lineY = boxTop + 88;
  doc.image(a.signature, left + 4, boxTop, { fit: [width * 0.6, 84], valign: "bottom" });
  doc
    .moveTo(left, lineY)
    .lineTo(left + width, lineY)
    .strokeColor(NAVY)
    .lineWidth(0.8)
    .stroke();
  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor(MUTED)
    .text("AUTHORIZED SIGNATURE", left, lineY + 6, { characterSpacing: 0.8 });
  doc.text(pdfSafe(dhakaDate(a.signedAt)), left, lineY + 6, { width, align: "right" });
  doc
    .fontSize(10)
    .fillColor(INK)
    .text(pdfSafe(a.values.name || a.signer), left, lineY + 22);
  doc.x = left;
  doc.y = lineY + 44;
  doc
    .font("Helvetica")
    .fontSize(9.5)
    .fillColor(BLUE)
    .text(
      pdfSafe(
        `Signed electronically by ${a.values.name || a.signer} (${a.email}) on ${dhakaTime(a.signedAt)}. Document ID ${a.docId}.`,
      ),
      { width },
    );

  // Signing record.
  doc.moveDown(1.2);
  if (doc.y > doc.page.height - doc.page.margins.bottom - 200) doc.addPage();
  doc.font("Helvetica-Bold").fontSize(11).fillColor(NAVY).text("Signing record", { width });
  doc.moveDown(0.3);
  const rows = [
    ["Document ID", a.docId],
    ["Agreement", `${a.title} (REF ${a.ref})`],
    ["Signed by", `${a.values.name || a.signer} <${a.email}>`],
    ["Signed at", `${dhakaTime(a.signedAt)} / ${new Date(a.signedAt).toISOString()} UTC`],
    ["Identity check", a.verificationLabel],
    ["Signature method", a.method === "draw" ? "Drawn on screen" : "Typed name"],
    ["IP address", a.ip || "Unknown"],
    ["Device", a.userAgent || "Unknown"],
    ["Text SHA-256", a.sha],
    ["Consent", a.consent],
  ];
  for (const [k, v] of rows) {
    const y = doc.y;
    doc.font("Helvetica").fontSize(8.5).fillColor(MUTED).text(k, left, y, { width: 110 });
    doc
      .fillColor(INK)
      .text(pdfSafe(v), left + 116, y, { width: width - 116 })
      .moveDown(0.25);
  }

  // Audit footer on every page.
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    const bottom = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;
    const y = doc.page.height - 50;
    doc
      .moveTo(left, y - 8)
      .lineTo(left + width, y - 8)
      .strokeColor(LINE)
      .lineWidth(0.6)
      .stroke();
    doc
      .font("Helvetica")
      .fontSize(7.5)
      .fillColor(MUTED)
      .text(
        pdfSafe(
          `Document ID ${a.docId}  |  Signed ${dhakaTime(a.signedAt)}  |  Page ${i + 1} of ${range.count}`,
        ),
        left,
        y,
        { width, lineBreak: false },
      );
    doc.text(pdfSafe(`SHA-256 of signed text: ${a.sha}`), left, y + 11, {
      width,
      lineBreak: false,
    });
    doc.page.margins.bottom = bottom;
  }
}
