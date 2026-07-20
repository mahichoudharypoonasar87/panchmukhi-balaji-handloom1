import { LucideIcon } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export interface LegalSection {
  title: string;
  intro?: string;
  items?: string[];
  paragraphs?: string[];
}

interface LegalPageLayoutProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  lastUpdated: string;
  sections: LegalSection[];
}

export default function LegalPageLayout({
  icon: Icon,
  title,
  subtitle,
  lastUpdated,
  sections,
}: LegalPageLayoutProps) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 bg-[var(--background)]">
        <div className="bg-dark-luxury border-b border-gold-500/10 py-10">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <Icon size={36} className="text-gold-500 mx-auto mb-3" />
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-ivory-100 mb-2">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[#C0A080] text-sm font-body mb-2 max-w-xl mx-auto">
                {subtitle}
              </p>
            )}
            <p className="text-[#A08060] text-xs font-utility uppercase tracking-widest">
              Last updated: {lastUpdated}
            </p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
          <div className="p-6 sm:p-8 rounded-3xl bg-[var(--card-bg)] border border-[var(--border)] space-y-8">
            {sections.map((section) => (
              <div key={section.title}>
                <h2 className="font-display text-lg font-bold text-[var(--foreground)] mb-3">
                  {section.title}
                </h2>

                {section.paragraphs?.map((p, i) => (
                  <p
                    key={i}
                    className="text-[var(--muted)] text-sm font-body leading-relaxed mb-2 last:mb-0"
                  >
                    {p}
                  </p>
                ))}

                {section.intro && (
                  <p className="text-[var(--muted)] text-sm font-body leading-relaxed mb-3">
                    {section.intro}
                  </p>
                )}

                {section.items && (
                  <ul className="space-y-2">
                    {section.items.map((item, i) => (
                      <li
                        key={i}
                        className="text-[var(--muted)] text-sm font-body leading-relaxed flex gap-2"
                      >
                        <span className="text-gold-500 mt-1 flex-shrink-0">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
