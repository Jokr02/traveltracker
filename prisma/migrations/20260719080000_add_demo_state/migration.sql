-- CreateTable
CREATE TABLE "DemoState" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "lastResetAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DemoState_pkey" PRIMARY KEY ("id")
);
