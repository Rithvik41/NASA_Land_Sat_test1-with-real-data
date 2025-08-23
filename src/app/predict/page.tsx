
"use client";

import React, { useState } from "react";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wand2, Loader2, Thermometer, Tractor, Droplets } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { suggestCoordinatesAction, getWeatherReportAction, planCropsAction, scheduleIrrigationAction } from "@/lib/actions";
import type { WeatherData, CropPlan, IrrigationSchedule } from "@/lib/types";
import { WeatherReport } from "@/components/weather-report";
import { Skeleton } from "@/components/ui/skeleton";

type PredictionType = 'weather' | 'crops' | 'irrigation';

export default function PredictPage() {
    const { toast } = useToast();
    const [lat, setLat] = useState("40.7128");
    const [lon, setLon] = useState("-74.0060");
    const [locationDesc, setLocationDesc] = useState("New York City");
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [isLoading, setIsLoading] = useState<PredictionType | null>(null);

    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [cropPlan, setCropPlan] = useState<CropPlan | null>(null);
    const [irrigationSchedule, setIrrigationSchedule] = useState<IrrigationSchedule | null>(null);

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

    const handlePrediction = async (type: PredictionType) => {
        if (!lat || !lon) {
            toast({ title: "Error", description: "Please provide valid coordinates.", variant: "destructive" });
            return;
        }
        setIsLoading(type);
        setWeather(null);
        setCropPlan(null);
        setIrrigationSchedule(null);

        const coords = { latitude: parseFloat(lat), longitude: parseFloat(lon) };
        
        let result;
        try {
            if (type === 'weather') {
                result = await getWeatherReportAction(coords);
                if (result.data) setWeather(result.data);
            } else if (type === 'crops') {
                result = await planCropsAction(coords);
                if (result.data) setCropPlan(result.data);
            } else if (type === 'irrigation') {
                result = await scheduleIrrigationAction(coords);
                 if (result.data) setIrrigationSchedule(result.data);
            }

            if (result?.error) {
                toast({ title: "Prediction Error", description: result.error, variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
        }

        setIsLoading(null);
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 p-4 md:p-6">
                <div className="container mx-auto space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Predictive Insights</CardTitle>
                            <CardDescription>
                                Get AI-powered predictions for your location. Start by entering a location description or coordinates.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="location-desc">Location Description</Label>
                                <div className="flex gap-2">
                                <Input
                                    id="location-desc"
                                    placeholder="e.g., Nile River Delta"
                                    value={locationDesc}
                                    onChange={(e) => setLocationDesc(e.target.value)}
                                    disabled={isSuggesting}
                                />
                                <Button onClick={handleSuggestCoordinates} disabled={isSuggesting || !locationDesc} size="icon">
                                    {isSuggesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                                    <span className="sr-only">Suggest Coordinates</span>
                                </Button>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="latitude">Latitude</Label>
                                    <Input id="latitude" placeholder="e.g., 30.83" value={lat} onChange={(e) => setLat(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="longitude">Longitude</Label>
                                    <Input id="longitude" placeholder="e.g., 31.07" value={lon} onChange={(e) => setLon(e.target.value)} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Thermometer/> Weather Forecast</CardTitle>
                                <CardDescription>Get the current weather report for your location.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button onClick={() => handlePrediction('weather')} disabled={!!isLoading}>
                                    {isLoading === 'weather' ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                                    Predict Weather
                                </Button>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Tractor/> Crop Planning</CardTitle>
                                <CardDescription>Receive recommendations on suitable crops and planting schedules.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button onClick={() => handlePrediction('crops')} disabled={!!isLoading}>
                                     {isLoading === 'crops' ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                                    Plan Crops
                                </Button>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Droplets/> Irrigation Schedule</CardTitle>
                                <CardDescription>Get AI-based advice on when and how much to water your fields.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button onClick={() => handlePrediction('irrigation')} disabled={!!isLoading}>
                                    {isLoading === 'irrigation' ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                                    Schedule Irrigation
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {isLoading && !weather && !cropPlan && !irrigationSchedule && (
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex justify-center items-center h-48">
                                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {weather && (
                        <WeatherReport weather={weather} />
                    )}

                    {cropPlan && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Crop Plan Recommendation</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="font-semibold">Planting Window</h4>
                                    <p className="text-muted-foreground">{cropPlan.plantingWindow.start} to {cropPlan.plantingWindow.end}</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold">Suitable Crops</h4>
                                    <ul className="list-disc pl-5 mt-2 space-y-2">
                                        {cropPlan.suitableCrops.map(crop => (
                                            <li key={crop.name}>
                                                <strong>{crop.name}:</strong> {crop.reason}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                 <div>
                                    <h4 className="font-semibold">Cooperative Farming Suggestion</h4>
                                    <p className="text-muted-foreground">{cropPlan.cooperativeFarmingSuggestion}</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {irrigationSchedule && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Irrigation Schedule Recommendation</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="font-semibold">Recommendation</h4>
                                    <p className="text-2xl font-bold text-primary">{irrigationSchedule.recommendation}</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold">Next Recommended Irrigation</h4>
                                    <p className="text-muted-foreground">{new Date(irrigationSchedule.nextIrrigationDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                </div>
                                 <div>
                                    <h4 className="font-semibold">Watering Depth</h4>
                                    <p className="text-muted-foreground">{irrigationSchedule.wateringDepthInches} inches</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold">Notes</h4>
                                    <p className="text-muted-foreground">{irrigationSchedule.notes}</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                </div>
            </main>
        </div>
    );
}
