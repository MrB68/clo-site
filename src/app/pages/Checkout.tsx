import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { useProducts } from "../contexts/ProductsContext";
// import { getPromoCodes, type DiscountOption } from "../utils/promoCodes";
type DiscountOption = any;
import { supabase } from "../../lib/supabase";
import { getCustomerProfile } from "../utils/customerProfile";
import { nepalLocations } from "../utils/nepalLocations";

interface StoredCartItem {
  productId?: string | { id?: string };
  quantity?: number;
  selectedSize?: string;
  selectedColor?: string;
  size?: string;
  color?: string;
  product?: {
    id?: string;
    sizes?: string[];
    colors?: string[];
  };
}

interface CheckoutItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
  image: string;
}

interface CheckoutFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  province: string;
  district: string;
  city: string;
  area: string;
  wardNumber: string;
  landmark: string;
  address: string;
  postalCode: string;
  paymentMethod: "esewa" | "cod";
}

type CheckoutField =
  | "firstName"
  | "lastName"
  | "email"
  | "phone"
  | "province"
  | "district"
  | "city"
  | "area"
  | "wardNumber"
  | "landmark"
  | "address"
  | "postalCode";

type CheckoutFieldErrors = Partial<Record<CheckoutField, string>>;

function getStoredCartItems(): Array<{
  productId: string;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}> {
  const savedCart = localStorage.getItem("cartItems");
  if (!savedCart) {
    return [];
  }

  try {
    const parsed = JSON.parse(savedCart);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((item: StoredCartItem) => {
        const productId =
          typeof item.productId === "string"
            ? item.productId
            : item.productId?.id ?? item.product?.id;

        if (!productId) {
          return null;
        }

        return {
          productId,
          quantity:
            typeof item.quantity === "number" && item.quantity > 0
              ? item.quantity
              : 1,
          selectedSize:
            item.selectedSize ?? item.size ?? item.product?.sizes?.[0] ?? "One Size",
          selectedColor:
            item.selectedColor ?? item.color ?? item.product?.colors?.[0] ?? "Default",
        };
      })
      .filter(
        (
          item
        ): item is {
          productId: string;
          quantity: number;
          selectedSize: string;
          selectedColor: string;
        } => item !== null
      );
  } catch {
    return [];
  }
}

export function Checkout() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { user } = useAuth();
const orderCodeFromUrl = params.get("order_id");
const customOrderId = params.get("orderId");
const isCustomOrder = params.get("custom") === "true";

// ✅ STRICT payment validation
const paymentStatus = params.get("payment") || (window.location.pathname.includes("payment-success") ? "success" : null);
const paidOrderIdFromUrl = params.get("orderId") || params.get("order_id");
const storedPaidOrderId = localStorage.getItem("paidOrderId");

const isPaymentSuccess =
  paymentStatus === "success" &&
  (paidOrderIdFromUrl || storedPaidOrderId || orderCodeFromUrl);
  const [orderProcessed, setOrderProcessed] = useState(false);

  useEffect(() => {
    if (!user) return;
  }, [user]);

  const { products } = useProducts();
  const [step, setStep] = useState<"shipping" | "payment" | "review" | "success">("shipping");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);


  useEffect(() => {
    setStep("shipping");
  }, []);
  const [formData, setFormData] = useState<CheckoutFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    province: "",
    district: "",
    address: "",
    city: "",
    area: "",
    wardNumber: "",
    landmark: "",
    postalCode: "",
    paymentMethod: "cod",
  });
  const [storedCartItems, setStoredCartItems] = useState(() => getStoredCartItems());
  const [promoCode, setPromoCode] = useState("");
  const [appliedDiscountCode, setAppliedDiscountCode] = useState("");
  const [promoCodeError, setPromoCodeError] = useState("");
  const [shippingErrors, setShippingErrors] = useState<CheckoutFieldErrors>({});
  const [discountOptions, setDiscountOptions] = useState<DiscountOption[]>([]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const storedProfile = getCustomerProfile(user.id);
    const nameParts = (user.name || "").trim().split(/\s+/);

    setFormData((current) => ({
      ...current,
      firstName:
        storedProfile?.firstName ||
        current.firstName ||
        nameParts[0] ||
        "",
      lastName:
        storedProfile?.lastName ||
        current.lastName ||
        nameParts.slice(1).join(" "),
      email: storedProfile?.email || current.email || user.email,
      phone: storedProfile?.phone || current.phone,
      province: storedProfile?.province || current.province,
      district: storedProfile?.district || current.district,
      city: storedProfile?.city || current.city,
      area: storedProfile?.area || current.area,
      wardNumber: storedProfile?.wardNumber || current.wardNumber,
      landmark: storedProfile?.landmark || current.landmark,
      address: storedProfile?.address || current.address,
      postalCode: storedProfile?.postalCode || current.postalCode,
    }));
  }, [user]);

  useEffect(() => {
    const syncCart = () => {
      setStoredCartItems(getStoredCartItems());
    };

    syncCart();
    window.addEventListener("cartUpdated", syncCart);
    window.addEventListener("storage", syncCart);

    return () => {
      window.removeEventListener("cartUpdated", syncCart);
      window.removeEventListener("storage", syncCart);
    };
  }, []);


  useEffect(() => {
    const fetchPromoCodes = async () => {
      const { data, error } = await supabase
        .from("promo_codes")
        .select("*");

      if (error) {
        console.error("Promo fetch error:", error);
        return;
      }

      // map DB → UI format
      const mapped = (data || []).map((p: any) => ({
        code: p.code,
        label: p.label ?? p.code ?? "PROMO",
        description: p.description ?? "",
        type: p.type ?? p.discount_type ?? "percent",
        value: Number(p.value ?? p.discount_value ?? 0),
        showInCheckout: p.show_in_checkout ?? false,
      }));

      setDiscountOptions(mapped);
    };

    fetchPromoCodes();
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    const syncProfile = () => {
      const storedProfile = getCustomerProfile(user.id);
      if (!storedProfile) {
        return;
      }

      setFormData((current) => ({
        ...current,
        ...storedProfile,
      }));
    };

    window.addEventListener("customerProfileUpdated", syncProfile);
    window.addEventListener("storage", syncProfile);

    return () => {
      window.removeEventListener("customerProfileUpdated", syncProfile);
      window.removeEventListener("storage", syncProfile);
    };
  }, [user]);

  const cartItems: CheckoutItem[] = storedCartItems
  
    .map((item) => {
      const product = products.find((entry) => entry.id === item.productId);

      if (!product) {
        return null;
      }

      return {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        size: item.selectedSize,
        color: item.selectedColor,
        image: product.image ?? "",
      };
    })
    .filter((item): item is CheckoutItem => item !== null);

    // 🔥 CUSTOM ORDER SUPPORT
