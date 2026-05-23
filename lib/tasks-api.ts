import axios from 'axios';
import { getApiBaseUrl } from '@/lib/auth';
import { Activity, ActivityStatus } from '@/lib/types';

export type TaskStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export interface LearnerTaskRecord {
  id: string;
  learnerId: string;
  taskName: string;
  flag: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}

interface LearnerTasksResponse {
  tasks: LearnerTaskRecord[];
}

interface TaskFlagResponse {
  success: boolean;
  flag: string;
}

export interface VerifyTaskPayload {
  userId: string;
  taskName: string;
  flag: string;
  points: number;
}

export interface VerifyTaskResponse {
  verified: boolean;
  status: string;
  userPoints: number;
}

export type TaskApiErrorCode = 'TASK_NETWORK_ERROR' | 'TASK_REQUEST_FAILED';

function assertObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object';
}

function normalizeTaskName(taskName: string): string {
  return taskName.trim().toLowerCase();
}

export function mapTaskStatusToActivityStatus(taskStatus: TaskStatus): ActivityStatus {
  if (taskStatus === 'COMPLETED') {
    return 'completed';
  }

  if (taskStatus === 'IN_PROGRESS') {
    return 'in_progress';
  }

  return 'open';
}

export function mergeActivitiesWithTaskRecords(
  activities: Activity[],
  taskRecords: LearnerTaskRecord[]
): Activity[] {
  const byTaskName = new Map<string, LearnerTaskRecord>();

  for (const taskRecord of taskRecords) {
    byTaskName.set(normalizeTaskName(taskRecord.taskName), taskRecord);
  }

  return activities.map((activity) => {
    const matchingTask = byTaskName.get(normalizeTaskName(activity.name));

    if (!matchingTask) {
      if (activity.status === 'open' && !activity.completedAt) {
        return activity;
      }

      return {
        ...activity,
        status: 'open',
        completedAt: undefined
      };
    }

    const mappedStatus = mapTaskStatusToActivityStatus(matchingTask.status);

    return {
      ...activity,
      status: mappedStatus,
      completedAt: mappedStatus === 'completed' ? matchingTask.updatedAt : undefined,
      flag: matchingTask.flag || activity.flag
    };
  });
}

export async function getLearnerTasks(userId: string): Promise<LearnerTaskRecord[]> {
  try {
    const response = await axios.get<LearnerTasksResponse>(
      `${getApiBaseUrl()}/tasks/users/${encodeURIComponent(userId)}`,
      {
        headers: {
          accept: 'application/json'
        },
        timeout: 15000
      }
    );

    const data = response.data;

    if (!assertObject(data) || !Array.isArray(data.tasks)) {
      throw new Error('TASK_REQUEST_FAILED');
    }

    return data.tasks.filter(
      (task): task is LearnerTaskRecord =>
        assertObject(task) &&
        typeof task.id === 'string' &&
        typeof task.learnerId === 'string' &&
        typeof task.taskName === 'string' &&
        typeof task.flag === 'string' &&
        typeof task.status === 'string' &&
        (task.status === 'NOT_STARTED' || task.status === 'IN_PROGRESS' || task.status === 'COMPLETED') &&
        typeof task.createdAt === 'string' &&
        typeof task.updatedAt === 'string'
    );
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (!error.response) {
        throw new Error('TASK_NETWORK_ERROR');
      }

      throw new Error('TASK_REQUEST_FAILED');
    }

    if (error instanceof Error && error.message === 'TASK_REQUEST_FAILED') {
      throw error;
    }

    throw new Error('TASK_REQUEST_FAILED');
  }
}

export async function getTaskFlag(userId: string, taskName: string): Promise<string> {
  try {
    const response = await axios.get<TaskFlagResponse>(`${getApiBaseUrl()}/tasks/flag`, {
      params: {
        userId,
        taskName
      },
      headers: {
        accept: 'application/json'
      },
      timeout: 15000
    });

    const data = response.data;

    if (!assertObject(data) || data.success !== true || typeof data.flag !== 'string' || !data.flag.trim()) {
      throw new Error('TASK_REQUEST_FAILED');
    }

    return data.flag;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (!error.response) {
        throw new Error('TASK_NETWORK_ERROR');
      }

      throw new Error('TASK_REQUEST_FAILED');
    }

    if (error instanceof Error && error.message === 'TASK_REQUEST_FAILED') {
      throw error;
    }

    throw new Error('TASK_REQUEST_FAILED');
  }
}

export async function verifyTask(payload: VerifyTaskPayload): Promise<VerifyTaskResponse> {
  try {
    const response = await axios.post<VerifyTaskResponse>(`${getApiBaseUrl()}/tasks/verify`, payload, {
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });

    const data = response.data;

    if (
      !assertObject(data) ||
      typeof data.verified !== 'boolean' ||
      typeof data.status !== 'string' ||
      typeof data.userPoints !== 'number'
    ) {
      throw new Error('TASK_REQUEST_FAILED');
    }

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (!error.response) {
        throw new Error('TASK_NETWORK_ERROR');
      }

      throw new Error('TASK_REQUEST_FAILED');
    }

    if (error instanceof Error && error.message === 'TASK_REQUEST_FAILED') {
      throw error;
    }

    throw new Error('TASK_REQUEST_FAILED');
  }
}
