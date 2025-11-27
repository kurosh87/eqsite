import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  getGames,
  getGameBySlug,
  getGameContent,
  saveGameSession,
  getUserGameHistory,
} from "@/lib/eq-database";

// GET /api/games - List games or get game details
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const history = searchParams.get("history") === "true";

    // Get user's game history
    if (history) {
      const session = await auth.api.getSession({ headers: await headers() });
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const gameId = searchParams.get("gameId") || undefined;
      const limit = parseInt(searchParams.get("limit") || "10");
      const gameHistory = await getUserGameHistory(session.user.id, gameId, limit);

      return NextResponse.json({
        history: gameHistory.map(({ session: gs, game }) => ({
          id: gs.id,
          game: {
            slug: game.slug,
            name: game.name,
          },
          score: gs.score,
          maxScore: gs.maxScore,
          accuracy: gs.accuracy,
          xpEarned: gs.xpEarned,
          completedAt: gs.completedAt,
        })),
      });
    }

    // Get specific game with content
    if (slug) {
      const game = await getGameBySlug(slug);
      if (!game) {
        return NextResponse.json({ error: "Game not found" }, { status: 404 });
      }

      const content = await getGameContent(game.id);

      return NextResponse.json({
        game: {
          id: game.id,
          slug: game.slug,
          name: game.name,
          description: game.description,
          instructions: game.instructions,
          gameType: game.gameType,
          difficulty: game.difficulty,
          estimatedMinutes: game.estimatedMinutes,
          xpReward: game.xpReward,
          isPremium: game.isPremium,
        },
        content: content.map((c) => ({
          id: c.id,
          content: c.content,
          difficulty: c.difficulty,
          order: c.order,
        })),
      });
    }

    // List all games
    const gamesList = await getGames();

    return NextResponse.json({
      games: gamesList.map((game) => ({
        id: game.id,
        slug: game.slug,
        name: game.name,
        description: game.description,
        gameType: game.gameType,
        difficulty: game.difficulty,
        estimatedMinutes: game.estimatedMinutes,
        xpReward: game.xpReward,
        isPremium: game.isPremium,
      })),
    });
  } catch (error) {
    console.error("Error fetching games:", error);
    return NextResponse.json(
      { error: "Failed to fetch games" },
      { status: 500 }
    );
  }
}

// POST /api/games - Save game session results
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { gameSlug, score, maxScore, accuracy, timeTaken, roundsCompleted } = body;

    if (!gameSlug || score === undefined || maxScore === undefined) {
      return NextResponse.json(
        { error: "gameSlug, score, and maxScore are required" },
        { status: 400 }
      );
    }

    const game = await getGameBySlug(gameSlug);
    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    // Calculate XP based on performance
    const performanceRatio = maxScore > 0 ? score / maxScore : 0;
    const xpEarned = Math.round(game.xpReward * performanceRatio);

    const gameSession = await saveGameSession(session.user.id, game.id, {
      score,
      maxScore,
      accuracy,
      timeTaken,
      roundsCompleted: roundsCompleted || 0,
      xpEarned,
    });

    return NextResponse.json({
      success: true,
      session: {
        id: gameSession.id,
        score: gameSession.score,
        maxScore: gameSession.maxScore,
        accuracy: gameSession.accuracy,
        xpEarned: gameSession.xpEarned,
      },
    });
  } catch (error) {
    console.error("Error saving game session:", error);
    return NextResponse.json(
      { error: "Failed to save game session" },
      { status: 500 }
    );
  }
}
