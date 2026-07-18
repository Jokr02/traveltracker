import "server-only";
import { prisma } from "@/lib/prisma";

export async function getAllTrips() {
  return prisma.trip.findMany({
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
  return prisma.trip.findUnique({
    where: { id },
    include: {
      visits: {
        include: { country: true },
        orderBy: { startDate: "asc" },
      },
    },
  });
}
