"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// Types for JTBD data
interface Job {
  id: string;
  text: string;
  type: "functional" | "emotional" | "social";
}

interface Pain {
  id: string;
  text: string;
  type: "functional" | "emotional" | "social";
}

interface Benefit {
  id: string;
  text: string;
}

interface UseCase {
  id: string;
  text: string;
}

interface JTBDResponse {
  jobs: Job[];
  pains: Pain[];
  benefits: Benefit[];
  useCases: UseCase[];
}

interface PartialJTBD {
  functionalJobs?: string[];
  emotionalJobs?: string[];
  socialJobs?: string[];
  functionalPains?: string[];
  emotionalPains?: string[];
  socialPains?: string[];
  benefits?: string[];
  useCases?: string[];
}



// Types for Ad Creatives
interface AdHeadline {
  id: string;
  text: string;
}

interface AdDescription {
  id: string;
  text: string;
}

interface AdCreativeResponse {
  headlines: AdHeadline[];
  googleAdsDescriptions: AdDescription[];
  metaAdsTexts: AdDescription[];
  heroTexts: AdHeadline[];
  ctaVariations: AdHeadline[];
}

// Stream JSON array from API
async function streamJsonArray(url: string, body: Record<string, unknown>, onProgress?: (items: unknown[]) => void): Promise<unknown[]> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error((errData as { error?: string }).error || "API error");
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let buffer = "";
  const results: unknown[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || ""; // keep incomplete line

    for (const line of lines) {
      if (line.trim()) {
        try {
          const item = JSON.parse(line.trim());
          results.push(item);
          onProgress?.(results.slice()); // pass copy
        } catch (e) {
          // ignore invalid JSON
        }
      }
    }
  }

  return results;
}

