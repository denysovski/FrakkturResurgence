import PageLayout from "@/pages/PageLayout";
import SEO from "@/components/SEO";
import { useNavigate } from "react-router-dom";
import { getStoredUser } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

const ClubPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCreateClubAccount = () => {
    const user = getStoredUser();

    if (!user) {
      navigate("/auth/login");
      return;
    }

    toast({
      title: "Frakktur Club",
      description: "You are already part of Frakktur club",
    });
  };

  return (
    <PageLayout forceBlackNavbar={true}>
      <SEO
        title="Frakktur Club"
        description="Join the exclusive Frakktur Club community. Enjoy early access to new collections, exclusive member-only discounts, and premium benefits for luxury streetwear enthusiasts."
        canonicalUrl="https://frakktur.com/club"
      />
      <div className="pt-32 pb-24 px-6 md:px-10">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-light mb-4 tracking-tight">
            Frakktur Club
          </h1>
          <p className="text-lg text-muted-foreground mb-12">
            Become part of an exclusive community of street fashion enthusiasts.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
            <div>
              <h2 className="text-xl font-normal mb-4">Members Benefit</h2>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="text-foreground mt-0.5">✓</span>
                  <span>Early access to new collections and limited editions</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-foreground mt-0.5">✓</span>
                  <span>Exclusive member-only discounts up to 20%</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-foreground mt-0.5">✓</span>
                  <span>Priority customer support 24/7</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-foreground mt-0.5">✓</span>
                  <span>Invitations to exclusive brand events</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-foreground mt-0.5">✓</span>
                  <span>Birthday rewards and special promotions</span>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-normal mb-4">How It Works</h2>
              <div className="space-y-4 text-sm text-muted-foreground">
                <p>
                  <strong className="text-foreground">Step 1:</strong> Sign up for your Frakktur Club account at checkout or through your profile.
                </p>
                <p>
                  <strong className="text-foreground">Step 2:</strong> Start earning points on every purchase and interaction.
                </p>
                <p>
                  <strong className="text-foreground">Step 3:</strong> Redeem points for discounts, exclusive items, and special experiences.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-secondary/50 border border-border rounded-lg p-8 text-center">
            <h3 className="text-2xl font-light mb-2 tracking-tight">
              Join the Movement
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              It's free to join. Sign up today and get instant access to exclusive benefits.
            </p>
            <button
              type="button"
              onClick={handleCreateClubAccount}
              className="inline-block bg-foreground text-background px-8 py-3 text-sm font-normal hover:bg-foreground/90 transition-colors rounded-sm"
            >
              Create Club Account
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default ClubPage;
