import Image from "next/image";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-neutral-50 py-16 px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        
        {/* Banner Section */}
        <div className="relative overflow-hidden rounded-xl bg-primary text-white shadow-md mb-16">
          <div className="relative h-64 sm:h-80 w-full overflow-hidden opacity-80">
            <img
              src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80"
              alt="Scenic road trip"
              className="h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-transparent" />
          </div>
          <div className="absolute bottom-0 left-0 p-8 sm:p-12">
            <h1 className="font-fraunces text-4xl sm:text-5xl font-semibold tracking-tight text-white mb-3">
              About Travel AI
            </h1>
            <p className="font-sans text-lg text-neutral-100 max-w-xl">
              Pioneering custom travel curation by blending seasoned travel expertise with specialized agentic AI.
            </p>
          </div>
        </div>

        {/* Our Vision and Story */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16 items-start">
          <div className="space-y-6">
            <h2 className="font-fraunces text-3xl font-semibold text-neutral-900">
              Our Vision
            </h2>
            <p className="font-sans text-neutral-700 leading-relaxed">
              At Travel AI, we believe that traveling should be deeply personal, immersive, and inspiring. Standard templates and rigid tours fail to capture what makes exploring meaningful to individuals. 
            </p>
            <p className="font-sans text-neutral-700 leading-relaxed">
              Our vision is to build the premier, context-aware itinerary recommendation engine that reads between the lines of your preferences. By dynamically querying our curated catalog and matching against traveler profiles, we save you from hours of choice fatigue.
            </p>
          </div>
          <div className="bg-neutral-100 p-8 rounded-xl border border-neutral-200">
            <h2 className="font-fraunces text-2xl font-semibold text-neutral-900 mb-4">
              How Our AI Works
            </h2>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">1</span>
                <div>
                  <h4 className="font-semibold text-neutral-900">Catalogs Mapping</h4>
                  <p className="text-sm text-neutral-705">We query our databases for real-world verified packages matching your location needs.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">2</span>
                <div>
                  <h4 className="font-semibold text-neutral-900">LLM Processing</h4>
                  <p className="text-sm text-neutral-705">Claude processes your custom constraints and ranks trip options dynamically.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">3</span>
                <div>
                  <h4 className="font-semibold text-neutral-900">Admin Approval Integration</h4>
                  <p className="text-sm text-neutral-705">Every custom creation passes through our admin console to set safe pricing quotes.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Meet the Curators */}
        <div className="mb-20">
          <h2 className="font-fraunces text-3xl font-semibold text-neutral-900 mb-8 text-center">
            Meet the Curators
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {/* Jane */}
            <div className="bg-neutral-100 rounded-xl p-6 border border-neutral-200 text-center hover:shadow-md transition-shadow">
              <div className="relative h-24 w-24 mx-auto mb-4 overflow-hidden rounded-full border-2 border-primary">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  alt="Jane Doe"
                  className="h-full w-full object-cover"
                />
              </div>
              <h3 className="font-fraunces text-xl font-semibold text-neutral-900">Jane Doe</h3>
              <p className="text-xs text-primary font-semibold uppercase tracking-wider mb-2">CEO & Travel Lead</p>
              <p className="text-sm text-neutral-700">
                Armed with 12 years of boutique travel planning experience, Jane shapes our curation standards.
              </p>
            </div>
            {/* John */}
            <div className="bg-neutral-100 rounded-xl p-6 border border-neutral-200 text-center hover:shadow-md transition-shadow">
              <div className="relative h-24 w-24 mx-auto mb-4 overflow-hidden rounded-full border-2 border-primary">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  alt="John Smith"
                  className="h-full w-full object-cover"
                />
              </div>
              <h3 className="font-fraunces text-xl font-semibold text-neutral-900">John Smith</h3>
              <p className="text-xs text-primary font-semibold uppercase tracking-wider mb-2">Chief AI Architect</p>
              <p className="text-sm text-neutral-700">
                A researcher specializing in retrieval systems, John guides our Claude API structures safely.
              </p>
            </div>
            {/* Chloe */}
            <div className="bg-neutral-100 rounded-xl p-6 border border-neutral-200 text-center hover:shadow-md transition-shadow">
              <div className="relative h-24 w-24 mx-auto mb-4 overflow-hidden rounded-full border-2 border-primary">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  alt="Chloe Chen"
                  className="h-full w-full object-cover"
                />
              </div>
              <h3 className="font-fraunces text-xl font-semibold text-neutral-900">Chloe Chen</h3>
              <p className="text-xs text-primary font-semibold uppercase tracking-wider mb-2">UI/UX Director</p>
              <p className="text-sm text-neutral-700">
                Chloe designs visual frameworks that keep client interactions fluid, clean, and intuitive.
              </p>
            </div>
          </div>
        </div>

        {/* Legal Sections (targeted by footer) */}
        <div className="border-t border-neutral-200 pt-16 grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Privacy Policy */}
          <section id="privacy" className="scroll-mt-6 space-y-4">
            <h2 className="font-fraunces text-2xl font-semibold text-neutral-900 pb-2 border-b border-neutral-250">
              Privacy Policy
            </h2>
            <p className="text-sm text-neutral-700 leading-relaxed">
              Your security and privacy are of utmost importance. At Travel AI, we do not share your demographic or query history data with advertising networks.
            </p>
            <p className="text-sm text-neutral-700 leading-relaxed">
              We process text queries, vacation preferences, and profile constraints through secure API calls to our LLM provider. No personal identifying information (PII), such as full names, email addresses, or credentials, is forwarded to third-party model inference servers. All data rests locally on our authenticated database servers.
            </p>
          </section>

          {/* Terms of Service */}
          <section id="terms" className="scroll-mt-6 space-y-4">
            <h2 className="font-fraunces text-2xl font-semibold text-neutral-900 pb-2 border-b border-neutral-250">
              Terms of Service
            </h2>
            <p className="text-sm text-neutral-700 leading-relaxed">
              By using our service, you agree to access content strictly for personal exploration and non-commercial bookings.
            </p>
            <p className="text-sm text-neutral-700 leading-relaxed">
              Our custom plans are recommendation drafts generated using machine learning. They do not constitute a binding booking till an administrator formally reviews, creates a priced quote, and you accept. Final availability and rates depend on flight, lodging, and logistics schedules at approval time.
            </p>
          </section>
        </div>

      </div>
    </main>
  );
}
