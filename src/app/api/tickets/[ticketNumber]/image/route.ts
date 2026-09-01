import bwipJs from "bwip-js";
import QRCode from "qrcode";
import { NextResponse } from "next/server";
import { getTicketByNumber } from "@/lib/flight-data";
import { boardingPassSvg, buildAbsoluteUrl, ticketDetails } from "@/lib/ticket-rendering";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function makeBarcodeDataUrl(text: string, height: number) {
  try {
    const png = await bwipJs.toBuffer({
      bcid: "code128",
      text,
      scale: 3,
      height,
      includetext: false,
      backgroundcolor: "FFFFFF",
    });
    return `data:image/png;base64,${png.toString("base64")}`;
  } catch {
    return "";
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ ticketNumber: string }> }) {
  const { ticketNumber } = await params;
  const bundle = await getTicketByNumber(ticketNumber);

  if (!bundle) {
    return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
  }

  const d = ticketDetails(bundle);
  const verificationUrl = buildAbsoluteUrl(`/verify/${bundle.ticket.verificationToken}`, new URL(request.url).origin);
  const qrDataUrl = await QRCode.toDataURL(verificationUrl, { width: 300, margin: 1 });
  const barcodeText = d.ticketNumber.replace(/[^0-9A-Za-z]/g, "").slice(0, 14).padEnd(12, "0");
  const barcodeLeft = await makeBarcodeDataUrl(barcodeText, 14);
  const barcodeRight = await makeBarcodeDataUrl(barcodeText, 12);
  const svg = boardingPassSvg(bundle, verificationUrl, qrDataUrl, barcodeLeft, barcodeRight);

  // Try sharp (works on Vercel/Docker/Firebase), fallback to SVG for Cloudflare Workers
  try {
    const sharp = (await import("sharp")).default;
    const png = await sharp(Buffer.from(svg)).png().toBuffer();
    return new NextResponse(new Uint8Array(png), {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `inline; filename="boarding-pass-${d.ticketNumber}.png"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    // Cloudflare Pages fallback - return SVG directly (still a valid boarding pass)
    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Content-Disposition": `inline; filename="boarding-pass-${d.ticketNumber}.svg"`,
        "Cache-Control": "no-store",
      },
    });
  }
}
