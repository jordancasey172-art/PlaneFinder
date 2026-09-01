import bwipJs from "bwip-js";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import { NextResponse } from "next/server";
import { getTicketByNumber } from "@/lib/flight-data";
import { buildAbsoluteUrl, ticketDetails } from "@/lib/ticket-rendering";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function field(doc: PDFKit.PDFDocument, label: string, value: string, x: number, y: number, onBlue: boolean, size = 22) {
  doc.fillColor(onBlue ? "#e3edf7" : "#5b6b7c").fontSize(9).font("Helvetica").text(label, x, y);
  doc.fillColor(onBlue ? "#ffffff" : "#2f5d8a").fontSize(size).font("Helvetica-Bold").text(value, x, y + 13);
}

function dottedH(doc: PDFKit.PDFDocument, x1: number, y: number, x2: number, color = "#cfd8e3") {
  doc.save().strokeColor(color).lineWidth(1).dash(3, { space: 3 }).moveTo(x1, y).lineTo(x2, y).stroke().undash().restore();
}

function dottedV(doc: PDFKit.PDFDocument, x: number, y1: number, y2: number, color = "#cfd8e3") {
  doc.save().strokeColor(color).lineWidth(1).dash(4, { space: 4 }).moveTo(x, y1).lineTo(x, y2).stroke().undash().restore();
}

export async function GET(request: Request, { params }: { params: Promise<{ ticketNumber: string }> }) {
  const { ticketNumber } = await params;
  const bundle = await getTicketByNumber(ticketNumber);

  if (!bundle) {
    return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
  }

  const d = ticketDetails(bundle);
  const verificationUrl = buildAbsoluteUrl(`/verify/${bundle.ticket.verificationToken}`, new URL(request.url).origin);
  const qrPng = await QRCode.toBuffer(verificationUrl, { width: 280, margin: 1 });
  const barcodeText = d.ticketNumber.replace(/[^0-9A-Za-z]/g, "").slice(0, 14).padEnd(12, "0");
  const barcodePng = await bwipJs.toBuffer({
    bcid: "code128",
    text: barcodeText,
    scale: 3,
    height: 14,
    includetext: false,
    backgroundcolor: "FFFFFF",
  });

  const doc = new PDFDocument({ size: [1056, 480], margin: 0 });
  const chunks: Buffer[] = [];
  const done = new Promise<Buffer>((resolve) => {
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  doc.rect(0, 0, 1056, 480).fill("#ffffff");

  // Left tear-off stub: vertical airline name + barcode
  doc.save().rotate(-90, { origin: [30, 240] });
  doc.fillColor("#2f5d8a").fontSize(18).font("Helvetica-Bold").text(d.airlineName.toUpperCase(), 30, 240, { characterSpacing: 5, width: 420 });
  doc.restore();

  doc.save().rotate(-90, { origin: [110, 240] });
  doc.image(barcodePng, 104, 240, { height: 40, width: 360 });
  doc.restore();

  doc.save().rotate(-90, { origin: [158, 240] });
  doc.fillColor("#2f5d8a").fontSize(19).font("Helvetica").text(d.ticketDigits, 158, 246, { characterSpacing: 4, width: 400 });
  doc.restore();

  dottedV(doc, 212, 24, 456);

  // Stub details
  doc.fillColor("#5b6b7c").fontSize(10).font("Helvetica").text("Passenger", 246, 48);
  doc.fillColor("#2f5d8a").fontSize(24).font("Helvetica-Bold").text(d.passengerName, 246, 62);
  dottedH(doc, 246, 100, 428);

  field(doc, "Boarding Time", d.boardingTime, 246, 124, false, 20);
  field(doc, "Gate", d.gate, 388, 124, false, 20);
  dottedH(doc, 246, 180, 428);

  field(doc, "Date", d.departureDate, 246, 204, false, 20);
  field(doc, "From", `${d.originCity}, ${d.originCode}`, 246, 258, false, 16);
  dottedH(doc, 246, 318, 428);

  field(doc, "To", `${d.destinationCity}, ${d.destinationCode}`, 246, 338, false, 16);
  field(doc, "Seat", d.seat, 246, 402, false, 20);
  field(doc, "Group", d.group, 388, 402, false, 20);

  dottedV(doc, 486, 24, 456);

  // Main panel header
  doc.fillColor("#2f5d8a").fontSize(32).font("Helvetica-Bold").text(d.cabinClass, 520, 34, { characterSpacing: 3 });
  doc.fontSize(30).fillColor("#2f5d8a").text("\u2708", 640, 92);
  doc.fillColor("#5b6b7c").fontSize(13).font("Helvetica").text(`Flight-ID — ${d.flightNumber}${d.airlineCode}XY`, 520, 172);
  doc.fillColor("#2f5d8a").fontSize(13).text(verificationUrl, 520, 222, { underline: true, width: 500 });
  doc.image(qrPng, 700, 292, { width: 92, height: 92 });
  doc.fillColor("#5b6b7c").fontSize(11).text("Please watch the departure board for", 520, 318);
  doc.text("boarding & gate updates. Boarding ends", 520, 334);
  doc.text("15 min before departure.", 520, 350);
  doc.fillColor("#2f5d8a").fontSize(11).text(`Booking ${d.bookingReference}  ·  Track ${d.trackingId}`, 520, 400);

  // Right blue stub
  doc.rect(846, 0, 210, 480).fill("#2f5d8a");
  doc.rect(870, 26, 160, 58).fill("#ffffff");
  doc.image(barcodePng, 876, 30, { height: 50, width: 148 });
  doc.fillColor("#ffffff").fontSize(15).font("Helvetica").text(d.ticketDigits, 870, 96, { align: "center", width: 160, characterSpacing: 3 });

  field(doc, "Passenger", d.passengerName, 870, 140, true, 17);
  dottedH(doc, 870, 190, 1042, "rgba(255,255,255,0.45)");
  field(doc, "Boarding Time", d.boardingTime, 870, 214, true, 14);
  field(doc, "Gate", d.gate, 952, 214, true, 14);
  dottedH(doc, 870, 290, 1042, "rgba(255,255,255,0.45)");
  field(doc, "Flight", d.aircraft, 870, 314, true, 12);
  field(doc, "From", `${d.originCity}, ${d.originCode}`, 870, 356, true, 12);
  field(doc, "To", `${d.destinationCity}, ${d.destinationCode}`, 870, 398, true, 12);

  doc.circle(1020, 436, 26).fillOpacity(0.16).fill("#ffffff");
  doc.fillOpacity(1);
  doc.image(qrPng, 1006, 422, { width: 28, height: 28 });

  doc.end();
  const pdf = await done;

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="boarding-pass-${d.ticketNumber}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
