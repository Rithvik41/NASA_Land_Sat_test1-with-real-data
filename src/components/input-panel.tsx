"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar as CalendarIcon, Upload, Wand2, Cpu, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { parseCsv } from "@/lib/csv";
import { suggestCoordinatesAction } from "@/lib/actions";
import type { GroundTruthDataPoint } from "@/lib/types";

interface InputPanelProps {
  lat: string;
  setLat: (val: string) => void;
  lon: string;
  setLon: (val: string) => void;
  locationDesc: string;
  setLocationDesc: (val: string) => void;
  dateRange?: DateRange;
  setDateRange: (range?: DateRange) => void;
  onCompute: () => void;
  isComputing: boolean;
  onFileUpload: (data: GroundTruthDataPoint[] | null) => void;
}

export function InputPanel({
  lat, setLat, lon, setLon, locationDesc, setLocationDesc,
  dateRange, setDateRange, onCompute, isComputing, onFileUpload
}: InputPanelProps) {
  const { toast } = useToast();
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [fileName, setFileName] =useState<string>("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const parsedData = parseCsv(text);
        if ('error' in parsedData) {
          toast({ title: "CSV Parsing Error", description: parsedData.error, variant: "destructive" });
          onFileUpload(null);
        } else {
          toast({ title: "Success", description: `${parsedData.length} ground truth points loaded.` });
          onFileUpload(parsedData);
        }
      };
      reader.readAsText(file);
    } else {
        setFileName("");
        onFileUpload(null);
    }
  };

  const handleSuggestCoordinates = async () => {
    if (!locationDesc) {
      toast({ title: "Error", description: "Please enter a location description.", variant: "destructive" });
      return;
    }
    setIsSuggesting(true);
    const result = await suggestCoordinatesAction(locationDesc);
    if (result.error) {
      toast({ title: "AI Error", description: result.error, variant: "destructive" });
    } else if (result.data) {
      setLat(result.data.latitude.toFixed(4));
      setLon(result.data.longitude.toFixed(4));
      toast({ title: "Coordinates Suggested", description: `Confidence: ${(result.data.confidence * 100).toFixed(0)}%` });
    }
    setIsSuggesting(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Input</CardTitle>
        <CardDescription>
          Specify coordinates, date range, and optional ground truth data.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="space-y-2 lg:col-span-2">
            <Label htmlFor="location-desc">Location Description (for AI suggestions)</Label>
            <div className="flex gap-2">
              <Input
                id="location-desc"
                placeholder="e.g., Amazon Rainforest"
                value={locationDesc}
                onChange={(e) => setLocationDesc(e.target.value)}
                disabled={isSuggesting}
              />
              <Button onClick={handleSuggestCoordinates} disabled={isSuggesting || !locationDesc}>
                {isSuggesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                <span className="sr-only">Suggest Coordinates</span>
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="latitude">Latitude</Label>
            <Input id="latitude" placeholder="e.g., 40.7128" value={lat} onChange={(e) => setLat(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="longitude">Longitude</Label>
            <Input id="longitude" placeholder="e.g., -74.0060" value={lon} onChange={(e) => setLon(e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="space-y-2">
            <Label>Date range</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label htmlFor="csv-upload">Ground Truth (CSV)</Label>
            <Button asChild variant="outline" className="w-full justify-start text-left font-normal">
                <Label htmlFor="csv-upload" className="w-full cursor-pointer">
                    <Upload className="mr-2 h-4 w-4" />
                    <span className="truncate">{fileName || "Upload file"}</span>
                </Label>
            </Button>
            <Input id="csv-upload" type="file" accept=".csv" className="sr-only" onChange={handleFileChange} />
          </div>
          <div className="lg:col-start-4">
            <Button onClick={onCompute} disabled={isComputing} className="w-full">
              {isComputing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Cpu className="mr-2 h-4 w-4" />
              )}
              Compute Metrics
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
