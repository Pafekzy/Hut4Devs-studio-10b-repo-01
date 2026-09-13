import http from 'node:http';
import { OutboxEventRecord, IHut4DevsRepositories } from '../../domain/repositories';

/**
 * Server-Sent Events (SSE) Real-Time Outbox Publisher (H4D-FUNC-010)
 *
 * Architecture Principles:
 * 1. Transaction + Outbox: Events are committed to PostgreSQL outbox_events FIRST.
 *    Only after successful COMMIT are events delivered via SSE.
 * 2. Non-Authoritative: Real-time delivery is a convenience broadcast for live UI updates.
 *    PostgreSQL remains the sole authoritative source of truth.
 * 3. Privacy Boundary: Payloads contain strictly operational accommodation metadata.
 *    No secrets, credentials, private notes, or unrelated domain data are ever broadcast.
 * 4. Unauthenticated: Labelled explicitly as unauthenticated development stream.
 */
export class OutboxPublisher {
  private subscribers = new Set<http.ServerResponse>();

  /**
   * Handles an incoming SSE connection request from an Accommodation Admin client.
   */
  handleSseConnection(req: http.IncomingMessage, res: http.ServerResponse): void {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    // Send initial handshake / welcome event
    const handshakeData = JSON.stringify({
      message: 'Connected to Accommodation Admin operational stream',
      disclaimer:
        'Development Preview: Unauthenticated stream. PostgreSQL is the authoritative source of truth.',
      connectedAt: new Date().toISOString(),
    });
    res.write(`event: connected\ndata: ${handshakeData}\n\n`);

    this.subscribers.add(res);

    req.on('close', () => {
      this.subscribers.delete(res);
    });

    req.on('error', () => {
      this.subscribers.delete(res);
    });
  }

  /**
   * Delivers a committed outbox event to all currently connected subscribers,
   * then marks the event as published in PostgreSQL.
   */
  async publish(
    event: OutboxEventRecord,
    repos?: IHut4DevsRepositories
  ): Promise<{ deliveredCount: number }> {
    const rawPayload =
      typeof event.payload === 'string' ? event.payload : JSON.stringify(event.payload);

    // Format according to standard W3C Server-Sent Events protocol
    const sseMessage = `event: ${event.eventType}\ndata: ${rawPayload}\nid: ${event.id}\n\n`;

    let deliveredCount = 0;
    const deadSubscribers: http.ServerResponse[] = [];

    for (const sub of this.subscribers) {
      try {
        if (!sub.writableEnded && sub.writable) {
          sub.write(sseMessage);
          deliveredCount++;
        } else {
          deadSubscribers.push(sub);
        }
      } catch {
        deadSubscribers.push(sub);
      }
    }

    for (const dead of deadSubscribers) {
      this.subscribers.delete(dead);
    }

    // Update outbox record published_at in database
    if (repos && repos.outbox) {
      try {
        await repos.outbox.markPublished(event.id, new Date().toISOString());
      } catch (err) {
        console.warn(`[OutboxPublisher] Failed to mark outbox event ${event.id} published:`, err);
      }
    }

    return { deliveredCount };
  }

  /**
   * Returns the count of currently active SSE subscriber connections.
   */
  getClientCount(): number {
    return this.subscribers.size;
  }

  /**
   * Closes all active connections (useful for clean server shutdown or testing).
   */
  closeAll(): void {
    for (const sub of this.subscribers) {
      try {
        sub.end();
      } catch {
        // Ignored on teardown
      }
    }
    this.subscribers.clear();
  }
}

// Global singleton publisher for deployable server runtime
export const globalOutboxPublisher = new OutboxPublisher();
