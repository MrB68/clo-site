import * as crypto from "crypto";

export default function handler(req: any, res: any) {
  // ✅ Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { total_amount, transaction_uuid } = req.body;

  // ❗ Safety check
  if (!total_amount || !transaction_uuid) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  const product_code = "EPAYTEST";

  const message = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;

  const secret = process.env.ESEWA_SECRET;

  if (!secret) {
    return res.status(500).json({ error: "Missing ESEWA_SECRET" });
  }

  const signature = crypto
    .createHmac("sha256", secret)
    .update(message)
    .digest("base64");

  return res.status(200).json({ signature });
}