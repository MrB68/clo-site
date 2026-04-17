import * as crypto from "crypto";
import fetch from "node-fetch";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

  // 🔥 CASE 1: VERIFY PAYMENT (after redirect)
  if (body.oid && body.amt && body.refId) {
    const { oid, amt, refId } = body;

    try {
      const verifyUrl = `https://uat.esewa.com.np/epay/transrec?amt=${amt}&rid=${refId}&pid=${oid}&scd=EPAYTEST`;

      const response = await fetch(verifyUrl);
      const text = await response.text();

      console.log("ESEWA VERIFY RESPONSE:", text);

      if (text.includes("Success")) {
        return res.status(200).json({ success: true });
      } else {
        return res.status(400).json({ success: false });
      }
    } catch (error) {
      console.error("Verification error:", error);
      return res.status(500).json({ error: "Verification failed" });
    }
  }

  // 🔥 CASE 2: GENERATE SIGNATURE (before payment)
  const { total, transaction_uuid, product_code } = body;

  if (!total || !transaction_uuid || !product_code) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  const message = `total=${String(total)},transaction_uuid=${String(transaction_uuid)},product_code=${String(product_code)}`;

  const secret = process.env.ESEWA_SECRET;

  if (!secret) {
    return res.status(500).json({ error: "Missing ESEWA_SECRET" });
  }

  const signature = crypto
    .createHmac("sha256", secret)
    .update(message)
    .digest("base64");

  console.log("SIGNATURE:", signature);

  return res.status(200).json({ signature });
}