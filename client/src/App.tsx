import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import Explore from "@/pages/Explore";
import PublicProfile from "@/pages/PublicProfile";
import ExploreMap from "@/pages/ExploreMap";
import Activity from "@/pages/Activity";
import CreateRecommendation from "@/pages/CreateRecommendation";
import RecommendationDetail from "@/pages/RecommendationDetail";
import CuratorRecs from "@/pages/CuratorRecs";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/explore" component={Explore} />
      <Route path="/map" component={ExploreMap} />
      <Route path="/activity" component={Activity} />
      <Route path="/curator-recs" component={CuratorRecs} />
      <Route path="/create" component={CreateRecommendation} />
      <Route path="/recommendation/:id" component={RecommendationDetail} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/profile/:username" component={PublicProfile} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
