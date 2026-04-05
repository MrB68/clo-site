import * as crypto from "crypto";

export default function handler(req: any, res: any) {
  // ✅ Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const { total_amount, transaction_uuid, product_code } = body;

  console.log("REQ BODY:", req.body);

  // ❗ Safety check
  if (!total_amount || !transaction_uuid || !product_code) {
    return res.status(400).json({ error: "Missing parameters" });
  }


  const message = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;

  const secret = process.env.ESEWA_SECRET;

  if (!secret) {
    return res.status(500).json({ error: "Missing ESEWA_SECRET" });
  }

  const signature = crypto
    .createHmac("sha256", secret)
    .update(message)
    .digest("base64");

  console.log("MESSAGE:", message);
  console.log("SIGNATURE:", signature);

  return res.status(200).json({ signature });
}