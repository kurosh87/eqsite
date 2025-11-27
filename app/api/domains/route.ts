import { NextRequest, NextResponse } from "next/server";
import { getEqDomains, getEqDomainBySlug, getSkillsForDomain } from "@/lib/eq-database";

// GET /api/domains - List EQ domains or get domain details
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    // Get specific domain with skills
    if (slug) {
      const domain = await getEqDomainBySlug(slug);
      if (!domain) {
        return NextResponse.json({ error: "Domain not found" }, { status: 404 });
      }

      const skills = await getSkillsForDomain(domain.id);

      return NextResponse.json({
        domain: {
          id: domain.id,
          slug: domain.slug,
          name: domain.name,
          description: domain.description,
          icon: domain.icon,
          color: domain.color,
        },
        skills: skills.map((skill) => ({
          id: skill.id,
          slug: skill.slug,
          name: skill.name,
          description: skill.description,
          tips: skill.tips,
          exercises: skill.exercises,
        })),
      });
    }

    // List all domains
    const domains = await getEqDomains();

    return NextResponse.json({
      domains: domains.map((domain) => ({
        id: domain.id,
        slug: domain.slug,
        name: domain.name,
        description: domain.description,
        icon: domain.icon,
        color: domain.color,
      })),
    });
  } catch (error) {
    console.error("Error fetching domains:", error);
    return NextResponse.json(
      { error: "Failed to fetch domains" },
      { status: 500 }
    );
  }
}
