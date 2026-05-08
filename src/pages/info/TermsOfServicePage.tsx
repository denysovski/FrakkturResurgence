import PolicyPage from "@/components/PolicyPage";

const TermsOfServicePage = () => (
  <PolicyPage
    title="Terms of Service"
    description="These terms explain how you may use the Frakktur website, place orders, and interact with our services."
    canonicalUrl="https://frakktur.com/terms-of-service"
    sections={[
      {
        title: "Using the Site",
        content: [
          "By accessing this site, you agree to use it only for lawful purposes and in a way that does not infringe the rights of others.",
          "We may update or change the website, its content, or its availability at any time without prior notice.",
        ],
      },
      {
        title: "Orders and Availability",
        content: [
          "All orders are subject to acceptance, stock availability, and verification of payment details where required.",
          "We reserve the right to cancel or refuse any order if we believe there is an issue with payment, fraud, or product availability.",
        ],
      },
      {
        title: "Intellectual Property",
        content: [
          "All content, imagery, trademarks, and design elements on this site belong to Frakktur or its partners unless stated otherwise.",
          "You may not copy, reproduce, or redistribute site content without permission.",
        ],
      },
    ]}
  />
);

export default TermsOfServicePage;