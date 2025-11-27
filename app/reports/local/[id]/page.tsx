"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ThemeSwitcher } from "@/components/theme-switcher";
import {
  AncestryComposition,
  type AncestryRegion,
  type Haplogroups as HaplogroupsData,
  type FlatAncestryComponent,
} from "@/components/ancestry-composition";
import {
  AlertCircle,
  Sparkles,
  MapPin,
  Dna,
  User,
  Globe,
  ChevronRight,
  Share2,
  Eye,
  Brain,
  History,
  FlaskConical,
  Printer,
  Heart,
  Utensils,
  Users,
  Loader2,
  Star,
  ScrollText,
  Award,
  BookUser,
  CalendarHeart,
  Download,
} from "lucide-react";

interface Haplogroups {
  paternal?: string[];
  maternal?: string[];
}

interface Match {
  name: string;
  confidence: number;
  reason: string;
  region: string;
  haplogroups: Haplogroups | string[];
  region_background: string;
  haplogroup_notes: string;
  morphology: string;
  population_genetics?: string;
  historical_context?: string;
}

interface FacialAnalysis {
  face_shape?: string;
  forehead?: string;
  eyes?: string;
  nose?: string;
  cheekbones?: string;
  jaw?: string;
  lips?: string;
  skin_tone?: string;
  distinctive_features?: string;
}

interface AncestryComponent {
  region: string;
  percentage: number;
  confidence?: string;
}

interface AnalysisData {
  uploadedImageUrl: string;
  matches: Match[];
  aiReport: string;
  detailedAnalysis?: string;
  facialAnalysis?: FacialAnalysis;
  ancestryComposition?: AncestryRegion[] | FlatAncestryComponent[] | AncestryComponent[];
  haplogroups?: HaplogroupsData | null;
  geneticHeritageSummary?: string;
  scientificNotes?: string;
  llmProvider?: string;
  createdAt?: string;
  raw?: unknown;
}

type EnrichmentSection =
  | "health_deep_dive"
  | "cultural_heritage"
  | "historical_migration"
  | "celebrity_lookalikes"
  | "genetic_traits"
  | "regional_cuisine"
  | "ancestor_letter"
  | "heritage_certificate"
  | "ancestral_names"
  | "cultural_calendar";

interface EnrichmentState {
  loading: boolean;
  data: Record<string, unknown> | null;
  error: string | null;
}

const ANCESTRY_COLORS = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-purple-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-orange-500",
  "bg-indigo-500",
];

