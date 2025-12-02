import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, ChevronRight, CheckCircle } from "lucide-react";

const TOUR_STEPS = [
  {
    id: "welcome",
    title: "Welcome to BlogVerse! 👋",
    description: "Let's take a quick tour to get you started with your blogging journey.",
    target: "body",
    position: "center" as const,
  },
  {
    id: "dashboard",
    title: "Dashboard Overview",
    description: "Your dashboard shows real-time stats, recent articles, and performance insights.",
    target: "[data-tour='dashboard']",
    position: "bottom" as const,
  },
  {
    id: "create-article",
    title: "Create New Articles",
    description: "Click here to write and publish new articles with our rich editor.",
    target: "a[href='/editor']",
    position: "bottom" as const,
  },
  {
    id: "my-articles",
    title: "Manage Your Articles",
    description: "View, edit, and organize all your published and draft articles.",
    target: "a[href='/my-articles']",
    position: "bottom" as const,
  },
  {
    id: "calendar",
    title: "Content Calendar",
    description: "Plan your content, schedule articles, and track your publishing pipeline.",
    target: "a[href='/calendar']",
    position: "bottom" as const,
  },
  {
    id: "analytics",
    title: "Analytics & Insights",
    description: "Track views, engagement, and performance metrics for your articles.",
    target: "a[href='/analytics']",
    position: "bottom" as const,
  },
  {
    id: "settings",
    title: "Settings & Customization",
    description: "Customize your theme, profile, and preferences to make it your own.",
    target: "a[href='/settings']",
    position: "bottom" as const,
  },
  {
    id: "complete",
    title: "You're All Set! 🎉",
    description: "You now know the basics. Start creating amazing content!",
    target: "body",
    position: "center" as const,
  },
];

export function GuidedTour() {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isOpen, setIsOpen] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  useEffect(() => {
    const tourStarted = localStorage.getItem("tourStarted");
    const tourCompleted = localStorage.getItem("tourCompleted");
    const savedCompletedSteps = localStorage.getItem("completedSteps");

    if (!tourCompleted && !tourStarted) {
      const timer = setTimeout(() => setIsOpen(true), 1000);
      localStorage.setItem("tourStarted", "true");
      return () => clearTimeout(timer);
    }

    if (savedCompletedSteps) {
      setCompletedSteps(JSON.parse(savedCompletedSteps));
    }
  }, []);

  const handleNext = () => {
    const newCompleted = [...completedSteps, TOUR_STEPS[currentStep].id];
    setCompletedSteps(newCompleted);
    localStorage.setItem("completedSteps", JSON.stringify(newCompleted));

    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  const handleSkip = () => {
    completeTour();
  };

  const completeTour = () => {
    localStorage.setItem("tourCompleted", "true");
    setIsOpen(false);
  };

  const currentStepData = TOUR_STEPS[currentStep];
  const progress = ((currentStep + 1) / TOUR_STEPS.length) * 100;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/30 pointer-events-auto" onClick={handleSkip} />

      {/* Spotlight for target element */}
      {currentStepData.target !== "body" && (
        <div
          className="fixed border-2 border-primary shadow-lg pointer-events-none"
          style={{
            boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.3)",
          }}
        />
      )}

      {/* Tour card */}
      <Card className="fixed z-50 pointer-events-auto max-w-sm p-6 shadow-2xl bg-background border-primary">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-bold text-primary">{currentStepData.title}</h3>
            <button onClick={handleSkip} className="text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
          </div>

          <p className="text-sm text-muted-foreground">{currentStepData.description}</p>

          {/* Progress bar */}
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Step {currentStep + 1} of {TOUR_STEPS.length}
            </span>
            {completedSteps.length > 0 && (
              <span className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-500" />
                {completedSteps.length} completed
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={handleSkip} className="flex-1">
              Skip Tour
            </Button>
            <Button size="sm" onClick={handleNext} className="flex-1 gap-2">
              {currentStep === TOUR_STEPS.length - 1 ? "Finish" : "Next"}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
