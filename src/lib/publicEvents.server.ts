import { eventsCollection, type CulturalEvent } from "@/lib/events";
import { getFirebaseAdminDb } from "@/lib/firebaseAdmin.server";

export async function readPublicEvents() {
  const firebaseAdminDb = getFirebaseAdminDb();
  if (!firebaseAdminDb) return [];
  try {
    const snapshot = await firebaseAdminDb
      .collection(eventsCollection)
      .orderBy("date", "asc")
      .get();
    return snapshot.docs.map((eventDoc) => ({
      id: eventDoc.id,
      ...(eventDoc.data() as Omit<CulturalEvent, "id">),
    }));
  } catch (error) {
    console.error("Could not load public events", error);
    return [];
  }
}

export async function readPublicEvent(eventId: string) {
  const firebaseAdminDb = getFirebaseAdminDb();
  if (!firebaseAdminDb) return null;
  try {
    const snapshot = await firebaseAdminDb.collection(eventsCollection).doc(eventId).get();
    if (!snapshot.exists()) return null;
    return {
      id: snapshot.id,
      ...(snapshot.data() as Omit<CulturalEvent, "id">),
    };
  } catch (error) {
    console.error(`Could not load public event ${eventId}`, error);
    return null;
  }
}
