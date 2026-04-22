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

interface JTBDApiResponse {
  jtbd: {
    jobs: { functional: string[]; emotional: string[]; social: string[] };
    pains: { functional: string[]; emotional: string[]; social: string[] };
    benefits: string[];
    useCases: string[];
  };
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

// JTBD Card component
function JTBDSection({ title, description, items, type }: {
  title: string;
  description?: string;
  items: Job[] | Pain[] | Benefit[] | UseCase[];
  type: "job" | "pain" | "benefit" | "usecase";
}) {
  const typeLabels = {
    job: "Job",
    pain: "Pain",
    benefit: "Benefit",
    usecase: "Use Case",
  };

  const tagVariants: Record<string, "default" | "functional" | "emotional" | "social"> = {
    functional: "functional",
    emotional: "emotional",
    social: "social",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>{title}</span>
          <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {items.length}
          </span>
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-1.5 rounded-lg border bg-muted/50 px-3 py-2 text-sm"
            >
              {type === "job" || type === "pain" ? (
                <Tag variant={tagVariants[(item as Job).type] || "default"} />
              ) : (
                <span className="text-muted-foreground">
                  {type === "benefit" ? "✓" : "→"}
                </span>
              )}
              <span>{(item as Job | Pain | Benefit | UseCase).text}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

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

// Loading spinner component
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="relative">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-primary"></div>
        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-primary">
          AI
        </div>
      </div>
      <p className="ml-4 text-muted-foreground">Анализируем ваш продукт...</p>
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
            <h3 className="font-semibold text-destructive">Произошла ошибка</h3>
            <p className="mt-1 text-sm text-muted-foreground">{message}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={onRetry}
            >
              Попробовать снова
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Empty state component
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed bg-muted/20 p-12 text-center">
      <div className="mb-4 text-5xl">🎨</div>
      <h3 className="text-lg font-semibold">Генератор рекламных креативов</h3>
      <p className="mt-2 max-w-md text-muted-foreground">
        Введите описание вашего продукта, и мы создадим для вас получите 10 вариантов рекламных заголовков и тексты объявлений для Google и Meta.
      </p>
    </div>
  );
}

export default function Home() {
  const [productIdea, setProductIdea] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingCreatives, setIsGeneratingCreatives] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jtbd, setJtbd] = useState<JTBDResponse | null>(null);
  const [partialJtbd, setPartialJtbd] = useState<PartialJTBD>({});
  const [creatives, setCreatives] = useState<AdCreativeResponse | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>("");
  const [openAccordion, setOpenAccordion] = useState<string | undefined>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productIdea.trim()) return;

    setIsLoading(true);
    setError(null);
    setJtbd(null);
    setPartialJtbd({});
    setCreatives(null);
    setShowResults(false);

    try {
      const productIdeaTrimmed = productIdea.trim();
      setShowResults(true);

      let accumulatedData: PartialJTBD = {};
      let jtbdData: JTBDResponse | null = null;

      const eventSource = new EventSource(`/api/generate-jtbd-stream?productIdea=${encodeURIComponent(productIdeaTrimmed)}`);

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === 'jobs') {
          accumulatedData.functionalJobs = data.functional;
          accumulatedData.emotionalJobs = data.emotional;
          accumulatedData.socialJobs = data.social;
          setPartialJtbd({ ...accumulatedData });
          setCurrentStep('jobs');
          setOpenAccordion('jobs');
        } else if (data.type === 'pains') {
          accumulatedData.functionalPains = data.functional;
          accumulatedData.emotionalPains = data.emotional;
          accumulatedData.socialPains = data.social;
          setPartialJtbd({ ...accumulatedData });
          setCurrentStep('pains');
          setOpenAccordion('pains');
        } else if (data.type === 'benefits') {
          accumulatedData.benefits = data.benefits;
          setPartialJtbd({ ...accumulatedData });
          setCurrentStep('benefits');
          setOpenAccordion('benefits');
        } else if (data.type === 'useCases') {
          accumulatedData.useCases = data.useCases;
          setPartialJtbd({ ...accumulatedData });
          setCurrentStep('useCases');
          setOpenAccordion('useCases');

          // Convert to full JTBD response
          jtbdData = {
            jobs: [
              ...(accumulatedData.functionalJobs || []).map((text: string, i: number) => ({ id: `job-func-${i}`, text, type: "functional" as const })),
              ...(accumulatedData.emotionalJobs || []).map((text: string, i: number) => ({ id: `job-emo-${i}`, text, type: "emotional" as const })),
              ...(accumulatedData.socialJobs || []).map((text: string, i: number) => ({ id: `job-soc-${i}`, text, type: "social" as const })),
            ],
            pains: [
              ...(accumulatedData.functionalPains || []).map((text: string, i: number) => ({ id: `pain-func-${i}`, text, type: "functional" as const })),
              ...(accumulatedData.emotionalPains || []).map((text: string, i: number) => ({ id: `pain-emo-${i}`, text, type: "emotional" as const })),
              ...(accumulatedData.socialPains || []).map((text: string, i: number) => ({ id: `pain-soc-${i}`, text, type: "social" as const })),
            ],
            benefits: (accumulatedData.benefits || []).map((text: string, i: number) => ({ id: `benefit-${i}`, text })),
            useCases: (accumulatedData.useCases || []).map((text: string, i: number) => ({ id: `usecase-${i}`, text })),
          };
          setJtbd(jtbdData);
        } else if (data.type === 'creatives') {
          const creatives: AdCreativeResponse = {
            headlines: (data.creatives?.headlines || []).map((text: string, i: number) => ({ id: `hl-${i}`, text })),
            googleAdsDescriptions: (data.creatives?.googleAds || []).map((text: string, i: number) => ({ id: `gad-${i}`, text })),
            metaAdsTexts: (data.creatives?.metaAds || []).map((text: string, i: number) => ({ id: `mad-${i}`, text })),
            heroTexts: (data.creatives?.heroTexts || []).map((text: string, i: number) => ({ id: `hero-${i}`, text })),
            ctaVariations: (data.creatives?.ctaVariations || []).map((text: string, i: number) => ({ id: `cta-${i}`, text })),
          };
          setCreatives(creatives);
          setCurrentStep('creatives');
          setOpenAccordion('creatives');
          setIsLoading(false);
          eventSource.close();
        }
      };

      eventSource.onerror = (error) => {
        setError("Ошибка при генерации данных");
        setIsLoading(false);
        eventSource.close();
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : "Неизвестная ошибка");
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setIsGeneratingCreatives(false);
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
              Ввод
            </a>
            <a href="#jtbd" className="text-sm font-medium hover:text-primary">
              JTBD
            </a>
            <a href="#creatives" className="text-sm font-medium hover:text-primary">
              Креативы
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
                Введи описание своего продукта
              </h1>
              <p className="text-xl text-muted-foreground">
                получи 10 вариантов рекламных заголовков + тексты объявлений для Google/Meta
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Textarea
                  value={productIdea}
                  onChange={(e) => setProductIdea(e.target.value)}
                  placeholder="Опишите ваш продукт, целевую аудиторию, основные преимущества..."
                  rows={5}
                  className="resize-none text-base"
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  Чем подробнее описание, тем лучше результат
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
                      Генерация...
                    </>
                  ) : (
                    "Сгенерировать креативы"
                  )}
                </Button>
              </div>
            </form>

            {isLoading && <LoadingSpinner />}

            {error && <ErrorMessage message={error} onRetry={handleRetry} />}
          </div>
        </section>

        {/* Results section */}
        {showResults && (() => {
          const displayJtbd = getDisplayJtbd();
          return (
          <>
            {/* JTBD Section */}
            {showResults && (
              <section id="jtbd" className="py-12 border-t">
                <SectionHeader
                  title="Анализ Jobs To Be Done"
                  description={jtbd && creatives ? "Определены ключевые работы, боли, выгоды и сценарии использования" : "Анализ выполняется поэтапно..."}
                />
                <Accordion defaultValue={openAccordion as any} onValueChange={(value: any) => setOpenAccordion(value)} className="w-full">
                  <AccordionItem value="jobs">
                    <AccordionTrigger>
                      <span className="flex items-center gap-2">
                        <span>🎯 Jobs</span>
                        {!partialJtbd.functionalJobs && !partialJtbd.emotionalJobs && !partialJtbd.socialJobs && isLoading && (
                          <span className="text-xs text-muted-foreground">Jobs are generating...</span>
                        )}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {(partialJtbd.functionalJobs || []).map((text, i) => (
                          <div key={`job-func-${i}`} className="flex items-center gap-1.5 rounded-lg border bg-muted/50 px-3 py-2 text-sm">
                            <Tag variant="functional" />
                            <span>{text}</span>
                          </div>
                        ))}
                        {(partialJtbd.emotionalJobs || []).map((text, i) => (
                          <div key={`job-emo-${i}`} className="flex items-center gap-1.5 rounded-lg border bg-muted/50 px-3 py-2 text-sm">
                            <Tag variant="emotional" />
                            <span>{text}</span>
                          </div>
                        ))}
                        {(partialJtbd.socialJobs || []).map((text, i) => (
                          <div key={`job-soc-${i}`} className="flex items-center gap-1.5 rounded-lg border bg-muted/50 px-3 py-2 text-sm">
                            <Tag variant="social" />
                            <span>{text}</span>
                          </div>
                        ))}
                        {!partialJtbd.functionalJobs && !partialJtbd.emotionalJobs && !partialJtbd.socialJobs && (
                          <span className="text-muted-foreground text-sm">No jobs yet...</span>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="pains">
                    <AccordionTrigger>
                      <span className="flex items-center gap-2">
                        <span>💢 Pains</span>
                        {!partialJtbd.functionalPains && !partialJtbd.emotionalPains && !partialJtbd.socialPains && currentStep === 'jobs' && isLoading && (
                          <span className="text-xs text-muted-foreground">Pains are generating...</span>
                        )}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {(partialJtbd.functionalPains || []).map((text, i) => (
                          <div key={`pain-func-${i}`} className="flex items-center gap-1.5 rounded-lg border bg-muted/50 px-3 py-2 text-sm">
                            <Tag variant="functional" />
                            <span>{text}</span>
                          </div>
                        ))}
                        {(partialJtbd.emotionalPains || []).map((text, i) => (
                          <div key={`pain-emo-${i}`} className="flex items-center gap-1.5 rounded-lg border bg-muted/50 px-3 py-2 text-sm">
                            <Tag variant="emotional" />
                            <span>{text}</span>
                          </div>
                        ))}
                        {(partialJtbd.socialPains || []).map((text, i) => (
                          <div key={`pain-soc-${i}`} className="flex items-center gap-1.5 rounded-lg border bg-muted/50 px-3 py-2 text-sm">
                            <Tag variant="social" />
                            <span>{text}</span>
                          </div>
                        ))}
                        {!partialJtbd.functionalPains && !partialJtbd.emotionalPains && !partialJtbd.socialPains && (
                          <span className="text-muted-foreground text-sm">No pains yet...</span>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="benefits">
                    <AccordionTrigger>
                      <span className="flex items-center gap-2">
                        <span>✅ Benefits</span>
                        {!partialJtbd.benefits && currentStep === 'pains' && isLoading && (
                          <span className="text-xs text-muted-foreground">Benefits are generating...</span>
                        )}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {(partialJtbd.benefits || []).map((text, i) => (
                          <div key={`benefit-${i}`} className="flex items-center gap-1.5 rounded-lg border bg-muted/50 px-3 py-2 text-sm">
                            <span className="text-muted-foreground">✓</span>
                            <span>{text}</span>
                          </div>
                        ))}
                        {!partialJtbd.benefits && (
                          <span className="text-muted-foreground text-sm">No benefits yet...</span>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="useCases">
                    <AccordionTrigger>
                      <span className="flex items-center gap-2">
                        <span>📋 Use Cases</span>
                        {!partialJtbd.useCases && currentStep === 'benefits' && isLoading && (
                          <span className="text-xs text-muted-foreground">Use Cases are generating...</span>
                        )}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {(partialJtbd.useCases || []).map((text, i) => (
                          <div key={`usecase-${i}`} className="flex items-center gap-1.5 rounded-lg border bg-muted/50 px-3 py-2 text-sm">
                            <span className="text-muted-foreground">→</span>
                            <span>{text}</span>
                          </div>
                        ))}
                        {!partialJtbd.useCases && (
                          <span className="text-muted-foreground text-sm">No use cases yet...</span>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="creatives">
                    <AccordionTrigger>
                      <span className="flex items-center gap-2">
                        <span>🎨 Creatives</span>
                        {!creatives && currentStep === 'useCases' && isLoading && (
                          <span className="text-xs text-muted-foreground">Creatives are generating...</span>
                        )}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid gap-4 pt-2">
                        {creatives ? (
                          <>
                            <div>
                              <h4 className="text-sm font-semibold mb-2">📰 Headlines</h4>
                              <div className="grid gap-2">
                                {creatives.headlines.map((item) => (
                                  <div key={item.id} className="rounded-lg border bg-muted/30 p-4">
                                    <p className="text-sm font-medium leading-relaxed">{item.text}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold mb-2">📝 Google Ads Descriptions</h4>
                              <div className="grid gap-2">
                                {creatives.googleAdsDescriptions.map((item) => (
                                  <div key={item.id} className="rounded-lg border bg-muted/30 p-4">
                                    <p className="text-sm font-medium leading-relaxed">{item.text}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold mb-2">📱 Meta Ads Texts</h4>
                              <div className="grid gap-2">
                                {creatives.metaAdsTexts.map((item) => (
                                  <div key={item.id} className="rounded-lg border bg-muted/30 p-4">
                                    <p className="text-sm font-medium leading-relaxed">{item.text}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold mb-2">🎯 Hero Texts</h4>
                              <div className="grid gap-2">
                                {creatives.heroTexts.map((item) => (
                                  <div key={item.id} className="rounded-lg border bg-muted/30 p-4">
                                    <p className="text-sm font-medium leading-relaxed">{item.text}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold mb-2">🚀 CTA Variations</h4>
                              <div className="grid gap-2">
                                {creatives.ctaVariations.map((item) => (
                                  <div key={item.id} className="rounded-lg border bg-muted/30 p-4">
                                    <p className="text-sm font-medium leading-relaxed">{item.text}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </>
                        ) : (
                          <span className="text-muted-foreground text-sm">No creatives yet...</span>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </section>
            )}
          </>
          );
        })()}
      </main>

      {/* Footer */}
      <footer className="border-t py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2026 AdCreative Generator. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
}
