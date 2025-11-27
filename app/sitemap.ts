import { MetadataRoute } from "next";
import { neon } from "@neondatabase/serverless";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://phenotype.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/sign-in`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/sign-up`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/phenotypes`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // Dynamic phenotype pages
  let phenotypePages: MetadataRoute.Sitemap = [];

  try {
    if (process.env.DATABASE_URL) {
      const connection = neon(process.env.DATABASE_URL);
      const phenotypes = await connection`
        SELECT id, created_at FROM phenotypes
        WHERE embedding IS NOT NULL
        ORDER BY created_at DESC
        LIMIT 500
      `;

      phenotypePages = phenotypes.map((phenotype) => ({
        url: `${baseUrl}/phenotypes/${phenotype.id as string}`,
        lastModified: (phenotype.created_at as Date) || new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.7,
      }));
    }
  } catch (error) {
    console.error("Error generating sitemap phenotypes:", error);
  }

  return [...staticPages, ...phenotypePages];
}
