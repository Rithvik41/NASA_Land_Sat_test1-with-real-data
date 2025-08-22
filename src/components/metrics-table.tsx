
"use client";

import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  ArrowUpDown,
  FileText,
  Download,
  Wand2,
  Loader2,
  BarChart2,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { generateInsightAction, generateReportAction } from "@/lib/actions";
import { generateCsv, downloadFile } from "@/lib/csv";
import type { MetricData } from '@/lib/types';

type SortKey = keyof MetricData | '';
type SortDirection = 'asc' | 'desc';

interface MetricsTableProps {
  metrics: MetricData[];
  onMetricsUpdate: (metrics: MetricData[]) => void;
  location: string;
  dateRange: string;
  onViewVisualizations: () => void;
}

export function MetricsTable({ metrics, onMetricsUpdate, location, dateRange, onViewVisualizations }: MetricsTableProps) {
  const { toast } = useToast();
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [insightLoading, setInsightLoading] = useState<string | null>(null);
  const [reportLoading, setReportLoading] = useState(false);

  const sortedMetrics = useMemo(() => {
    if (!sortKey) return metrics;
    return [...metrics].sort((a, b) => {
      const aVal = a[sortKey as keyof MetricData];
      const bVal = b[sortKey as keyof MetricData];
      
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [metrics, sortKey, sortDirection]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const getInsight = async (metricName: string) => {
    setInsightLoading(metricName);
    const metric = metrics.find(m => m.name === metricName);
    if (metric) {
      const result = await generateInsightAction(metric);
      if (result.error) {
        toast({ title: "AI Error", description: result.error, variant: "destructive" });
      } else if (result.data) {
        onMetricsUpdate(metrics.map(m => m.name === metricName ? { ...m, insight: result.data } : m));
      }
    }
    setInsightLoading(null);
  };
  
  const handleExportCsv = () => {
    const csvData = generateCsv(metrics);
    downloadFile(csvData, 'earth-insights-metrics.csv', 'text/csv');
    toast({ title: 'Success', description: 'Metrics exported to CSV.' });
  }

  const handleExportReport = async () => {
    setReportLoading(true);
    const result = await generateReportAction(metrics, location, dateRange);
    setReportLoading(false);
    if (result.error) {
      toast({ title: 'Report Generation Error', description: result.error, variant: 'destructive' });
    } else if (result.data) {
      downloadFile(result.data, 'summary-report.txt', 'text/plain');
      toast({ title: 'Success', description: 'Summary report generated and downloaded.' });
    }
  };

  const renderSortIcon = (key: SortKey) => {
    if (sortKey !== key) return <ArrowUpDown className="ml-2 h-4 w-4" />;
    return sortDirection === 'asc' ? '▲' : '▼';
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Computed Metrics</CardTitle>
            <CardDescription>Detailed metrics including spectral indices, land cover statistics, and change detection.</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onViewVisualizations}><BarChart2 className="mr-2 h-4 w-4" /> View Plots</Button>
            <Button variant="outline" onClick={handleExportCsv}><Download className="mr-2 h-4 w-4" /> Export CSV</Button>
            <Button variant="outline" onClick={handleExportReport} disabled={reportLoading}>
              {reportLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
              Summary Report
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => handleSort('name')} className="cursor-pointer">Metric {renderSortIcon('name')}</TableHead>
              <TableHead onClick={() => handleSort('firstValue')} className="cursor-pointer text-right">First Value {renderSortIcon('firstValue')}</TableHead>
              <TableHead onClick={() => handleSort('lastValue')} className="cursor-pointer text-right">Last Value {renderSortIcon('lastValue')}</TableHead>
              <TableHead onClick={() => handleSort('percentageChange')} className="cursor-pointer text-right">Change (%) {renderSortIcon('percentageChange')}</TableHead>
              <TableHead onClick={() => handleSort('n')} className="cursor-pointer text-right">Points (n) {renderSortIcon('n')}</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedMetrics.map((metric) => (
              <TableRow key={metric.name}>
                <TableCell className="font-medium">{metric.name}</TableCell>
                <TableCell className="text-right">{metric.firstValue?.toFixed(4) ?? 'N/A'}</TableCell>
                <TableCell className="text-right">{metric.lastValue?.toFixed(4) ?? 'N/A'}</TableCell>
                <TableCell className={`text-right ${metric.percentageChange === null ? '' : metric.percentageChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {metric.percentageChange?.toFixed(2) ?? 'N/A'}
                </TableCell>
                <TableCell className="text-right">{metric.n}</TableCell>
                <TableCell className="text-center">
                  <TooltipProvider>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => !metric.insight && getInsight(metric.name)}>
                          {insightLoading === metric.name ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        {insightLoading === metric.name ? (
                          <div className="flex items-center justify-center p-4">
                            <Loader2 className="h-6 w-6 animate-spin" />
                          </div>
                        ) : (
                          <div className="grid gap-4">
                            <div className="space-y-2">
                              <h4 className="font-medium leading-none">AI Insight</h4>
                              <p className="text-sm text-muted-foreground">{metric.insight || "Click to generate an insight."}</p>
                            </div>
                          </div>
                        )}
                      </PopoverContent>
                    </Popover>
                  </TooltipProvider>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
