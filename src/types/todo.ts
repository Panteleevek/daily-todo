export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';
export type RepeatType = 'daily' | 'weekly' | 'specific_days';

export interface TodoTemplate {
  id: string;
  title: string;
  time?: string;
  repeatType: RepeatType;
  repeatDays?: string[];
  always: boolean;
  count: string;
  createdAt: string;
  updatedAt?: string;
  completed?: boolean;
  completedDates: string[];
}

export interface EditTodoFormData {
  id?: string;
  title: string;
  time?: string;
  period?: string | string[];
  always: boolean;
  count: string;
}
export interface TodoInstance {
  id: string;
  templateId: string;
  date: string;
  completed: boolean;
  completedAt?: string;
  title: string;
  time?: string;
  count?: string;
  completedCount?: string;
}

export interface TodoState {
  templates: TodoTemplate[];
  instances: TodoInstance[];
  currentDateInstances?: string;
  selectedDate: string;
  modalType?: 'create' | 'edit';
  loading: boolean;
  error?: string;
  currentInstance?: TodoInstance;
  emptyList: boolean
  isToday: boolean
}

export interface TodoFormData {
  title: string;
  time?: string;
  period?: string | string[];
  always: boolean;
  count: string;
}
