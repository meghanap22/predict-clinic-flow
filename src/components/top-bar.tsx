import { useEffect, useState } from "react";
import { Moon, Sun, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

export function TopBar() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-md">
      <SidebarTrigger />
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
        </span>
        <span className="text-xs font-medium text-muted-foreground">Live simulation</span>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Badge variant="outline" className="hidden gap-1 border-teal/40 bg-teal/10 text-teal-foreground md:inline-flex">
          <Sparkles className="h-3 w-3" /> AI Online
        </Badge>
        <Button variant="ghost" size="icon" aria-label="Toggle theme" onClick={() => setDark((d) => !d)}>
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>
    </header>
  );
}
