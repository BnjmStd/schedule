/**
 * 🔍 Debug helper para disponibilidad de profesores
 */

"use server";

import { prisma } from "@/lib/prisma";
import { DayOfWeek } from "@prisma/client";
import { dateToTimeString } from "@/lib/utils/time";

export async function checkTeacherAvailabilityDebug(
  teacherId: string,
  dayOfWeek: string,
  startTime: string,
  endTime: string,
  academicYear?: number,
) {
  if (!teacherId) {
    return {
      isAvailable: true,
      reason: "Sin profesor asignado",
      availabilitySlots: [],
    };
  }

  const year = academicYear || new Date().getFullYear();

  const availability = await prisma.teacherAvailability.findMany({
    where: {
      teacherId,
      academicYear: year,
      dayOfWeek: dayOfWeek as DayOfWeek,
    },
    select: {
      startTime: true,
      endTime: true,
    },
  });

  if (availability.length === 0) {
    return {
      isAvailable: false,
      reason: `Sin disponibilidad para ${dayOfWeek} en ${year}`,
      availabilitySlots: [],
    };
  }

  const matchingSlot = availability.find(
    (slot) =>
      startTime >= dateToTimeString(slot.startTime) &&
      endTime <= dateToTimeString(slot.endTime),
  );

  if (matchingSlot) {
    return {
      isAvailable: true,
      reason: `Slot ${dateToTimeString(matchingSlot.startTime)}-${dateToTimeString(matchingSlot.endTime)}`,
      availabilitySlots: availability.map((s) => ({
        start: dateToTimeString(s.startTime),
        end: dateToTimeString(s.endTime),
      })),
    };
  }

  return {
    isAvailable: false,
    reason: `Bloque ${startTime}-${endTime} fuera de slots: ${availability.map((s) => `${dateToTimeString(s.startTime)}-${dateToTimeString(s.endTime)}`).join(", ")}`,
    availabilitySlots: availability.map((s) => ({
      start: dateToTimeString(s.startTime),
      end: dateToTimeString(s.endTime),
    })),
  };
}
