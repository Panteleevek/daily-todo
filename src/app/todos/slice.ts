import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AppThunk } from '../hooks';
import type { TodoTemplate, TodoInstance, TodoState, TodoFormData } from '../../types/todo';
import { indexedDBService } from './indexedDB';
import { compareDay, getToday } from '../../utils/dateUtils';

const initialState: TodoState = {
  templates: [],
  instances: [],
  selectedDate: getToday(),
  loading: false,
  currentInstance: null,
};

export const todosSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    setTemplates: (state, action: PayloadAction<TodoTemplate[]>) => {
      state.templates = action.payload;
    },
    addTemplate: (state, action: PayloadAction<TodoTemplate>) => {
      state.templates.push(action.payload);
    },
    updateTemplate: (state, action: PayloadAction<TodoTemplate>) => {
      const index = state.templates.findIndex(t => t.id === action.payload.id);
      if (index !== -1) state.templates[index] = action.payload;
    },
    removeTemplate: (state, action: PayloadAction<string>) => {
      state.templates = state.templates.filter(t => t.id !== action.payload);
    },

    setInstances: (state, action: PayloadAction<TodoInstance[]>) => {
      state.instances = action.payload;
    },
    setCurrentInstance: (state, action: PayloadAction<TodoInstance>) => {
      state.currentInstance = action.payload;
    },
    updateInstance: (state, action: PayloadAction<TodoInstance>) => {
      const index = state.instances.findIndex(i => i.id === action.payload.id);
      if (index !== -1) {
        // Полная замена элемента
        state.instances = [
          ...state.instances.slice(0, index),
          action.payload,
          ...state.instances.slice(index + 1),
        ];
      } else {
        // Если не нашли - добавляем (на всякий случай)
        state.instances.push(action.payload);
      }
    },
    setSelectedDate: (state, action: PayloadAction<string>) => {
      state.selectedDate = action.payload;
    },
    setModal: (state, action: PayloadAction<'create' | 'edit' | undefined>) => {
      state.modalType = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | undefined>) => {
      state.error = action.payload;
    },
    clearError: state => {
      state.error = undefined;
    },
  },
});

// Thunks
export const loadTodosForDate =
  (date: string, showAll?: boolean): AppThunk =>
  async dispatch => {
    dispatch(todosSlice.actions.setLoading(true));
    dispatch(todosSlice.actions.setError(undefined));
    try {
      const templates = await indexedDBService.getAllTemplates();
      dispatch(todosSlice.actions.setTemplates(templates));
      const existingInstances = await indexedDBService.getInstancesForDate(date);
      // Генерируем экземпляры для даты
      const dateObj = new Date(date);
      const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      const instancesForDate = templates
        .filter(template => {
          if (!showAll) {
            switch (template.repeatType) {
              case 'daily':
                return true;
              case 'weekly':
              case 'specific_days':
                return template.repeatDays?.includes(dayOfWeek as any);
              default:
                return false;
            }
          }
          return true;
        })
        .filter(template => compareDay(template.createdAt, date))
        // .sort((a,b) => a.complated)
        .map(template => {
          const existing = existingInstances.find(i => i.templateId === template.id);

          if (existing) {
            return { ...existing, period: template.repeatDays };
          }
          return {
            id: `${template.id}_${date}`,
            templateId: template.id,
            date,
            completed: false,
            title: template.title,
            time: template.time,
            count: template.count || '1',
            completedCount: '0',
          };
        });
      // Сохраняем новые экземпляры
      const savePromises = instancesForDate
        .filter(instance => !existingInstances.find(i => i.templateId === instance.templateId))
        .map(instance => indexedDBService.saveInstance(instance));

      await Promise.all(savePromises);

      dispatch(todosSlice.actions.setInstances(instancesForDate));
      dispatch(todosSlice.actions.setSelectedDate(date));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load todos';
      dispatch(todosSlice.actions.setError(message));
    } finally {
      dispatch(todosSlice.actions.setLoading(false));
    }
  };

export const createTemplate =
  (
    formData: Omit<TodoFormData, 'period'> & {
      repeatType: 'daily' | 'weekly' | 'specific_days';
      repeatDays?: string[];
    }
  ): AppThunk =>
  async (dispatch, getState) => {
    dispatch(todosSlice.actions.setLoading(true));
    dispatch(todosSlice.actions.setError(undefined));

    try {
      const newTemplate: TodoTemplate = {
        id: Date.now().toString(),
        title: formData.title,
        time: formData.time,
        repeatType: formData.repeatType,
        repeatDays: formData.repeatDays,
        always: formData.repeatType === 'daily',
        count: formData.count,
        createdAt: new Date().toISOString(),
      };

      await indexedDBService.saveTemplate(newTemplate);
      dispatch(todosSlice.actions.addTemplate(newTemplate));
      dispatch(todosSlice.actions.setModal(undefined));

      const currentDate = getState().todos.selectedDate;
      await dispatch(loadTodosForDate(currentDate));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create template';
      dispatch(todosSlice.actions.setError(message));
      throw error;
    } finally {
      dispatch(todosSlice.actions.setLoading(false));
    }
  };
