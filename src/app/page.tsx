import Header from "@/components/Header";
import Hero from "@/components/Hero";
import StatsRibbon from "@/components/StatsRibbon";
import DepartmentGrid from "@/components/DepartmentGrid";
import Footer from "@/components/Footer";
import SeoData from "@/components/SeoData";

import LiveActivityStrip from "@/components/LiveActivityStrip";
import TrustBlock from "@/components/TrustBlock";
import BottomNav from "@/components/BottomNav";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <SeoData />
      <Header />
      <LiveActivityStrip />
      <Hero />
      <TrustBlock />
      <DepartmentGrid />
      <BottomNav />
      
      {/* FAQ Section for AEO and GEO Optimization */}
      <section className="py-20 bg-white" id="faq">
        <div className="container mx-auto px-4 md:px-10 lg:px-20">
          <h2 className="text-gov-blue text-3xl font-bold tracking-tight mb-12 text-center">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <h3 className="text-slate-900 font-bold mb-3">What is the Delhi CM Grievance Dashboard?</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Delhi CM Grievance Dashboard is an official grievance registration and resolution platform for the Government of NCT Delhi that allows residents to report civic issues and track resolutions in real-time.
              </p>
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <h3 className="text-slate-900 font-bold mb-3">How can I report a civic issue?</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                You can report an issue by logging into the Delhi CM Grievance Dashboard and using the Quick-Report tool to describe the problem. The system will automatically categorize and route it to the appropriate department.
              </p>
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <h3 className="text-slate-900 font-bold mb-3">Which departments are covered?</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                The platform covers major municipal and state departments including Sanitation, Electrical, Roads, Public Health, Water supply, and Horticulture management.
              </p>
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <h3 className="text-slate-900 font-bold mb-3">Is my data secure?</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Yes, the Delhi CM Grievance Dashboard uses government-grade encryption and secure authentication to ensure citizen data privacy and transparency in resolutions.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
