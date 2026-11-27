import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { products } from '../data/products.ts';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding GARUD database...');

  // 1. Admin & Demo Customer
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@garudwear.in';
  const adminPassword = process.env.ADMIN_PASSWORD || 'GarudAdmin@2024';
  const adminHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: 'ADMIN' },
    create: {
      name: 'GARUD Admin',
      email: adminEmail,
      phone: '+91 9876543210',
      passwordHash: adminHash,
      role: 'ADMIN',
      emailVerified: true,
    },
  });

  // 2. Products & Variants
  for (const item of products) {
    const sku = `GRD-${item.id.toUpperCase()}`;
    const existing = await prisma.product.findUnique({ where: { slug: item.slug } });

    if (!existing) {
      const created = await prisma.product.create({
        data: {
          id: item.id,
          sku,
          name: item.name,
          slug: item.slug,
          description: item.description,
          price: item.price,
          originalPrice: item.originalPrice ?? null,
          category: item.category,
          categoryLabel: item.categoryLabel,
          material: item.material,
          images: JSON.stringify(item.images),
          colors: JSON.stringify(item.colors),
          tags: JSON.stringify(item.tags),
          isBestseller: item.tags.includes('bestseller'),
          isNewArrival: item.tags.includes('new'),
          isActive: true,
          rating: item.rating,
          reviewCount: item.reviewCount,
        },
      });

      const perVariantStock = Math.max(
        4,
        Math.floor(item.stock / Math.max(1, item.sizes.length * item.colors.length))
      );

      for (const color of item.colors) {
        for (const size of item.sizes) {
          await prisma.productVariant.create({
            data: {
              productId: created.id,
              size,
              color: color.name,
              stock: perVariantStock,
              skuSuffix: `${size}-${color.name.slice(0, 3).toUpperCase()}`,
            },
          });
        }
      }
    }
  }

  // 3. Coupons
  await prisma.coupon.upsert({
    where: { code: 'GARUD10' },
    update: {},
    create: {
      code: 'GARUD10',
      description: '10% off your first GARUD order',
      discountType: 'PERCENT',
      discountValue: 10,
      minOrder: 499,
      isActive: true,
    },
  });

  await prisma.coupon.upsert({
    where: { code: 'WARRIOR250' },
    update: {},
    create: {
      code: 'WARRIOR250',
      description: 'Flat ₹250 off on orders above ₹1,999',
      discountType: 'FIXED',
      discountValue: 250,
      minOrder: 1999,
      isActive: true,
    },
  });

  // 4. Announcements
  const existingAnnouncements = await prisma.announcement.count();
  if (existingAnnouncements === 0) {
    await prisma.announcement.createMany({
      data: [
        { text: 'FREE SHIPPING ON ORDERS ABOVE ₹999', isActive: true, sortOrder: 1 },
        { text: 'NEW DROP — THE WARRIORS COLLECTION IS HERE', isActive: true, sortOrder: 2 },
        { text: 'USE CODE: GARUD10 FOR 10% OFF YOUR FIRST ORDER', isActive: true, sortOrder: 3 },
      ],
    });
  }

  // 5. Testimonials
  const existingTestimonials = await prisma.testimonial.count();
  if (existingTestimonials === 0) {
    await prisma.testimonial.createMany({
      data: [
        {
          name: 'Arjun Sharma',
          location: 'Mumbai',
          rating: 5,
          text: 'The quality is insane. The 240GSM fabric is thick, the print is crisp, and the oversized fit is spot on.',
          product: 'Garud Mythic Tee',
        },
        {
          name: 'Rahul Verma',
          location: 'Delhi',
          rating: 5,
          text: 'Finally an Indian streetwear brand with real heavyweight 400GSM hoodies. Fast delivery and premium packaging.',
          product: 'Garud Heavyweight Hoodie',
        },
        {
          name: 'Vikram Singh',
          location: 'Bangalore',
          rating: 5,
          text: 'The cultural identity in the design is what sets Garud apart. Worn it everywhere and gets compliments daily.',
          product: 'Divine Wings Tee',
        },
      ],
    });
  }

  // 6. Store Settings
  const defaultSettings = [
    { key: 'storeName', value: 'GARUD' },
    { key: 'freeShippingThreshold', value: '999' },
    { key: 'standardShippingFee', value: '99' },
    { key: 'codEnabled', value: 'true' },
    { key: 'codFee', value: '0' },
    { key: 'supportEmail', value: 'support@garudwear.in' },
  ];

  for (const s of defaultSettings) {
    await prisma.storeSetting.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    });
  }

  console.log('Seed completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
