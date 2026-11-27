import { prisma } from './prisma';
import { serializeProduct } from './product-utils';

export async function getStoreConfig() {
  const rows = await prisma.storeSetting.findMany();
  const map = new Map(rows.map(r => [r.key, r.value]));
  return {
    storeName: map.get('storeName') || 'GARUD',
    freeShippingThreshold: Number(map.get('freeShippingThreshold') ?? 999),
    standardShippingFee: Number(map.get('standardShippingFee') ?? 99),
    codEnabled: map.get('codEnabled') !== 'false',
    codFee: Number(map.get('codFee') ?? 0),
    supportEmail: map.get('supportEmail') || 'support@garudwear.in',
  };
}

export async function validateCoupon(code: string | null | undefined, subtotal: number) {
  if (!code || !code.trim()) {
    return { valid: false, discount: 0, code: null as string | null, message: '' };
  }
  const normalized = code.trim().toUpperCase();
  const coupon = await prisma.coupon.findUnique({ where: { code: normalized } });

  if (!coupon || !coupon.isActive) {
    return { valid: false, discount: 0, code: null, message: 'Invalid or inactive coupon code.' };
  }
  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return { valid: false, discount: 0, code: null, message: 'This coupon has expired.' };
  }
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    return { valid: false, discount: 0, code: null, message: 'Coupon usage limit reached.' };
  }
  if (subtotal < coupon.minOrder) {
    return {
      valid: false,
      discount: 0,
      code: null,
      message: `Minimum order of ₹${coupon.minOrder.toLocaleString('en-IN')} required for ${normalized}.`,
    };
  }

  let discount =
    coupon.discountType === 'PERCENT'
      ? Math.round((subtotal * coupon.discountValue) / 100)
      : coupon.discountValue;

  if (coupon.maxDiscount !== null && coupon.maxDiscount > 0) {
    discount = Math.min(discount, coupon.maxDiscount);
  }
  discount = Math.min(discount, subtotal);

  return {
    valid: true,
    discount,
    code: coupon.code,
    message: `${coupon.code} applied (-₹${discount.toLocaleString('en-IN')})`,
  };
}

export async function calculateServerCart(sessionId: string, couponCode?: string | null) {
  const rows = await prisma.cartItem.findMany({
    where: { sessionId },
    include: {
      product: {
        include: { variants: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  const config = await getStoreConfig();
  const items = rows
    .filter(r => r.product.isActive)
    .map(r => {
      const variant = r.product.variants.find(v => v.size === r.size && v.color === r.color);
      const availableStock = variant?.stock ?? 0;
      const clampedQty = Math.min(r.quantity, Math.max(1, availableStock));
      const product = serializeProduct(r.product);
      return {
        id: r.id,
        productId: r.productId,
        size: r.size,
        color: r.color,
        quantity: clampedQty,
        availableStock,
        inStock: availableStock > 0 && r.quantity <= availableStock,
        lineTotal: product.price * clampedQty,
        product,
      };
    });

  const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
  const couponResult = await validateCoupon(couponCode, subtotal);
  const discountedSubtotal = Math.max(0, subtotal - couponResult.discount);
  const shippingCharge =
    subtotal === 0
      ? 0
      : discountedSubtotal >= config.freeShippingThreshold
      ? 0
      : config.standardShippingFee;
  const total = discountedSubtotal + shippingCharge;
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  return {
    items,
    totalItems,
    subtotal,
    discount: couponResult.discount,
    couponCode: couponResult.code,
    couponMessage: couponResult.message,
    couponValid: couponResult.valid,
    shippingCharge,
    freeShippingThreshold: config.freeShippingThreshold,
    total,
    codEnabled: config.codEnabled,
  };
}
