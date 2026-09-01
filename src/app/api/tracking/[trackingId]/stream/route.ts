import { getTrackingSnapshot } from "@/lib/tracking";
import { toTrackingViewModel } from "@/lib/view-models";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ trackingId: string }> }) {
  const { trackingId } = await params;
  const initialSnapshot = await getTrackingSnapshot(trackingId);

  if (!initialSnapshot) {
    return new Response("Tracking ID not found.", { status: 404 });
  }

  const encoder = new TextEncoder();
  let timer: ReturnType<typeof setInterval> | undefined;
  let isClosed = false;

  const stream = new ReadableStream({
    async start(controller) {
      async function push() {
        if (isClosed || request.signal.aborted) {
          if (timer) clearInterval(timer);
          try {
            controller.close();
          } catch {
            // Stream may already be closed by the runtime.
          }
          return;
        }

        const snapshot = await getTrackingSnapshot(trackingId);
        if (!snapshot) {
          controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({ error: "Tracking ID not found." })}\n\n`));
          return;
        }

        controller.enqueue(encoder.encode(`data: ${JSON.stringify(toTrackingViewModel(snapshot))}\n\n`));
      }

      await push();
      timer = setInterval(() => void push(), 2500);
    },
    cancel() {
      isClosed = true;
      if (timer) clearInterval(timer);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
