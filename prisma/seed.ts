/// <reference types="node" />
/**
 * 🌱 SEED — School Timetable SaaS
 *
 * Generates a complete, realistic dataset for development and testing.
 *
 * Run with:  npx prisma db seed
 *       or:  npm run db:seed
 *
 * ⚠️  DESTRUCTIVE — deletes all existing data before seeding.
 */

import {
  PrismaClient,
  AcademicLevel,
  DayOfWeek,
  GenerationStatus,
  SubscriptionPlan,
  SubscriptionStatus,
  UserRole,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Converts an "HH:MM" string to a Date object suitable for @db.Time fields.
 * Prisma stores only the time portion in PostgreSQL TIME columns.
 */
function t(timeStr: string): Date {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const d = new Date(0); // epoch base — date portion is irrelevant for TIME
  d.setUTCHours(hours, minutes, 0, 0);
  return d;
}

const ACADEMIC_YEAR = 2026;
const PASSWORD_PLAIN = "password123";

// ---------------------------------------------------------------------------
// Cleanup — delete in reverse dependency order
// ---------------------------------------------------------------------------

async function cleanup() {
  console.log("🗑️  Cleaning existing data...");

  await prisma.scheduleGenerationResult.deleteMany();
  await prisma.scheduleGenerationJob.deleteMany();
  await prisma.scheduleBlock.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.courseSubjectRequirement.deleteMany();
  await prisma.teacherSubject.deleteMany();
  await prisma.teacherAvailabilityException.deleteMany();
  await prisma.teacherAvailability.deleteMany();
  await prisma.teacherWorkloadLimit.deleteMany();
  await prisma.scheduleLevelConfigHistory.deleteMany();
  await prisma.scheduleLevelConfig.deleteMany();
  await prisma.course.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.session.deleteMany();
  await prisma.subscriptionHistory.deleteMany();
  await prisma.schoolSubscription.deleteMany();
  await prisma.billingEvent.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.user.deleteMany();
  await prisma.school.deleteMany();
  await prisma.organization.deleteMany();

  console.log("  ✓ All tables cleared");
}

// ---------------------------------------------------------------------------
// Main seed
// ---------------------------------------------------------------------------

async function main() {
  console.log("\n🌱 Starting seed...\n");
  await cleanup();

  const hashedPw = await bcrypt.hash(PASSWORD_PLAIN, 10);

  // ── Organization ──────────────────────────────────────────────────────────

  const org = await prisma.organization.create({
    data: { name: "Red Educacional Nacional" },
  });
  console.log(`✓ Organization: ${org.name}`);

  // ── School ────────────────────────────────────────────────────────────────

  const school = await prisma.school.create({
    data: {
      organizationId: org.id,
      name: "Colegio San Martín",
      address: "Av. San Martín 1234, Santiago",
      phone: "+56 2 2345 6789",
      email: "contacto@colegiosanmartin.cl",
      activeAcademicLevels: "BASIC",
    },
  });
  console.log(`✓ School: ${school.name}`);

  // ── Subscription (FREE, active) ───────────────────────────────────────────

  await prisma.schoolSubscription.create({
    data: {
      schoolId: school.id,
      plan: SubscriptionPlan.FREE,
      status: SubscriptionStatus.ACTIVE,
      currentPeriodEnd: new Date("2099-12-31T00:00:00.000Z"),
    },
  });

  // ── Users ─────────────────────────────────────────────────────────────────

  const owner = await prisma.user.create({
    data: {
      schoolId: school.id,
      name: "Carlos Mendoza",
      email: "owner@colegiosanmartin.cl",
      password: hashedPw,
      role: UserRole.OWNER,
    },
  });

  await prisma.user.createMany({
    data: [
      {
        schoolId: school.id,
        name: "María García",
        email: "admin@colegiosanmartin.cl",
        password: hashedPw,
        role: UserRole.ADMIN,
      },
      {
        schoolId: school.id,
        name: "Pedro Rodríguez",
        email: "staff1@colegiosanmartin.cl",
        password: hashedPw,
        role: UserRole.STAFF,
      },
      {
        schoolId: school.id,
        name: "Ana Torres",
        email: "staff2@colegiosanmartin.cl",
        password: hashedPw,
        role: UserRole.STAFF,
      },
    ],
  });
  console.log("✓ Users: 1 OWNER, 1 ADMIN, 2 STAFF");

  // ── Schedule Level Config (BASIC) ─────────────────────────────────────────

  await prisma.scheduleLevelConfig.create({
    data: {
      schoolId: school.id,
      academicLevel: AcademicLevel.BASIC,
      startTime: t("08:00"),
      endTime: t("14:30"),
      blockDuration: 45,
      breaks: [
        { afterBlock: 3, duration: 15, name: "Recreo" },
        { afterBlock: 5, duration: 30, name: "Colación" },
      ],
    },
  });
  console.log("✓ ScheduleLevelConfig: BASIC (08:00 – 14:30, 45-min blocks)");

  // ── Subjects ──────────────────────────────────────────────────────────────

  const subjectDefs = [
    { name: "Matemáticas", code: "MAT", color: "#3B82F6" },
    { name: "Lenguaje y Comunicación", code: "LEN", color: "#10B981" },
    {
      name: "Historia, Geografía y Cs. Sociales",
      code: "HIS",
      color: "#F59E0B",
    },
    { name: "Ciencias Naturales", code: "CNA", color: "#6366F1" },
    { name: "Educación Artística", code: "ART", color: "#EC4899" },
    { name: "Música", code: "MUS", color: "#8B5CF6" },
    { name: "Inglés", code: "ING", color: "#14B8A6" },
  ] as const;

  const createdSubjects = await Promise.all(
    subjectDefs.map((s) =>
      prisma.subject.create({ data: { schoolId: school.id, ...s } }),
    ),
  );

  const [mat, len, his, cna, art, mus, ing] = createdSubjects;
  console.log(`✓ Subjects: ${createdSubjects.length}`);

  // ── Teachers ──────────────────────────────────────────────────────────────

  const teacherDefs = [
    { firstName: "Ana", lastName: "Martínez", email: "a.martinez@colegio.cl" },
    { firstName: "Juan", lastName: "Pérez", email: "j.perez@colegio.cl" },
    { firstName: "Carmen", lastName: "López", email: "c.lopez@colegio.cl" },
    { firstName: "Roberto", lastName: "Silva", email: "r.silva@colegio.cl" },
    { firstName: "Patricia", lastName: "Díaz", email: "p.diaz@colegio.cl" },
    { firstName: "Luis", lastName: "Morales", email: "l.morales@colegio.cl" },
    { firstName: "Sandra", lastName: "Vargas", email: "s.vargas@colegio.cl" },
    { firstName: "Miguel", lastName: "Torres", email: "m.torres@colegio.cl" },
    { firstName: "Isabel", lastName: "Castro", email: "i.castro@colegio.cl" },
    { firstName: "Fernando", lastName: "Ruiz", email: "f.ruiz@colegio.cl" },
  ];

  const teachers = await Promise.all(
    teacherDefs.map((td) =>
      prisma.teacher.create({ data: { schoolId: school.id, ...td } }),
    ),
  );
  console.log(`✓ Teachers: ${teachers.length}`);

  const [t0, t1, t2, t3, t4, t5, t6, t7, t8, t9] = teachers;

  // ── Teacher-Subject assignments ───────────────────────────────────────────
  // Each teacher can teach one or two subjects.

  const tsAssignments: {
    teacher: (typeof teachers)[0];
    subjects: (typeof createdSubjects)[0][];
  }[] = [
    { teacher: t0, subjects: [mat] },
    { teacher: t1, subjects: [mat, cna] },
    { teacher: t2, subjects: [len] },
    { teacher: t3, subjects: [len, his] },
    { teacher: t4, subjects: [his] },
    { teacher: t5, subjects: [cna] },
    { teacher: t6, subjects: [art, mus] },
    { teacher: t7, subjects: [ing] },
    { teacher: t8, subjects: [mat, ing] },
    { teacher: t9, subjects: [mus, art] },
  ];

  await Promise.all(
    tsAssignments.flatMap(({ teacher, subjects }) =>
      subjects.map((subject) =>
        prisma.teacherSubject.create({
          data: {
            teacherId: teacher.id,
            subjectId: subject.id,
            schoolId: school.id,
          },
        }),
      ),
    ),
  );
  console.log("✓ TeacherSubject assignments");

  // ── Teacher Availability — Mon–Fri, 08:00–14:30 ───────────────────────────

  const days = [
    DayOfWeek.MONDAY,
    DayOfWeek.TUESDAY,
    DayOfWeek.WEDNESDAY,
    DayOfWeek.THURSDAY,
    DayOfWeek.FRIDAY,
  ];

  // Slightly varied availability to make the dataset realistic
  const availabilityWindows: Record<string, { start: string; end: string }[]> =
    {
      "0": [{ start: "08:00", end: "14:30" }], // Ana   — full morning
      "1": [{ start: "08:00", end: "14:30" }], // Juan  — full morning
      "2": [
        { start: "08:00", end: "12:00" },
        { start: "13:00", end: "14:30" },
      ], // Carmen — split
      "3": [{ start: "08:00", end: "14:30" }],
      "4": [{ start: "09:00", end: "14:30" }], // Patricia — late start
      "5": [{ start: "08:00", end: "14:30" }],
      "6": [{ start: "08:00", end: "14:30" }],
      "7": [{ start: "08:00", end: "13:00" }], // Miguel — half day
      "8": [{ start: "08:00", end: "14:30" }],
      "9": [{ start: "08:00", end: "14:30" }],
    };

  await Promise.all(
    teachers.flatMap((teacher, idx) =>
      days.flatMap((day) =>
        (
          availabilityWindows[String(idx)] ?? [{ start: "08:00", end: "14:30" }]
        ).map((slot) =>
          prisma.teacherAvailability.create({
            data: {
              teacherId: teacher.id,
              schoolId: school.id,
              academicYear: ACADEMIC_YEAR,
              dayOfWeek: day,
              startTime: t(slot.start),
              endTime: t(slot.end),
            },
          }),
        ),
      ),
    ),
  );
  console.log("✓ Teacher availability (Mon–Fri)");

  // ── Teacher Workload Limits ────────────────────────────────────────────────

  await Promise.all(
    teachers.map((teacher) =>
      prisma.teacherWorkloadLimit.create({
        data: {
          teacherId: teacher.id,
          schoolId: school.id,
          academicYear: ACADEMIC_YEAR,
          maxBlocksPerDay: 5,
          maxBlocksPerWeek: 25,
          preferredStartTime: t("08:00"),
          preferredEndTime: t("14:30"),
        },
      }),
    ),
  );
  console.log("✓ Teacher workload limits");

  // ── Courses — 1°–4° Básico A ──────────────────────────────────────────────

  const courseDefs = [
    { name: "1° Básico A", grade: "1", section: "A", studentCount: 32 },
    { name: "2° Básico A", grade: "2", section: "A", studentCount: 30 },
    { name: "3° Básico A", grade: "3", section: "A", studentCount: 28 },
    { name: "4° Básico A", grade: "4", section: "A", studentCount: 31 },
  ];

  const courses = await Promise.all(
    courseDefs.map((cd) =>
      prisma.course.create({
        data: {
          schoolId: school.id,
          academicLevel: AcademicLevel.BASIC,
          academicYear: ACADEMIC_YEAR,
          ...cd,
        },
      }),
    ),
  );
  console.log(`✓ Courses: ${courses.length} (1°–4° Básico A)`);

  // ── Course Subject Requirements ───────────────────────────────────────────
  // Preferred teacher cycles per subject to distribute load.

  const subjectTeacherPool: Record<string, string[]> = {
    [mat.id]: [t0.id, t1.id, t8.id],
    [len.id]: [t2.id, t3.id],
    [his.id]: [t3.id, t4.id],
    [cna.id]: [t1.id, t5.id],
    [art.id]: [t6.id, t9.id],
    [mus.id]: [t6.id, t9.id],
    [ing.id]: [t7.id, t8.id],
  };

  const reqTemplate = [
    { subject: mat, blocksPerWeek: 5, maxConsecutiveBlocks: 2 },
    { subject: len, blocksPerWeek: 5, maxConsecutiveBlocks: 2 },
    { subject: cna, blocksPerWeek: 3, maxConsecutiveBlocks: 2 },
    { subject: his, blocksPerWeek: 2, maxConsecutiveBlocks: 1 },
    { subject: art, blocksPerWeek: 2, maxConsecutiveBlocks: 2 },
    { subject: ing, blocksPerWeek: 3, maxConsecutiveBlocks: 2 },
    { subject: mus, blocksPerWeek: 1, maxConsecutiveBlocks: 1 },
  ];

  await Promise.all(
    courses.flatMap((course, courseIdx) =>
      reqTemplate.map((req) => {
        const pool = subjectTeacherPool[req.subject.id];
        const preferredTeacherId = pool[courseIdx % pool.length];

        return prisma.courseSubjectRequirement.create({
          data: {
            schoolId: school.id,
            courseId: course.id,
            subjectId: req.subject.id,
            academicYear: ACADEMIC_YEAR,
            blocksPerWeek: req.blocksPerWeek,
            maxConsecutiveBlocks: req.maxConsecutiveBlocks,
            preferredTeacherId,
          },
        });
      }),
    ),
  );
  console.log("✓ Course subject requirements");

  // ── Schedule Generation Job (PENDING) ─────────────────────────────────────

  const job = await prisma.scheduleGenerationJob.create({
    data: {
      schoolId: school.id,
      academicYear: ACADEMIC_YEAR,
      semester: 1,
      status: GenerationStatus.PENDING,
      createdByUserId: owner.id,
      configSnapshot: {
        academicLevel: "BASIC",
        strategy: "constraint_solver",
        maxIterations: 50000,
        softConstraints: {
          respectPreferredTeachers: true,
          avoidAfterLunch: true,
          spreadSubjectsEvenly: true,
        },
        courses: courses.map((c) => ({ id: c.id, name: c.name })),
      },
    },
  });
  console.log(`✓ ScheduleGenerationJob: ${job.id} (PENDING)`);

  // ── Summary ───────────────────────────────────────────────────────────────

  console.log("\n✅ Seed completed successfully!\n");
  console.table({
    Organization: org.name,
    School: school.name,
    Users: 4,
    Teachers: teachers.length,
    Subjects: createdSubjects.length,
    Courses: courses.length,
    "Generation Job": `${job.id.slice(0, 8)}… (PENDING)`,
    "Test password": PASSWORD_PLAIN,
  });
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
