import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown, Plus, Search, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { US_CITIES_BY_STATE, getCitiesForState, addCityToState } from "@/data/us-cities";
import { toast } from "sonner";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
  "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY",
  "DC","PR","VI","GU","AS","MP",
];

export function CitiesTab() {
  const [selectedState, setSelectedState] = useState("AL");
  const [stateOpen, setStateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newCity, setNewCity] = useState("");
  const [addState, setAddState] = useState("AL");
  const [addStateOpen, setAddStateOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const cities = useMemo(
    () => getCitiesForState(selectedState, searchQuery || undefined),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedState, searchQuery, refreshKey]
  );

  const totalCities = useMemo(
    () => US_CITIES_BY_STATE[selectedState]?.length ?? 0,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedState, refreshKey]
  );

  const handleAdd = () => {
    const trimmed = newCity.trim();
    if (!trimmed) return;
    const added = addCityToState(trimmed, addState);
    if (added) {
      toast.success(`Added "${trimmed}" to ${addState}`);
      setNewCity("");
      setRefreshKey((k) => k + 1);
    } else {
      toast.error(`"${trimmed}" already exists in ${addState}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Browse section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5" /> Browse Cities by State
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <Label>State</Label>
              <Popover open={stateOpen} onOpenChange={setStateOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="w-[120px] justify-between font-normal">
                    {selectedState}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[160px] p-0">
                  <Command>
                    <CommandInput placeholder="Search…" />
                    <CommandList>
                      <CommandEmpty>Not found.</CommandEmpty>
                      <CommandGroup>
                        {US_STATES.map((s) => (
                          <CommandItem
                            key={s}
                            value={s}
                            onSelect={() => {
                              setSelectedState(s);
                              setStateOpen(false);
                              setSearchQuery("");
                            }}
                          >
                            <Check className={cn("mr-2 h-4 w-4", selectedState === s ? "opacity-100" : "opacity-0")} />
                            {s}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2 flex-1 min-w-[200px]">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter cities…"
                  className="pl-9"
                />
              </div>
            </div>

            <Badge variant="secondary" className="mb-0.5">
              {searchQuery ? `${cities.length} / ` : ""}{totalCities} cities
            </Badge>
          </div>

          <ScrollArea className="h-[360px] rounded-md border">
            <div className="p-3 space-y-1">
              {cities.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">No cities found.</p>
              )}
              {cities.map((city) => (
                <div key={city} className="text-sm py-1 px-2 rounded hover:bg-accent/50">
                  {city}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Add section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Plus className="h-5 w-5" /> Add City
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Additions are kept in memory for this session. Ask a developer to update the static dataset for permanent changes.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-2">
              <Label>State</Label>
              <Popover open={addStateOpen} onOpenChange={setAddStateOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="w-[120px] justify-between font-normal">
                    {addState}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[160px] p-0">
                  <Command>
                    <CommandInput placeholder="Search…" />
                    <CommandList>
                      <CommandEmpty>Not found.</CommandEmpty>
                      <CommandGroup>
                        {US_STATES.map((s) => (
                          <CommandItem
                            key={s}
                            value={s}
                            onSelect={() => {
                              setAddState(s);
                              setAddStateOpen(false);
                            }}
                          >
                            <Check className={cn("mr-2 h-4 w-4", addState === s ? "opacity-100" : "opacity-0")} />
                            {s}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2 flex-1 min-w-[200px]">
              <Label>City Name</Label>
              <Input
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
                placeholder="e.g., Springfield"
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              />
            </div>

            <Button onClick={handleAdd} disabled={!newCity.trim()}>
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
