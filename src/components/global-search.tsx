import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  BarChart3,
  ClipboardList,
  DoorOpen,
  GitBranch,
  LayoutDashboard,
  LineChart,
  Search,
  SlidersHorizontal,
  Sparkles,
  Stethoscope,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  POPULAR_SEARCHES,
  SEARCH_CATEGORY_ORDER,
  SEARCH_INDEX,
  type SearchCategory,
  type SearchItem,
} from "@/lib/search-index";
import {
  filterSearchItems,
  findSearchSuggestions,
  groupSearchResults,
  highlightMatch,
} from "@/lib/search-utils";
import { cn } from "@/lib/utils";

const PAGE_ICONS: Record<string, React.ReactNode> = {
  "/": <LayoutDashboard className="h-4 w-4" />,
  "/analytics": <LineChart className="h-4 w-4" />,
  "/patient-flow": <Activity className="h-4 w-4" />,
  "/recommendations": <Sparkles className="h-4 w-4" />,
  "/simulation": <SlidersHorizontal className="h-4 w-4" />,
};

const CATEGORY_ICONS: Record<SearchCategory, React.ReactNode> = {
  Pages: <LayoutDashboard className="h-4 w-4" />,
  Departments: <Stethoscope className="h-4 w-4" />,
  "Flow Stages": <GitBranch className="h-4 w-4" />,
  "Staff & Rooms": <Users className="h-4 w-4" />,
  Metrics: <TrendingUp className="h-4 w-4" />,
  "Charts & Views": <BarChart3 className="h-4 w-4" />,
  Recommendations: <Sparkles className="h-4 w-4" />,
  Simulation: <SlidersHorizontal className="h-4 w-4" />,
};

function itemIcon(item: SearchItem) {
  if (item.category === "Pages") return PAGE_ICONS[item.url] ?? CATEGORY_ICONS.Pages;
  if (item.category === "Flow Stages") return <ClipboardList className="h-4 w-4" />;
  if (item.category === "Staff & Rooms") {
    return item.id.startsWith("room") ? <DoorOpen className="h-4 w-4" /> : <Stethoscope className="h-4 w-4" />;
  }
  return CATEGORY_ICONS[item.category] ?? <Zap className="h-4 w-4" />;
}

function HighlightedText({ text, query }: { text: string; query: string }) {
  const parts = highlightMatch(text, query);
  return (
    <>
      {parts.map((part, index) =>
        part.match ? (
          <mark key={index} className="rounded bg-primary/15 px-0.5 text-primary">
            {part.text}
          </mark>
        ) : (
          <span key={index}>{part.text}</span>
        ),
      )}
    </>
  );
}

export function GlobalSearch({ className }: { className?: string }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const results = useMemo(() => filterSearchItems(query, SEARCH_INDEX), [query]);
  const suggestions = useMemo(
    () => (query.trim() && results.length === 0 ? findSearchSuggestions(query, SEARCH_INDEX) : []),
    [query, results.length],
  );
  const grouped = useMemo(() => groupSearchResults(results), [results]);

  const selectItem = (item: SearchItem) => {
    setOpen(false);
    setQuery("");
    navigate({ to: item.url });
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setQuery("");
  };

  const applyPopularSearch = (term: string) => {
    setQuery(term);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "flex h-9 w-full items-center gap-2 rounded-lg border border-input bg-muted/40 px-3 text-sm text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground",
          className,
        )}
        aria-label="Search clinic"
      >
        <Search className="h-4 w-4 shrink-0 opacity-60" />
        <span className="hidden flex-1 truncate text-left sm:inline">
          Search pages, doctors, rooms, metrics…
        </span>
        <kbd className="pointer-events-none hidden rounded border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline">
          ⌘K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="overflow-hidden p-0 sm:max-w-xl">
          <Command
            shouldFilter={false}
            className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5"
          >
            <CommandInput
              value={query}
              onValueChange={setQuery}
              placeholder="Try wait time, Dr. Chen, Room 4, check-in, simulation…"
            />
            <CommandList className="max-h-[420px]">
              {query.trim() && results.length === 0 ? (
                <div className="space-y-4 px-4 py-6">
                  <p className="text-sm text-muted-foreground">
                    No exact matches for{" "}
                    <span className="font-medium text-foreground">"{query.trim()}"</span>
                  </p>

                  {suggestions.length > 0 ? (
                    <div className="space-y-3">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Did you mean
                      </p>
                      {suggestions.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => selectItem(item)}
                          className="flex w-full items-center gap-3 rounded-xl border bg-muted/30 p-3 text-left transition hover:border-primary/30 hover:bg-primary/5"
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            {itemIcon(item)}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold">{item.title}</span>
                            {item.subtitle && (
                              <span className="block truncate text-xs text-muted-foreground">
                                {item.subtitle}
                              </span>
                            )}
                          </span>
                          <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                      Try a department (<b>Pediatrics</b>), a doctor (<b>Dr. Chen</b>), a flow stage (
                      <b>Check-In</b>), or a metric like <b>Wait Time</b>.
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {!query.trim() && (
                    <>
                      <CommandEmpty>Browse popular searches or type anything clinic-related.</CommandEmpty>
                      <div className="border-b px-4 pb-3 pt-1">
                        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                          Popular searches
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {POPULAR_SEARCHES.map((term) => (
                            <button
                              key={term}
                              type="button"
                              onClick={() => applyPopularSearch(term)}
                              className="rounded-full border bg-muted/40 px-2.5 py-1 text-xs transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                            >
                              {term}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {SEARCH_CATEGORY_ORDER.map((category, index) => {
                    const items = grouped.get(category);
                    if (!items?.length) return null;

                    return (
                      <div key={category}>
                        {index > 0 && <CommandSeparator />}
                        <CommandGroup heading={`${category}${query.trim() ? ` (${items.length})` : ""}`}>
                          {items.map((item) => (
                            <CommandItem
                              key={item.id}
                              value={`${item.title} ${item.subtitle ?? ""} ${item.keywords.join(" ")}`}
                              onSelect={() => selectItem(item)}
                              className="gap-3"
                            >
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                {itemIcon(item)}
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="flex items-center gap-2">
                                  <span className="truncate font-medium">
                                    {query.trim() ? (
                                      <HighlightedText text={item.title} query={query} />
                                    ) : (
                                      item.title
                                    )}
                                  </span>
                                  {!query.trim() && (
                                    <Badge variant="outline" className="hidden text-[10px] sm:inline-flex">
                                      {category}
                                    </Badge>
                                  )}
                                </span>
                                {item.subtitle && (
                                  <span className="block truncate text-xs text-muted-foreground">
                                    {item.subtitle}
                                  </span>
                                )}
                              </span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </div>
                    );
                  })}

                  {query.trim() && results.length > 0 && (
                    <div className="border-t px-4 py-2 text-center text-[11px] text-muted-foreground">
                      {results.length} result{results.length === 1 ? "" : "s"} — press Enter to open top match
                    </div>
                  )}
                </>
              )}
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
