
export interface DetectedComponent {
  label: string;
  type: string;
  part_number: string;
  center: [number, number];
  datasheet_url?: string;
  pinout?: string;
  description?: string;
}

export interface Fault {
  id: string;
  severity: 'critical' | 'warning';
  message: string;
  fix: string;
  marker_coordinates: { x: number; y: number };
  ar_element: 'arrow' | 'pulse' | 'label';
}

export interface ArSceneConfig {
  anchor_points: [number, number][];
  overlay_svg?: string;
}

export interface CircuitAnalysisResult {
  analysis_summary: string;
  health_score: number;
  detected_components: DetectedComponent[];
  faults: Fault[];
  ar_scene_config: ArSceneConfig;
}

export interface AppState {
  isLoggedIn: boolean;
  image: string | null;
  schematic: string;
  isAnalyzing: boolean;
  result: CircuitAnalysisResult | null;
  error: string | null;
}
