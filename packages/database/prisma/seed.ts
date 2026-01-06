//C:\Users\studi\my-next-app\packages\database\prisma\seed.ts
import { PrismaClient } from '@studio-perennis/database';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashed = await bcrypt.hash('password123', 10);

  /* ---------------- USER ---------------- */

  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      password: hashed,
      isAdmin: true,
    },
  });

  /* ---------------- BOOK ---------------- */

  let book = await prisma.book.findUnique({
    where: { slug: 'test-book' },
  });

  if (!book) {
    book = await prisma.book.create({
      data: {
        title: 'Test Book - Perennis Edition',
        slug: 'test-book',
        author: 'Test Author',
        pages: 200,
        coverImage: '/books/test-cover.jpg',
        pdfPath: '/books/test.pdf',
        type: "GENERAL",

      },
    });
  }

  const bookId = book.id;

  console.log(`✅ Book ${bookId}: ${book.title}`);

  /* ---------------- WAREHOUSE ---------------- */

  let warehouse = await prisma.warehouse.findFirst({
    where: { name: 'IN_HOUSE' },
  });

  if (!warehouse) {
    warehouse = await prisma.warehouse.create({
      data: {
        name: 'IN_HOUSE',
        city: 'Ghaziabad',
        country: 'IN',
      },
    });
  }

  /* ---------------- BOOK VARIANTS ---------------- */

  const pdfVariant = await prisma.bookVariant.upsert({
    where: { sku: 'TEST-PDF-001' },
    update: {},
    create: {
      bookId,
      type: 'PDF',
      sku: 'TEST-PDF-001',
      pricePaise: 29500, // ₹295
      fulfillmentType: 'IN_HOUSE',
    },
  });

const hardcopyVariant = await prisma.bookVariant.upsert({
  where: { sku: 'TEST-HC-001' },
  update: {},
  create: {
    bookId,
    type: 'HARDCOPY',
    sku: 'TEST-HC-001',
    pricePaise: 49500,
    fulfillmentType: 'IN_HOUSE',
  },
});

  /* ---------------- INVENTORY ---------------- */

  await prisma.inventory.upsert({
    where: {
      variantId_warehouseId: {
        variantId: hardcopyVariant.id,
        warehouseId: warehouse.id,
      },
    },
    update: {},
    create: {
      variantId: hardcopyVariant.id,
      warehouseId: warehouse.id,
      onHand: 10,
      reserved: 0,
    },
  });

  /* ---------------- LIBRARY ENTRY ---------------- */

  await prisma.libraryEntry.upsert({
    where: {
      userId_bookId: {
        userId: user.id,
        bookId: bookId,
      },
    },
    update: {},
    create: {
      userId: user.id,
      bookId: bookId,
      format: 'PDF',
    },
  });

  /* ---------------- READING SESSION ---------------- */
/* ---------------- READING SESSION ---------------- */

const existingSession = await prisma.readingSession.findFirst({
  where: {
    userId: user.id,
    bookId: bookId,
    state: 'ACTIVE',
  },
});

if (existingSession) {
  await prisma.readingSession.update({
    where: { id: existingSession.id },
    data: {
      lastSeenPage: 25,
      furthestAllowedPage: 25,
    },
  });
} else {
  await prisma.readingSession.create({
    data: {
      userId: user.id,
      bookId: bookId,
      mode: 'FREE',
      state: 'ACTIVE',
      lastSeenPage: 25,
      furthestAllowedPage: 25,
    },
  });
}


  /* ---------------- REFLECTION GATE ---------------- */

  await prisma.reflectionGate.upsert({
    where: { id: 'test-gate-1' },
    update: {},
    create: {
      id: 'test-gate-1',
      bookId: bookId,
      pageNumber: 50,
      question: 'What assumption of yours is being questioned here?',
      minLength: 50,
    },
  });

  console.log('✅ SEED COMPLETE');
  console.log(`   User ID: ${user.id}`);
  console.log(`   Book ID: ${bookId}`);
  console.log(`   PDF Variant: ${pdfVariant.sku}`);
  console.log(`   Hardcopy Variant: ${hardcopyVariant.sku} (10 in stock)`);
  console.log(`   Reflection gate at page 50`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('✅ All done!');
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
