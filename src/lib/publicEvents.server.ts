import { eventsCollection, type CulturalEvent } from "@/lib/events";
import { firebaseDb } from "@/lib/firebase";
import { collection, doc, getDoc, getDocs, orderBy, query } from "firebase/firestore";

export async function readPublicEvents() {
  try {
    if (!firebaseDb) return [];
    const snapshot = await getDocs(
      query(collection(firebaseDb, eventsCollection), orderBy("date", "asc")),
    );
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
  try {
    if (!firebaseDb) return null;
    const snapshot = await getDoc(doc(firebaseDb, eventsCollection, eventId));
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
