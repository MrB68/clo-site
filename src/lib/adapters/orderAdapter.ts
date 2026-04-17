export const normalizeOrder = (o: any) => ({
  ...o,
  customerName: o.customer_name,
  customerEmail: o.customer_email,
  date: o.created_at,
  shippingAddress: o.address,
});