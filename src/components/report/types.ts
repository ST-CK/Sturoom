export type Band = { label: string; level: string; value: number };
export type HeatDot = { date: Date; value: number; visited: boolean };

export type PresenceMetrics = {
  todayMin: number;
  avg7Min: number;
  weekMin: number;
  trend: number[];
};

export type StudyMetrics = {
  totalH: number;
  totalM: number;
  avgPerSessionMin: number;
  sessions: number;
  trend: number[];
};

export type VolumeMetrics = {
  problems: number;
  videosMin: number;
  weekDiffProblems: number;
  weekDiffVideos: number;
};

export type AccuracyMetrics = { rate: number; diff: number };

export type Metrics = {
  presence: PresenceMetrics;
  study: StudyMetrics;
  volume: VolumeMetrics;
  accuracy: AccuracyMetrics;
};
