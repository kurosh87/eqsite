import { redirect } from "next/navigation";
import { stackServerApp } from "@/app/stack";
import { getPhenotypeById } from "@/lib/database";
import { PhenotypeDetailContent } from "@/components/phenotype-detail-content";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://phenotype.app";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const phenotype = await getPhenotypeById(id);

  if (!phenotype) {
    return {
      title: "Phenotype Not Found",
    };
  }

  const regions = phenotype.regions?.join(", ") || "Various regions";

  return {
    title: `${phenotype.name} Phenotype`,
    description: phenotype.description || `Explore the ${phenotype.name} phenotype. Geographic origin: ${regions}. Discover facial features, ancestral heritage, and genetic characteristics.`,
    openGraph: {
      title: `${phenotype.name} - Phenotype Details`,
      description: phenotype.description || `Learn about the ${phenotype.name} phenotype from ${regions}.`,
      images: phenotype.imageUrl
        ? [{ url: phenotype.imageUrl, width: 400, height: 400, alt: phenotype.name }]
        : undefined,
    },
    alternates: {
      canonical: `${siteUrl}/phenotypes/${id}`,
    },
  };
}

export default async function PhenotypeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await stackServerApp.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { id } = await params;
  const phenotype = await getPhenotypeById(id);

  if (!phenotype) {
    redirect("/phenotypes");
  }

  const userData = {
    displayName: user.displayName,
    primaryEmail: user.primaryEmail,
    isAdmin: user.isAdmin,
  };

  const phenotypeData = {
    id: phenotype.id,
    name: phenotype.name,
    description: phenotype.description ?? undefined,
    imageUrl: phenotype.imageUrl,
    regions: phenotype.regions,
    countries: phenotype.countries,
    parentGroups: phenotype.parentGroups,
    connectionScore: phenotype.connectionScore,
    isBasic: phenotype.isBasic,
    relatedPhenotypes: phenotype.relatedPhenotypes,
    metadata: phenotype.metadata,
  };

  return <PhenotypeDetailContent user={userData} phenotype={phenotypeData} />;
}
