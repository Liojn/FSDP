export interface StrategicGoal {
  id: string;
  title: string;
  description: string;
  department: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'At Risk';
  progress: number;
  targetDate: string;
  metrics: string[];
  dependencies?: string[];
}

export interface StrategicMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'completed' | 'at-risk';
  progress: number;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  assumptions: string[];
  projectedOutcomes: {
    metric: string;
    value: number;
    confidence: number;
  }[];
  recommendations: string[];
}

export interface ProgressData {
  milestones: Milestone[];
  metrics: StrategicMetric[];
  lastUpdated: string;
}

export interface StrategicInsight {
  id: string;
  type: 'recommendation' | 'alert' | 'trend';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: string;
  timestamp: string;
  relatedMetrics: string[];
}

export interface ScenarioAnalysis {
  feasibility: number;
  risks: string[];
  recommendations: string[];
}

export interface MetricTrend {
  metric: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  data: { timestamp: string; value: number }[];
}

export interface RecommendationResult {
  recommendations: string[];
  priority: 'high' | 'medium' | 'low';
  expectedImpact: number;
}

export interface RoadmapData {
  milestones: Milestone[];
  dependencies: { from: string; to: string }[];
  criticalPath: string[];
}

export interface DepartmentBenchmark {
  metrics: StrategicMetric[];
  industryAverage: number;
  topPerformer: number;
  recommendations: string[];
}
