/**
 * Red Dirt Blooms — Order Success Page
 * Shown after a successful Stripe checkout.
 * Confirms the order, shows care tips, and captures email for Bloom Watch.
 */
import { useState } from "react";
import { Link } from "wouter";
import { CheckCircle, Flower2, Mail, ArrowRight, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const CARE_TIPS = [
  "Trim stems at a 45° angle before placing in water",
  "Use a clean vase with fresh, cool water",
  "Keep away from direct sunlight and heat vents",
  "Change the water every 2 days for maximum freshness",
  "Remove any leaves below the waterline",
];

export default function OrderSuccess() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const subscribeMutation = trpc.bloomWatch.subscribe.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setSubscribed(true);
      setEmail("");
    },
    onError: (err) => {
      toast.error("Couldn't sign you up: " + err.message);
    },
  });

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    subscribeMutation.mutate({ email, source: "order-success" });
  };

  return (
    <div className="min-h-screen bg-[#F5F0E8] pt-16 lg:pt-20">
      {/* Hero confirmation */}
      <section className="py-20 bg-[#2A1F1A]">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="w-20 h-20 rounded-full bg-[#7A8C6E] flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-[#F5F0E8]" />
          </div>
          <div className="font-accent text-[#E8A020] text-xl mb-3">Order Confirmed!</div>
          <h1
            className="font-heading text-[#F5F0E8] font-bold mb-4"
            style={{ fontSize: "clamp(2rem, 5vw, 3rem)" }}
          >
            Your Red Dirt Blooms Are on Their Way
          </h1>
          <p className="font-body text-[#F5F0E8]/60 text-base leading-relaxed max-w-lg mx-auto">
            Thank you for supporting a local Oklahoma flower farm! We'll be in touch with pickup or delivery details shortly. Check your email for your order confirmation.
          </p>
        </div>
      </section>

      {/* What's next */}
      <section className="py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

            {/* Bouquet Care Tips */}
            <div className="bg-white rounded border border-[#B5451B]/10 p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-[#E8A020] flex items-center justify-center">
                  <Flower2 className="w-5 h-5 text-[#2A1F1A]" />
                </div>
                <h2 className="font-heading text-[#2A1F1A] font-semibold text-xl">Bouquet Care Tips</h2>
              </div>
              <p className="font-body text-[#2A1F1A]/60 text-sm mb-4">
                With a little love, your Red Dirt Blooms bouquet will last 7–10 days.
              </p>
              <ul className="space-y-3">
                {CARE_TIPS.map((tip, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#7A8C6E] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[#F5F0E8] text-xs font-bold">{i + 1}</span>
                    </div>
                    <span className="font-body text-[#2A1F1A]/70 text-sm leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bloom Watch signup */}
            <div className="bg-[#B5451B] rounded p-6 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#E8A020] flex items-center justify-center">
                  <Mail className="w-5 h-5 text-[#2A1F1A]" />
                </div>
                <h2 className="font-heading text-[#F5F0E8] font-semibold text-xl">Join the Bloom Watch</h2>
              </div>
              <p className="font-body text-[#F5F0E8]/70 text-sm mb-6 leading-relaxed flex-1">
                Be the first to know when the next harvest is ready. Bloom Watch subscribers get early access before we post publicly — and spots go fast.
              </p>
              {subscribed ? (
                <div className="bg-[#F5F0E8]/10 rounded p-4 text-center">
                  <CheckCircle className="w-8 h-8 text-[#E8A020] mx-auto mb-2" />
                  <p className="font-body text-[#F5F0E8] text-sm font-medium">You're on the Bloom Watch! 🌸</p>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="flex-1 bg-[#F5F0E8] border-0 rounded px-3 py-2.5 font-body text-sm text-[#2A1F1A] placeholder-[#2A1F1A]/40 focus:outline-none focus:ring-2 focus:ring-[#E8A020]"
                  />
                  <button
                    type="submit"
                    disabled={subscribeMutation.isPending}
                    className="bg-[#E8A020] hover:bg-[#d4911a] text-[#2A1F1A] font-body font-semibold text-sm px-4 py-2.5 rounded transition-colors disabled:opacity-60 flex items-center gap-1"
                  >
                    {subscribeMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign Up"}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Navigation CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/harvest-stand"
              className="inline-flex items-center justify-center gap-2 bg-[#B5451B] hover:bg-[#9e3c17] text-[#F5F0E8] font-body font-semibold px-6 py-3 rounded transition-colors"
            >
              <Flower2 className="w-4 h-4" />
              Shop More Flowers
            </Link>
            <Link
              href="/bloom-diary"
              className="inline-flex items-center justify-center gap-2 bg-white border border-[#B5451B]/20 hover:border-[#B5451B] text-[#B5451B] font-body font-semibold px-6 py-3 rounded transition-colors"
            >
              Watch the Bloom Diary
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 text-[#2A1F1A]/50 hover:text-[#B5451B] font-body text-sm px-4 py-3 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
