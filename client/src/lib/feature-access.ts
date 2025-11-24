// Feature access control based on user plan and admin status
export type Plan = "free" | "pro" | "enterprise";

export interface FeatureAccess {
  darkMode: boolean;
  scheduledPublishing: boolean;
  pdfExport: boolean;
  plagiarismChecker: boolean;
  versionHistory: boolean;
  collaborativeEditing: boolean;
  advancedAnalytics: boolean;
  unlimitedArticles: boolean;
  customDomain: boolean;
  seoOptimization: boolean;
}

export const FEATURE_ACCESS: Record<Plan, FeatureAccess> = {
  free: {
    darkMode: true,
    scheduledPublishing: false,
    pdfExport: false,
    plagiarismChecker: false,
    versionHistory: false,
    collaborativeEditing: false,
    advancedAnalytics: false,
    unlimitedArticles: false,
    customDomain: false,
    seoOptimization: false,
  },
  pro: {
    darkMode: true,
    scheduledPublishing: true,
    pdfExport: true,
    plagiarismChecker: true,
    versionHistory: true,
    collaborativeEditing: true,
    advancedAnalytics: true,
    unlimitedArticles: true,
    customDomain: false,
    seoOptimization: true,
  },
  enterprise: {
    darkMode: true,
    scheduledPublishing: true,
    pdfExport: true,
    plagiarismChecker: true,
    versionHistory: true,
    collaborativeEditing: true,
    advancedAnalytics: true,
    unlimitedArticles: true,
    customDomain: true,
    seoOptimization: true,
  },
};

export const canAccessFeature = (
  plan: Plan,
  isAdmin: boolean,
  feature: keyof FeatureAccess
): boolean => {
  // Admin users have access to all features
  if (isAdmin) return true;
  
  return FEATURE_ACCESS[plan][feature];
};

export const getPlanFeatures = (plan: Plan): FeatureAccess => {
  return FEATURE_ACCESS[plan];
};
