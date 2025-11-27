"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Plus,
  Sparkles,
  Calendar,
  Search,
  Filter,
  ChevronRight,
  Edit3,
  Trash2,
  ArrowLeft,
  Save,
  X,
} from "lucide-react";

interface JournalEntry {
  id: string;
  title?: string;
  content: string;
  mood?: string;
  moodScore?: number;
  emotions?: string[];
  tags?: string[];
  promptText?: string;
  wordCount: number;
  createdAt: string;
  updatedAt: string;
}

interface Prompt {
  id: string;
  category: string;
  promptText: string;
}

const MOOD_OPTIONS = [
  { value: 1, emoji: "😢", label: "Very Low" },
  { value: 2, emoji: "😕", label: "Low" },
  { value: 3, emoji: "😐", label: "Neutral" },
  { value: 4, emoji: "🙂", label: "Good" },
  { value: 5, emoji: "😊", label: "Great" },
];

const PROMPT_CATEGORIES = [
  { id: "reflection", label: "Reflection", color: "bg-blue-500" },
  { id: "gratitude", label: "Gratitude", color: "bg-green-500" },
  { id: "emotion", label: "Emotions", color: "bg-purple-500" },
  { id: "growth", label: "Growth", color: "bg-orange-500" },
  { id: "relationship", label: "Relationships", color: "bg-pink-500" },
];

