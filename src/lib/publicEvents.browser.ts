import { createClientOnlyFn } from "@tanstack/react-start";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

import { eventsCollection, type CulturalEvent } from "@/lib/events";
import { firebaseDb } from "@/lib/firebase";

export const readPublicEventsFromBrowser = createClientOnlyFn(async () => {
  if (!firebaseDb) return [];
  const snapshot = await getDocs(
    query(collection(firebaseDb, eventsCollection), orderBy("date", "asc")),
  );
  return snapshot.docs.map((eventDoc) => ({
    id: eventDoc.id,
    ...(eventDoc.data() as Omit<CulturalEvent, "id">),
  }));
});
