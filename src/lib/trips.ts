import "server-only";
import { getDb } from "@/lib/db";

export async function getAllTrips() {
  const { db } = await getDb();
  return db.trip.findMany({
    include: {
      visits: {
        include: { country: true },
        orderBy: { startDate: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getTripById(id: string) {
  const { db } = await getDb();
  return db.trip.findUnique({
    where: { id },
    include: {
      visits: {
        include: { country: true },
        orderBy: { startDate: "asc" },
      },
    },
  });
}