export const incrementTodoCount =
  (instanceId: string): AppThunk =>
  async (dispatch, getState) => {
    const state = getState();
    const instance = state.todos.instances.find(i => i.id === instanceId);

    if (!instance) return;

    const currentCount = parseInt(instance.completedCount || '0');
    const targetCount = parseInt(instance.count || '1');

    let completedCount: string;
    let completed: boolean;
    let completedAt: string | undefined;
    if (!instance.completed) {
      // Увеличиваем счетчик
      const newCount = Math.min(currentCount + 1, targetCount);
      completedCount = newCount.toString();
      completed = newCount >= targetCount;
      completedAt = completed ? new Date().toISOString() : undefined;
    } else {
      completedCount = '0';
      completed = false;
      completedAt = undefined;
    }

    const updatedInstance: TodoInstance = {
      ...instance,
      completedCount,
      completed,
      completedAt,
    };

    try {
      dispatch(todosSlice.actions.updateInstance(updatedInstance));
      await indexedDBService.saveInstance(updatedInstance);
    } catch (error) {
      console.error('Failed to toggle todo:', error);
    }
  };

export const updateTemplate =
  (params: {
    templateId: string;
    title: string;
    time?: string;
    repeatType: 'daily' | 'weekly' | 'specific_days';
    repeatDays?: string[];
    always: boolean;
    count: string;
  }): AppThunk =>
  async (dispatch, getState) => {
    dispatch(todosSlice.actions.setLoading(true));
    dispatch(todosSlice.actions.setError(undefined));

    try {
      const { templates } = getState().todos;
      const existingTemplate = templates.find(t => t.id === params.templateId);

      if (!existingTemplate) {
        throw new Error('Шаблон не найден');
      }

      const updatedTemplate: TodoTemplate = {
        ...existingTemplate,
        title: params.title,
        time: params.time,
        repeatType: params.repeatType,
        repeatDays: params.repeatDays,
        always: params.always,
        count: params.count,
      };

      // Обновляем шаблон в состоянии
      const index = templates.findIndex(t => t.id === params.templateId);
      if (index !== -1) {
        const newTemplates = [...templates];
        newTemplates[index] = updatedTemplate;
        dispatch(todosSlice.actions.setTemplates(newTemplates));
      }
      await indexedDBService.saveInstance(updatedTemplate);
      await indexedDBService.saveTemplate(updatedTemplate);

      dispatch(todosSlice.actions.setModal(undefined));

      // Перезагружаем экземпляры для текущей даты
      const currentDate = getState().todos.selectedDate;
      await dispatch(loadTodosForDate(currentDate));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Ошибка при обновлении';
      dispatch(todosSlice.actions.setError(message));
      throw error;
    } finally {
      dispatch(todosSlice.actions.setLoading(false));
    }
  };

export const toggleTodoInstance =
  (instanceId: string): AppThunk =>
  async (dispatch, getState) => {
    const state = getState();
    const instance = state.todos.instances.find(i => i.id === instanceId);

    if (!instance) return;

    const updatedInstance: TodoInstance = {
      ...instance,
      completedAt: !instance.completed ? new Date().toISOString() : undefined,
    };

    try {
      await indexedDBService.saveInstance(updatedInstance);
      dispatch(todosSlice.actions.updateInstance(updatedInstance));
    } catch (error) {
      console.error('Failed to toggle todo:', error);
    }
  };

export const deleteTemplate =
  (templateId: string): AppThunk =>
  async (dispatch, getState) => {
    dispatch(todosSlice.actions.setLoading(true));

    try {
      dispatch(todosSlice.actions.removeTemplate(templateId));

      await indexedDBService.deleteTemplate(templateId);
      await indexedDBService.deleteInstancesForTemplate(templateId);

      // Обновляем экземпляры для текущей даты
      const currentDate = getState().todos.selectedDate;
      await dispatch(loadTodosForDate(currentDate));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete template';
      dispatch(todosSlice.actions.setError(message));
      throw error;
    } finally {
      dispatch(todosSlice.actions.setLoading(false));
    }
  };

export const changeDate =
  (date: string): AppThunk =>
  async dispatch => {
    await dispatch(loadTodosForDate(date));
  };

export const {
  setTemplates,
  addTemplate,
  removeTemplate,
  setInstances,
  setCurrentInstance,
  updateInstance,
  setSelectedDate,
  setModal,
  setLoading,
  setError,
  clearError,
} = todosSlice.actions;

export default todosSlice.reducer;
