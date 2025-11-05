import { MapPin, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import type { Recommendation } from "@shared/schema";

interface MapSearchResult {
  center: {
    latitude: number;
    longitude: number;
  };
  radius: number;
  count: number;
  recommendations: (Recommendation & { likeCount: number })[];
}

export default function LocationMap() {
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  // Fetch map data based on active search
  const { data, isLoading, error } = useQuery<MapSearchResult>({
    queryKey: [`/api/map/search?location=${encodeURIComponent(activeSearch)}`],
    enabled: !!activeSearch,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setActiveSearch(searchInput.trim());
    }
  };

  const handleClear = () => {
    setSearchInput("");
    setActiveSearch("");
  };

  // Convert lat/lng to map position (simplified projection)
  const getMarkerStyle = (lat: number, lng: number) => {
    const x = ((lng + 180) / 360) * 100;
    const y = ((90 - lat) / 180) * 100;
    
    return {
      left: `${x}%`,
      top: `${y}%`,
      transform: 'translate(-50%, -50%)',
    };
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
        <Input
          type="search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search location (e.g., San Francisco, CA)"
          className="pl-12 h-12 border-4"
          data-testid="input-location-search"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
          {activeSearch && (
            <Button
              type="button"
              onClick={handleClear}
              variant="ghost"
              size="sm"
              data-testid="button-clear-search"
            >
              Clear
            </Button>
          )}
          <Button
            type="submit"
            size="sm"
            disabled={!searchInput.trim() || isLoading}
            data-testid="button-search-location"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Searching...
              </>
            ) : (
              'Search'
            )}
          </Button>
        </div>
      </form>

      <div className="border-4 border-foreground bg-muted/20 rounded-md overflow-hidden">
        <div className="relative aspect-[16/9] bg-gradient-to-br from-primary/10 via-background to-accent/10">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="w-12 h-12 mx-auto mb-2 animate-spin text-primary" />
                <p className="font-medium text-muted-foreground">Searching for recommendations...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-destructive">
                <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="font-medium">Failed to search location</p>
                <p className="text-sm text-muted-foreground">Please try again</p>
              </div>
            </div>
          )}

          {data && data.recommendations.length > 0 && (
            <div className="absolute inset-0">
              {/* Center marker */}
              <div
                className="absolute z-10"
                style={getMarkerStyle(data.center.latitude, data.center.longitude)}
              >
                <div className="relative">
                  <div className="w-4 h-4 rounded-full bg-primary border-2 border-background animate-pulse" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-primary/20 border-2 border-primary/40" />
                </div>
              </div>

              {/* Recommendation markers */}
              {data.recommendations.map((rec) => (
                <Link
                  key={rec.id}
                  href={`/recommendation/${rec.id}`}
                >
                  <button
                    className="absolute group z-20"
                    style={getMarkerStyle(rec.latitude!, rec.longitude!)}
                    data-testid={`marker-${rec.id}`}
                  >
                    <div className="relative">
                      <MapPin 
                        className="w-6 h-6 text-foreground group-hover:text-primary group-hover:scale-125 transition-all"
                        fill="currentColor"
                      />
                      <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <Badge variant="default" className="border-2 text-xs max-w-[200px] truncate">
                          {rec.title}
                        </Badge>
                      </div>
                    </div>
                  </button>
                </Link>
              ))}
            </div>
          )}

          {data && data.recommendations.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="font-medium">No recommendations found</p>
                <p className="text-sm">Try searching a different location</p>
              </div>
            </div>
          )}

          {!activeSearch && !isLoading && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center text-muted-foreground">
                <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="font-medium">Search for a location to explore recommendations</p>
                <p className="text-sm mt-1">Shows all recommendations within 50 miles</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {data && data.recommendations.length > 0 && (
        <div className="border-4 border-foreground p-6 bg-card">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-display font-bold text-2xl mb-1" data-testid="text-search-results">
                {data.count} recommendation{data.count !== 1 ? 's' : ''} found
              </h3>
              <p className="text-muted-foreground">
                Within {data.radius} miles of your search
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {data.recommendations.slice(0, 6).map((rec) => (
              <Link key={rec.id} href={`/recommendation/${rec.id}`}>
                <Card className="hover-elevate transition-all cursor-pointer h-full">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm truncate mb-1" data-testid={`rec-title-${rec.id}`}>
                          {rec.title}
                        </h4>
                        {rec.location && (
                          <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            {rec.location}
                          </p>
                        )}
                      </div>
                    </div>
                    {rec.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {rec.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      {rec.rating && (
                        <Badge variant="secondary" className="text-xs">
                          ★ {rec.rating}
                        </Badge>
                      )}
                      {rec.likeCount > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {rec.likeCount} {rec.likeCount === 1 ? 'like' : 'likes'}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {data.recommendations.length > 6 && (
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Showing 6 of {data.count} recommendations. Scroll the map to see more.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
