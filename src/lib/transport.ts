import { TransportMode } from "@/generated/prisma/client";

export const TRANSPORT_LABELS: Record<TransportMode, string> = {
  PLANE: "Flugzeug",
  CAR: "Auto",
  TRAIN: "Zug",
  BUS: "Bus",
  FERRY: "Fähre",
  OTHER: "Sonstiges",
};

export const TRANSPORT_ORDER: TransportMode[] = [
  "PLANE",
  "CAR",
  "TRAIN",
  "BUS",
  "FERRY",
  "OTHER",
];
