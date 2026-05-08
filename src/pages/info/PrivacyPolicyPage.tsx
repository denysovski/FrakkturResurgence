import PolicyPage from "@/components/PolicyPage";

const PrivacyPolicyPage = () => (
  <PolicyPage
    title="Privacy Policy"
    description="How we collect, use, and protect your personal information on Frakktur."
    canonicalUrl="https://frakktur.com/privacy-policy"
    sections={[
      {
        title: "Information We Collect",
        content: [
          "We collect information you provide during account creation, checkout, newsletter sign-up, and customer support interactions.",
          "We may also collect device and browser data to improve website performance and security.",
        ],
      },
      {
        title: "How We Use It",
        content: [
          "Your data is used to process orders, manage accounts, provide support, and send relevant updates when you opt in.",
          "We do not sell your personal information.",
        ],
      },
      {
        title: "Your Rights",
        content: [
          "You can request access, correction, or deletion of certain personal data subject to legal and operational requirements.",
          "For privacy questions, contact us using the information on the About page.",
        ],
      },
    ]}
  />
);

export default PrivacyPolicyPage;