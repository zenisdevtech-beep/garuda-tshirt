import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const seedProducts = [
  {
    id: 'ts-001',
    name: 'Garud Mythic Tee',
    slug: 'garud-mythic-tee',
    price: 1499,
    category: 'tshirts',
    categoryLabel: 'T-Shirts',
    images: [
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80',
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
    ],
    description:
      'The original Garud Mythic Tee. Heavyweight 240GSM cotton, oversized silhouette with the iconic Garud eagle chest print. Born from Indian mythology, made for the streets.',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: [{ name: 'Jet Black', hex: '#0A0A0A' }, { name: 'Charcoal', hex: '#3A3A3A' }],
    tags: ['bestseller', 'new'],
    stock: 48,
    rating: 4.9,
    reviewCount: 312,
    material: '240GSM 100% Cotton',
  },
  {
    id: 'ts-002',
    name: 'Eagle Eye Graphic Tee',
    slug: 'eagle-eye-graphic-tee',
    price: 1299,
    category: 'tshirts',
    categoryLabel: 'T-Shirts',
    images: [
      'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=800&q=80',
      'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&q=80',
    ],
    description:
      'Statement oversized tee with an eagle-eye mandala graphic on the back. Soft-touch 220GSM cotton with pigment-dyed finish for a worn-in premium look.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [{ name: 'Raw White', hex: '#F5F0E8' }, { name: 'Jet Black', hex: '#0A0A0A' }],
    tags: ['new'],
    stock: 62,
    rating: 4.7,
    reviewCount: 187,
    material: '220GSM 100% Cotton',
  },
  {
    id: 'ts-003',
    name: 'Warrior Script Tee',
    slug: 'warrior-script-tee',
    price: 1399,
    category: 'tshirts',
    categoryLabel: 'T-Shirts',
    images: [
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80',
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80',
    ],
    description:
      'Devanagari script "योद्धा" (Warrior) across the chest. Premium 230GSM organic cotton with a structured boxy cut. Wear your identity.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [{ name: 'Sandstone', hex: '#D8CFC0' }, { name: 'Jet Black', hex: '#0A0A0A' }],
    tags: ['bestseller', 'new'],
    stock: 74,
    rating: 4.8,
    reviewCount: 243,
    material: '230GSM Organic Cotton',
  },
  {
    id: 'ts-004',
    name: 'Heritage Crest Tee',
    slug: 'heritage-crest-tee',
    price: 1299,
    category: 'tshirts',
    categoryLabel: 'T-Shirts',
    images: [
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80',
    ],
    description:
      'A tribute to Indian heritage. Lotus mandala crest on the chest with a subtle tone-on-tone rear graphic. 220GSM cotton, boxy fit.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [{ name: 'Jet Black', hex: '#0A0A0A' }],
    tags: ['new'],
    stock: 55,
    rating: 4.6,
    reviewCount: 98,
    material: '220GSM Cotton',
  },
  {
    id: 'ts-005',
    name: 'Divine Wings Tee',
    slug: 'divine-wings-tee',
    price: 1599,
    originalPrice: 1899,
    category: 'tshirts',
    categoryLabel: 'T-Shirts',
    images: [
      'https://images.unsplash.com/photo-1554568218-0f1715e72254?w=800&q=80',
      'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=800&q=80',
    ],
    description:
      "Limited edition. Garud's outstretched wings span across this premium 260GSM heavyweight tee. Crafted for everyday comfort and bold presence.",
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [{ name: 'Chalk White', hex: '#F5F0E8' }],
    tags: ['limited', 'sale', 'bestseller'],
    stock: 24,
    rating: 4.9,
    reviewCount: 156,
    material: '260GSM Heavyweight Cotton',
  },
  {
    id: 'ts-006',
    name: 'Bharat Bold Tee',
    slug: 'bharat-bold-tee',
    price: 1299,
    category: 'tshirts',
    categoryLabel: 'T-Shirts',
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80',
    ],
    description:
      '"BHARAT" in bold condensed type across the chest. A declaration, not just a tee. 220GSM pure cotton in a clean athletic-street silhouette.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [{ name: 'Pure White', hex: '#FFFFFF' }, { name: 'Deep Teal', hex: '#0B4654' }],
    tags: ['bestseller'],
    stock: 88,
    rating: 4.7,
    reviewCount: 167,
    material: '220GSM 100% Cotton',
  },
  {
    id: 'ts-007',
    name: 'Ashoka Emblem Tee',
    slug: 'ashoka-emblem-tee',
    price: 1499,
    category: 'tshirts',
    categoryLabel: 'T-Shirts',
    images: [
      'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&q=80',
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80',
    ],
    description:
      'Ashoka emblem reimagined in a modern geometric style on the chest. 240GSM cotton with a slight texture wash. Classic straight fit.',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: [{ name: 'Jet Black', hex: '#0A0A0A' }],
    tags: ['bestseller', 'new'],
    stock: 41,
    rating: 4.8,
    reviewCount: 204,
    material: '240GSM Cotton',
  },
  {
    id: 'hd-001',
    name: 'Garud Heavyweight Hoodie',
    slug: 'garud-heavyweight-hoodie',
    price: 2999,
    category: 'hoodies',
    categoryLabel: 'Hoodies',
    images: [
      'https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?w=800&q=80',
      'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800&q=80',
    ],
    description:
      'The definitive Garud hoodie. 400GSM French terry cotton, oversized with kangaroo pocket and embroidered Garud eagle crest on chest. Built for warriors.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [{ name: 'Desert Clay', hex: '#B67B5B' }, { name: 'Jet Black', hex: '#0A0A0A' }],
    tags: ['bestseller', 'new'],
    stock: 38,
    rating: 4.9,
    reviewCount: 267,
    material: '400GSM French Terry Cotton',
  },
  {
    id: 'hd-002',
    name: 'Mythic Overshirt',
    slug: 'mythic-overshirt',
    price: 2599,
    category: 'hoodies',
    categoryLabel: 'Hoodies',
    images: [
      'https://images.unsplash.com/photo-1541101767792-f9b2b1c4f127?w=800&q=80',
      'https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?w=800&q=80',
    ],
    description:
      'Structured everyday overshirt with subtle Garud crest detailing. 320GSM breathable cotton blend, relaxed fit. Pairs effortlessly with joggers or denim.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [{ name: 'Ivory White', hex: '#F5F0E8' }],
    tags: ['new'],
    stock: 61,
    rating: 4.6,
    reviewCount: 98,
    material: '320GSM Cotton Blend',
  },
  {
    id: 'jg-001',
    name: 'Garud Track Trousers',
    slug: 'garud-track-trousers',
    price: 2199,
    category: 'joggers',
    categoryLabel: 'Joggers',
    images: [
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80',
      'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&q=80',
    ],
    description:
      'Tailored heavyweight trousers with contrast Garud seam detailing. 320GSM cotton twill, structured straight-taper fit for street and studio.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [{ name: 'Deep Indigo', hex: '#1B2838' }, { name: 'Jet Black', hex: '#0A0A0A' }],
    tags: ['bestseller', 'new'],
    stock: 67,
    rating: 4.8,
    reviewCount: 189,
    material: '320GSM Cotton Twill',
  },
  {
    id: 'jk-001',
    name: 'Garud Bomber Jacket',
    slug: 'garud-bomber-jacket',
    price: 4999,
    category: 'jackets',
    categoryLabel: 'Jackets',
    images: [
      'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800&q=80',
      'https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?w=800&q=80',
    ],
    description:
      'The statement outerwear piece. Tailored jacket with Garud eagle embroidered on the back, custom metal zipper, ribbed cuffs, and internal pockets.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [{ name: 'Jet Black', hex: '#0A0A0A' }, { name: 'Olive', hex: '#4B5320' }],
    tags: ['new', 'limited', 'bestseller'],
    stock: 22,
    rating: 4.9,
    reviewCount: 134,
    material: 'Heavyweight Twill & Satin Lining',
  },
  {
    id: 'ac-001',
    name: 'Garud Snapback Cap',
    slug: 'garud-snapback-cap',
    price: 999,
    category: 'accessories',
    categoryLabel: 'Accessories',
    images: [
      'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=800&q=80',
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&q=80',
    ],
    description:
      'Structured 6-panel cap with embroidered Garud eagle logo on the front panel and "GARUD" on the back strap. Adjustable, one size.',
    sizes: ['One Size'],
    colors: [{ name: 'Jet Black', hex: '#0A0A0A' }],
    tags: ['bestseller', 'new'],
    stock: 120,
    rating: 4.8,
    reviewCount: 234,
    material: '6-Panel Structured Cotton',
  },
  {
    id: 'ac-002',
    name: 'Eagle Eye Dad Cap',
    slug: 'eagle-eye-dad-cap',
    price: 799,
    category: 'accessories',
    categoryLabel: 'Accessories',
    images: [
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&q=80',
      'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=800&q=80',
    ],
    description:
      'Unstructured dad cap with tonal Garud embroidery. Curved brim, adjustable strap. Minimal and clean for the daily warrior.',
    sizes: ['One Size'],
    colors: [{ name: 'Midnight Black', hex: '#0A0A0A' }],
    tags: ['new'],
    stock: 95,
    rating: 4.7,
    reviewCount: 167,
    material: 'Unstructured Cotton Twill',
  },
];

async function main() {
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

  for (const item of seedProducts) {
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

  if ((await prisma.announcement.count()) === 0) {
    await prisma.announcement.createMany({
      data: [
        { text: 'FREE SHIPPING ON ORDERS ABOVE ₹999', isActive: true, sortOrder: 1 },
        { text: 'NEW DROP — THE WARRIORS COLLECTION IS HERE', isActive: true, sortOrder: 2 },
        { text: 'USE CODE: GARUD10 FOR 10% OFF YOUR FIRST ORDER', isActive: true, sortOrder: 3 },
      ],
    });
  }

  if ((await prisma.testimonial.count()) === 0) {
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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