const isCustomCheckout = params.get("custom") === "true";

const customOrder = isCustomCheckout
  ? JSON.parse(localStorage.getItem("customCheckoutOrder") || "null")
  : null;

const checkoutItems: CheckoutItem[] = isCustomCheckout
  ? [
      {
        id: customOrder?.id || "custom",
        name: "Custom Design Order",
        price:
          customOrder?.approved_price ??
          customOrder?.total ??
          0,
        quantity: 1,
        size: "Custom",
        color: "Custom",
        // ✅ FIX: show uploaded custom design image
        image:
          customOrder?.design_images?.[0] ||
          customOrder?.image_urls?.[0] ||
          customOrder?.image_url ||
          "",
      },
    ]
  : cartItems;

  const subtotal = checkoutItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const valleyDistricts = ["Kathmandu", "Lalitpur", "Bhaktapur"];

  let baseShipping = 0;

  if (valleyDistricts.includes(formData.district)) {
    baseShipping = 0;
  } else {
    baseShipping = subtotal > 5000 ? 500 : 1000;
  }
  const appliedDiscount = discountOptions?.length
  ? discountOptions.find(
      (option) =>
        option.code?.toUpperCase() === appliedDiscountCode?.toUpperCase()
    )
  : null;
  const visibleDiscountOptions = discountOptions.filter(
    (option) => option.showInCheckout
  );
  const discountAmount = (() => {
    if (!appliedDiscount) return 0;

    const value = parseFloat(appliedDiscount.value) || 0;
    const type = appliedDiscount.type;

    if (type === "percent") {
      return Math.round(subtotal * (value / 100));
    }

    if (type === "flat") {
      return Math.min(value, subtotal);
    }

    if (type === "shipping") {
      return baseShipping;
    }

    return 0;
  })();
  const shipping =
    appliedDiscount?.type === "shipping" ? 0 : baseShipping;
  // const tax = Math.round(subtotal * 0.13); // Re-enable when VAT is integrated
  const tax = 0;
  const total = Math.max(0, subtotal + shipping + tax - discountAmount);
  const assignedBranch =
    formData.province === "Gandaki"
      ? "Gandaki Branch"
      : formData.province === "Bagmati"
        ? "Bagmati Branch"
        : "Head Office";

  const provinceOptions = Object.keys(nepalLocations);
  const districtOptions = formData.province
    ? nepalLocations[formData.province]?.districts ?? []
    : [];
  const cityOptions = formData.province
    ? nepalLocations[formData.province]?.cities ?? []
    : [];
  //const cashOnDeliveryDistricts = new Set(["Kathmandu", "Lalitpur", "Bhaktapur"]);
  //const isCashOnDeliveryAvailable = cashOnDeliveryDistricts.has(formData.district);
  // 🔥 TEMP: allow COD everywhere (disabled restriction for deployment)
  const isCashOnDeliveryAvailable = true;
