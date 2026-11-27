let cachedToken: { token: string; expiresAt: number } | null = null;

export function isShiprocketConfigured(): boolean {
  return Boolean(process.env.SHIPROCKET_EMAIL && process.env.SHIPROCKET_PASSWORD);
}

async function getShiprocketToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }
  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;
  if (!email || !password) {
    throw new Error('Shiprocket credentials (SHIPROCKET_EMAIL, SHIPROCKET_PASSWORD) are not configured.');
  }

  const res = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Shiprocket auth failed: ${text}`);
  }
  const data = (await res.json()) as { token: string };
  cachedToken = {
    token: data.token,
    expiresAt: Date.now() + 8 * 24 * 60 * 60 * 1000, // ~8 days
  };
  return data.token;
}

export async function checkPinServiceability(deliveryPincode: string, cod = false) {
  if (!/^\d{6}$/.test(deliveryPincode)) {
    return {
      serviceable: false,
      source: 'validation' as const,
      message: 'Please enter a valid 6-digit Indian PIN code.',
    };
  }

  if (!isShiprocketConfigured()) {
    // Store-level PIN code validation when Shiprocket API credentials are not yet configured
    return {
      serviceable: true,
      source: 'store-rules' as const,
      estimatedDays: 4,
      codAvailable: true,
      courierName: 'Standard Express',
      message: 'Delivery available in 3–5 business days (live Shiprocket rates require API credentials).',
    };
  }

  const token = await getShiprocketToken();
  const pickup = process.env.SHIPROCKET_PICKUP_PINCODE || '400001';
  const url = `https://apiv2.shiprocket.in/v1/external/courier/serviceability/?pickup_postcode=${pickup}&delivery_postcode=${deliveryPincode}&weight=0.5&cod=${cod ? 1 : 0}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error('Failed to check Shiprocket serviceability');
  }
  const json = await res.json();
  const couriers = json?.data?.available_courier_companies || [];
  if (couriers.length === 0) {
    return {
      serviceable: false,
      source: 'shiprocket' as const,
      message: 'Delivery is currently unavailable for this PIN code.',
    };
  }
  const best = couriers[0];
  return {
    serviceable: true,
    source: 'shiprocket' as const,
    estimatedDays: Number(best.estimated_delivery_days || 4),
    codAvailable: Boolean(best.cod),
    courierName: best.courier_name as string,
    freightCharge: Math.ceil(Number(best.rate || 0)),
    message: `Estimated delivery in ${best.estimated_delivery_days || '3-5'} days via ${best.courier_name}.`,
  };
}

export async function createShiprocketOrder(params: {
  orderNumber: string;
  orderDate: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pinCode: string;
  paymentMethod: 'RAZORPAY' | 'COD';
  subtotal: number;
  items: Array<{ name: string; sku: string; units: number; selling_price: number }>;
}) {
  if (!isShiprocketConfigured()) {
    return {
      created: false,
      reason: 'Shiprocket credentials (SHIPROCKET_EMAIL, SHIPROCKET_PASSWORD) are not configured.',
    };
  }

  const token = await getShiprocketToken();
  const res = await fetch('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      order_id: params.orderNumber,
      order_date: params.orderDate,
      pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION || 'Primary',
      billing_customer_name: params.customerName,
      billing_last_name: '',
      billing_address: params.addressLine1,
      billing_address_2: params.addressLine2 || '',
      billing_city: params.city,
      billing_pincode: params.pinCode,
      billing_state: params.state,
      billing_country: 'India',
      billing_email: params.customerEmail,
      billing_phone: params.customerPhone,
      shipping_is_billing: true,
      order_items: params.items,
      payment_method: params.paymentMethod === 'COD' ? 'COD' : 'Prepaid',
      sub_total: params.subtotal,
      length: 30,
      breadth: 25,
      height: 5,
      weight: 0.5,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || 'Shiprocket order creation failed');
  }

  return {
    created: true,
    shiprocketOrderId: String(data.order_id || ''),
    shiprocketShipmentId: String(data.shipment_id || ''),
    awbCode: data.awb_code ? String(data.awb_code) : undefined,
    courierName: data.courier_name ? String(data.courier_name) : undefined,
  };
}
