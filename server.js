import express from "express";
import crypto from "crypto";
import cors from "cors";
import fetch from "node-fetch";
import { createClient } from "@supabase/supabase-js";

const app = express();
const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY;

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

app.use(cors());

app.use(express.json());

async function incrementSales(items = []) {
  for (const item of items) {
    const productId = item.product_id || item.id;
    const qty = item.quantity || 1;

    if (!productId) continue;

    const { error } = await supabase.rpc("increment_sales", {
      product_id: productId,
      qty,
    });

    if (error) {
      console.error("❌ Failed to increment sales:", error);
    }
  }
}

app.get("/api/esewa", (req, res) => {
  res.json({ message: "eSewa API is running. Use POST to generate signature." });
});

app.get("/", (req, res) => {
  res.send("Server is running ✅");
});

app.post("/api/esewa", (req, res) => {
  const { total, transaction_uuid, product_code } = req.body;

  if (!total || !transaction_uuid || !product_code) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  const message = `total=${String(total)},transaction_uuid=${String(transaction_uuid)},product_code=${String(product_code)}`;

  const secret = "8gBm/:&EnhH.1/q";

  const signature = crypto
    .createHmac("sha256", secret)
    .update(message)
    .digest("base64");

  console.log("MESSAGE:", message);
  console.log("SIGNATURE:", signature);

  res.json({ signature });
});


app.post("/api/khalti/initiate", async (req, res) => {
  try {
    if (!KHALTI_SECRET_KEY) {
      return res.status(500).json({ error: "Khalti secret key not configured" });
    }

    const response = await fetch(
      "https://dev.khalti.com/api/v2/epayment/initiate/",
      {
        method: "POST",
        headers: {
          "Authorization": `Key ${KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req.body),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    if (data.status === "Completed") {
      console.log("✅ Payment verified, updating sales");

      await incrementSales(req.body.items || []);
    }

    res.json(data);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Khalti initiate failed" });
  }
});

app.post("/khalti/initiate", async (req, res) => {
  console.log("🔥 Khalti initiate route HIT");

  try {
    if (!KHALTI_SECRET_KEY) {
      return res.status(500).json({ error: "Khalti secret key not configured" });
    }

    const response = await fetch(
      "https://dev.khalti.com/api/v2/epayment/initiate/",
      {
        method: "POST",
        headers: {
          "Authorization": `Key ${KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req.body),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Khalti initiate failed" });
  }
});

app.post("/api/khalti/verify", async (req, res) => {
  try {
    if (!KHALTI_SECRET_KEY) {
      return res.status(500).json({ error: "Khalti secret key not configured" });
    }

    const { pidx } = req.body;

    if (!pidx) {
      return res.status(400).json({ error: "pidx is required" });
    }

    const response = await fetch(
      "https://dev.khalti.com/api/v2/epayment/lookup/",
      {
        method: "POST",
        headers: {
          "Authorization": `Key ${KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pidx }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Khalti verification failed" });
  }
});

app.post("/khalti/verify", async (req, res) => {
  console.log("🔥 Khalti verify route HIT");

  try {
    if (!KHALTI_SECRET_KEY) {
      return res.status(500).json({ error: "Khalti secret key not configured" });
    }

    const { pidx } = req.body;

    if (!pidx) {
      return res.status(400).json({ error: "pidx is required" });
    }

    const response = await fetch(
      "https://dev.khalti.com/api/v2/epayment/lookup/",
      {
        method: "POST",
        headers: {
          "Authorization": `Key ${KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pidx }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Khalti verification failed" });
  }
});

// 🔥 eSewa verification route (SECURE)
app.post("/api/esewa/verify", async (req, res) => {
  try {
    const { oid, amt, refId } = req.body;

    if (!oid || !amt || !refId) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const verificationUrl = "https://uat.esewa.com.np/epay/transrec";

    const formData = new URLSearchParams();
    formData.append("amt", amt);
    formData.append("rid", refId);
    formData.append("pid", oid);
    formData.append("scd", "EPAYTEST"); // sandbox merchant code

    const response = await fetch(verificationUrl, {
      method: "POST",
      body: formData,
    });

    const text = await response.text();

    console.log("eSewa VERIFY RESPONSE:", text);

    if (text.includes("Success")) {
      await incrementSales(req.body.items || []);

      return res.json({
        success: true,
        transaction_id: refId,
        order_id: oid,
        amount: amt,
        raw: text,
      });
    }

    return res.json({
      success: false,
      transaction_id: refId,
      order_id: oid,
      amount: amt,
      raw: text,
    });

  } catch (error) {
    console.error("eSewa verify error:", error);
    res.status(500).json({ error: "Verification failed" });
  }
});

app.listen(3000, () => {
  console.log("🚀 Local API running on http://localhost:3000");
});