// Tag component for chips
function Tag({ variant = "default" }: { variant?: "default" | "functional" | "emotional" | "social" }) {
  const variantStyles = {
    default: "bg-primary/10 text-primary border-primary/20",
    functional: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    emotional: "bg-pink-500/10 text-pink-600 border-pink-500/20",
    social: "bg-green-500/10 text-green-600 border-green-500/20",
  };

  const tagLabels: Record<string, string> = {
    functional: "Functional",
    emotional: "Emotional",
    social: "Social",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors ${variantStyles[variant]}`}
    >
      {tagLabels[variant] || variant}
    </span>
  );
}

// Section header component
function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      {description && <p className="text-muted-foreground mt-1">{description}</p>}
    </div>
  );
}


>


// Ad Creative Section component
function AdCreativeSection({ title, description, items, type }: {
  title: string;
  description?: string;
  items: AdHeadline[] | AdDescription[];
  type: "headline" | "description" | "hero" | "cta";
}) {
  const icons: Record<string, string> = {
    headline: "📰",
    description: "📝",
    hero: "🎯",
    cta: "🚀",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>{icons[type]}</span>
          <span>{title}</span>
          <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {items.length}
          </span>
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border bg-muted/30 p-4 transition-colors hover:bg-muted/50"
            >
              <p className="text-sm font-medium leading-relaxed">
                {(item as AdHeadline | AdDescription).text}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}



// Spoiler section component for accordion
function SpoilerSection({
  title,
  description,
  items,
  type,
  isGenerating,
  generatingText
}: {
  title: string;
  description?: string | null;
  items: Job[] | Pain[] | Benefit[] | UseCase[] | AdHeadline[] | AdDescription[];
  type: "job" | "pain" | "benefit" | "usecase" | "headline" | "description" | "hero" | "cta";
  isGenerating?: boolean;
  generatingText?: string | null;
}) {

  const tagVariants: Record<string, "default" | "functional" | "emotional" | "social"> = {
    functional: "functional",
    emotional: "emotional",
    social: "social",
  };

  const icons: Record<string, string> = {
    headline: "📰",
    description: "📝",
    hero: "🎯",
    cta: "🚀",
  };

  return (
    <div className="space-y-4">
      {description && <p className="text-muted-foreground">{description}</p>}
      {isGenerating ? (
        <div className="flex items-center justify-center py-8">
          <div className="relative">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary"></div>
          </div>
          <p className="ml-4 text-muted-foreground">{generatingText || ""}</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-1.5 rounded-lg border bg-muted/50 px-3 py-2 text-sm"
            >
              {type === "job" || type === "pain" ? (
                <Tag variant={tagVariants[(item as Job).type] || "default"} />
              ) : type === "headline" || type === "description" || type === "hero" || type === "cta" ? (
                <span className="text-muted-foreground">{icons[type]}</span>
              ) : (
                <span className="text-muted-foreground">
                  {type === "benefit" ? "✓" : "→"}
                </span>
              )}
              <span>{(item as Job | Pain | Benefit | UseCase | AdHeadline | AdDescription).text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Error message component
function ErrorMessage({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Card className="border-destructive/50 bg-destructive/5">
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-destructive/10 p-1.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="size-5 text-destructive"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-destructive">An error occurred</h3>
            <p className="mt-1 text-sm text-muted-foreground">{message}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={onRetry}
            >
              Try again
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}



export default function Home() {
  const [productIdea, setProductIdea] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jtbd, setJtbd] = useState<JTBDResponse | null>(null);
  const [partialJtbd, setPartialJtbd] = useState<PartialJTBD>({});
  const [creatives, setCreatives] = useState<AdCreativeResponse | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [accordionValue, setAccordionValue] = useState<string>("");
  const [currentGeneratingText, setCurrentGeneratingText] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productIdea.trim()) return;

    setIsLoading(true);
    setError(null);
    setJtbd(null);
    setPartialJtbd({});
    setCreatives(null);
    setShowResults(true); // Show results immediately
    setAccordionValue("jobs");
    setCurrentGeneratingText("Functional jobs are generating");

    try {
      const productIdeaTrimmed = productIdea.trim();
      let functionalJobs: string[] = [];
      let emotionalJobs: string[] = [];
      let socialJobs: string[] = [];
      let functionalPains: string[] = [];
      let emotionalPains: string[] = [];
      let socialPains: string[] = [];
      let benefits: string[] = [];
      let useCases: string[] = [];

      // Step 1: Generate functional jobs
      await streamJsonArray("/api/generate-jtbd-functional", { productIdea: productIdeaTrimmed }, (items) => {
        functionalJobs = items.map((item: any) => item.text || item);
        setPartialJtbd(prev => ({ ...prev, functionalJobs }));
      });

      // Step 2: Generate emotional jobs
      setCurrentGeneratingText("Emotional jobs are generating");
      await streamJsonArray("/api/generate-jtbd-emotional", {
        productIdea: productIdeaTrimmed,
        functionalJobs
      }, (items) => {
        emotionalJobs = items.map((item: any) => item.text || item);
        setPartialJtbd(prev => ({ ...prev, emotionalJobs }));
      });

      // Step 3: Generate social jobs
      setCurrentGeneratingText("Social jobs are generating");
      await streamJsonArray("/api/generate-jtbd-social", {
        productIdea: productIdeaTrimmed,
        functionalJobs,
        emotionalJobs
      }, (items) => {
        socialJobs = items.map((item: any) => item.text || item);
        setPartialJtbd(prev => ({ ...prev, socialJobs }));
      });

      const allJobs = [...functionalJobs, ...emotionalJobs, ...socialJobs];

      // Step 4: Generate functional pains
      setAccordionValue("pains");
      setCurrentGeneratingText("Functional pains are generating");
      await streamJsonArray("/api/generate-jtbd-pains-functional", {
        productIdea: productIdeaTrimmed,
        jobs: allJobs
      }, (items) => {
        functionalPains = items.map((item: any) => item.text || item);
        setPartialJtbd(prev => ({ ...prev, functionalPains }));
      });

      // Step 5: Generate emotional pains
      setCurrentGeneratingText("Emotional pains are generating");
      await streamJsonArray("/api/generate-jtbd-pains-emotional", {
        productIdea: productIdeaTrimmed,
        jobs: allJobs,
        functionalPains
      }, (items) => {
        emotionalPains = items.map((item: any) => item.text || item);
        setPartialJtbd(prev => ({ ...prev, emotionalPains }));
      });

      // Step 6: Generate social pains
      setCurrentGeneratingText("Social pains are generating");
      await streamJsonArray("/api/generate-jtbd-pains-social", {
        productIdea: productIdeaTrimmed,
        jobs: allJobs
      }, (items) => {
        socialPains = items.map((item: any) => item.text || item);
        setPartialJtbd(prev => ({ ...prev, socialPains }));
      });

      const allPains = [...functionalPains, ...emotionalPains, ...socialPains];

      // Step 7: Generate benefits
      setAccordionValue("benefits");
      setCurrentGeneratingText("Benefits are generating");
      await streamJsonArray("/api/generate-jtbd-benefits", {
        jobs: allJobs,
        pains: allPains
      }, (items) => {
        benefits = items.map((item: any) => item.text || item);
        setPartialJtbd(prev => ({ ...prev, benefits }));
      });

      // Step 8: Generate use cases
      setAccordionValue("usecases");
      setCurrentGeneratingText("Use cases are generating");
      await streamJsonArray("/api/generate-jtbd-usecases", {
        jobs: allJobs,
        benefits
      }, (items) => {
        useCases = items.map((item: any) => item.text || item);
        setPartialJtbd(prev => ({ ...prev, useCases }));
      });

      // Convert partial JTBD to full JTBD response
      const jtbd: JTBDResponse = {
        jobs: [
          ...functionalJobs.map((text: string, i: number) => ({ id: `job-func-${i}`, text, type: "functional" as const })),
          ...emotionalJobs.map((text: string, i: number) => ({ id: `job-emo-${i}`, text, type: "emotional" as const })),
          ...socialJobs.map((text: string, i: number) => ({ id: `job-soc-${i}`, text, type: "social" as const })),
        ],
        pains: [
          ...functionalPains.map((text: string, i: number) => ({ id: `pain-func-${i}`, text, type: "functional" as const })),
          ...emotionalPains.map((text: string, i: number) => ({ id: `pain-emo-${i}`, text, type: "emotional" as const })),
          ...socialPains.map((text: string, i: number) => ({ id: `pain-soc-${i}`, text, type: "social" as const })),
        ],
        benefits: benefits.map((text: string, i: number) => ({ id: `benefit-${i}`, text })),
        useCases: useCases.map((text: string, i: number) => ({ id: `usecase-${i}`, text })),
      };
      setJtbd(jtbd);
      setIsLoading(false); // Stop main loading

      // Step 9: Generate Ad Creatives
      setAccordionValue("creatives");
      setCurrentGeneratingText("Creatives are generating");
      let creativesData: any = {};
      await streamJsonArray("/api/generate-creatives", {
        jtbd: {
          jobs: { functional: functionalJobs, emotional: emotionalJobs, social: socialJobs },
          pains: { functional: functionalPains, emotional: emotionalPains, social: socialPains },
          benefits,
          useCases
        },
        productIdea: productIdeaTrimmed
      }, (items) => {
        // Assume the last item has the full creatives
        if (items.length > 0) {
          creativesData = items[items.length - 1];
          setCreatives({
            headlines: (creativesData.headlines || []).map((text: string, i: number) => ({ id: `hl-${i}`, text })),
            googleAdsDescriptions: (creativesData.googleAds || []).map((text: string, i: number) => ({ id: `gad-${i}`, text })),
            metaAdsTexts: (creativesData.metaAds || []).map((text: string, i: number) => ({ id: `mad-${i}`, text })),
            heroTexts: (creativesData.heroTexts || []).map((text: string, i: number) => ({ id: `hero-${i}`, text })),
            ctaVariations: (creativesData.ctaVariations || []).map((text: string, i: number) => ({ id: `cta-${i}`, text })),
          });
        }
      });
      setCurrentGeneratingText(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setIsLoading(false);
      setCurrentGeneratingText(null);
    }
  };

  const handleRetry = () => {
    setError(null);
    handleSubmit({ preventDefault: () => {} } as React.FormEvent);
  };

  // Convert partial JTBD to display format
  const getDisplayJtbd = (): JTBDResponse | null => {
    if (jtbd) return jtbd;

    if (Object.keys(partialJtbd).length === 0) return null;

    return {
      jobs: [
        ...(partialJtbd.functionalJobs || []).map((text: string, i: number) => ({ id: `job-func-${i}`, text, type: "functional" as const })),
        ...(partialJtbd.emotionalJobs || []).map((text: string, i: number) => ({ id: `job-emo-${i}`, text, type: "emotional" as const })),
        ...(partialJtbd.socialJobs || []).map((text: string, i: number) => ({ id: `job-soc-${i}`, text, type: "social" as const })),
      ],
      pains: [
        ...(partialJtbd.functionalPains || []).map((text: string, i: number) => ({ id: `pain-func-${i}`, text, type: "functional" as const })),
        ...(partialJtbd.emotionalPains || []).map((text: string, i: number) => ({ id: `pain-emo-${i}`, text, type: "emotional" as const })),
        ...(partialJtbd.socialPains || []).map((text: string, i: number) => ({ id: `pain-soc-${i}`, text, type: "social" as const })),
      ],
      benefits: (partialJtbd.benefits || []).map((text: string, i: number) => ({ id: `benefit-${i}`, text })),
      useCases: (partialJtbd.useCases || []).map((text: string, i: number) => ({ id: `usecase-${i}`, text })),
    };
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
              AI
            </div>
            <span className="text-xl font-bold">AdCreative Generator</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <a href="#input" className="text-sm font-medium hover:text-primary">
              Input
            </a>
            <a href="#jtbd" className="text-sm font-medium hover:text-primary">
              JTBD
            </a>
            <a href="#creatives" className="text-sm font-medium hover:text-primary">
              Creatives
            </a>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        {/* Hero section with input */}
        <section id="input" className="py-12 md:py-20">
          <div className="mx-auto max-w-3xl">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold tracking-tight mb-4">
                Enter your product description
              </h1>
              <p className="text-xl text-muted-foreground">
                get 10 ad headline variations + ad texts for Google/Meta
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Textarea
                  value={productIdea}
                  onChange={(e) => setProductIdea(e.target.value)}
                  placeholder="Describe your product, target audience, main benefits..."
                  rows={5}
                  className="resize-none text-base"
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  The more detailed the description, the better the result
                </p>
              </div>
              <div className="flex justify-end">
                <Button
                  type="submit"
                  size="lg"
                  disabled={isLoading || !productIdea.trim()}
                >
                  {isLoading ? (
                    <>
                      <div className="mr-2 size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Generating...
                    </>
                  ) : (
                     "Generate Creatives"
                  )}
                </Button>
              </div>
            </form>



            {error && <ErrorMessage message={error} onRetry={handleRetry} />}
          </div>
        </section>

        {/* Results section */}
        {showResults && (
          <section id="jtbd" className="py-12 border-t">
            <SectionHeader
              title="Jobs To Be Done Analysis"
              description={jtbd ? "Key jobs, pains, benefits, and use cases defined" : "Analysis is performed step by step..."}
            />
            <Accordion value={accordionValue as any} className="space-y-4">
              <AccordionItem value="jobs">
                <AccordionTrigger>
                  🎯 Jobs {currentGeneratingText?.includes("jobs") ? `(${partialJtbd.functionalJobs?.length || 0} + ${partialJtbd.emotionalJobs?.length || 0} + ${partialJtbd.socialJobs?.length || 0})` : `(${getDisplayJtbd()?.jobs.length || 0})`}
                </AccordionTrigger>
                <AccordionContent>
                  <SpoilerSection
                    title="Jobs"
                    description="Functional, emotional, and social jobs that the product performs"
                    items={getDisplayJtbd()?.jobs || []}
                    type="job"
                    isGenerating={currentGeneratingText?.includes("jobs") || false}
                    generatingText={currentGeneratingText}
                  />
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="pains">
                <AccordionTrigger>
                  💢 Pains {currentGeneratingText?.includes("pains") ? `(${partialJtbd.functionalPains?.length || 0} + ${partialJtbd.emotionalPains?.length || 0} + ${partialJtbd.socialPains?.length || 0})` : `(${getDisplayJtbd()?.pains.length || 0})`}
                </AccordionTrigger>
                <AccordionContent>
                  <SpoilerSection
                    title="Pains"
                    description="Functional, emotional, and social client pains"
                    items={getDisplayJtbd()?.pains || []}
                    type="pain"
                    isGenerating={currentGeneratingText?.includes("pains") || false}
                    generatingText={currentGeneratingText}
                  />
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="benefits">
                <AccordionTrigger>
                  ✅ Benefits {currentGeneratingText?.includes("Benefits") ? `(${partialJtbd.benefits?.length || 0})` : `(${getDisplayJtbd()?.benefits.length || 0})`}
                </AccordionTrigger>
                <AccordionContent>
                  <SpoilerSection
                    title="Benefits"
                    description="Key advantages and values of the product"
                    items={getDisplayJtbd()?.benefits || []}
                    type="benefit"
                    isGenerating={currentGeneratingText?.includes("Benefits") || false}
                    generatingText={currentGeneratingText}
                  />
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="usecases">
                <AccordionTrigger>
                  📋 Use Cases {currentGeneratingText?.includes("Use cases") ? `(${partialJtbd.useCases?.length || 0})` : `(${getDisplayJtbd()?.useCases.length || 0})`}
                </AccordionTrigger>
                <AccordionContent>
                  <SpoilerSection
                    title="Use Cases"
                    description="Specific product application situations"
                    items={getDisplayJtbd()?.useCases || []}
                    type="usecase"
                    isGenerating={currentGeneratingText?.includes("Use cases") || false}
                    generatingText={currentGeneratingText}
                  />
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="creatives">
                <AccordionTrigger>
                  🎨 Creatives {currentGeneratingText?.includes("Creatives") ? `(${creatives ? Object.values(creatives).reduce((sum, arr) => sum + arr.length, 0) : 0})` : `(${creatives ? Object.values(creatives).reduce((sum, arr) => sum + arr.length, 0) : 0})`}
                </AccordionTrigger>
                <AccordionContent>
                  {creatives ? (
                    <div className="space-y-6">
                      <AdCreativeSection
                        title="📰 Headlines (10 variants)"
                        description="Attractive headlines for advertising"
                        items={creatives.headlines}
                        type="headline"
                      />
                      <AdCreativeSection
                        title="📝 Google Ads Descriptions (5 variants)"
                        description="Description texts for Google ads"
                        items={creatives.googleAdsDescriptions}
                        type="description"
                      />
                      <AdCreativeSection
                        title="📱 Meta Ads Texts (5 variants)"
                        description="Ad texts for Facebook, Instagram and other Meta platforms"
                        items={creatives.metaAdsTexts}
                        type="description"
                      />
                      <AdCreativeSection
                        title="🎯 Hero Texts (3 variants)"
                        description="Main promo texts for main screens and banners"
                        items={creatives.heroTexts}
                        type="hero"
                      />
                      <AdCreativeSection
                        title="🚀 Call-to-Actions (3 variants)"
                        description="Effective CTA (Call-to-Action) for increasing conversion"
                        items={creatives.ctaVariations}
                        type="cta"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-8">
                      <div className="relative">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary"></div>
                      </div>
                      <p className="ml-4 text-muted-foreground">{currentGeneratingText}</p>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2026 AdCreative Generator. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
