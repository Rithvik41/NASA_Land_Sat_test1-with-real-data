import type { MetricData, GroundTruthDataPoint } from "@/lib/types";

export function parseCsv(csvText: string): GroundTruthDataPoint[] | { error: string } {
  try {
    const rows = csvText.trim().split(/\r?\n/);
    const header = rows.shift()?.toLowerCase().split(',') || [];
    const dateIndex = header.indexOf('date');
    const valueIndex = header.indexOf('value');

    if (dateIndex === -1 || valueIndex === -1) {
      return { error: "CSV must contain 'date' and 'value' columns." };
    }

    return rows.map(row => {
      const columns = row.split(',');
      return {
        date: columns[dateIndex],
        value: parseFloat(columns[valueIndex]),
      };
    }).filter(p => !isNaN(p.value) && p.date);
  } catch (e) {
    return { error: "Failed to parse CSV file. Please check the format." };
  }
}

export function generateCsv(data: MetricData[]): string {
  if (!data.length) return "";

  const headers = "Metric,First Value,Last Value,Change (%),Valid Points (n)";
  const rows = data.map(metric => 
    [
      metric.name,
      metric.firstValue?.toFixed(4) ?? 'N/A',
      metric.lastValue?.toFixed(4) ?? 'N/A',
      metric.percentageChange?.toFixed(2) ?? 'N/A',
      metric.n
    ].join(',')
  );

  return [headers, ...rows].join('\n');
}

export function downloadFile(content: string, fileName: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
