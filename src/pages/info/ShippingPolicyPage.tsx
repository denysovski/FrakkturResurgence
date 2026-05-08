import PolicyPage from "@/components/PolicyPage";

const ShippingPolicyPage = () => (
  <PolicyPage
    title="Shipping Policy"
    description="Information about how we process, pack, and ship Frakktur orders worldwide."
    canonicalUrl="https://frakktur.com/shipping-policy"
    sections={[
      {
        title: "Processing Times",
        content: [
          "Orders are typically processed within 1 to 3 business days after payment has been confirmed.",
          "During new drops or peak periods, processing can take slightly longer.",
        ],
      },
      {
        title: "Shipping Methods",
        content: [
          "We offer standard and express shipping options where available. Shipping fees and delivery estimates are shown during checkout.",
          "Once your order is dispatched, you will receive tracking details by email.",
        ],
      },
      {
        title: "Delivery Issues",
        content: [
          "If a package is delayed, lost, or returned to sender, contact support with your order number so we can help resolve the issue.",
          "Please ensure your shipping address is entered correctly at checkout.",
        ],
      },
    ]}
  />
);

export default ShippingPolicyPage;