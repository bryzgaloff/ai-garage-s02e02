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
    functional: "Функциональная",
    emotional: "Эмоциональная",
    social: "Социальная",
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



export default function Home() {
  const [productIdea, setProductIdea] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jtbd, setJtbd] = useState<JTBDResponse | null>(null);
  const [creatives, setCreatives] = useState<AdCreativeResponse | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [accordionValue, setAccordionValue] = useState<string[]>([]);
  const [loadingSections, setLoadingSections] = useState<Record<string, boolean>>({});
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productIdea.trim()) return;

    setIsLoading(true);
    setError(null);
    setJtbd(null);
    setCreatives(null);
    setShowResults(false);
    setAccordionValue(["jobs"]);
    setLoadingSections({
      jobs: true,
      pains: false,
      benefits: false,
      useCases: false,
      creatives: false,
    });
    setCompletedSections(new Set());

    try {
      const productIdeaTrimmed = productIdea.trim();

      const response = await fetch("/api/generate-jtbd-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIdea: productIdeaTrimmed }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body");
      }

      let buffer = "";
      setShowResults(true);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");

        buffer = lines.pop() || ""; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith("event: ")) {
            const eventType = line.slice(7);
            const dataLine = lines[lines.indexOf(line) + 1];
            if (dataLine && dataLine.startsWith("data: ")) {
              const data = JSON.parse(dataLine.slice(6));

              switch (eventType) {
                case "jobs":
                  if (data.status === "generating") {
                    setLoadingSections(prev => ({ ...prev, jobs: true }));
                  } else {
                    setJtbd(prev => ({
                      jobs: [
                        ...data.functional.map((text: string, i: number) => ({ id: `job-func-${i}`, text, type: "functional" as const })),
                        ...data.emotional.map((text: string, i: number) => ({ id: `job-emo-${i}`, text, type: "emotional" as const })),
                        ...data.social.map((text: string, i: number) => ({ id: `job-soc-${i}`, text, type: "social" as const })),
                      ],
                      pains: prev?.pains || [],
                      benefits: prev?.benefits || [],
                      useCases: prev?.useCases || [],
                    }));
                    setLoadingSections(prev => ({ ...prev, jobs: false }));
                    setCompletedSections(prev => new Set([...prev, "jobs"]));
                    setAccordionValue(["pains"]);
                    setLoadingSections(prev => ({ ...prev, pains: true }));
                  }
                  break;
                case "pains":
                  if (data.status === "generating") {
                    setLoadingSections(prev => ({ ...prev, pains: true }));
                  } else {
                    setJtbd(prev => ({
                      jobs: prev?.jobs || [],
                      pains: [
                        ...data.functional.map((text: string, i: number) => ({ id: `pain-func-${i}`, text, type: "functional" as const })),
                        ...data.emotional.map((text: string, i: number) => ({ id: `pain-emo-${i}`, text, type: "emotional" as const })),
                        ...data.social.map((text: string, i: number) => ({ id: `pain-soc-${i}`, text, type: "social" as const })),
                      ],
                      benefits: prev?.benefits || [],
                      useCases: prev?.useCases || [],
                    }));
                    setLoadingSections(prev => ({ ...prev, pains: false }));
                    setCompletedSections(prev => new Set([...prev, "pains"]));
                    setAccordionValue(["benefits"]);
                    setLoadingSections(prev => ({ ...prev, benefits: true }));
                  }
                  break;
                case "benefits":
                  if (data.status === "generating") {
                    setLoadingSections(prev => ({ ...prev, benefits: true }));
                  } else {
                    setJtbd(prev => ({
                      jobs: prev?.jobs || [],
                      pains: prev?.pains || [],
                      benefits: data.benefits.map((text: string, i: number) => ({ id: `benefit-${i}`, text })),
                      useCases: prev?.useCases || [],
                    }));
                    setLoadingSections(prev => ({ ...prev, benefits: false }));
                    setCompletedSections(prev => new Set([...prev, "benefits"]));
                    setAccordionValue(["useCases"]);
                    setLoadingSections(prev => ({ ...prev, useCases: true }));
                  }
                  break;
                case "useCases":
                  if (data.status === "generating") {
                    setLoadingSections(prev => ({ ...prev, useCases: true }));
                  } else {
                    setJtbd(prev => ({
                      jobs: prev?.jobs || [],
                      pains: prev?.pains || [],
                      benefits: prev?.benefits || [],
                      useCases: data.useCases.map((text: string, i: number) => ({ id: `usecase-${i}`, text })),
                    }));
                    setLoadingSections(prev => ({ ...prev, useCases: false }));
                    setCompletedSections(prev => new Set([...prev, "useCases"]));
                    setAccordionValue(["creatives"]);
                    setLoadingSections(prev => ({ ...prev, creatives: true }));
                  }
                  break;
                case "creatives":
                  if (data.status === "generating") {
                    setLoadingSections(prev => ({ ...prev, creatives: true }));
                  } else {
                    setCreatives({
                      headlines: data.headlines.map((text: string, i: number) => ({ id: `hl-${i}`, text })),
                      googleAdsDescriptions: data.googleAdsDescriptions.map((text: string, i: number) => ({ id: `gad-${i}`, text })),
                      metaAdsTexts: data.metaAdsTexts.map((text: string, i: number) => ({ id: `mad-${i}`, text })),
                      heroTexts: data.heroTexts.map((text: string, i: number) => ({ id: `hero-${i}`, text })),
                      ctaVariations: data.ctaVariations.map((text: string, i: number) => ({ id: `cta-${i}`, text })),
                    });
                    setLoadingSections(prev => ({ ...prev, creatives: false }));
                    setCompletedSections(prev => new Set([...prev, "creatives"]));
                    setAccordionValue([]); // Collapse all
                  }
                  break;
                case "complete":
                  setIsLoading(false);
                  break;
                case "error":
                  throw new Error(data.message);
                  break;
              }
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Неизвестная ошибка");
      setIsLoading(false);
      setLoadingSections({});
    }
  };

  const handleRetry = () => {
    setError(null);
    handleSubmit({ preventDefault: () => {} } as React.FormEvent);
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
        {showResults && (
          <section className="py-12 border-t">
            <SectionHeader
              title="Анализ Jobs To Be Done"
              description="Прогрессивный анализ выполняется поэтапно..."
            />
            <Accordion value={accordionValue} onValueChange={setAccordionValue} className="w-full">
              <AccordionItem value="jobs">
                <AccordionTrigger>
                  🎯 Работы (Jobs)
                  {loadingSections.jobs && <span className="ml-2 text-sm text-muted-foreground">Работы генерируются...</span>}
                  {completedSections.has("jobs") && !loadingSections.jobs && (
                    <span className="ml-2 text-sm text-green-600">✓ Завершено</span>
                  )}
                </AccordionTrigger>
                <AccordionContent>
                  {jtbd?.jobs && jtbd.jobs.length > 0 ? (
                    <JTBDSection
                      title=""
                      description="Функциональные, эмоциональные и социальные работы, которые выполняет продукт"
                      items={jtbd.jobs}
                      type="job"
                    />
                  ) : loadingSections.jobs ? (
                    <LoadingSpinner />
                  ) : null}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="pains">
                <AccordionTrigger>
                  💢 Боли (Pains)
                  {loadingSections.pains && <span className="ml-2 text-sm text-muted-foreground">Боли генерируются...</span>}
                  {completedSections.has("pains") && !loadingSections.pains && (
                    <span className="ml-2 text-sm text-green-600">✓ Завершено</span>
                  )}
                </AccordionTrigger>
                <AccordionContent>
                  {jtbd?.pains && jtbd.pains.length > 0 ? (
                    <JTBDSection
                      title=""
                      description="Функциональные, эмоциональные и социальные боли клиентов"
                      items={jtbd.pains}
                      type="pain"
                    />
                  ) : loadingSections.pains ? (
                    <LoadingSpinner />
                  ) : null}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="benefits">
                <AccordionTrigger>
                  ✅ Выгоды (Benefits)
                  {loadingSections.benefits && <span className="ml-2 text-sm text-muted-foreground">Выгоды генерируются...</span>}
                  {completedSections.has("benefits") && !loadingSections.benefits && (
                    <span className="ml-2 text-sm text-green-600">✓ Завершено</span>
                  )}
                </AccordionTrigger>
                <AccordionContent>
                  {jtbd?.benefits && jtbd.benefits.length > 0 ? (
                    <JTBDSection
                      title=""
                      description="Ключевые преимущества и ценности продукта"
                      items={jtbd.benefits}
                      type="benefit"
                    />
                  ) : loadingSections.benefits ? (
                    <LoadingSpinner />
                  ) : null}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="useCases">
                <AccordionTrigger>
                  📋 Сценарии использования (Use Cases)
                  {loadingSections.useCases && <span className="ml-2 text-sm text-muted-foreground">Сценарии генерируются...</span>}
                  {completedSections.has("useCases") && !loadingSections.useCases && (
                    <span className="ml-2 text-sm text-green-600">✓ Завершено</span>
                  )}
                </AccordionTrigger>
                <AccordionContent>
                  {jtbd?.useCases && jtbd.useCases.length > 0 ? (
                    <JTBDSection
                      title=""
                      description="Конкретные ситуации применения продукта"
                      items={jtbd.useCases}
                      type="usecase"
                    />
                  ) : loadingSections.useCases ? (
                    <LoadingSpinner />
                  ) : null}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="creatives">
                <AccordionTrigger>
                  🎨 Рекламные креативы (Creatives)
                  {loadingSections.creatives && <span className="ml-2 text-sm text-muted-foreground">Креативы генерируются...</span>}
                  {completedSections.has("creatives") && !loadingSections.creatives && (
                    <span className="ml-2 text-sm text-green-600">✓ Завершено</span>
                  )}
                </AccordionTrigger>
                <AccordionContent>
                  {creatives ? (
                    <div className="grid gap-6">
                      <AdCreativeSection
                        title="📰 Заголовки (10 вариантов)"
                        description="Привлекательные заголовки для рекламы"
                        items={creatives.headlines}
                        type="headline"
                      />
                      <AdCreativeSection
                        title="📝 Описания для Google Ads (5 вариантов)"
                        description="Тексты описаний для рекламных объявлений в Google"
                        items={creatives.googleAdsDescriptions}
                        type="description"
                      />
                      <AdCreativeSection
                        title="📱 Тексты для Meta Ads (5 вариантов)"
                        description="Рекламные тексты для Facebook, Instagram и других платформ Meta"
                        items={creatives.metaAdsTexts}
                        type="description"
                      />
                      <AdCreativeSection
                        title="🎯 Hero тексты (3 варианта)"
                        description="Основные промо-тексты для главных экранов и баннеров"
                        items={creatives.heroTexts}
                        type="hero"
                      />
                      <AdCreativeSection
                        title="🚀 Призывы к действию (3 варианта)"
                        description="Эффективные CTA (Call-to-Action) для увеличения конверсии"
                        items={creatives.ctaVariations}
                        type="cta"
                      />
                    </div>
                  ) : loadingSections.creatives ? (
                    <LoadingSpinner />
                  ) : null}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>
        )}
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