/*//temporary disable COD restriction for deployment, re-enable when ready    
  useEffect(() => {
    if (!isCashOnDeliveryAvailable && formData.paymentMethod === "cod") {
      setFormData((current) => ({
        ...current,
        paymentMethod: "esewa",
      }));
    }
  }, [formData.paymentMethod, isCashOnDeliveryAvailable]);
*/
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (shippingErrors[name as CheckoutField]) {
      setShippingErrors((prev) => ({ ...prev, [name]: "" }));
    }

    setFormData((prev) => {
      if (name === "province") {
        return {
          ...prev,
          province: value,
          district: "",
          city: "",
          area: "",
        };
      }

      return { ...prev, [name]: value };
    });
  };

  const validateShippingForm = () => {
    const nextErrors: CheckoutFieldErrors = {};

    if (!formData.firstName.trim()) nextErrors.firstName = "First name is required.";
    if (!formData.lastName.trim()) nextErrors.lastName = "Last name is required.";

    if (!formData.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!formData.phone.trim()) {
      nextErrors.phone = "Phone number is required.";
    } else if (!/^9\d{9}$/.test(formData.phone)) {
      nextErrors.phone = "Enter a valid Nepali mobile number.";
    }

    if (!formData.province) nextErrors.province = "Select a province.";
    if (!formData.district) nextErrors.district = "Select a district.";
    if (!formData.city) nextErrors.city = "Select a city or municipality.";
    if (!formData.area.trim()) nextErrors.area = "Area / Tole is required.";

    if (!formData.wardNumber.trim()) {
      nextErrors.wardNumber = "Ward number is required.";
    } else {
      const wardNumber = Number(formData.wardNumber);
      if (!Number.isInteger(wardNumber) || wardNumber < 1 || wardNumber > 32) {
        nextErrors.wardNumber = "Ward number must be between 1 and 32.";
      }
    }

    if (!formData.address.trim()) nextErrors.address = "House / Street address is required.";
    if (!formData.landmark.trim()) nextErrors.landmark = "Nearest landmark is required.";

    if (formData.postalCode.trim() && !/^\d{5}$/.test(formData.postalCode)) {
      nextErrors.postalCode = "Postal code must be a 5-digit number.";
    }

    setShippingErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      toast.error("Please correct the highlighted checkout fields");
      return false;
    }

    return true;
  };

  const handleShippingSubmit = () => {
    // 🚫 Block if not signed in
    //if (!user) {
     // toast.error("Please sign in to continue checkout");
     // return;
   // }

    if (validateShippingForm()) {
      setStep("payment");
    }
  };

  const applyDiscountCode = async (code: string) => {
    const normalizedCode = code.trim().toUpperCase();

    if (!normalizedCode) {
      setPromoCodeError("Please enter a promo code.");
      toast.error("Enter a promo code");
      return;
    }

    let data: any = null;
    let error: any = null;
    try {
      const res = await supabase
        .from("promo_codes")
        .select("*")
        .eq("code", normalizedCode)
        .single();
      data = res.data;
      error = res.error;
    } catch (e) {
      console.warn("Promo fetch failed", e);
    }

    if (error || !data) {
      setPromoCodeError("Invalid promo code");
      toast.error("Invalid promo code");
      return;
    }

    // 🔒 STEP 2: prevent reuse
    if (user) {
      if (!user?.id || !user?.email) {
        console.warn("User info missing for promo validation");
      }
      // Safer user_id check
      let usage: any[] = [];
      try {
        let res = await supabase
          .from("promo_usages")
          .select("id")
          .eq("promo_code", normalizedCode)
          .eq("user_id", user.id);
        usage = res.error ? [] : res.data || [];
      } catch (e) {
        console.warn("Promo usage check skipped (user_id)");
      }

      // Fallback: check by email if not found by user_id
      let usageByEmail: any[] = [];
      if (user.email) {
        try {
          let res = await supabase
            .from("promo_usages")
            .select("id")
            .eq("promo_code", normalizedCode)
            .eq("customeremail", user.email?.toLowerCase());
          usageByEmail = res.error ? [] : res.data || [];
        } catch (e) {
          console.warn("Promo usage check skipped (email)");
        }
      }

      const finalUsage = [...(usage || []), ...usageByEmail];
      if (finalUsage.length > 0) {
        setPromoCodeError("You have already used this promo code");
        toast.error("Promo already used");
        return;
      }
    }

    if (data.expiry_date && new Date(data.expiry_date) < new Date()) {
      setPromoCodeError("Promo code expired");
      toast.error("Promo expired");
      return;
    }

    if (data.usage_limit && data.used_count >= data.usage_limit) {
      setPromoCodeError("Promo usage limit reached");
      toast.error("Promo limit reached");
      return;
    }

    // 🔒 STEP 3: enforce per-user usage limit using orders table
    if (user?.id && data.user_usage_limit) {
      try {
        const { data: userOrders, error: userOrderErr } = await supabase
          .from("orders")
          .select("id")
          .eq("user_id", user.id)
          .eq("promo_code", normalizedCode);

        if (!userOrderErr) {
          const usageCount = userOrders?.length || 0;

          if (usageCount >= data.user_usage_limit) {
            setPromoCodeError(`You can only use this promo ${data.user_usage_limit} times`);
            toast.error("Promo usage limit reached for this user");
            return;
          }
        }
      } catch (err) {
        console.warn("User promo usage check failed", err);
      }
    }

    // 🔒 STEP 4: enforce global usage via orders table (source of truth)
    try {
      const { data: allOrders, error: globalErr } = await supabase
        .from("orders")
        .select("id")
        .eq("promo_code", normalizedCode);

      if (!globalErr) {
        const totalUsage = allOrders?.length || 0;

        if (data.usage_limit && totalUsage >= data.usage_limit) {
          setPromoCodeError("Promo usage limit reached");
          toast.error("Promo limit reached");
          return;
        }
      }
    } catch (err) {
      console.warn("Global promo usage check failed", err);
    }

    setPromoCodeError("");
    setAppliedDiscountCode(data.code);
    console.log("APPLIED PROMO FULL:", data);
    setPromoCode(data.code);

    toast.success(`${data.label ?? data.code ?? "Promo"} applied`);
  };

  const removeDiscountCode = () => {
    setAppliedDiscountCode("");
    setPromoCode("");
    setPromoCodeError("");
    toast.success("Discount removed");
  };

  const handlePaymentSubmit = () => {
    if (isProcessingPayment) return;

   // if (!user) {
    //  toast.error("Please sign in to continue checkout");
    //  return;
   /// }

    if (checkoutItems.length === 0) {
      toast.error("Your cart is empty");
      navigate("/shop");
      return;
    }

    setIsProcessingPayment(true);

    if (formData.paymentMethod === "esewa") {
      initiateEsewaPayment();
      return;
    }

    // if (formData.paymentMethod === "nepalpay") {
    //   initiateNepalPayPayment();
    //   return;
    // }

    setStep("review");
    setIsProcessingPayment(false);
  };

