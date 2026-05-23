export type ActivityStatus = 'completed' | 'in_progress' | 'open' | 'locked' | 'scheduled';
export type ActivityType = 'puzzle' | 'linux' | 'game' | 'decode' | 'web' | 'boss' | 'knowledge';

export interface Activity {
  id: string;
  challengeNum: string;
  week: 1 | 2 | 3 | 4;
  name: string;
  shortDescription: string;
  fullDescription: string;
  type: ActivityType;
  status: ActivityStatus;
  points: number;
  isBoss: boolean;
  scheduledOpenAt?: string;
  completedAt?: string;
  flag: string;
  hints: string[];
}

export interface NextClass {
  title: string;
  datetime: string;
  zoomUrl: string;
}

export interface ClassRecording {
  id: string;
  title: string;
  description: string;
  recordedAt: string;
  durationLabel: string;
  videoUrl: string;
}

export interface MockData {
  operativeName: string;
  accessCode: string;
  nextClass: NextClass;
  pastRecordings: ClassRecording[];
  activities: Activity[];
}
