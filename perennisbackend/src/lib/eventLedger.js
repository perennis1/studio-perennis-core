// src/lib/eventLedger.js

export async function recordEvent(
  tx,
  {
    entityType,
    entityId,
    eventType,
    actorType,
    actorId = null,
    payload = null,
  }
) {
  return tx.eventLedger.create({
    data: {
      entityType,
      entityId,
      eventType,
      actorType,
      actorId,
      payload,
    },
  });
}
