export interface DataPoint {
  date: string; // Should be a date string that can be parsed by new Date()
  value: number;
}

export interface GroundTruthDataPoint {
  date: string;
  value: number;
}

export interface MetricData {
  name: string;
  timeSeries: DataPoint[];
  firstValue: number | null;
  lastValue: number | null;
  percentageChange: number | null;
  n: number;
  insight?: string;
  groundTruth?: GroundTruthDataPoint[];
}

export interface SatellitePassData {
    passTime: string;
    satelliteName: string;
    status: string;
    speed: number;
}
