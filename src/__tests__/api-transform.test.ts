import { transformJTBD, transformCreatives } from "@/lib/transform";

describe("transformJTBD", () => {
  it("transforms JTBD API response to UI format", () => {
    const input = {
      jtbd: {
        jobs: { functional: ["Fix plumbing leaks"], emotional: ["Feel confident"], social: ["Impress neighbors"] },
        pains: { functional: ["Water damage"], emotional: ["Stress"], social: ["Neighbor complaints"] },
        benefits: ["Peace of mind"],
        useCases: ["Emergency repairs"],
      },
    };

    const result = transformJTBD(input);

    expect(result.jobs).toHaveLength(3);
    expect(result.jobs[0]).toEqual({ id: "job-func-0", text: "Fix plumbing leaks", type: "functional" });
    expect(result.jobs[1]).toEqual({ id: "job-emo-0", text: "Feel confident", type: "emotional" });
    expect(result.jobs[2]).toEqual({ id: "job-soc-0", text: "Impress neighbors", type: "social" });

    expect(result.pains).toHaveLength(3);
    expect(result.pains[0]).toEqual({ id: "pain-func-0", text: "Water damage", type: "functional" });
    expect(result.pains[1]).toEqual({ id: "pain-emo-0", text: "Stress", type: "emotional" });
    expect(result.pains[2]).toEqual({ id: "pain-soc-0", text: "Neighbor complaints", type: "social" });

    expect(result.benefits).toHaveLength(1);
    expect(result.benefits[0]).toEqual({ id: "benefit-0", text: "Peace of mind" });

    expect(result.useCases).toHaveLength(1);
    expect(result.useCases[0]).toEqual({ id: "usecase-0", text: "Emergency repairs" });
  });

  it("handles undefined jtbd object", () => {
    const result = transformJTBD(undefined as any);

    expect(result.jobs).toEqual([]);
    expect(result.pains).toEqual([]);
    expect(result.benefits).toEqual([]);
    expect(result.useCases).toEqual([]);
  });

  it("handles undefined arrays", () => {
    const input = { jtbd: {} };

    const result = transformJTBD(input);

    expect(result.jobs).toEqual([]);
    expect(result.pains).toEqual([]);
    expect(result.benefits).toEqual([]);
    expect(result.useCases).toEqual([]);
  });

  it("handles partial arrays", () => {
    const input = {
      jtbd: {
        jobs: { functional: ["Job 1"] },
        pains: {},
        benefits: ["Benefit 1"],
        useCases: [],
      },
    };

    const result = transformJTBD(input);

    expect(result.jobs).toHaveLength(1);
    expect(result.pains).toHaveLength(0);
    expect(result.benefits).toHaveLength(1);
    expect(result.useCases).toHaveLength(0);
  });

  it("handles malformed input gracefully", () => {
    const input = {
      jtbd: {
        jobs: { functional: null, emotional: undefined },
        pains: "not an object",
        benefits: { wrong: "format" },
      },
    } as any;

    const result = transformJTBD(input);

    expect(result.jobs).toEqual([]);
    expect(result.pains).toEqual([]);
    expect(result.benefits).toEqual([]);
    expect(result.useCases).toEqual([]);
  });
});

describe("transformCreatives", () => {
  it("transforms creatives API response to UI format", () => {
    const input = {
      creatives: {
        headlines: ["Headline 1", "Headline 2"],
        googleAds: ["Google Ad 1"],
        metaAds: ["Meta Ad 1"],
        heroTexts: ["Hero 1"],
        ctaVariations: ["CTA 1"],
      },
    };

    const result = transformCreatives(input);

    expect(result.headlines).toHaveLength(2);
    expect(result.headlines[0]).toEqual({ id: "hl-0", text: "Headline 1" });
    expect(result.headlines[1]).toEqual({ id: "hl-1", text: "Headline 2" });

    expect(result.googleAdsDescriptions).toHaveLength(1);
    expect(result.googleAdsDescriptions[0]).toEqual({ id: "gad-0", text: "Google Ad 1" });

    expect(result.metaAdsTexts).toHaveLength(1);
    expect(result.metaAdsTexts[0]).toEqual({ id: "mad-0", text: "Meta Ad 1" });

    expect(result.heroTexts).toHaveLength(1);
    expect(result.heroTexts[0]).toEqual({ id: "hero-0", text: "Hero 1" });

    expect(result.ctaVariations).toHaveLength(1);
    expect(result.ctaVariations[0]).toEqual({ id: "cta-0", text: "CTA 1" });
  });

  it("handles undefined creatives object", () => {
    const result = transformCreatives(undefined as any);

    expect(result.headlines).toEqual([]);
    expect(result.googleAdsDescriptions).toEqual([]);
    expect(result.metaAdsTexts).toEqual([]);
    expect(result.heroTexts).toEqual([]);
    expect(result.ctaVariations).toEqual([]);
  });

  it("handles undefined arrays", () => {
    const input = { creatives: {} };

    const result = transformCreatives(input);

    expect(result.headlines).toEqual([]);
    expect(result.googleAdsDescriptions).toEqual([]);
    expect(result.metaAdsTexts).toEqual([]);
    expect(result.heroTexts).toEqual([]);
    expect(result.ctaVariations).toEqual([]);
  });

  it("handles partial arrays", () => {
    const input = {
      creatives: {
        headlines: ["Headline 1"],
      },
    };

    const result = transformCreatives(input);

    expect(result.headlines).toHaveLength(1);
    expect(result.googleAdsDescriptions).toHaveLength(0);
  });

  it("handles malformed input gracefully", () => {
    const input = {
      creatives: {
        headlines: null,
        googleAds: "not an array",
        metaAds: { nested: "object" },
      },
    } as any;

    const result = transformCreatives(input);

    expect(result.headlines).toEqual([]);
    expect(result.googleAdsDescriptions).toEqual([]);
    expect(result.metaAdsTexts).toEqual([]);
    expect(result.heroTexts).toEqual([]);
    expect(result.ctaVariations).toEqual([]);
  });

  it("handles multiple items in arrays", () => {
    const input = {
      creatives: {
        headlines: ["h1", "h2", "h3"],
        googleAds: ["g1", "g2"],
      },
    };

    const result = transformCreatives(input);

    expect(result.headlines).toEqual([
      { id: "hl-0", text: "h1" },
      { id: "hl-1", text: "h2" },
      { id: "hl-2", text: "h3" },
    ]);
    expect(result.googleAdsDescriptions).toEqual([
      { id: "gad-0", text: "g1" },
      { id: "gad-1", text: "g2" },
    ]);
  });
});