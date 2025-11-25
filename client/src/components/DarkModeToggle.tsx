import { useTheme } from "next-themes";
import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface DarkModeToggleProps {
  variant?: "button" | "dropdown" | "inline";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  compact?: boolean;
}

export function DarkModeToggle({
  variant = "button",
  size = "md",
  showLabel = false,
  compact = false,
}: DarkModeToggleProps) {
  const { theme, setTheme } = useTheme();

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  if (variant === "dropdown") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className={cn(sizeClasses[size], "transition-all hover:bg-primary/10")}
            data-testid="button-dark-mode-dropdown"
            title="Theme options"
          >
            {theme === "dark" ? (
              <Moon className={iconSizes[size]} />
            ) : theme === "light" ? (
              <Sun className={iconSizes[size]} />
            ) : (
              <Monitor className={iconSizes[size]} />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Theme Preference</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={theme === "light"}
            onCheckedChange={() => setTheme("light")}
            className="gap-2 cursor-pointer"
            data-testid="option-light-theme"
          >
            <Sun className="h-4 w-4" />
            Light Mode
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={theme === "dark"}
            onCheckedChange={() => setTheme("dark")}
            className="gap-2 cursor-pointer"
            data-testid="option-dark-theme"
          >
            <Moon className="h-4 w-4" />
            Dark Mode
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={theme === "system"}
            onCheckedChange={() => setTheme("system")}
            className="gap-2 cursor-pointer"
            data-testid="option-system-theme"
          >
            <Monitor className="h-4 w-4" />
            System Preference
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (variant === "inline") {
    return (
      <div className={cn("flex gap-2 rounded-lg border border-border p-1", compact && "p-0.5")}>
        <Button
          variant={theme === "light" ? "default" : "ghost"}
          size="icon"
          className={cn(sizeClasses[size])}
          onClick={() => setTheme("light")}
          data-testid="button-light-theme"
          title="Light mode"
        >
          <Sun className={iconSizes[size]} />
        </Button>
        <Button
          variant={theme === "dark" ? "default" : "ghost"}
          size="icon"
          className={cn(sizeClasses[size])}
          onClick={() => setTheme("dark")}
          data-testid="button-dark-theme"
          title="Dark mode"
        >
          <Moon className={iconSizes[size]} />
        </Button>
        <Button
          variant={theme === "system" ? "default" : "ghost"}
          size="icon"
          className={cn(sizeClasses[size])}
          onClick={() => setTheme("system")}
          data-testid="button-system-theme"
          title="System preference"
        >
          <Monitor className={iconSizes[size]} />
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size="icon"
      className={cn(
        sizeClasses[size],
        "transition-all duration-300 hover:bg-primary/10 hover:border-primary/50 group relative"
      )}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      data-testid="button-dark-mode-toggle"
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? (
        <>
          <Sun className={cn(iconSizes[size], "rotate-0 scale-100 transition-all")} />
          <Moon className="sr-only">Light Mode</Moon>
        </>
      ) : (
        <>
          <Moon className={cn(iconSizes[size], "rotate-0 scale-100 transition-all")} />
          <Sun className="sr-only">Dark Mode</Sun>
        </>
      )}
      {showLabel && (
        <span className="ml-2 text-sm font-medium">
          {theme === "dark" ? "Light" : "Dark"} Mode
        </span>
      )}
    </Button>
  );
}

export default DarkModeToggle;