// Component to render enrichment content based on section type
function EnrichmentContent({ section, data }: { section: EnrichmentSection; data: Record<string, unknown> }) {
  const renderArray = (arr: unknown[], renderItem: (item: unknown, idx: number) => React.ReactNode) => {
    if (!Array.isArray(arr)) return null;
    return arr.map((item, idx) => renderItem(item, idx));
  };

  const renderText = (text: unknown): React.ReactNode => {
    if (typeof text === "string") return text;
    if (typeof text === "number") return String(text);
    return null;
  };

  switch (section) {
    case "health_deep_dive": {
      const d = data as Record<string, unknown>;
      return (
        <div className="space-y-6">
          {d.title ? <h3 className="text-xl font-bold">{renderText(d.title)}</h3> : null}
          {d.genetic_health_overview ? (
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{renderText(d.genetic_health_overview)}</p>
          ) : null}

          {Array.isArray(d.health_advantages) && d.health_advantages.length > 0 && (
            <div>
              <h4 className="font-semibold text-green-600 mb-3 flex items-center gap-2">
                <Heart className="h-4 w-4" /> Health Advantages
              </h4>
              <div className="grid gap-3">
                {renderArray(d.health_advantages, (item, idx) => {
                  const adv = item as Record<string, unknown>;
                  return (
                    <div key={idx} className="p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                      <div className="font-medium">{renderText(adv.trait)}</div>
                      <p className="text-sm text-muted-foreground mt-1">{renderText(adv.description)}</p>
                      {!!adv.prevalence && <Badge variant="outline" className="mt-2 text-xs">{renderText(adv.prevalence)}</Badge>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {Array.isArray(d.health_considerations) && d.health_considerations.length > 0 && (
            <div>
              <h4 className="font-semibold text-amber-600 mb-3">Health Considerations</h4>
              <div className="grid gap-3">
                {renderArray(d.health_considerations, (item, idx) => {
                  const con = item as Record<string, unknown>;
                  return (
                    <div key={idx} className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                      <div className="font-medium">{renderText(con.condition)}</div>
                      <p className="text-sm text-muted-foreground mt-1">{renderText(con.description)}</p>
                      {Array.isArray(con.prevention_tips) && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {con.prevention_tips.map((tip, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">{renderText(tip)}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!!d.dietary_recommendations && typeof d.dietary_recommendations === "object" && (
            <div>
              <h4 className="font-semibold text-green-600 mb-3 flex items-center gap-2">
                <Utensils className="h-4 w-4" /> Dietary Recommendations
              </h4>
              <div className="grid md:grid-cols-2 gap-4">
                {Array.isArray((d.dietary_recommendations as Record<string, unknown>).foods_to_embrace) && (
                  <div className="p-3 rounded-lg bg-green-500/5">
                    <div className="text-sm font-medium text-green-600 mb-2">Foods to Embrace</div>
                    <ul className="text-sm space-y-1">
                      {((d.dietary_recommendations as Record<string, unknown>).foods_to_embrace as string[]).map((food, i) => (
                        <li key={i}>• {food}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {Array.isArray((d.dietary_recommendations as Record<string, unknown>).traditional_superfoods) && (
                  <div className="p-3 rounded-lg bg-emerald-500/5">
                    <div className="text-sm font-medium text-emerald-600 mb-2">Traditional Superfoods</div>
                    <ul className="text-sm space-y-1">
                      {((d.dietary_recommendations as Record<string, unknown>).traditional_superfoods as string[]).map((food, i) => (
                        <li key={i}>• {food}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {!!d.disclaimer && (
            <p className="text-xs text-muted-foreground italic border-t pt-4">{renderText(d.disclaimer)}</p>
          )}
        </div>
      );
    }

    case "cultural_heritage": {
      const d = data as Record<string, unknown>;
      return (
        <div className="space-y-6">
          {!!d.title && <h3 className="text-xl font-bold">{renderText(d.title)}</h3>}
          {!!d.cultural_overview && (
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{renderText(d.cultural_overview)}</p>
          )}

          {Array.isArray(d.festivals_celebrations) && d.festivals_celebrations.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-500" /> Festivals & Celebrations
              </h4>
              <div className="grid md:grid-cols-2 gap-3">
                {renderArray(d.festivals_celebrations, (item, idx) => {
                  const fest = item as Record<string, unknown>;
                  return (
                    <div key={idx} className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                      <div className="font-medium">{renderText(fest.name)}</div>
                      <div className="text-xs text-muted-foreground">{renderText(fest.timing)}</div>
                      <p className="text-sm mt-1">{renderText(fest.description)}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!!d.traditional_cuisine && typeof d.traditional_cuisine === "object" && (
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Utensils className="h-4 w-4 text-orange-500" /> Traditional Cuisine
              </h4>
              {Array.isArray((d.traditional_cuisine as Record<string, unknown>).signature_dishes) && (
                <div className="grid gap-3">
                  {((d.traditional_cuisine as Record<string, unknown>).signature_dishes as Array<Record<string, unknown>>).slice(0, 4).map((dish, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-orange-500/5 border border-orange-500/20">
                      <div className="font-medium">{renderText(dish.name)}</div>
                      <p className="text-sm text-muted-foreground">{renderText(dish.description)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {Array.isArray(d.places_to_visit) && d.places_to_visit.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-500" /> Places to Visit
              </h4>
              <div className="grid md:grid-cols-2 gap-3">
                {renderArray(d.places_to_visit, (item, idx) => {
                  const place = item as Record<string, unknown>;
                  return (
                    <div key={idx} className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                      <div className="font-medium">{renderText(place.name)}</div>
                      <div className="text-xs text-muted-foreground">{renderText(place.location)}</div>
                      <p className="text-sm mt-1">{renderText(place.why_visit)}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      );
    }

    case "historical_migration": {
      const d = data as Record<string, unknown>;
      return (
        <div className="space-y-6">
          {!!d.title && <h3 className="text-xl font-bold">{renderText(d.title)}</h3>}
          {!!d.origin_story && (
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{renderText(d.origin_story)}</p>
          )}

          {Array.isArray(d.migration_timeline) && d.migration_timeline.length > 0 && (
            <div>
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <History className="h-4 w-4 text-amber-500" /> Migration Timeline
              </h4>
              <div className="relative pl-4 border-l-2 border-amber-500/30 space-y-4">
                {renderArray(d.migration_timeline, (item, idx) => {
                  const event = item as Record<string, unknown>;
                  return (
                    <div key={idx} className="relative">
                      <div className="absolute -left-[21px] w-4 h-4 rounded-full bg-amber-500 border-2 border-background" />
                      <div className="p-3 rounded-lg bg-amber-500/5">
                        <div className="text-xs font-bold text-amber-600">{renderText(event.period)}</div>
                        <div className="font-medium mt-1">{renderText(event.event)}</div>
                        <p className="text-sm text-muted-foreground mt-1">{renderText(event.description)}</p>
                        {!!event.location_from && !!event.location_to && (
                          <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {renderText(event.location_from)} → {renderText(event.location_to)}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {Array.isArray(d.ancient_ancestors) && d.ancient_ancestors.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3">Ancient Ancestors</h4>
              <div className="grid md:grid-cols-2 gap-3">
                {renderArray(d.ancient_ancestors, (item, idx) => {
                  const ancestor = item as Record<string, unknown>;
                  return (
                    <div key={idx} className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
                      <div className="font-medium">{renderText(ancestor.population)}</div>
                      <Badge variant="outline" className="text-xs mt-1">{renderText(ancestor.contribution)}</Badge>
                      <p className="text-sm text-muted-foreground mt-2">{renderText(ancestor.characteristics)}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!!d.your_place_in_history && (
            <div className="p-4 rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
              <h4 className="font-semibold mb-2">Your Place in History</h4>
              <p className="text-sm whitespace-pre-wrap">{renderText(d.your_place_in_history)}</p>
            </div>
          )}
        </div>
      );
    }

    case "celebrity_lookalikes": {
      const d = data as Record<string, unknown>;
      return (
        <div className="space-y-6">
          {!!d.title && <h3 className="text-xl font-bold">{renderText(d.title)}</h3>}

          {Array.isArray(d.celebrity_matches) && d.celebrity_matches.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Star className="h-4 w-4 text-purple-500" /> Celebrity Matches
              </h4>
              <div className="grid md:grid-cols-2 gap-3">
                {renderArray(d.celebrity_matches, (item, idx) => {
                  const celeb = item as Record<string, unknown>;
                  return (
                    <div key={idx} className="p-4 rounded-lg bg-purple-500/5 border border-purple-500/20">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-bold text-lg">{renderText(celeb.name)}</div>
                          <div className="text-sm text-muted-foreground">{renderText(celeb.profession)}</div>
                        </div>
                        {!!celeb.birth_year && <Badge variant="outline">{renderText(celeb.birth_year)}</Badge>}
                      </div>
                      <p className="text-sm mt-2">{renderText(celeb.why_similar)}</p>
                      {Array.isArray(celeb.shared_features) && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {celeb.shared_features.map((feature, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">{renderText(feature)}</Badge>
                          ))}
                        </div>
                      )}
                      {!!celeb.fun_fact && (
                        <p className="text-xs text-muted-foreground mt-2 italic">💡 {renderText(celeb.fun_fact)}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {Array.isArray(d.historical_figures) && d.historical_figures.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3">Historical Figures</h4>
              <div className="grid md:grid-cols-2 gap-3">
                {renderArray(d.historical_figures, (item, idx) => {
                  const figure = item as Record<string, unknown>;
                  return (
                    <div key={idx} className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                      <div className="font-medium">{renderText(figure.name)}</div>
                      <div className="text-xs text-muted-foreground">{renderText(figure.era)}</div>
                      <p className="text-sm mt-1">{renderText(figure.significance)}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {Array.isArray(d.athletes) && d.athletes.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3">Athletes</h4>
              <div className="grid md:grid-cols-3 gap-3">
                {renderArray(d.athletes, (item, idx) => {
                  const athlete = item as Record<string, unknown>;
                  return (
                    <div key={idx} className="p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                      <div className="font-medium">{renderText(athlete.name)}</div>
                      <Badge variant="outline" className="text-xs">{renderText(athlete.sport)}</Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      );
    }

    case "regional_cuisine": {
      const d = data as Record<string, unknown>;
      return (
        <div className="space-y-6">
          {!!d.title && <h3 className="text-xl font-bold">{renderText(d.title)}</h3>}
          {!!d.cuisine_overview && (
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{renderText(d.cuisine_overview)}</p>
          )}

          {Array.isArray(d.signature_dishes) && d.signature_dishes.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Utensils className="h-4 w-4 text-orange-500" /> Signature Dishes
              </h4>
              <div className="grid md:grid-cols-2 gap-3">
                {renderArray(d.signature_dishes, (item, idx) => {
                  const dish = item as Record<string, unknown>;
                  return (
                    <div key={idx} className="p-4 rounded-lg bg-orange-500/5 border border-orange-500/20">
                      <div className="font-bold">{renderText(dish.name)}</div>
                      {!!dish.english_name && <div className="text-xs text-muted-foreground">{renderText(dish.english_name)}</div>}
                      <p className="text-sm mt-2">{renderText(dish.description)}</p>
                      {Array.isArray(dish.key_ingredients) && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {dish.key_ingredients.map((ing, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">{renderText(ing)}</Badge>
                          ))}
                        </div>
                      )}
                      {!!dish.cultural_significance && (
                        <p className="text-xs text-muted-foreground mt-2 italic">{renderText(dish.cultural_significance)}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {Array.isArray(d.street_food) && d.street_food.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3">Street Food</h4>
              <div className="grid md:grid-cols-3 gap-3">
                {renderArray(d.street_food, (item, idx) => {
                  const food = item as Record<string, unknown>;
                  return (
                    <div key={idx} className="p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
                      <div className="font-medium">{renderText(food.name)}</div>
                      <p className="text-sm text-muted-foreground">{renderText(food.description)}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {Array.isArray(d.recipes_to_try) && d.recipes_to_try.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3">Recipes to Try at Home</h4>
              <div className="grid md:grid-cols-2 gap-3">
                {renderArray(d.recipes_to_try, (item, idx) => {
                  const recipe = item as Record<string, unknown>;
                  return (
                    <div key={idx} className="p-3 rounded-lg bg-green-500/5 border border-green-500/20 flex items-center justify-between">
                      <div>
                        <div className="font-medium">{renderText(recipe.dish)}</div>
                        <div className="text-xs text-muted-foreground">{renderText(recipe.time)}</div>
                      </div>
                      <Badge variant={recipe.difficulty === "beginner" ? "default" : "secondary"}>
                        {renderText(recipe.difficulty)}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      );
    }

    case "genetic_traits": {
      const d = data as Record<string, unknown>;
      return (
        <div className="space-y-6">
          {!!d.title && <h3 className="text-xl font-bold">{renderText(d.title)}</h3>}

          {Array.isArray(d.trait_deep_dive) && d.trait_deep_dive.length > 0 && (
            <div className="space-y-4">
              {renderArray(d.trait_deep_dive, (item, idx) => {
                const category = item as Record<string, unknown>;
                return (
                  <div key={idx}>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Dna className="h-4 w-4 text-indigo-500" /> {renderText(category.trait_category)}
                    </h4>
                    {Array.isArray(category.traits) && (
                      <div className="grid gap-3">
                        {(category.traits as Array<Record<string, unknown>>).map((trait, tidx) => (
                          <div key={tidx} className="p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/20">
                            <div className="flex items-start justify-between">
                              <div className="font-medium">{renderText(trait.name)}</div>
                              {!!trait.frequency && <Badge variant="outline" className="text-xs">{renderText(trait.frequency)}</Badge>}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{renderText(trait.typical_expression)}</p>
                            {!!trait.genetic_basis && (
                              <div className="text-xs text-indigo-600 mt-2">Genes: {renderText(trait.genetic_basis)}</div>
                            )}
                            {!!trait.evolutionary_origin && (
                              <p className="text-xs text-muted-foreground mt-1 italic">{renderText(trait.evolutionary_origin)}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {Array.isArray(d.environmental_adaptations) && d.environmental_adaptations.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3">Environmental Adaptations</h4>
              <div className="grid md:grid-cols-2 gap-3">
                {renderArray(d.environmental_adaptations, (item, idx) => {
                  const adapt = item as Record<string, unknown>;
                  return (
                    <div key={idx} className="p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                      <div className="font-medium">{renderText(adapt.adaptation)}</div>
                      <div className="text-xs text-muted-foreground">{renderText(adapt.environment)}</div>
                      <p className="text-sm mt-1">{renderText(adapt.mechanism)}</p>
                      <div className="text-xs text-green-600 mt-2">{renderText(adapt.benefit)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      );
    }

    case "ancestor_letter": {
      const d = data as Record<string, unknown>;
      const letter = d.letter as Record<string, unknown> | undefined;
      const context = d.ancestral_context as Record<string, unknown> | undefined;
      const legacy = d.their_legacy_in_you as Record<string, unknown> | undefined;
      const profile = d.ancestor_profile as Record<string, unknown> | undefined;
      return (
        <div className="space-y-6">
          {!!d.title && <h3 className="text-2xl font-bold text-amber-700">{renderText(d.title)}</h3>}
          {!!d.subtitle && <p className="text-sm text-muted-foreground italic">{renderText(d.subtitle)}</p>}

          {letter && (
            <div className="bg-amber-50 dark:bg-amber-950/20 rounded-xl p-6 border border-amber-200 dark:border-amber-800 space-y-4">
              <p className="text-lg italic text-amber-800 dark:text-amber-200">{renderText(letter.greeting)}</p>
              {Array.isArray(letter.body) && letter.body.map((paragraph, idx) => (
                <p key={idx} className="text-muted-foreground leading-relaxed">{renderText(paragraph)}</p>
              ))}
              <div className="pt-4 border-t border-amber-200 dark:border-amber-800">
                <p className="italic text-amber-700 dark:text-amber-300">{renderText(letter.closing)}</p>
                <p className="text-sm text-muted-foreground mt-2">{renderText(letter.signature)}</p>
              </div>
            </div>
          )}

          {profile && (
            <div className="bg-muted/30 rounded-lg p-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <User className="h-4 w-4 text-amber-600" /> Your Ancestor
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {!!profile.hypothetical_name && <div><span className="text-muted-foreground">Name:</span> <span className="font-medium">{renderText(profile.hypothetical_name)}</span></div>}
                {!!profile.life_span && <div><span className="text-muted-foreground">Lived:</span> <span className="font-medium">{renderText(profile.life_span)}</span></div>}
                {!!profile.family_role && <div><span className="text-muted-foreground">Role:</span> <span className="font-medium">{renderText(profile.family_role)}</span></div>}
                {!!profile.memorable_trait && <div><span className="text-muted-foreground">Known for:</span> <span className="font-medium">{renderText(profile.memorable_trait)}</span></div>}
              </div>
            </div>
          )}

          {context && (
            <div className="space-y-3">
              <h4 className="font-semibold">Historical Context</h4>
              <div className="grid md:grid-cols-2 gap-3 text-sm">
                {!!context.likely_time_period && <div className="p-3 bg-muted/30 rounded-lg"><span className="text-muted-foreground">Time Period:</span> <span className="font-medium">{renderText(context.likely_time_period)}</span></div>}
                {!!context.likely_location && <div className="p-3 bg-muted/30 rounded-lg"><span className="text-muted-foreground">Location:</span> <span className="font-medium">{renderText(context.likely_location)}</span></div>}
                {!!context.typical_occupation && <div className="p-3 bg-muted/30 rounded-lg"><span className="text-muted-foreground">Occupation:</span> <span className="font-medium">{renderText(context.typical_occupation)}</span></div>}
              </div>
              {Array.isArray(context.what_they_valued) && (
                <div className="flex flex-wrap gap-2">
                  {context.what_they_valued.map((value, idx) => (
                    <Badge key={idx} variant="secondary">{renderText(value)}</Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {legacy && (
            <div className="p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-lg border border-amber-500/20">
              <h4 className="font-semibold mb-2">Their Legacy In You</h4>
              <p className="text-sm text-muted-foreground">{renderText(legacy.resilience)}</p>
            </div>
          )}

          {!!d.emotional_reflection && (
            <div className="text-center py-4 italic text-muted-foreground border-t">
              {renderText(d.emotional_reflection)}
            </div>
          )}
        </div>
      );
    }

    case "heritage_certificate": {
      const d = data as Record<string, unknown>;
      const declaration = d.ancestry_declaration as Record<string, unknown> | undefined;
      return (
        <div className="space-y-6">
          <div className="text-center border-4 border-double border-amber-500/50 rounded-xl p-8 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30">
            <div className="flex justify-center mb-4">
              <Award className="h-16 w-16 text-amber-600" />
            </div>
            <h2 className="text-3xl font-serif font-bold text-amber-800 dark:text-amber-200 mb-2">
              {renderText(d.certificate_title) || "Certificate of Heritage"}
            </h2>
            <p className="text-sm text-muted-foreground mb-6">{renderText(d.official_declaration)}</p>

            <Separator className="my-6" />

            <p className="text-lg leading-relaxed mb-6">{renderText(d.heritage_statement)}</p>

            {declaration && (
              <div className="grid grid-cols-2 gap-4 text-sm my-6 text-left max-w-md mx-auto">
                <div><span className="text-muted-foreground">Heritage:</span></div>
                <div className="font-semibold">{renderText(declaration.primary_heritage)}</div>
                <div><span className="text-muted-foreground">Origin:</span></div>
                <div className="font-semibold">{renderText(declaration.geographic_origin)}</div>
                <div><span className="text-muted-foreground">Confidence:</span></div>
                <div className="font-semibold">{renderText(declaration.confidence_level)}</div>
              </div>
            )}

            <Separator className="my-6" />

            <p className="italic text-amber-700 dark:text-amber-300 mb-4">{renderText(d.ancestral_blessing)}</p>

            {!!d.heritage_motto && (
              <div className="bg-amber-100 dark:bg-amber-900/30 rounded-lg p-4 my-4">
                <p className="text-lg font-serif italic">&ldquo;{renderText(d.heritage_motto)}&rdquo;</p>
                {!!d.heritage_motto_translation && <p className="text-sm text-muted-foreground mt-1">{renderText(d.heritage_motto_translation)}</p>}
              </div>
            )}

            <p className="text-sm mt-6">{renderText(d.closing_statement)}</p>

            <div className="mt-8 pt-4 border-t border-amber-300 dark:border-amber-700">
              <p className="text-xs text-muted-foreground">{renderText(d.verification_statement)}</p>
            </div>
          </div>

          <div className="flex justify-center">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" /> Download Certificate
            </Button>
          </div>
        </div>
      );
    }

    case "ancestral_names": {
      const d = data as Record<string, unknown>;
      const names = d.traditional_names as Record<string, unknown> | undefined;
      const traditions = d.naming_traditions as Record<string, unknown> | undefined;
      const surnames = d.surname_analysis as Record<string, unknown> | undefined;
      return (
        <div className="space-y-6">
          {!!d.title && <h3 className="text-xl font-bold">{renderText(d.title)}</h3>}
          {!!d.subtitle && <p className="text-sm text-muted-foreground">{renderText(d.subtitle)}</p>}

          {names && (
            <div className="grid md:grid-cols-2 gap-6">
              {Array.isArray(names.male_names) && names.male_names.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 text-blue-600">Traditional Male Names</h4>
                  <div className="space-y-2">
                    {(names.male_names as Array<Record<string, unknown>>).slice(0, 6).map((name, idx) => (
                      <div key={idx} className="p-3 bg-blue-500/5 rounded-lg border border-blue-500/20">
                        <div className="font-semibold">{renderText(name.name)}</div>
                        <div className="text-xs text-muted-foreground">{renderText(name.pronunciation)}</div>
                        <div className="text-sm mt-1">{renderText(name.meaning)}</div>
                        <Badge variant="outline" className="mt-2 text-xs">{renderText(name.popularity)}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {Array.isArray(names.female_names) && names.female_names.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 text-pink-600">Traditional Female Names</h4>
                  <div className="space-y-2">
                    {(names.female_names as Array<Record<string, unknown>>).slice(0, 6).map((name, idx) => (
                      <div key={idx} className="p-3 bg-pink-500/5 rounded-lg border border-pink-500/20">
                        <div className="font-semibold">{renderText(name.name)}</div>
                        <div className="text-xs text-muted-foreground">{renderText(name.pronunciation)}</div>
                        <div className="text-sm mt-1">{renderText(name.meaning)}</div>
                        <Badge variant="outline" className="mt-2 text-xs">{renderText(name.popularity)}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {surnames && Array.isArray(surnames.common_surnames) && (
            <div>
              <h4 className="font-semibold mb-3">Common Surnames & Meanings</h4>
              <div className="grid md:grid-cols-2 gap-3">
                {(surnames.common_surnames as Array<Record<string, unknown>>).map((surname, idx) => (
                  <div key={idx} className="p-3 bg-muted/30 rounded-lg">
                    <div className="font-semibold">{renderText(surname.surname)}</div>
                    <div className="text-sm text-muted-foreground">{renderText(surname.meaning)}</div>
                    <Badge variant="secondary" className="mt-2 text-xs">{renderText(surname.origin_type)}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {traditions && (
            <div className="bg-muted/20 rounded-lg p-4 space-y-2">
              <h4 className="font-semibold">Naming Traditions</h4>
              {!!traditions.how_names_chosen && <p className="text-sm"><span className="text-muted-foreground">How names are chosen:</span> {renderText(traditions.how_names_chosen)}</p>}
              {!!traditions.naming_ceremony && <p className="text-sm"><span className="text-muted-foreground">Naming ceremony:</span> {renderText(traditions.naming_ceremony)}</p>}
              {!!traditions.name_structure && <p className="text-sm"><span className="text-muted-foreground">Name structure:</span> {renderText(traditions.name_structure)}</p>}
            </div>
          )}
        </div>
      );
    }

    case "cultural_calendar": {
      const d = data as Record<string, unknown>;
      return (
        <div className="space-y-6">
          {!!d.title && <h3 className="text-xl font-bold">{renderText(d.title)}</h3>}
          {!!d.introduction && <p className="text-sm text-muted-foreground">{renderText(d.introduction)}</p>}

          {Array.isArray(d.major_holidays) && d.major_holidays.length > 0 && (
            <div>
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <CalendarHeart className="h-4 w-4 text-rose-500" /> Major Holidays & Celebrations
              </h4>
              <div className="space-y-4">
                {(d.major_holidays as Array<Record<string, unknown>>).slice(0, 6).map((holiday, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-gradient-to-br from-rose-500/5 to-pink-500/5 border border-rose-500/20">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-lg">{renderText(holiday.name)}</div>
                        <div className="text-sm text-muted-foreground">{renderText(holiday.date)}</div>
                      </div>
                      <Badge variant={holiday.importance_level === "major" ? "default" : "secondary"}>
                        {renderText(holiday.importance_level)}
                      </Badge>
                    </div>
                    <p className="text-sm mt-2">{renderText(holiday.description)}</p>
                    {Array.isArray(holiday.traditions) && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {holiday.traditions.map((t, i) => (
                          <Badge key={i} variant="outline" className="text-xs">{renderText(t)}</Badge>
                        ))}
                      </div>
                    )}
                    {Array.isArray(holiday.traditional_foods) && holiday.traditional_foods.length > 0 && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        <span className="font-medium">Traditional foods:</span> {holiday.traditional_foods.map(f => renderText(f)).join(", ")}
                      </div>
                    )}
                    {!!holiday.how_to_celebrate_at_home && (
                      <div className="mt-3 p-2 bg-background/50 rounded text-sm">
                        <span className="font-medium">Celebrate at home:</span> {renderText(holiday.how_to_celebrate_at_home)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {Array.isArray(d.upcoming_celebrations) && d.upcoming_celebrations.length > 0 && (
            <div className="bg-gradient-to-r from-rose-500/10 to-pink-500/10 rounded-lg p-4">
              <h4 className="font-semibold mb-3">Coming Up Soon</h4>
              <div className="space-y-2">
                {(d.upcoming_celebrations as Array<Record<string, unknown>>).map((celebration, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-background/50 rounded">
                    <div>
                      <div className="font-medium">{renderText(celebration.name)}</div>
                      <div className="text-xs text-muted-foreground">{renderText(celebration.date)}</div>
                    </div>
                    <Badge variant="secondary">{renderText(celebration.days_until)}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {Array.isArray(d.create_your_own_traditions) && (
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-2">Ways to Connect</h4>
              <ul className="space-y-1 text-sm">
                {d.create_your_own_traditions.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-rose-500">•</span>
                    {renderText(tip)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    }

    default:
      return (
        <div className="text-sm text-muted-foreground">
          <pre className="p-4 bg-muted rounded-lg overflow-auto text-xs">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      );
  }
}

const DEEP_DIVE_SECTIONS: Array<{
  id: EnrichmentSection;
  title: string;
  description: string;
  icon: typeof Heart;
  gradient: string;
}> = [
  {
    id: "health_deep_dive",
    title: "Health & Wellness Report",
    description: "Genetic health traits, dietary recommendations, and fitness profile",
    icon: Heart,
    gradient: "from-red-500/10 to-pink-500/10",
  },
  {
    id: "cultural_heritage",
    title: "Cultural Heritage Guide",
    description: "Traditions, customs, festivals, and cultural practices",
    icon: Globe,
    gradient: "from-blue-500/10 to-cyan-500/10",
  },
  {
    id: "historical_migration",
    title: "Migration Timeline",
    description: "Ancestral journey through history with dates and routes",
    icon: History,
    gradient: "from-amber-500/10 to-orange-500/10",
  },
  {
    id: "celebrity_lookalikes",
    title: "Famous Faces",
    description: "Celebrities and historical figures with similar heritage",
    icon: Star,
    gradient: "from-purple-500/10 to-violet-500/10",
  },
  {
    id: "regional_cuisine",
    title: "Culinary Heritage",
    description: "Traditional dishes, ingredients, and food culture",
    icon: Utensils,
    gradient: "from-green-500/10 to-emerald-500/10",
  },
  {
    id: "genetic_traits",
    title: "Genetic Trait Analysis",
    description: "Detailed breakdown of inherited physical characteristics",
    icon: Dna,
    gradient: "from-indigo-500/10 to-blue-500/10",
  },
  {
    id: "ancestor_letter",
    title: "Letter From Your Ancestors",
    description: "A deeply personal message across generations",
    icon: ScrollText,
    gradient: "from-amber-500/10 to-yellow-500/10",
  },
  {
    id: "heritage_certificate",
    title: "Heritage Certificate",
    description: "Official recognition of your ancestral heritage",
    icon: Award,
    gradient: "from-yellow-500/10 to-amber-500/10",
  },
  {
    id: "ancestral_names",
    title: "Your Ancestral Names",
    description: "Traditional names from your heritage",
    icon: BookUser,
    gradient: "from-teal-500/10 to-cyan-500/10",
  },
  {
    id: "cultural_calendar",
    title: "Heritage Calendar",
    description: "Holidays and celebrations to honor your roots",
    icon: CalendarHeart,
    gradient: "from-rose-500/10 to-pink-500/10",
  },
];

// Skeleton component for loading state
function ReportSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/10">
      {/* Header Skeleton */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-28" />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Top Matches Skeleton */}
        <Card className="mb-8 overflow-hidden border-2 border-primary/20">
          <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-primary/10 pb-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {[...Array(6)].map((_, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-muted/30 border border-muted space-y-3">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-8 w-12" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-1 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Content Grid Skeleton */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Left Column */}
          <div className="space-y-6">
            <Card className="overflow-hidden">
              <Skeleton className="w-full aspect-square" />
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <Skeleton className="h-5 w-40" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[...Array(5)].map((_, idx) => (
                  <div key={idx} className="space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Center Column */}
          <div className="space-y-6">
            <Card className="overflow-hidden border-2 border-primary/30">
              <CardHeader className="bg-primary/10 border-b border-primary/20">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-10 w-16 rounded-md" />
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <Skeleton className="h-10 w-3/4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
                <Skeleton className="h-px w-full" />
                <div className="flex items-start gap-3">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-5 w-28" />
                  <div className="grid grid-cols-2 gap-3">
                    <Skeleton className="h-20 rounded-lg" />
                    <Skeleton className="h-20 rounded-lg" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-44" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-8 rounded-full" />
                <div className="space-y-2">
                  {[...Array(4)].map((_, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-3 w-3 rounded-full" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <Skeleton className="h-4 w-10" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-amber-500/5 to-orange-500/5">
              <CardHeader>
                <Skeleton className="h-5 w-36" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Deep Dive Skeleton */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, idx) => (
              <Card key={idx}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                    <Skeleton className="h-5 w-5" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

// Skeleton for enrichment content loading
function EnrichmentSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <Skeleton className="h-7 w-48" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-5 w-36" />
        <div className="grid gap-3">
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="p-3 rounded-lg border space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton className="h-5 w-40" />
        <div className="grid md:grid-cols-2 gap-3">
          {[...Array(4)].map((_, idx) => (
            <div key={idx} className="p-3 rounded-lg border space-y-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-full" />
              <div className="flex gap-1">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Sanitize and normalize the data from localStorage
function sanitizeAnalysisData(raw: any): AnalysisData | null {
  if (!raw) return null;

  // Parse aiReport if it's a JSON string containing the full response
  let aiReport = raw.aiReport || "";
  // Check both camelCase and snake_case for detailedAnalysis
  let detailedAnalysis = raw.detailedAnalysis || raw.detailed_analysis || "";
  let matches: Match[] = [];

  // Debug log
  console.log('[sanitizeAnalysisData] raw.detailedAnalysis:', raw.detailedAnalysis);
  console.log('[sanitizeAnalysisData] raw.detailed_analysis:', raw.detailed_analysis);
  let facialAnalysis = raw.facialAnalysis;
  let ancestryComposition = raw.ancestryComposition;
  let haplogroups = raw.haplogroups || null;
  let geneticHeritageSummary = raw.geneticHeritageSummary || "";
  let scientificNotes = raw.scientificNotes || "";

  // If aiReport is a JSON string, extract the report text
  if (typeof aiReport === "string" && aiReport.trim().startsWith("{")) {
    try {
      const parsed = JSON.parse(aiReport);
      if (parsed.report) {
        aiReport = parsed.report;
      }
      if (parsed.detailed_analysis) {
        detailedAnalysis = parsed.detailed_analysis;
      }
      // Also extract matches if they're in the parsed aiReport
      if (Array.isArray(parsed.matches) && parsed.matches.length > 0) {
        matches = parsed.matches;
      }
      if (parsed.facial_analysis) {
        facialAnalysis = parsed.facial_analysis;
      }
      if (parsed.ancestry_composition) {
        ancestryComposition = parsed.ancestry_composition;
      }
      if (parsed.haplogroups) {
        haplogroups = parsed.haplogroups;
      }
      if (parsed.genetic_heritage_summary) {
        geneticHeritageSummary = parsed.genetic_heritage_summary;
      }
      if (parsed.scientific_notes) {
        scientificNotes = parsed.scientific_notes;
      }
    } catch {
      // Not valid JSON, keep as-is
    }
  }

  // Process matches from raw.matches if we don't have them yet
  if (matches.length === 0 && raw.matches) {
    if (Array.isArray(raw.matches)) {
      matches = raw.matches.map((m: any) => {
        // If match is a string, try to parse it
        if (typeof m === "string") {
          try {
            return JSON.parse(m);
          } catch {
            return null;
          }
        }
        return m;
      }).filter(Boolean);
    } else if (typeof raw.matches === "string") {
      try {
        const parsed = JSON.parse(raw.matches);
        if (Array.isArray(parsed)) {
          matches = parsed;
        } else if (parsed.matches && Array.isArray(parsed.matches)) {
          matches = parsed.matches;
        }
      } catch {
        // Not valid JSON
      }
    }
  }

  // Also check raw.raw for matches if still empty
  if (matches.length === 0 && raw.raw) {
    const rawData = typeof raw.raw === "string" ? (() => { try { return JSON.parse(raw.raw); } catch { return null; } })() : raw.raw;
    if (rawData?.matches && Array.isArray(rawData.matches)) {
      matches = rawData.matches;
    }
    if (rawData?.report && typeof aiReport !== "string") {
      aiReport = rawData.report;
    }
    if (rawData?.detailed_analysis && !detailedAnalysis) {
      detailedAnalysis = rawData.detailed_analysis;
    }
    if (rawData?.facial_analysis && !facialAnalysis) {
      facialAnalysis = rawData.facial_analysis;
    }
    if (rawData?.ancestry_composition && !ancestryComposition) {
      ancestryComposition = rawData.ancestry_composition;
    }
    if (rawData?.haplogroups && !haplogroups) {
      haplogroups = rawData.haplogroups;
    }
  }

  // Normalize matches to ensure they have the right structure
  matches = matches.map((m: any) => ({
    name: m?.name || "Unknown",
    confidence: typeof m?.confidence === "number" ? m.confidence : 0,
    reason: m?.reason || m?.reasoning || "",
    region: m?.region || "",
    haplogroups: m?.haplogroups || { paternal: [], maternal: [] },
    region_background: m?.region_background || "",
    haplogroup_notes: m?.haplogroup_notes || "",
    morphology: m?.morphology || "",
    population_genetics: m?.population_genetics || "",
    historical_context: m?.historical_context || "",
  }));

  const result = {
    uploadedImageUrl: raw.uploadedImageUrl || "",
    matches,
    aiReport: typeof aiReport === "string" ? aiReport : JSON.stringify(aiReport),
    detailedAnalysis: typeof detailedAnalysis === "string" ? detailedAnalysis : "",
    facialAnalysis,
    ancestryComposition,
    haplogroups,
    geneticHeritageSummary,
    scientificNotes,
    llmProvider: raw.llmProvider,
    createdAt: raw.createdAt,
    raw: raw.raw,
  };

  console.log('[sanitizeAnalysisData] Final detailedAnalysis:', result.detailedAnalysis ? result.detailedAnalysis.substring(0, 100) + '...' : 'EMPTY');

  return result;
}

export default function LocalReportPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [data, setData] = useState<AnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const reportRef = useRef<HTMLDivElement>(null);
  const [enrichments, setEnrichments] = useState<Record<EnrichmentSection, EnrichmentState>>({
    health_deep_dive: { loading: false, data: null, error: null },
    cultural_heritage: { loading: false, data: null, error: null },
    historical_migration: { loading: false, data: null, error: null },
    celebrity_lookalikes: { loading: false, data: null, error: null },
    genetic_traits: { loading: false, data: null, error: null },
    regional_cuisine: { loading: false, data: null, error: null },
    ancestor_letter: { loading: false, data: null, error: null },
    heritage_certificate: { loading: false, data: null, error: null },
    ancestral_names: { loading: false, data: null, error: null },
    cultural_calendar: { loading: false, data: null, error: null },
  });
  const [dialogSection, setDialogSection] = useState<EnrichmentSection | null>(null);

  useEffect(() => {
    // Small delay to show skeleton and make loading feel intentional
    const timer = setTimeout(() => {
      try {
        const stored =
          localStorage.getItem(`localAnalysisResult:${id}`) ||
          localStorage.getItem("localAnalysisResult");
        if (stored) {
          const rawData = JSON.parse(stored);
          const sanitized = sanitizeAnalysisData(rawData);
          setData(sanitized);
        }
      } catch (err) {
        console.warn("Failed to read local analysis result:", err);
      } finally {
        setIsLoading(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [id]);

  // Auto-fetch key enrichment sections when data is available
  useEffect(() => {
    if (!data?.matches?.[0]) return;

    // Fetch these sections automatically in background
    const autoFetchSections: EnrichmentSection[] = [
      "cultural_heritage",
      "historical_migration",
      "celebrity_lookalikes",
    ];

    // Stagger the requests to avoid overwhelming the API
    autoFetchSections.forEach((section, idx) => {
      setTimeout(() => {
        if (!enrichments[section].data && !enrichments[section].loading) {
          fetchEnrichmentInternal(section);
        }
      }, idx * 2000); // 2 second delay between each
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.matches]);

  const fetchEnrichmentInternal = async (section: EnrichmentSection) => {
    if (!data?.matches?.[0]) return;

    setEnrichments((prev) => ({
      ...prev,
      [section]: { ...prev[section], loading: true, error: null },
    }));

    try {
      const response = await fetch("/api/analyze/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section,
          topMatch: {
            name: data.matches[0].name,
            region: data.matches[0].region,
            confidence: data.matches[0].confidence,
          },
          allMatches: data.matches.map((m) => ({ name: m.name, confidence: m.confidence })),
          imageUrl: data.uploadedImageUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch enrichment");
      }

      const result = await response.json();
      setEnrichments((prev) => ({
        ...prev,
        [section]: { loading: false, data: result.data, error: null },
      }));
    } catch (err) {
      setEnrichments((prev) => ({
        ...prev,
        [section]: { loading: false, data: null, error: err instanceof Error ? err.message : "Unknown error" },
      }));
    }
  };

  // Use the internal function directly
  const fetchEnrichment = fetchEnrichmentInternal;

  const handleSectionClick = useCallback((section: EnrichmentSection) => {
    setDialogSection(section);
    if (!enrichments[section].data && !enrichments[section].loading) {
      fetchEnrichment(section);
    }
  }, [enrichments, fetchEnrichment]);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Phenotype Analysis",
          text: `Check out my phenotype analysis results!`,
          url: window.location.href,
        });
      } catch {
        // User cancelled or error
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  // Show skeleton while loading
  if (isLoading) {
    return <ReportSkeleton />;
  }

  // Show empty state if no data after loading
  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted/20">
        <Card className="max-w-md w-full p-8 text-center space-y-4">
          <AlertCircle className="h-16 w-16 mx-auto text-muted-foreground/50" />
          <h1 className="text-2xl font-bold">No Analysis Found</h1>
          <p className="text-muted-foreground">
            Upload a photo to generate your phenotype analysis report.
          </p>
          <Button size="lg" onClick={() => router.push("/")}>
            Start Analysis
          </Button>
        </Card>
      </div>
    );
  }

  const topMatch = data.matches?.[0];
  const hasMatches = data.matches && data.matches.length > 0;
  const hasFacialAnalysis = data.facialAnalysis && Object.keys(data.facialAnalysis).length > 0;
  const hasAncestry = data.ancestryComposition && data.ancestryComposition.length > 0;

  // Helper to get haplogroups in consistent format
  const getHaplogroups = (hg: Haplogroups | string[]): Haplogroups => {
    if (Array.isArray(hg)) {
      return { paternal: hg, maternal: [] };
    }
    return hg || { paternal: [], maternal: [] };
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/10" ref={reportRef}>
      {/* Premium Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50 print:static print:bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
                <Dna className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-bold text-xl">Phenotype Analysis Report</h1>
                <p className="text-sm text-muted-foreground">
                  {data.createdAt
                    ? new Date(data.createdAt).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Generated just now"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 print:hidden">
              <ThemeSwitcher />
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Link href="/">
                <Button>New Analysis</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Top Matches Overview */}
        {hasMatches && (
          <Card className="mb-8 overflow-hidden border-2 border-primary/20 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-primary/10 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Top Phenotype Matches
                </CardTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{data.matches.length} phenotypes analyzed</span>
                  {hasAncestry && (
                    <>
                      <span>•</span>
                      <span>{data.ancestryComposition?.length} ancestry regions</span>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {data.matches.slice(0, 6).map((match, idx) => (
                  <div
                    key={`${match.name}-${idx}`}
                    className={`relative p-4 rounded-xl transition-all ${
                      idx === 0
                        ? "bg-gradient-to-br from-primary/15 to-primary/5 border-2 border-primary/30 shadow-md"
                        : "bg-muted/30 hover:bg-muted/50 border border-muted"
                    }`}
                  >
                    {idx === 0 && (
                      <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                        TOP MATCH
                      </div>
                    )}
                    <div className="flex items-center justify-between mb-2">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        idx === 0 ? "bg-primary text-primary-foreground" : "bg-muted-foreground/20"
                      }`}>
                        {idx + 1}
                      </div>
                      <div className={`text-2xl font-bold ${idx === 0 ? "text-primary" : ""}`}>
                        {match.confidence}%
                      </div>
                    </div>
                    <h3 className={`font-semibold text-sm mb-1 line-clamp-1 ${idx === 0 ? "text-primary" : ""}`}>
                      {match.name}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3 flex-shrink-0" />
                      <span className="line-clamp-1">{match.region?.split(",")[0] || "Unknown"}</span>
                    </div>
                    <Progress value={match.confidence} className={`h-1 mt-2 ${idx === 0 ? "" : "opacity-60"}`} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analysis Summary */}
        {data.aiReport && (
          <Card className="mb-8 border-l-4 border-l-primary">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold mb-2">Analysis Summary</h2>
                  <p className="text-muted-foreground leading-relaxed">{data.aiReport}</p>
                  {data.geneticHeritageSummary && (
                    <p className="text-muted-foreground leading-relaxed mt-3 pt-3 border-t">
                      <span className="font-medium text-foreground">Genetic Heritage:</span> {data.geneticHeritageSummary}
                    </p>
                  )}
                  {data.detailedAnalysis && (
                    <div className="mt-4 pt-4 border-t">
                      <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                        <ScrollText className="h-4 w-4 text-primary" />
                        In-Depth Analysis
                      </h3>
                      <p className="text-muted-foreground leading-relaxed text-sm">
                        {data.detailedAnalysis}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Grid - 2 Columns */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Left Column - Photo + Facial Analysis */}
          <div className="space-y-6">
            <Card className="overflow-hidden shadow-xl">
              <CardContent className="p-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={data.uploadedImageUrl}
                  alt="Subject face for analysis"
                  className="w-full aspect-[4/3] object-cover"
                />
              </CardContent>
            </Card>

            {/* Facial Analysis */}
            {hasFacialAnalysis && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Eye className="h-4 w-4 text-primary" />
                    Facial Feature Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(data.facialAnalysis!).map(([key, value]) => {
                      if (!value) return null;
                      const label = key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
                      return (
                        <div key={key} className="space-y-1">
                          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            {label}
                          </div>
                          <div className="text-sm">{value}</div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Top Match + Ancestry */}
          <div className="space-y-6">
            {/* Top Match */}
            {topMatch && (
              <Card className="overflow-hidden border-2 border-primary/30 shadow-xl bg-gradient-to-br from-primary/5 via-background to-background">
                <CardHeader className="bg-primary/10 border-b border-primary/20">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      Primary Match
                    </CardTitle>
                    <Badge className="text-2xl px-4 py-2 bg-primary shadow-lg">
                      {topMatch.confidence}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-5">
                  <h2 className="text-4xl font-bold tracking-tight">{topMatch.name}</h2>
                  <p className="text-muted-foreground leading-relaxed">{topMatch.reason}</p>

                  <Separator />

                  {/* Region */}
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">Geographic Origin</div>
                      <div className="text-sm text-muted-foreground">{topMatch.region}</div>
                    </div>
                  </div>

                  {/* Haplogroups */}
                  {(() => {
                    const hg = getHaplogroups(topMatch.haplogroups);
                    const hasPaternal = hg.paternal && hg.paternal.length > 0;
                    const hasMaternal = hg.maternal && hg.maternal.length > 0;
                    if (!hasPaternal && !hasMaternal) return null;
                    return (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Dna className="h-5 w-5 text-purple-600" />
                          <span className="font-medium">Haplogroups</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {hasPaternal && (
                            <div className="bg-blue-500/5 rounded-lg p-3 border border-blue-500/20">
                              <div className="text-xs font-medium text-blue-600 mb-2">Paternal (Y-DNA)</div>
                              <div className="flex flex-wrap gap-1">
                                {hg.paternal!.map((h) => (
                                  <Badge key={h} variant="outline" className="font-mono text-xs">
                                    {h}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          {hasMaternal && (
                            <div className="bg-pink-500/5 rounded-lg p-3 border border-pink-500/20">
                              <div className="text-xs font-medium text-pink-600 mb-2">Maternal (mtDNA)</div>
                              <div className="flex flex-wrap gap-1">
                                {hg.maternal!.map((h) => (
                                  <Badge key={h} variant="outline" className="font-mono text-xs">
                                    {h}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Morphology */}
                  {topMatch.morphology && (
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">Facial Morphology</div>
                        <div className="text-sm text-muted-foreground">{topMatch.morphology}</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Ancestry Composition - 23andMe Style */}
            {hasAncestry && (
              <AncestryComposition
                data={data.ancestryComposition!}
                haplogroups={data.haplogroups}
              />
            )}
          </div>
        </div>

        {/* All Matches Section */}
        {hasMatches && data.matches.length > 1 && (
          <Card className="mb-8">
            <CardHeader className="bg-muted/30 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  All Phenotype Matches
                </CardTitle>
                <Badge variant="outline" className="text-base px-3">
                  {data.matches.length} matches
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs defaultValue="grid" className="w-full">
                <div className="px-6 pt-4">
                  <TabsList>
                    <TabsTrigger value="grid">Grid View</TabsTrigger>
                    <TabsTrigger value="detailed">Detailed View</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="grid" className="p-6">
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.matches.map((match, idx) => {
                      const hg = getHaplogroups(match.haplogroups);
                      return (
                        <Card key={`${match.name}-${idx}`} className={idx === 0 ? "border-primary/30 bg-primary/5" : ""}>
                          <CardContent className="p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                  idx === 0 ? "bg-primary text-primary-foreground" : "bg-muted"
                                }`}>
                                  {idx + 1}
                                </div>
                                <h3 className="font-bold">{match.name}</h3>
                              </div>
                              <Badge variant={idx === 0 ? "default" : "secondary"}>
                                {match.confidence}%
                              </Badge>
                            </div>
                            <Progress value={match.confidence} className="h-1.5" />
                            <p className="text-xs text-muted-foreground line-clamp-2">{match.reason}</p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {match.region}
                            </div>
                            {(hg.paternal?.length || hg.maternal?.length) ? (
                              <div className="flex flex-wrap gap-1">
                                {[...(hg.paternal || []), ...(hg.maternal || [])].slice(0, 3).map((h) => (
                                  <Badge key={h} variant="outline" className="text-[10px] font-mono">
                                    {h}
                                  </Badge>
                                ))}
                              </div>
                            ) : null}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </TabsContent>

                <TabsContent value="detailed" className="p-0">
                  {data.matches.map((match, idx) => {
                    const hg = getHaplogroups(match.haplogroups);
                    return (
                      <div key={`${match.name}-${idx}`} className={`p-6 ${idx > 0 ? "border-t" : ""}`}>
                        <div className="flex items-start gap-4">
                          <div className={`h-12 w-12 rounded-full flex items-center justify-center font-bold ${
                            idx === 0 ? "bg-primary text-primary-foreground" : "bg-muted"
                          }`}>
                            {idx + 1}
                          </div>
                          <div className="flex-1 space-y-4">
                            <div className="flex items-center justify-between">
                              <h3 className="text-2xl font-bold">{match.name}</h3>
                              <Badge variant={idx === 0 ? "default" : "secondary"} className="text-lg px-4">
                                {match.confidence}%
                              </Badge>
                            </div>
                            <Progress value={match.confidence} className="h-2" />
                            <p className="text-muted-foreground">{match.reason}</p>

                            <div className="grid md:grid-cols-2 gap-4">
                              <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm">
                                  <MapPin className="h-4 w-4 text-blue-600" />
                                  <span className="font-medium">Region:</span>
                                  <span className="text-muted-foreground">{match.region}</span>
                                </div>
                                {!!match.morphology && (
                                  <div className="flex items-start gap-2 text-sm">
                                    <User className="h-4 w-4 text-green-600 mt-0.5" />
                                    <span className="font-medium">Morphology:</span>
                                    <span className="text-muted-foreground">{match.morphology}</span>
                                  </div>
                                )}
                              </div>
                              <div className="space-y-3">
                                {(hg.paternal?.length || hg.maternal?.length) ? (
                                  <div className="flex items-start gap-2 text-sm">
                                    <Dna className="h-4 w-4 text-purple-600 mt-0.5" />
                                    <div>
                                      <span className="font-medium">Haplogroups:</span>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {hg.paternal?.map((h) => (
                                          <Badge key={h} variant="outline" className="text-xs font-mono bg-blue-500/5">
                                            {h}
                                          </Badge>
                                        ))}
                                        {hg.maternal?.map((h) => (
                                          <Badge key={h} variant="outline" className="text-xs font-mono bg-pink-500/5">
                                            {h}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                ) : null}
                              </div>
                            </div>

                            {(match.region_background || match.historical_context || match.population_genetics || match.haplogroup_notes) && (
                              <div className="bg-muted/30 rounded-lg p-4 space-y-2 text-sm">
                                {!!match.region_background && (
                                  <p><span className="font-medium">Background:</span> {match.region_background}</p>
                                )}
                                {!!match.historical_context && (
                                  <p><span className="font-medium">Historical Context:</span> {match.historical_context}</p>
                                )}
                                {!!match.population_genetics && (
                                  <p><span className="font-medium">Population Genetics:</span> {match.population_genetics}</p>
                                )}
                                {!!match.haplogroup_notes && (
                                  <p><span className="font-medium">Haplogroup Notes:</span> {match.haplogroup_notes}</p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Deep Dive Sections */}
        {hasMatches && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <Brain className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Deep Dive Reports</h2>
                <p className="text-sm text-muted-foreground">Click any section to generate detailed AI-powered insights</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {DEEP_DIVE_SECTIONS.map((section) => {
                const Icon = section.icon;
                const state = enrichments[section.id];

                return (
                  <Card
                    key={section.id}
                    className={`cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] ${
                      state.data ? "border-green-500/30" : ""
                    }`}
                    onClick={() => handleSectionClick(section.id)}
                  >
                    <CardContent className={`p-4 bg-gradient-to-br ${section.gradient}`}>
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-lg bg-background/80 flex items-center justify-center shadow-sm">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{section.title}</h3>
                            {!!state.data && (
                              <Badge variant="outline" className="text-[10px] bg-green-500/10 text-green-600 border-green-500/30">
                                Ready
                              </Badge>
                            )}
                            {!!state.loading && (
                              <Loader2 className="h-3 w-3 animate-spin text-primary" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{section.description}</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Dialog for Deep Dive Content */}
            <Dialog open={!!dialogSection} onOpenChange={(open) => !open && setDialogSection(null)}>
              <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
                {dialogSection && (() => {
                  const section = DEEP_DIVE_SECTIONS.find((s) => s.id === dialogSection);
                  const state = enrichments[dialogSection];
                  if (!section) return null;
                  const Icon = section.icon;

                  return (
                    <>
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-lg flex items-center justify-center bg-gradient-to-br ${section.gradient}`}>
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="text-xl">{section.title}</div>
                            <div className="text-sm font-normal text-muted-foreground">{section.description}</div>
                          </div>
                        </DialogTitle>
                      </DialogHeader>

                      <div className="mt-4">
                        {state.loading ? (
                          <div className="space-y-4">
                            <div className="flex items-center gap-3 text-primary">
                              <Loader2 className="h-5 w-5 animate-spin" />
                              <span>Generating detailed report...</span>
                            </div>
                            <EnrichmentSkeleton />
                          </div>
                        ) : state.error ? (
                          <div className="p-4 rounded-lg bg-destructive/10 text-destructive">
                            <p>{state.error}</p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-3"
                              onClick={() => fetchEnrichment(dialogSection)}
                            >
                              <Loader2 className="h-4 w-4 mr-2" />
                              Retry
                            </Button>
                          </div>
                        ) : state.data ? (
                          <EnrichmentContent section={dialogSection} data={state.data} />
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3" />
                            <p>Loading content...</p>
                          </div>
                        )}
                      </div>
                    </>
                  );
                })()}
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* Footer Disclaimer */}
        <Card className="bg-muted/20 border-dashed print:border-solid">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <FlaskConical className="h-6 w-6 text-muted-foreground flex-shrink-0" />
              <div className="space-y-2">
                <h4 className="font-semibold">About This Analysis</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  This phenotype analysis uses advanced AI vision models to estimate ancestral origins based on facial morphology.
                  The results are for educational and entertainment purposes only and should not be considered as definitive
                  genetic or ancestral information. Haplogroup suggestions are speculative associations with regional populations
                  based on phenotypic characteristics. For accurate genetic ancestry information, please consult a certified
                  genetic testing service.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Debug Section */}
        <details className="mt-8 text-xs print:hidden">
          <summary className="cursor-pointer text-muted-foreground hover:text-foreground flex items-center gap-1">
            <ChevronRight className="h-3 w-3" />
            Debug: Raw API Response
          </summary>
          <pre className="mt-2 p-4 bg-muted rounded-lg overflow-auto max-h-96 text-[10px]">
            {JSON.stringify(data, null, 2)}
          </pre>
        </details>
      </main>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          .print\\:hidden { display: none !important; }
          .print\\:static { position: static !important; }
          .print\\:bg-white { background: white !important; }
          .print\\:border-solid { border-style: solid !important; }
        }
      `}</style>
    </div>
  );
}
