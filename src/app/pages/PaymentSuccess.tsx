import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const data = params.get("data");

    if (data) {
      try {
        const decoded = JSON.parse(atob(data));
        console.log("eSewa Response:", decoded);

        if (decoded.status === "COMPLETE") {
          const orderId = decoded.transaction_uuid;

          console.log("Payment SUCCESS for order:", orderId);

          // store payment success with order reference
          localStorage.setItem("paymentSuccess", "true");
          localStorage.setItem("paidOrderId", orderId);

          // trigger order finalize signal
          window.dispatchEvent(new Event("paymentSuccess"));
        }
      } catch (err) {
        console.error("Failed to decode eSewa response", err);
      }
    }
  }, [params]);

  useEffect(() => {
    const handleFinalize = () => {
      const orderId = localStorage.getItem("paidOrderId");

      // redirect back with order reference
      navigate(`/checkout?payment=success&orderId=${orderId}`);
    };

    const timer = setTimeout(handleFinalize, 1500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Payment Successful 🎉</h1>
        <p>Your order has been placed successfully.</p>
      </div>
    </div>
  );
}