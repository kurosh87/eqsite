import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database";
import { haplogroups } from "@/app/schema/schema";
import { eq, ilike, or, sql } from "drizzle-orm";

/**
 * GET /api/haplogroups
 * Fetch haplogroup details by name or search
 *
 * Query params:
 * - name: exact haplogroup name (e.g., "R1b", "H")
 * - search: fuzzy search term
 * - type: filter by 'paternal' or 'maternal'
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name");
    const search = searchParams.get("search");
    const type = searchParams.get("type");

    // If exact name is provided, try to find by exact match or prefix match
    if (name) {
      // First try exact match
      let result = await db
        .select()
        .from(haplogroups)
        .where(eq(haplogroups.name, name))
        .limit(1);

      // If not found, try case-insensitive match
      if (result.length === 0) {
        result = await db
          .select()
          .from(haplogroups)
          .where(ilike(haplogroups.name, name))
          .limit(1);
      }

      // If still not found, try to find parent haplogroup
      // e.g., "R1b1a2" -> try "R1b1a" -> "R1b1" -> "R1b" -> "R1"
      if (result.length === 0 && name.length > 1) {
        let searchName = name;
        while (searchName.length > 1 && result.length === 0) {
          // Try removing last character
          searchName = searchName.slice(0, -1);
          result = await db
            .select()
            .from(haplogroups)
            .where(ilike(haplogroups.name, searchName))
            .limit(1);
        }

        // If we found a parent, mark it as such
        if (result.length > 0) {
          return NextResponse.json({
            haplogroup: result[0],
            matchType: "parent",
            originalQuery: name,
            matchedParent: searchName,
          });
        }
      }

      if (result.length === 0) {
        return NextResponse.json(
          { error: `Haplogroup ${name} not found`, suggestions: await getSuggestions(name) },
          { status: 404 }
        );
      }

      return NextResponse.json({
        haplogroup: result[0],
        matchType: "exact",
      });
    }

    // Search mode
    if (search) {
      const conditions = [];

      // Name prefix match
      conditions.push(ilike(haplogroups.name, `${search}%`));

      // Full text search in description
      conditions.push(ilike(haplogroups.shortDescription, `%${search}%`));
      conditions.push(ilike(haplogroups.description, `%${search}%`));
      conditions.push(ilike(haplogroups.originRegion, `%${search}%`));

      let query = db
        .select()
        .from(haplogroups)
        .where(or(...conditions));

      if (type && (type === "paternal" || type === "maternal")) {
        query = db
          .select()
          .from(haplogroups)
          .where(
            sql`${or(...conditions)} AND ${haplogroups.type} = ${type}`
          );
      }

      const results = await query.limit(20);

      return NextResponse.json({
        haplogroups: results,
        count: results.length,
      });
    }

    // List all haplogroups (optionally filtered by type)
    let results;
    if (type && (type === "paternal" || type === "maternal")) {
      results = await db
        .select()
        .from(haplogroups)
        .where(eq(haplogroups.type, type))
        .orderBy(haplogroups.name);
    } else {
      results = await db
        .select()
        .from(haplogroups)
        .orderBy(haplogroups.name);
    }

    return NextResponse.json({
      haplogroups: results,
      count: results.length,
    });
  } catch (error: any) {
    console.error("Error fetching haplogroups:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch haplogroups" },
      { status: 500 }
    );
  }
}

/**
 * Get suggestions for similar haplogroup names
 */
async function getSuggestions(name: string): Promise<string[]> {
  try {
    // Get first letter/number to find similar haplogroups
    const prefix = name.charAt(0).toUpperCase();

    const similar = await db
      .select({ name: haplogroups.name })
      .from(haplogroups)
      .where(ilike(haplogroups.name, `${prefix}%`))
      .limit(5);

    return similar.map((h) => h.name);
  } catch {
    return [];
  }
}
