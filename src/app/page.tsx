
"use client";

import Link from "next/link";
import { Mountain, Cpu, BarChart, Settings, CheckCircle, ArrowRight, Download, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";

export default function LandingPage() {
    const scrollToFeatures = () => {
        const featuresSection = document.getElementById('features');
        if(featuresSection) {
            featuresSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <section className="relative w-full h-[80vh] md:h-[90vh] flex items-center justify-center text-center text-white overflow-hidden">
             <div className="absolute inset-0 z-0">
                <img
                    src="https://placehold.co/1920x1080.png"
                    alt="Satellite view of Earth"
                    data-ai-hint="satellite earth"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
             </div>

            <div className="container px-4 md:px-6 z-10">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-shadow-lg">
                    Turn Satellite Data into Actionable Insights
                  </h1>
                  <p className="max-w-[700px] mx-auto text-lg text-gray-200 md:text-xl">
                    Upload ground truth data, analyze environmental metrics, and visualize change — all in one powerful dashboard.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row justify-center">
                   <Button asChild size="lg" className="bg-primary/90 hover:bg-primary text-primary-foreground hover:scale-105 transition-transform duration-300 shadow-lg">
                    <Link href="/dashboard">Get Started <ArrowRight className="ml-2 h-5 w-5" /></Link>
                  </Button>
                  <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-black transition-colors" onClick={scrollToFeatures}>
                    Learn More
                  </Button>
                </div>
              </div>
            </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
                  Key Features
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Powerful Analysis at Your Fingertips
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  From vegetation health to urban expansion, get the data you
                  need to make informed decisions.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-4 mt-12">
              <div className="grid gap-2 text-center p-4 rounded-lg hover:bg-muted/50 transition-colors">
                <SlidersHorizontal className="h-10 w-10 text-primary mx-auto" />
                <h3 className="text-lg font-bold">Coordinate Input</h3>
                <p className="text-sm text-muted-foreground">
                    Enter lat/long to analyze any region on Earth.
                </p>
              </div>
              <div className="grid gap-2 text-center p-4 rounded-lg hover:bg-muted/50 transition-colors">
                <Cpu className="h-10 w-10 text-primary mx-auto" />
                <h3 className="text-lg font-bold">Metric Computation</h3>
                <p className="text-sm text-muted-foreground">
                  Calculate key spectral indices like NDVI, NDWI, and NDBI.
                </p>
              </div>
              <div className="grid gap-2 text-center p-4 rounded-lg hover:bg-muted/50 transition-colors">
                <BarChart className="h-10 w-10 text-primary mx-auto" />
                <h3 className="text-lg font-bold">Interactive Visuals</h3>
                <p className="text-sm text-muted-foreground">
                  Time-series charts and satellite vs. ground truth scatter plots.
                </p>
              </div>
               <div className="grid gap-2 text-center p-4 rounded-lg hover:bg-muted/50 transition-colors">
                <Download className="h-10 w-10 text-primary mx-auto" />
                <h3 className="text-lg font-bold">Export Easily</h3>
                <p className="text-sm text-muted-foreground">
                  Download your computed metrics in CSV format for research.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="value-prop" className="w-full py-12 md:py-24 lg:py-32 bg-muted/30">
            <div className="container px-4 md:px-6">
                 <div className="grid gap-10 lg:grid-cols-2 items-center">
                    <div>
                        <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm mb-2">Why Us?</div>
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">The Ultimate Environmental Data Platform</h2>
                        <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed mt-4">
                            We provide a seamless bridge between complex satellite imagery and clear, actionable environmental intelligence.
                        </p>
                        <ul className="mt-6 space-y-4">
                            <li className="flex items-start">
                                <CheckCircle className="h-6 w-6 mr-3 text-primary flex-shrink-0 mt-1" />
                                <span className="text-muted-foreground"><strong>Built on Google Earth Engine</strong> for robust, scalable analysis.</span>
                            </li>
                             <li className="flex items-start">
                                <CheckCircle className="h-6 w-6 mr-3 text-primary flex-shrink-0 mt-1" />
                                <span className="text-muted-foreground"><strong>Accurate, fast environmental insights</strong> to power your research.</span>
                            </li>
                             <li className="flex items-start">
                                <CheckCircle className="h-6 w-6 mr-3 text-primary flex-shrink-0 mt-1" />
                                <span className="text-muted-foreground"><strong>User-friendly and powerful visualization</strong> for intuitive data exploration.</span>
                            </li>
                             <li className="flex items-start">
                                <CheckCircle className="h-6 w-6 mr-3 text-primary flex-shrink-0 mt-1" />
                                <span className="text-muted-foreground"><strong>Export-ready for research</strong> and decision-making.</span>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <img 
                             src="https://placehold.co/600x400.png"
                            alt="Data Visualization"
                            data-ai-hint="data visualization chart"
                            className="mx-auto aspect-video overflow-hidden rounded-xl object-cover"
                        />
                    </div>
                 </div>
            </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">
          &copy; 2024 Earth Insights. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
            <Link href="#" className="text-xs hover:underline underline-offset-4 text-muted-foreground">About</Link>
            <Link href="#" className="text-xs hover:underline underline-offset-4 text-muted-foreground">Contact</Link>
        </nav>
      </footer>
    </div>
  );
}