const DEFAULT_PROMPTS: Prompt[] = [
  { id: "1", category: "reflection", promptText: "What's one thing you learned about yourself today?" },
  { id: "2", category: "gratitude", promptText: "List three things you're grateful for right now." },
  { id: "3", category: "emotion", promptText: "Describe a strong emotion you felt today. What triggered it?" },
  { id: "4", category: "growth", promptText: "What's a challenge you're currently facing, and how might you grow from it?" },
  { id: "5", category: "relationship", promptText: "Think about a meaningful interaction you had recently. What made it special?" },
  { id: "6", category: "reflection", promptText: "If you could give your younger self one piece of advice, what would it be?" },
  { id: "7", category: "emotion", promptText: "How do you typically react when you feel stressed? Is there a healthier way?" },
  { id: "8", category: "growth", promptText: "What's one small step you could take today toward a bigger goal?" },
];

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [prompts] = useState<Prompt[]>(DEFAULT_PROMPTS);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "write" | "view">("list");
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Write form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [moodScore, setMoodScore] = useState<number | undefined>(undefined);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadEntries();
  }, []);

  async function loadEntries() {
    try {
      const res = await fetch("/api/journal");
      if (res.ok) {
        const data = await res.json();
        setEntries(data.entries || []);
      }
    } catch (error) {
      console.error("Failed to load entries:", error);
    } finally {
      setLoading(false);
    }
  }

  function startNewEntry(prompt?: Prompt) {
    setSelectedPrompt(prompt || null);
    setContent(prompt ? "" : "");
    setTitle("");
    setMoodScore(undefined);
    setTags([]);
    setView("write");
  }

  function viewEntry(entry: JournalEntry) {
    setSelectedEntry(entry);
    setView("view");
  }

  async function saveEntry() {
    if (!content.trim()) return;

    setSaving(true);
    try {
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim() || undefined,
          content: content.trim(),
          moodScore,
          tags: tags.length > 0 ? tags : undefined,
          promptId: selectedPrompt?.id,
          promptText: selectedPrompt?.promptText,
        }),
      });

      if (res.ok) {
        await loadEntries();
        setView("list");
        resetForm();
      }
    } catch (error) {
      console.error("Failed to save entry:", error);
    } finally {
      setSaving(false);
    }
  }

  async function deleteEntry(id: string) {
    if (!confirm("Are you sure you want to delete this entry?")) return;

    try {
      const res = await fetch(`/api/journal/${id}`, { method: "DELETE" });
      if (res.ok) {
        await loadEntries();
        if (selectedEntry?.id === id) {
          setView("list");
          setSelectedEntry(null);
        }
      }
    } catch (error) {
      console.error("Failed to delete entry:", error);
    }
  }

  function resetForm() {
    setTitle("");
    setContent("");
    setMoodScore(undefined);
    setSelectedPrompt(null);
    setTags([]);
    setNewTag("");
  }

  function addTag() {
    if (newTag.trim() && !tags.includes(newTag.trim().toLowerCase())) {
      setTags([...tags, newTag.trim().toLowerCase()]);
      setNewTag("");
    }
  }

  function removeTag(tag: string) {
    setTags(tags.filter(t => t !== tag));
  }

  const filteredEntries = entries.filter(entry => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      entry.title?.toLowerCase().includes(query) ||
      entry.content.toLowerCase().includes(query) ||
      entry.tags?.some(t => t.toLowerCase().includes(query))
    );
  });

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  // Write View
  if (view === "write") {
    return (
      <div className="container max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => { resetForm(); setView("list"); }}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">New Entry</h1>
        </div>

        {selectedPrompt && (
          <Card className="mb-6 border-primary/30 bg-primary/5">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Today&apos;s Prompt</p>
                  <p className="font-medium">{selectedPrompt.promptText}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          <Input
            placeholder="Title (optional)"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="text-lg font-medium"
          />

          <Textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={12}
            className="resize-none"
          />

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{wordCount} words</span>
            <span>{new Date().toLocaleDateString()}</span>
          </div>

          {/* Mood Score */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">How are you feeling?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between gap-2">
                {MOOD_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    onClick={() => setMoodScore(moodScore === option.value ? undefined : option.value)}
                    className={cn(
                      "flex-1 flex flex-col items-center p-3 rounded-lg transition-all",
                      moodScore === option.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50 hover:bg-muted"
                    )}
                  >
                    <span className="text-2xl mb-1">{option.emoji}</span>
                    <span className="text-xs">{option.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button onClick={() => removeTag(tag)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag..."
                  value={newTag}
                  onChange={e => setNewTag(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag())}
                  className="flex-1"
                />
                <Button variant="outline" onClick={addTag}>Add</Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => { resetForm(); setView("list"); }}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={saveEntry} disabled={!content.trim() || saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Entry"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // View Entry
  if (view === "view" && selectedEntry) {
    return (
      <div className="container max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="icon" onClick={() => { setSelectedEntry(null); setView("list"); }}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={() => deleteEntry(selectedEntry.id)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>

        <article>
          <header className="mb-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Calendar className="h-4 w-4" />
              {new Date(selectedEntry.createdAt).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
            {selectedEntry.title && (
              <h1 className="text-2xl font-bold">{selectedEntry.title}</h1>
            )}
          </header>

          {selectedEntry.promptText && (
            <Card className="mb-6 border-primary/30 bg-primary/5">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Prompt</p>
                    <p className="italic">{selectedEntry.promptText}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="prose prose-neutral dark:prose-invert max-w-none mb-6">
            {selectedEntry.content.split("\n").map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>

          <footer className="flex items-center justify-between pt-4 border-t">
            <div className="flex gap-2">
              {selectedEntry.tags?.map(tag => (
                <Badge key={tag} variant="outline">{tag}</Badge>
              ))}
            </div>
            {selectedEntry.moodScore && (
              <span className="text-2xl">
                {MOOD_OPTIONS.find(m => m.value === selectedEntry.moodScore)?.emoji}
              </span>
            )}
          </footer>
        </article>
      </div>
    );
  }

  // List View
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Journal</h1>
          <p className="text-muted-foreground">
            Reflect on your thoughts and emotions
          </p>
        </div>
        <Button onClick={() => startNewEntry()}>
          <Plus className="h-4 w-4 mr-2" />
          New Entry
        </Button>
      </div>

      {/* Prompts */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Writing Prompts
          </CardTitle>
          <CardDescription>Need inspiration? Try one of these prompts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3">
            {prompts.slice(0, 4).map(prompt => {
              const category = PROMPT_CATEGORIES.find(c => c.id === prompt.category);
              return (
                <button
                  key={prompt.id}
                  onClick={() => startNewEntry(prompt)}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 text-left transition-colors"
                >
                  <div className={cn("w-2 h-2 rounded-full mt-2", category?.color)} />
                  <span className="text-sm">{prompt.promptText}</span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search entries..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Entries List */}
      {filteredEntries.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">
              {entries.length === 0 ? "No entries yet" : "No matching entries"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {entries.length === 0
                ? "Start writing to capture your thoughts and emotions"
                : "Try a different search term"}
            </p>
            {entries.length === 0 && (
              <Button onClick={() => startNewEntry()}>
                <Edit3 className="h-4 w-4 mr-2" />
                Write Your First Entry
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredEntries.map(entry => (
            <Card
              key={entry.id}
              className="cursor-pointer hover:bg-muted/30 transition-colors"
              onClick={() => viewEntry(entry)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-muted-foreground">
                        {new Date(entry.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      {entry.moodScore && (
                        <span className="text-lg">
                          {MOOD_OPTIONS.find(m => m.value === entry.moodScore)?.emoji}
                        </span>
                      )}
                    </div>
                    {entry.title && (
                      <h3 className="font-semibold mb-1">{entry.title}</h3>
                    )}
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {entry.content}
                    </p>
                    {entry.tags && entry.tags.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {entry.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {entry.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{entry.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
