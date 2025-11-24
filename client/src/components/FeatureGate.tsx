import { ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { canAccessFeature, type FeatureAccess } from "@/lib/feature-access";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FeatureGateProps {
  feature: keyof FeatureAccess;
  children: ReactNode;
  fallback?: ReactNode;
  onUpgrade?: () => void;
}

export function FeatureGate({
  feature,
  children,
  fallback,
  onUpgrade,
}: FeatureGateProps) {
  const { user } = useAuth();

  if (!user) {
    return <>{fallback}</>;
  }

  const hasAccess = canAccessFeature(user.plan as any, user.isAdmin || false, feature);

  if (!hasAccess) {
    return (
      fallback || (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900 dark:text-amber-100">
              <Lock className="h-5 w-5" />
              Feature Locked
            </CardTitle>
            <CardDescription className="text-amber-800 dark:text-amber-200">
              This feature is not available on your current plan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={onUpgrade} variant="outline" className="border-amber-300 hover:bg-amber-100">
              Upgrade Plan
            </Button>
          </CardContent>
        </Card>
      )
    );
  }

  return <>{children}</>;
}
