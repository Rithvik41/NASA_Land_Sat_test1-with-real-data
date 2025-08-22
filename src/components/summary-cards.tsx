"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, ArrowDown, TrendingUp, Droplets, Leaf, Home, Mountain } from "lucide-react";
import type { MetricData } from "@/lib/types";

const metricIcons: { [key: string]: React.ReactNode } = {
  NDVI: <Leaf className="h-4 w-4 text-muted-foreground" />,
  NDWI: <Droplets className="h-4 w-4 text-muted-foreground" />,
  NDBI: <Home className="h-4 w-4 text-muted-foreground" />,
  NBR: <TrendingUp className="h-4 w-4 text-muted-foreground" />,
  "default": <Mountain className="h-4 w-4 text-muted-foreground" />,
};

function getMetricCardData(metrics: MetricData[]) {
    const ndvi = metrics.find(m => m.name === 'NDVI');
    const ndwi = metrics.find(m => m.name === 'NDWI');
    const ndbi = metrics.find(m => m.name === 'NDBI');
    const nbr = metrics.find(m => m.name === 'NBR');
    return [
        { title: 'Vegetation Index (NDVI)', metric: ndvi },
        { title: 'Water Index (NDWI)', metric: ndwi },
        { title: 'Built-up Index (NDBI)', metric: ndbi },
        { title: 'Burn Ratio (NBR)', metric: nbr },
    ];
}


export function SummaryCards({ metrics }: { metrics: MetricData[] }) {
  const cardData = getMetricCardData(metrics);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cardData.map(({ title, metric }) => (
        <Card key={title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {metricIcons[metric?.name || 'default']}
          </CardHeader>
          <CardContent>
            {metric ? (
              <>
                <div className="text-2xl font-bold">{metric.lastValue?.toFixed(4) || "N/A"}</div>
                <p className="text-xs text-muted-foreground flex items-center">
                  {metric.percentageChange !== null ? (
                    <>
                      {metric.percentageChange >= 0 ? (
                        <ArrowUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <ArrowDown className="h-4 w-4 text-red-500" />
                      )}
                      <span className={metric.percentageChange >= 0 ? "text-green-500" : "text-red-500"}>
                        {metric.percentageChange.toFixed(2)}%
                      </span>
                      &nbsp;from start
                    </>
                  ) : "No change data"}
                </p>
              </>
            ) : (
                <div className="text-2xl font-bold">N/A</div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
