import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { readPublicEvent, readPublicEvents } from "@/lib/publicEvents.server";

export const getPublicEvents = createServerFn({ method: "GET" }).handler(readPublicEvents);

export const getPublicEvent = createServerFn({ method: "GET" })
  .validator(z.object({ eventId: z.string().min(1) }))
  .handler(({ data }) => readPublicEvent(data.eventId));
