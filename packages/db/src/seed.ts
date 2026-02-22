import { db, schema } from "./index.js";
import argon2 from "argon2";

async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });
}

async function seed() {
  console.log("🌱 Seeding database...");

  // Hash passwords
  const superAdminHash = await hashPassword("SuperAdmin123!");
  const demoHash = await hashPassword("Demo1234!");

  // 1. Subscription Plans
  const plans = await db
    .insert(schema.subscriptionPlans)
    .values([
      {
        name: "Starter",
        slug: "starter",
        description: "Küçük okullar için temel plan",
        monthlyPrice: 99900, // 999.00 TL
        yearlyPrice: 999900, // 9999.00 TL
        maxStudents: 100,
        maxTeachers: 15,
        maxStorageMB: 5120,
        features: ["messaging", "grades", "attendance", "meals", "announcements", "schedule"],
        sortOrder: 1,
      },
      {
        name: "Professional",
        slug: "professional",
        description: "Orta ölçekli okullar için gelişmiş plan",
        monthlyPrice: 249900,
        yearlyPrice: 2499900,
        maxStudents: 500,
        maxTeachers: 50,
        maxStorageMB: 25600,
        features: [
          "messaging", "grades", "attendance", "meals", "announcements", "schedule",
          "transport", "finance_advanced", "reports_advanced", "digital_portfolio",
        ],
        sortOrder: 2,
      },
      {
        name: "Enterprise",
        slug: "enterprise",
        description: "Büyük okullar ve zincirler için tam donanımlı plan",
        monthlyPrice: 499900,
        yearlyPrice: 4999900,
        maxStudents: 2000,
        maxTeachers: 200,
        maxStorageMB: 102400,
        features: [
          "messaging", "grades", "attendance", "meals", "announcements", "schedule",
          "transport", "finance_full", "reports_full", "digital_portfolio",
          "ai_features", "api_access", "custom_reports",
        ],
        sortOrder: 3,
      },
    ])
    .returning();

  console.log(`  ✅ ${plans.length} subscription plans created`);

  // 2. Super Admin user (password will be hashed by the API)
  // For seed, we use a pre-hashed password: "SuperAdmin123!"
  const superAdmin = await db
    .insert(schema.users)
    .values({
      email: "admin@edusync.com",
      passwordHash: superAdminHash,
      firstName: "Super",
      lastName: "Admin",
      role: "SUPER_ADMIN",
      isActive: true,
      emailVerified: true,
    })
    .returning();

  console.log(`  ✅ Super Admin created: ${superAdmin[0].email}`);

  // 3. Demo School (Tenant)
  const demoSchool = await db
    .insert(schema.tenants)
    .values({
      name: "Demo Özel Okulu",
      slug: "demo-okulu",
      city: "İstanbul",
      district: "Kadıköy",
      phone: "+90 216 555 0001",
      email: "info@demo-okulu.com",
      status: "ACTIVE",
      settings: {
        timezone: "Europe/Istanbul",
        language: "tr",
        gradingSystem: "100",
        attendanceEnabled: true,
        transportEnabled: true,
        mealEnabled: true,
      },
    })
    .returning();

  console.log(`  ✅ Demo school created: ${demoSchool[0].name}`);

  // 4. Demo Subscription
  const now = new Date();
  const oneYearLater = new Date(now);
  oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);

  await db.insert(schema.subscriptions).values({
    tenantId: demoSchool[0].id,
    planId: plans[1].id, // Professional
    status: "ACTIVE",
    startDate: now,
    endDate: oneYearLater,
    autoRenew: true,
  });

  console.log("  ✅ Demo subscription created");

  // 5. Demo Academic Year
  const academicYear = await db
    .insert(schema.academicYears)
    .values({
      tenantId: demoSchool[0].id,
      name: "2025-2026",
      startDate: new Date("2025-09-15"),
      endDate: new Date("2026-06-15"),
      isCurrent: true,
    })
    .returning();

  // 6. Grade Levels
  const gradeLevelNames = [
    "Anaokulu", "1. Sınıf", "2. Sınıf", "3. Sınıf", "4. Sınıf",
    "5. Sınıf", "6. Sınıf", "7. Sınıf", "8. Sınıf",
  ];

  const gradeLevelValues = gradeLevelNames.map((name, i) => ({
    tenantId: demoSchool[0].id,
    name,
    sortOrder: i,
  }));

  const gradeLevelsResult = await db.insert(schema.gradeLevels).values(gradeLevelValues).returning();
  console.log(`  ✅ ${gradeLevelsResult.length} grade levels created`);

  // 7. Demo Classes
  const classNames = ["A", "B", "C"];
  const classValues = [];
  for (const gl of gradeLevelsResult.slice(1, 6)) { // 1-5. sınıf
    for (const section of classNames.slice(0, 2)) { // A, B
      classValues.push({
        tenantId: demoSchool[0].id,
        gradeLevelId: gl.id,
        academicYearId: academicYear[0].id,
        name: `${gl.name.replace(". Sınıf", "")}-${section}`,
        capacity: 30,
      });
    }
  }

  const classesResult = await db.insert(schema.classes).values(classValues).returning();
  console.log(`  ✅ ${classesResult.length} classes created`);

  // 8. School Admin User
  const schoolAdmin = await db
    .insert(schema.users)
    .values({
      email: "mudur@demo-okulu.com",
      passwordHash: demoHash,
      firstName: "Ahmet",
      lastName: "Yılmaz",
      role: "PRINCIPAL",
      tenantId: demoSchool[0].id,
      isActive: true,
      emailVerified: true,
    })
    .returning();

  console.log(`  ✅ School admin created: ${schoolAdmin[0].email}`);

  // 9. Demo Teacher
  const teacher = await db
    .insert(schema.users)
    .values({
      email: "ogretmen@demo-okulu.com",
      passwordHash: demoHash,
      firstName: "Ayşe",
      lastName: "Kaya",
      role: "TEACHER",
      tenantId: demoSchool[0].id,
      isActive: true,
      emailVerified: true,
    })
    .returning();

  console.log(`  ✅ Demo teacher created: ${teacher[0].email}`);

  // 10. Demo Parent
  const parent = await db
    .insert(schema.users)
    .values({
      email: "veli@demo-okulu.com",
      passwordHash: demoHash,
      firstName: "Mehmet",
      lastName: "Demir",
      phone: "+90 532 555 0001",
      role: "PARENT",
      tenantId: demoSchool[0].id,
      isActive: true,
      emailVerified: true,
    })
    .returning();

  console.log(`  ✅ Demo parent created: ${parent[0].email}`);

  // 11. Demo Student
  const student = await db
    .insert(schema.students)
    .values({
      tenantId: demoSchool[0].id,
      studentNumber: "2025001",
      firstName: "Ali",
      lastName: "Demir",
      dateOfBirth: new Date("2015-05-15"),
      gender: "MALE",
      bloodType: "A+",
      status: "ACTIVE",
      classId: classesResult[0].id,
    })
    .returning();

  console.log(`  ✅ Demo student created: ${student[0].firstName} ${student[0].lastName}`);

  // 12. Link parent to student
  await db.insert(schema.studentParents).values({
    studentId: student[0].id,
    parentId: parent[0].id,
    relation: "FATHER",
    isPrimary: true,
    isEmergencyContact: true,
  });

  console.log("  ✅ Parent-student link created");

  console.log("\n🎉 Seed completed successfully!");
  console.log("\n📋 Demo Credentials:");
  console.log("  Super Admin: admin@edusync.com / SuperAdmin123!");
  console.log("  Principal:   mudur@demo-okulu.com / Demo1234!");
  console.log("  Teacher:     ogretmen@demo-okulu.com / Demo1234!");
  console.log("  Parent:      veli@demo-okulu.com / Demo1234!");

  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
