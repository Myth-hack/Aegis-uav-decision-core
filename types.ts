
export enum FlightMode {
  MANUAL = 'MANUAL',
  ASSISTED = 'ASSISTED',
  AUTONOMOUS = 'AUTONOMOUS',
  RETURN_TO_HOME = 'RTL',
  EMERGENCY_LANDING = 'LAND',
  WATER_LANDING = 'WATER_MODE',
  AUTO_FOLLOW = 'AUTO_FOLLOW'
}

export enum MissionType {
  SURVEILLANCE = 'SURVEILLANCE',
  DISASTER_MONITOR = 'DISASTER',
  SEARCH_RESCUE = 'RESCUE',
  NAVAL_OBSERVATION = 'NAVAL',
  INFRASTRUCTURE = 'INSPECTION'
}

export enum TrackingStatus {
  LOCKED = 'LOCKED',
  LOST = 'LOST',
  OCCLUDED = 'OCCLUDED',
  SCANNING = 'SCANNING'
}

export interface Telemetry {
  altitude: number;
  speed: number;
  battery: number;
  gpsSignal: number;
  windSpeed: number;
  pitch: number;
  roll: number;
  yaw: number;
  heading: number;
  connectionStrength: number;
  isWaterproofMode: boolean;
}

export interface TrackingDecision {
  target_id: string;
  lock_confidence: number;
  risk_level: 'Low' | 'Medium' | 'High';
  suggested_action: string;
  reason: string;
  status: TrackingStatus;
}

export interface DecisionMessage {
  id: string;
  timestamp: string;
  type: 'AI' | 'SYSTEM' | 'OPERATOR';
  content: string;
  trackingData?: TrackingDecision;
}
