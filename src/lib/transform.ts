// API transformation utilities for JTBD and Ad Creatives

export interface Job {
  id: string;
  text: string;
  type: "functional" | "emotional" | "social";
}

export interface Pain {
  id: string;
  text: string;
  type: "functional" | "emotional" | "social";
}

export interface Benefit {
  id: string;
  text: string;
}

export interface UseCase {
  id: string;
  text: string;
}

export interface JTBDResponse {
  jobs: Job[];
  pains: Pain[];
  benefits: Benefit[];
  useCases: UseCase[];
}

export interface JTBDApiResponse {
  jtbd?: {
    jobs?: { functional?: string[]; emotional?: string[]; social?: string[] };
    pains?: { functional?: string[]; emotional?: string[]; social?: string[] };
    benefits?: string[];
    useCases?: string[];
  };
}

export interface AdHeadline {
  id: string;
  text: string;
}

export interface AdDescription {
  id: string;
  text: string;
}

export interface AdCreativeResponse {
  headlines: AdHeadline[];
  googleAdsDescriptions: AdDescription[];
  metaAdsTexts: AdDescription[];
  heroTexts: AdHeadline[];
  ctaVariations: AdHeadline[];
}

export interface CreativesApiResponse {
  creatives?: {
    headlines?: string[];
    googleAds?: string[];
    metaAds?: string[];
    heroTexts?: string[];
    ctaVariations?: string[];
  };
}

function isStringArray(arr: unknown): arr is string[] {
  return Array.isArray(arr) && arr.every((item) => typeof item === 'string');
}

export function transformJTBD(jtbdRaw: JTBDApiResponse | undefined): JTBDResponse {
  if (!jtbdRaw?.jtbd) {
    return {
      jobs: [],
      pains: [],
      benefits: [],
      useCases: [],
    };
  }

  const jtbd = jtbdRaw.jtbd;

  return {
    jobs: [
      ...(isStringArray(jtbd.jobs?.functional) ? jtbd.jobs.functional.map((text: string, i: number) => ({ id: `job-func-${i}`, text, type: "functional" as const })) : []),
      ...(isStringArray(jtbd.jobs?.emotional) ? jtbd.jobs.emotional.map((text: string, i: number) => ({ id: `job-emo-${i}`, text, type: "emotional" as const })) : []),
      ...(isStringArray(jtbd.jobs?.social) ? jtbd.jobs.social.map((text: string, i: number) => ({ id: `job-soc-${i}`, text, type: "social" as const })) : []),
    ],
    pains: [
      ...(isStringArray(jtbd.pains?.functional) ? jtbd.pains.functional.map((text: string, i: number) => ({ id: `pain-func-${i}`, text, type: "functional" as const })) : []),
      ...(isStringArray(jtbd.pains?.emotional) ? jtbd.pains.emotional.map((text: string, i: number) => ({ id: `pain-emo-${i}`, text, type: "emotional" as const })) : []),
      ...(isStringArray(jtbd.pains?.social) ? jtbd.pains.social.map((text: string, i: number) => ({ id: `pain-soc-${i}`, text, type: "social" as const })) : []),
    ],
    benefits: isStringArray(jtbd.benefits) ? jtbd.benefits.map((text: string, i: number) => ({ id: `benefit-${i}`, text })) : [],
    useCases: isStringArray(jtbd.useCases) ? jtbd.useCases.map((text: string, i: number) => ({ id: `usecase-${i}`, text })) : [],
  };
}

export function transformCreatives(creativesRaw: CreativesApiResponse | undefined): AdCreativeResponse {
  if (!creativesRaw?.creatives) {
    return {
      headlines: [],
      googleAdsDescriptions: [],
      metaAdsTexts: [],
      heroTexts: [],
      ctaVariations: [],
    };
  }

  const creatives = creativesRaw.creatives;

  return {
    headlines: isStringArray(creatives.headlines) ? creatives.headlines.map((text: string, i: number) => ({ id: `hl-${i}`, text })) : [],
    googleAdsDescriptions: isStringArray(creatives.googleAds) ? creatives.googleAds.map((text: string, i: number) => ({ id: `gad-${i}`, text })) : [],
    metaAdsTexts: isStringArray(creatives.metaAds) ? creatives.metaAds.map((text: string, i: number) => ({ id: `mad-${i}`, text })) : [],
    heroTexts: isStringArray(creatives.heroTexts) ? creatives.heroTexts.map((text: string, i: number) => ({ id: `hero-${i}`, text })) : [],
    ctaVariations: isStringArray(creatives.ctaVariations) ? creatives.ctaVariations.map((text: string, i: number) => ({ id: `cta-${i}`, text })) : [],
  };
}