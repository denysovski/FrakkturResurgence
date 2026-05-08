import PolicyPage from "@/components/PolicyPage";

const RefundPolicyPage = () => (
  <PolicyPage
    title="Refund Policy"
    description="How returns, refunds, and exchanges are handled for Frakktur orders."
    canonicalUrl="https://frakktur.com/refund-policy"
    sections={[
      {
        title: "Return Window",
        content: [
          "You may request a return within 14 days of delivery, provided the item is unworn, unused, and in original condition.",
          "Certain limited or personalized items may be final sale and not eligible for return.",
        ],
      },
      {
        title: "Refund Process",
        content: [
          "Once a return is received and inspected, approved refunds are issued to the original payment method.",
          "Processing times may vary depending on your bank or card provider.",
        ],
      },
      {
        title: "Exchanges",
        content: [
          "If you need a different size or item, contact us and we will confirm whether an exchange is possible based on availability.",
          "We recommend double-checking size guides before placing your order.",
        ],
      },
    ]}
  />
);

export default RefundPolicyPage;