// const initiateNepalPayPayment = async () => {
//   try {
//     const transaction_uuid = `ORDER-${Date.now()}`;
//
//     const response = await fetch("http://localhost:3000/nepalpay/initiate", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         amount: total,
//         order_id: transaction_uuid,
//       }),
//     });
//
//     const data = await response.json();
//
//     if (!data.qr_code_url) {
//       throw new Error("QR not generated");
//     }
//
//     window.open(data.qr_code_url, "_blank");
//
//     setStep("review");
//     setIsProcessingPayment(false);
//
//   } catch (err) {
//     console.error(err);
//     toast.error("NepalPay initiation failed");
//     setIsProcessingPayment(false);
//   }
// };

 const initiateEsewaPayment = async () => {
  try {
    const totalRounded = Math.round(total);
    const transaction_uuid: string =
      isCustomOrder && customOrderId
        ? customOrderId
        : crypto.randomUUID();
    const product_code = "EPAYTEST";

    // 🔒 STOCK VALIDATION (prevent overselling)
    for (const item of cartItems) {
      const { data: product, error: stockErr } = await supabase
        .from("products")
        .select("stock")
        .eq("id", item.id)
        .single();

      if (stockErr || !product) {
        toast.error(`Failed to verify stock for ${item.name}`);
        setIsProcessingPayment(false);
        return;
      }

      const currentStock = Number(product.stock || 0);
      if (currentStock < item.quantity) {
        toast.error(`Only ${currentStock} left for ${item.name}`);
        setIsProcessingPayment(false);
        return;
      }
    }

    // 🔥 STORE ORDER SNAPSHOT BEFORE ESEWA REDIRECT
    localStorage.setItem(
      "pendingOrderData",
      JSON.stringify({
        transaction_uuid,
        items: checkoutItems,
        pricing: {
          subtotal,
          discount_amount: discountAmount || 0,
          promo_code: appliedDiscountCode || null,
          shipping_cost: shipping || 0,
          total: totalRounded,
        },
        customer: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          area: formData.area,
          city: formData.city,
          district: formData.district,
          province: formData.province,
          wardNumber: formData.wardNumber,
          landmark: formData.landmark,
          postalCode: formData.postalCode,
        },
      })
    );

    // ✅ GET SIGNATURE
    const response = await fetch("http://localhost:3000/api/esewa", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        total_amount: totalRounded,
        transaction_uuid,
        product_code,
      }),
    });

    const data = await response.json();

    if (!data.signature) {
      throw new Error("Signature missing");
    }

    // ✅ REDIRECT TO ESEWA
    const form = document.createElement("form");
    form.method = "POST";
    form.action = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
    form.target = "_self";

    const fields = {
      amount: totalRounded.toString(),
      tax_amount: "0",
      total_amount: totalRounded.toString(),
      transaction_uuid,
      product_code,
      product_service_charge: "0",
      product_delivery_charge: "0",
      success_url: `${window.location.origin}/checkout?payment=success&order_id=${transaction_uuid}&method=esewa`,
      failure_url: `${window.location.origin}/payment-failure`,
      signed_field_names: "total_amount,transaction_uuid,product_code",
      signature: data.signature,
    };

    Object.entries(fields).forEach(([key, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = value;
      form.appendChild(input);
    });

    // Store order ID in localStorage before redirect
    if (transaction_uuid) {
      localStorage.setItem("paidOrderId", transaction_uuid);
    }

    document.body.appendChild(form);
    form.submit();

    // If redirect fails, reset processing after timeout
    setTimeout(() => {
      setIsProcessingPayment(false);
    }, 5000);

  } catch (err) {
    console.error(err);
    toast.error("Payment failed");
    setIsProcessingPayment(false);
  }
};

  const finalizeOrder = async () => {
    if (orderProcessed && formData.paymentMethod !== "esewa") {
      console.log("🚫 Order already processed, skipping");
      return;
    }
    try {
      // 🔥 USE STORED DATA IN finalizeOrder (CRITICAL FIX)
      let storedOrder = JSON.parse(localStorage.getItem("pendingOrderData") || "null");

      // 🔥 FIX: rebuild snapshot if missing (handles eSewa redirect/state loss)
      if (!storedOrder || !storedOrder.pricing || !storedOrder.customer) {
        console.warn("⚠️ Missing snapshot → rebuilding from current state");

        storedOrder = {
          transaction_uuid:
            orderCodeFromUrl ||
            paidOrderIdFromUrl ||
            localStorage.getItem("paidOrderId") ||
            `ORDER-${Date.now()}`,

          items: checkoutItems,

          pricing: {
            subtotal,
            discount_amount: discountAmount || 0,
            promo_code: appliedDiscountCode || null,
            shipping_cost: shipping || 0,
            total,
          },

          customer: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            area: formData.area,
            city: formData.city,
            district: formData.district,
            province: formData.province,
            wardNumber: formData.wardNumber,
            landmark: formData.landmark,
            postalCode: formData.postalCode,
          },
        };

        // restore snapshot so rest of flow stays consistent
        localStorage.setItem("pendingOrderData", JSON.stringify(storedOrder));
      }
      const pricing = storedOrder.pricing || {};
      const customer = storedOrder.customer || {};

      // 🔒 FINAL PROMO ENFORCEMENT (server-truth via orders table)
      if (pricing.promo_code) {
        const normalizedCode = String(pricing.promo_code).trim().toUpperCase();

        try {
          // fetch promo config
          const { data: promo, error: promoErr } = await supabase
            .from("promo_codes")
            .select("code, usage_limit, user_usage_limit, expiry_date")
            .eq("code", normalizedCode)
            .single();

          if (promoErr || !promo) {
            toast.error("Promo invalid or unavailable");
            return;
          }

          // expiry check
          if (promo.expiry_date && new Date(promo.expiry_date) < new Date()) {
            toast.error("Promo expired");
            return;
          }

          // global usage via orders table
          const { data: allOrders, error: globalErr } = await supabase
            .from("orders")
            .select("id")
            .eq("promo_code", normalizedCode);

          if (!globalErr) {
            const totalUsage = allOrders?.length || 0;
            if (promo.usage_limit && totalUsage >= promo.usage_limit) {
              toast.error("Promo usage limit reached");
              return;
            }
          }

          // per-user usage via orders table
          if (user?.id && promo.user_usage_limit) {
            const { data: userOrders, error: userErr } = await supabase
              .from("orders")
              .select("id")
              .eq("user_id", user.id)
              .eq("promo_code", normalizedCode);

            if (!userErr) {
              const usageCount = userOrders?.length || 0;
              if (usageCount >= promo.user_usage_limit) {
                toast.error("Promo usage limit reached for this user");
                return;
              }
            }
          }
        } catch (e) {
          console.warn("Finalize promo enforcement failed", e);
        }
      }
      const storedForm = storedOrder?.formData || {};

      // --- SAFETY LOGS ---
      let orderId =
        paidOrderIdFromUrl ||
        orderCodeFromUrl ||
        localStorage.getItem("paidOrderId") ||
        customOrderId;

      // 🔥 FIX: fallback to stored pending order
      if (!orderId) {
        const stored = JSON.parse(localStorage.getItem("pendingOrderData") || "{}");

        if (stored?.transaction_uuid) {
          orderId = stored.transaction_uuid;
        }
      }

      // 🔥 FINAL FALLBACK (never fail order creation)
      if (!orderId) {
        console.warn("⚠️ No orderId found → generating fallback");
        orderId = `ORDER-${Date.now()}`;
      }

      orderId = String(orderId).split("?")[0];
      console.log("FINALIZE ORDER TRIGGERED");
      console.log("ORDER ID USED:", orderId);
      console.log("STORED ORDER DATA:", storedOrder);

      // ✅ fallback for COD / NepalPay
      if (formData.paymentMethod === "cod" && !isCustomOrder) {
        // --- Ensure snapshot exists before COD insert ---
        if (!localStorage.getItem("pendingOrderData")) {
          localStorage.setItem(
            "pendingOrderData",
            JSON.stringify({
              transaction_uuid: orderId,
              items: checkoutItems,
              pricing: {
                subtotal,
                discount_amount: discountAmount || 0,
                promo_code: appliedDiscountCode || null,
                shipping_cost: shipping || 0,
                total,
              },
              customer: {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                area: formData.area,
                city: formData.city,
                district: formData.district,
                province: formData.province,
                wardNumber: formData.wardNumber,
                landmark: formData.landmark,
                postalCode: formData.postalCode,
              },
            })
          );
        }

        console.log("CREATING COD ORDER");
        const orderCode = `ORDER-${Date.now()}`;
        orderId = crypto.randomUUID();

        const formattedShippingAddress = [
          `${customer.address}, Ward ${customer.wardNumber}`,
          `${customer.area}, ${customer.city}`,
          `${customer.district}, ${customer.province}`,
          `Landmark: ${customer.landmark}`,
          customer.postalCode ? `Postal Code: ${customer.postalCode}` : "",
          `Phone: ${customer.phone}`,
        ].filter(Boolean).join(", ");

        // Ensure user is not null before accessing user?.id
        //if (!user) {
         // toast.error("Please sign in to continue checkout");
          //return;
       // }
        const { error } = await supabase.from("orders").insert([
          {
            id: orderId,
            order_code: orderCode,
           // user_id: user?.id || null,
           user_id: user?.id ?? null,

            customer_name: `${customer.firstName || ""} ${customer.lastName || ""}`,
            customer_email: (customer.email || "").toLowerCase(),

            // 🔥 ADD COMPLETE BILL DATA
            subtotal: pricing.subtotal || 0,
            discount_amount: pricing.discount_amount || 0,
            promo_code: pricing.promo_code || null,
            shipping_cost: pricing.shipping_cost || 0,
            total: pricing.total || 0,
            items: JSON.parse(JSON.stringify(storedOrder.items || checkoutItems)),

            address: formattedShippingAddress,
            status: "pending",
            payment_status: "pending",
            payment_method: "cod",

            branch: assignedBranch,
            created_at: new Date().toISOString(),
          },
        ]);
        if (error) {
          console.error("SUPABASE INSERT ERROR:", error);
          throw error;
        }
        // Set processed after successful insert
        setOrderProcessed(true);
      }
      else if (formData.paymentMethod === "cod") {
        console.log("COD already handled");
      }

      // ✅ CREATE ORDER ONLY AFTER SUCCESSFUL ESEWA PAYMENT
      if (isPaymentSuccess && !isCustomOrder) {
        // 🔒 ensure user is available (critical for My Orders)
        let activeUser = user;

        if (!activeUser?.id) {
          const { data } = await supabase.auth.getUser();
          activeUser = data?.user as any;
        }

        if (!activeUser?.id) {
          console.error("❌ User not found during eSewa finalize — aborting");
          toast.error("Session expired. Please login again.");
          return;
        }
        // 🔒 PREVENT DUPLICATE ORDER CREATION (safer limit(1) to avoid cache issues)
        const { data: existingOrders } = await supabase
          .from("orders")
          .select("id")
          .eq("order_code", orderId)
          .limit(1);

        const existingOrder = existingOrders && existingOrders.length > 0 ? existingOrders[0] : null;

        if (existingOrder) {
          console.log("⚠️ Order already exists — skipping insert");
          setOrderProcessed(true);
          return;
        }

        const formattedShippingAddress = [
          `${customer.address}, Ward ${customer.wardNumber}`,
          `${customer.area}, ${customer.city}`,
          `${customer.district}, ${customer.province}`,
          `Landmark: ${customer.landmark}`,
          customer.postalCode ? `Postal Code: ${customer.postalCode}` : "",
          `Phone: ${customer.phone}`,
        ].filter(Boolean).join(", ");

        const { error } = await supabase.from("orders").insert([
          {
            id: crypto.randomUUID(),
            order_code: orderId,
            user_id: activeUser.id,
            customer_name: `${customer.firstName || ""} ${customer.lastName || ""}`,
            customer_email: (customer.email || "").toLowerCase(),
            // 🔥 ADD COMPLETE BILL DATA
            subtotal: pricing.subtotal || 0,
            discount_amount: pricing.discount_amount || 0,
            promo_code: pricing.promo_code || null,
            shipping_cost: pricing.shipping_cost || 0,
            total: pricing.total || 0,
            items: JSON.parse(JSON.stringify(storedOrder.items || checkoutItems)),
            address: formattedShippingAddress,
            status: "processing",
            payment_status: "paid",
            payment_method: "esewa",
            branch: assignedBranch,
            created_at: new Date().toISOString(),
          },
        ]);
        if (error) {
          console.error("SUPABASE INSERT ERROR:", error);
          throw error;
        }
        // Set processed after successful insert
        setOrderProcessed(true);
      }

      // For custom orders only → update after payment
      if (orderId && isCustomOrder) {
        const { error: updateError } = await supabase
          .from("orders")
          .update({
            status: "paid",
            payment_status: "paid",
          })
          .eq("id", orderId as string);

        if (updateError) {
          console.error(updateError);
          toast.error("Failed to confirm payment");
          return;
        }
      }

      // 📦 REDUCE STOCK AFTER ORDER CONFIRMATION
      for (const item of storedOrder.items || []) {
        const { data: product } = await supabase
          .from("products")
          .select("stock")
          .eq("id", item.id)
          .single();

        const currentStock = Number(product?.stock || 0);
        const newStock = Math.max(0, currentStock - item.quantity);

        await supabase
          .from("products")
          .update({ stock: newStock })
          .eq("id", item.id);
      }


      // Track promo usage if discount code applied and user present
      if (pricing.promo_code && user?.id) {
        const { error } = await supabase.from("promo_usages").insert([
          {
            promo_code: pricing.promo_code,
            user_id: user.id,
            customeremail: user.email?.toLowerCase() || null,
          },
        ]);

        if (error) {
          console.error("PROMO USAGE INSERT ERROR:", error);
        }
      }

      toast.success("Order placed successfully");
      localStorage.removeItem("cartItems");
      window.dispatchEvent(new Event("cartUpdated"));
      setStoredCartItems([]);
      setAppliedDiscountCode("");
      setPromoCode("");
      setOrderPlaced(true);
      setStep("success");
      setIsProcessingPayment(false);
      // 🔥 CLEAR STORED DATA AFTER SUCCESS
      localStorage.removeItem("pendingOrderData");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  useEffect(() => {
    if (!isPaymentSuccess || orderProcessed) return;

    const run = async () => {
      console.log("✅ PAYMENT SUCCESS DETECTED");

      // 🚨 ALWAYS CLEAR old flag before running

      await finalizeOrder();
      // mark as finalized AFTER success
      setOrderProcessed(true); // 🔥 prevent duplicate run
      setOrderPlaced(true);

      // cleanup
      localStorage.removeItem("paymentSuccess");
      localStorage.removeItem("paidOrderId");

      setStep("success");
    };

    run();
  }, [isPaymentSuccess, orderProcessed]);

  if (products.length === 0) {
    return <div className="pt-20 text-center">Loading...</div>;
  }

  if (checkoutItems.length === 0 && step !== "success") {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center px-4 bg-black text-white">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-semibold">Your checkout is empty</h2>
          <p className="text-gray-400">Add items to your cart before proceeding.</p>
          <button
            type="button"
            onClick={() => window.location.assign("/shop")}
            className="inline-flex items-center justify-center bg-black text-white px-8 py-4"
          >
            Go to Shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-black text-white">
      {/* Sign-in or Guest Choice Banner */}
      {!user && (
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="border border-gray-300 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm">
              You are not signed in. Sign in for faster checkout.
            </p>
            <button
              onClick={() => navigate("/signin")}
              className="px-4 py-2 border border-black text-black hover:bg-black hover:text-white transition text-sm"
            >
              Sign In
            </button>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="bg-black text-white py-8 sm:py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 mb-4 hover:opacity-70 transition"
          >
            <ArrowLeft size={18} />
            Back
          </button>
          <h1 className="text-3xl sm:text-4xl tracking-wider">CHECKOUT</h1>
        </div>
      </div>

      {/* Progress indicator */}
        <div className="border-b border-gray-800 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center text-xs sm:text-sm">
          {[
            { key: "shipping", label: "Shipping" },
            { key: "payment", label: "Payment" },
            { key: "review", label: "Review" },
          ].map((s, idx) => (
            <div key={s.key} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
                  (step === s.key || ["shipping", "payment", "review"].indexOf(step) > idx)
                    ? "bg-black text-white"
                    : "bg-gray-200 text-gray-400"
                }`}
              >
                {["shipping", "payment", "review"].indexOf(step) > idx ? <CheckCircle2 size={18} /> : idx + 1}
              </div>
              <span className="hidden sm:inline">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left - Form */}
        <div className="lg:col-span-2 space-y-8">
          {/* Shipping Form */}
          {step === "shipping" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h2 className="text-2xl font-semibold">Shipping Information</h2>
              <p className="text-sm text-gray-400">Fields marked with <span className="text-red-600">*</span> are required.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm">First Name <span className="text-red-600">*</span></label>
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`w-full border px-4 py-3 text-sm focus:outline-none transition ${shippingErrors.firstName ? "border-red-500" : "border-gray-300 focus:border-black"}`}
                  />
                  {shippingErrors.firstName && <p className="mt-1 text-sm text-red-600">{shippingErrors.firstName}</p>}
                </div>
                <div>
                  <label className="mb-2 block text-sm">Last Name <span className="text-red-600">*</span></label>
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`w-full border px-4 py-3 text-sm focus:outline-none transition ${shippingErrors.lastName ? "border-red-500" : "border-gray-300 focus:border-black"}`}
                  />
                  {shippingErrors.lastName && <p className="mt-1 text-sm text-red-600">{shippingErrors.lastName}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm">Email <span className="text-red-600">*</span></label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full border px-4 py-3 text-sm focus:outline-none transition ${shippingErrors.email ? "border-red-500" : "border-gray-300 focus:border-black"}`}
                  />
                  {shippingErrors.email && <p className="mt-1 text-sm text-red-600">{shippingErrors.email}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm">Phone Number <span className="text-red-600">*</span></label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="98XXXXXXXX"
                    value={formData.phone}
                    onChange={handleInputChange}
                    inputMode="numeric"
                    maxLength={10}
                    className={`w-full border px-4 py-3 text-sm focus:outline-none transition ${shippingErrors.phone ? "border-red-500" : "border-gray-300 focus:border-black"}`}
                  />
                  {shippingErrors.phone && <p className="mt-1 text-sm text-red-600">{shippingErrors.phone}</p>}
                </div>
                <div>
                  <label className="mb-2 block text-sm">Province <span className="text-red-600">*</span></label>
                  <select
                    name="province"
                    value={formData.province}
                    onChange={handleInputChange}
                    className={`w-full border px-4 py-3 text-sm focus:outline-none transition bg-black text-white border-gray-700 focus:border-white ${shippingErrors.province ? "border-red-500" : ""}`}
                  >
                    <option value="">Select Province</option>
                    {provinceOptions.map((province) => (
                      <option key={province} value={province}>{province}</option>
                    ))}
                  </select>
                  {shippingErrors.province && <p className="mt-1 text-sm text-red-600">{shippingErrors.province}</p>}
                </div>
                <div>
                  <label className="mb-2 block text-sm">District <span className="text-red-600">*</span></label>
                  <select
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    disabled={!formData.province}
                    className={`w-full border px-4 py-3 text-sm focus:outline-none transition bg-black text-white border-gray-700 focus:border-white disabled:bg-gray-900 ${shippingErrors.district ? "border-red-500" : ""}`}
                  >
                    <option value="">Select District</option>
                    {districtOptions.map((district) => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
                  {shippingErrors.district && <p className="mt-1 text-sm text-red-600">{shippingErrors.district}</p>}
                </div>
                <div>
                  <label className="mb-2 block text-sm">City / Municipality <span className="text-red-600">*</span></label>
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    disabled={!formData.province}
                    className={`w-full border px-4 py-3 text-sm focus:outline-none transition bg-black text-white border-gray-700 focus:border-white ${shippingErrors.city ? "border-red-500" : ""}`}
                  >
                    <option value="">Select City / Municipality</option>
                    {cityOptions.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                  {shippingErrors.city && <p className="mt-1 text-sm text-red-600">{shippingErrors.city}</p>}
                </div>
                <div>
                  <label className="mb-2 block text-sm">Area / Tole <span className="text-red-600">*</span></label>
                  <input
                    type="text"
                    name="area"
                    placeholder="Area / Tole"
                    value={formData.area}
                    onChange={handleInputChange}
                    className={`w-full border px-4 py-3 text-sm focus:outline-none transition ${shippingErrors.area ? "border-red-500" : "border-gray-300 focus:border-black"}`}
                  />
                  {shippingErrors.area && <p className="mt-1 text-sm text-red-600">{shippingErrors.area}</p>}
                </div>
                <div>
                  <label className="mb-2 block text-sm">Ward No. <span className="text-red-600">*</span></label>
                  <input
                    type="number"
                    name="wardNumber"
                    placeholder="Ward No."
                    min="1"
                    max="32"
                    value={formData.wardNumber}
                    onChange={handleInputChange}
                    className={`w-full border px-4 py-3 text-sm focus:outline-none transition ${shippingErrors.wardNumber ? "border-red-500" : "border-gray-300 focus:border-black"}`}
                  />
                  {shippingErrors.wardNumber && <p className="mt-1 text-sm text-red-600">{shippingErrors.wardNumber}</p>}
                </div>
                <div>
                  <label className="mb-2 block text-sm">Postal Code</label>
                  <input
                    type="text"
                    name="postalCode"
                    placeholder="Postal Code"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    inputMode="numeric"
                    maxLength={5}
                    className={`w-full border px-4 py-3 text-sm focus:outline-none transition ${shippingErrors.postalCode ? "border-red-500" : "border-gray-300 focus:border-black"}`}
                  />
                  {shippingErrors.postalCode && <p className="mt-1 text-sm text-red-600">{shippingErrors.postalCode}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm">House / Street Address <span className="text-red-600">*</span></label>
                  <input
                    type="text"
                    name="address"
                    placeholder="House / Street Address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={`w-full border px-4 py-3 text-sm focus:outline-none transition ${shippingErrors.address ? "border-red-500" : "border-gray-300 focus:border-black"}`}
                  />
                  {shippingErrors.address && <p className="mt-1 text-sm text-red-600">{shippingErrors.address}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm">Nearest Landmark <span className="text-red-600">*</span></label>
                  <input
                    type="text"
                    name="landmark"
                    placeholder="Nearest Landmark"
                    value={formData.landmark}
                    onChange={handleInputChange}
                    className={`w-full border px-4 py-3 text-sm focus:outline-none transition ${shippingErrors.landmark ? "border-red-500" : "border-gray-300 focus:border-black"}`}
                  />
                  {shippingErrors.landmark && <p className="mt-1 text-sm text-red-600">{shippingErrors.landmark}</p>}
                </div>
              </div>
              <button
                onClick={handleShippingSubmit}
                // disabled={!user}
                className="w-full bg-black text-white py-4 font-medium hover:bg-gray-900 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                Continue to Payment
              </button>
            </motion.div>
          )}

          {/* Payment Methods */}
          {step === "payment" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h2 className="text-2xl font-semibold">Payment Method</h2>
              {!isCashOnDeliveryAvailable ? (
                <p className="rounded border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
                  Cash on Delivery is available only for Kathmandu, Lalitpur, and Bhaktapur.
                  Orders outside these districts must use online payment.
                </p>
              ) : null}
              {isCustomOrder && (
                <p className="text-sm text-red-500 mb-2">
                  Custom orders can only be paid via eSewa
                </p>
              )}
              <div className="space-y-4">
                {/* eSewa temporarily disabled
                <label className="p-4 sm:p-6 cursor-pointer transition">
                  <div className="flex items-center gap-4">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="esewa"
                      checked={formData.paymentMethod === "esewa"}
                      onChange={handleInputChange}
                      className="w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <p className="font-semibold text-sm sm:text-base">eSewa</p>
                      <p className="text-gray-400 text-xs sm:text-sm">
                        Fast and secure mobile wallet
                      </p>
                    </div>
                  </div>
                </label>
                */}



                {/* Cash on Delivery */}
                {!isCustomOrder ? (
                  <label className="p-4 sm:p-6 cursor-pointer transition">
                    <div className="flex items-center gap-4">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={formData.paymentMethod === "cod"}
                        onChange={handleInputChange}
                        className="w-4 h-4 cursor-pointer"
                      />
                      <div>
                        <p className="font-semibold text-sm sm:text-base">Cash on Delivery</p>
                        <p className="text-gray-400 text-xs sm:text-sm">Pay when you receive your order</p>
                      </div>
                    </div>
                  </label>
                ) : null}
              </div>


              <div className="flex gap-4">
                <button
                  onClick={() => setStep("shipping")}
                className="flex-1 border border-white text-white py-4 font-medium hover:bg-white hover:text-black transition text-sm sm:text-base"
                >
                  Back
                </button>
                <button
                  onClick={handlePaymentSubmit}
                  disabled={isProcessingPayment}
                  className="flex-1 bg-black text-white py-4 font-medium hover:bg-gray-900 transition text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessingPayment ? "Processing..." : "Continue"}
                </button>
              </div>
            </motion.div>
          )}

          {/* Review & Place Order */}
          {step === "review" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h2 className="text-2xl font-semibold">Order Review</h2>
              <div className="border-t pt-6 space-y-4">
                <h3 className="font-semibold">Shipping Details:</h3>
                <p className="text-sm text-gray-400">
                  {formData.firstName} {formData.lastName}
                  <br />
                  {formData.address}
                  <br />
                  Ward {formData.wardNumber}, {formData.area}
                  <br />
                  {formData.city}, {formData.district}, {formData.province}
                  <br />
                  Landmark: {formData.landmark}
                  <br />
                  Postal Code: {formData.postalCode}
                  <br />
                  {formData.phone}
                </p>
              </div>
              <button
                onClick={finalizeOrder}
                className="w-full bg-black text-white py-4 font-medium hover:bg-gray-900 transition text-sm sm:text-base"
              >
                Place Order
              </button>
            </motion.div>
          )}

          {/* Success */}
          {step === "success" && orderPlaced && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 space-y-6">
              <div className="text-6xl text-green-500">✓</div>
              <h2 className="text-3xl sm:text-4xl font-semibold">Order Confirmed!</h2>
              <p className="text-gray-400 text-sm sm:text-base">Your order has been placed successfully. You'll receive a confirmation email shortly.</p>
              <button
                onClick={() => navigate("/")}
                className="mx-auto block bg-black text-white px-8 py-3 font-medium hover:bg-gray-900 transition text-sm sm:text-base"
              >
                Continue Shopping
              </button>
            </motion.div>
          )}
        </div>

        {/* Right - Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-32 bg-[#0a0a0a] border border-gray-800 p-6 sm:p-8 space-y-6 text-white">
            <h2 className="text-xl font-semibold">Order Summary</h2>

            {/* Items */}
            <div className="space-y-4 max-h-64 overflow-y-auto border-b pb-6">
              {checkoutItems.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <img src={item.image} alt={item.name} className="w-16 h-16 object-cover" />
                  <div className="flex-1 text-sm">
                    <p className="font-medium line-clamp-2">{item.name}</p>
                    <p className="text-gray-400">Qty: {item.quantity}</p>
                    <p className="font-medium">NPR {(item.price * item.quantity).toLocaleString("en-NP")}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 border-b pb-6">
              <div className="space-y-3">
                <p className="text-sm font-medium">Promo Code</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => {
                      setPromoCode(e.target.value);
                      if (promoCodeError) {
                        setPromoCodeError("");
                      }
                    }}
                    placeholder="Enter promo code"
                    className="flex-1 border border-gray-700 bg-black text-white px-4 py-3 text-sm focus:outline-none focus:border-white transition"
                  />
                  <button
                    type="button"
                    onClick={() => applyDiscountCode(promoCode)}
                    className="bg-black px-4 py-3 text-sm font-medium text-white hover:bg-gray-900 transition"
                  >
                    Apply
                  </button>
                </div>
                {promoCodeError && (
                  <p className="text-sm text-red-600">{promoCodeError}</p>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Available Promo Codes</p>
                {visibleDiscountOptions.length > 0 ? (
                  <div className="grid gap-3">
                    {visibleDiscountOptions.map((option) => (
                      <button
                        key={option.code}
                        type="button"
                        onClick={() => applyDiscountCode(option.code)}
                        className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 border px-4 py-3 text-left text-sm transition rounded ${
                          appliedDiscountCode === option.code
                            ? "border-black bg-black text-white"
                            : "border-gray-700 bg-black hover:border-white hover:bg-gray-900"
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="font-semibold">
                          {option.label ?? option.code ?? "PROMO"}
                           </span>
                          <span className="text-xs opacity-70">
                            {option.description || "Tap to apply discount"}
                          </span>
                        </div>

                        <div className="text-xs font-medium sm:text-right opacity-80">
                          {(option.type === "percent" || Number(option.value) <= 100)
                            ? `${option.value}% OFF`
                            : option.type === "flat"
                              ? `NPR ${option.value} OFF`
                              : option.type === "shipping"
                                ? "Free Shipping"
                                : "Offer"}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="rounded border border-dashed border-gray-700 bg-black px-4 py-4 text-sm text-gray-400 text-center">
                    No promo codes are currently available to display.
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  You can also enter a custom promo code manually if one was shared with you by the team.
                </p>
              </div>

              {appliedDiscount && (
                <div className="flex items-center justify-between rounded bg-black border border-gray-800 px-4 py-3 text-sm">
                  <div>
                    <p className="font-medium">
                    {appliedDiscount?.label ?? appliedDiscount?.code ?? "Promo"} applied
                    </p>
                    <p className="text-gray-400">{appliedDiscount.code}</p>
                  </div>
                  <button
                    type="button"
                    onClick={removeDiscountCode}
                    className="text-sm underline hover:no-underline"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Totals */}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Subtotal:</span>
                <span>NPR {subtotal.toLocaleString("en-NP")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Shipping:</span>
                <span>
                  {shipping === 0
                    ? "FREE (Kathmandu Valley)"
                    : `NPR ${shipping.toLocaleString("en-NP")} (Outside Valley)`}
                </span>
              </div>
              {appliedDiscount && (
                <div className="flex justify-between text-green-700">
                  <span>Discount:</span>
                  <span>- NPR {discountAmount.toLocaleString("en-NP")}</span>
                </div>
              )}
              {/*
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (13%):</span>
                <span>NPR {tax.toLocaleString("en-NP")}</span>
              </div>
              */}
              <div className="border-t pt-3 flex justify-between text-base font-bold">
                <span>Total:</span>
                <span>NPR {total.toLocaleString("en-NP")}</span>
              </div>
            </div>

            {/* Info */}
            <div className="bg-black border border-gray-800 p-4 rounded text-xs text-gray-400 space-y-2">
              <p>✓ Secure checkout</p>
              <p>✓ Exchange within 2 days</p>
              <p>✗ No Returns</p>
              <p>✓ Same day delivery in within Kathmandu Valley</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
