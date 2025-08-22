
"use client";

import Link from "next/link";
import { Mountain, Cpu, BarChart, Settings, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/header";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-background">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Unlock Environmental Insights with Satellite Data
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Our platform provides powerful tools to analyze satellite
                    imagery, compute key environmental metrics, and visualize
                    changes over time.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/dashboard">Get Started</Link>
                  </Button>
                </div>
              </div>
              <img
                src="https://placehold.co/600x400.png"
                alt="Hero"
                data-ai-hint="satellite earth"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
              />
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
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
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 mt-12">
              <div className="grid gap-1">
                <Cpu className="h-8 w-8 text-primary" />
                <h3 className="text-lg font-bold">Metric Computation</h3>
                <p className="text-sm text-muted-foreground">
                  Calculate key spectral indices like NDVI, NDWI, and NDBI to
                  understand land cover dynamics.
                </p>
              </div>
              <div className="grid gap-1">
                <BarChart className="h-8 w-8 text-primary" />
                <h3 className="text-lg font-bold">Data Visualization</h3>
                <p className="text-sm text-muted-foreground">
                  Visualize trends with interactive time-series plots and
                  compare satellite data with ground truth.
                </p>
              </div>
              <div className="grid gap-1">
                <CheckCircle className="h-8 w-8 text-primary" />
                <h3 className="text-lg font-bold">High Accuracy</h3>
                <p className="text-sm text-muted-foreground">
                  Leverage advanced algorithms and high-quality satellite
                  imagery for reliable and accurate results.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">
          &copy; 2024 Earth Insights. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
