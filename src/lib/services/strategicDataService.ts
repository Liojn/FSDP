import { api } from '../api';
import type { 
  StrategicMetric, 
  Milestone, 
  Scenario, 
  ProgressData, 
  StrategicInsight,
  StrategicGoal,
  ScenarioAnalysis,
  MetricTrend,
  RecommendationResult,
  RoadmapData,
  DepartmentBenchmark
} from '@/types/strategic';

class StrategicDataService {
  private static instance: StrategicDataService;

  private constructor() {}

  public static getInstance(): StrategicDataService {
    if (!StrategicDataService.instance) {
      StrategicDataService.instance = new StrategicDataService();
    }
    return StrategicDataService.instance;
  }

  // Progress Tracking
  async getProgress(): Promise<ProgressData> {
    const response = await api.get<ProgressData>('/api/strategic/progress');
    return response.data;
  }

  async updateMilestone(milestoneId: string, update: Partial<Milestone>): Promise<Milestone> {
    const response = await api.patch<Partial<Milestone>, Milestone>(`/api/strategic/milestones/${milestoneId}`, update);
    return response.data;
  }

  // Scenario Planning
  async createScenario(scenario: Omit<Scenario, 'id'>): Promise<Scenario> {
    const response = await api.post<Omit<Scenario, 'id'>, Scenario>('/api/strategic/scenarios', scenario);
    return response.data;
  }

  async getScenarios(): Promise<Scenario[]> {
    const response = await api.get<Scenario[]>('/api/strategic/scenarios');
    return response.data;
  }

  async analyzeScenario(scenarioId: string): Promise<ScenarioAnalysis> {
    const response = await api.post<void, ScenarioAnalysis>(`/api/strategic/scenarios/${scenarioId}/analyze`);
    return response.data;
  }

  // Real-time Insights
  async getStrategicInsights(): Promise<StrategicInsight[]> {
    const response = await api.get<StrategicInsight[]>('/api/strategic/insights');
    return response.data;
  }

  async getMetricTrends(metricIds: string[]): Promise<MetricTrend[]> {
    const response = await api.post<{ metricIds: string[] }, MetricTrend[]>('/api/strategic/metrics/trends', { metricIds });
    return response.data;
  }

  // Automated Recommendations
  async generateRecommendations(context: {
    metrics: StrategicMetric[];
    goals: StrategicGoal[];
    department?: string;
  }): Promise<RecommendationResult[]> {
    const response = await api.post<typeof context, RecommendationResult[]>('/api/strategic/recommendations', context);
    return response.data;
  }

  // Roadmap Visualization
  async getRoadmapData(): Promise<RoadmapData> {
    const response = await api.get<RoadmapData>('/api/strategic/roadmap');
    return response.data;
  }

  // Department Benchmarks
  async getDepartmentBenchmarks(department: string): Promise<DepartmentBenchmark> {
    const response = await api.get<DepartmentBenchmark>(`/api/strategic/benchmarks/${department}`);
    return response.data;
  }
}

export const strategicDataService = StrategicDataService.getInstance();
