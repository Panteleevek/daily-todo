import type { DayOfWeek, TodoTemplate } from '../types/todo';
import { getDayOfWeek } from './dateUtils';

// Проверяет, должен ли todo отображаться в указанную дату
export const shouldShowTemplateOnDate = (
  template: TodoTemplate,
  date: Date
): boolean => {
  const dayOfWeek = getDayOfWeek(date);
  
  switch (template.repeatType) {
    case 'daily':
      return true;
    
    case 'weekly':
      return template.repeatDays?.includes(dayOfWeek as DayOfWeek) || false;
    
    case 'specific_days':
      return template.repeatDays?.includes(dayOfWeek as DayOfWeek) || false;
    
    default:
      return false;
  }
};

// Генерирует экземпляры todo для даты на основе шаблонов
export const generateInstancesForDate = (
  date: string,
  templates: TodoTemplate[],
  existingInstances: Map<string, TodoInstance> // key: templateId
): TodoInstance[] => {
  const dateObj = new Date(date);
  const instances: TodoInstance[] = [];
  
  for (const template of templates) {
    if (shouldShowTemplateOnDate(template, dateObj)) {
      const existingInstance = existingInstances.get(template.id);
      
      if (existingInstance) {
        // Используем существующий экземпляр
        instances.push(existingInstance);
      } else {
        // Создаем новый экземпляр
        instances.push({
          id: `${template.id}_${date}`,
          templateId: template.id,
          date,
          completed: false,
          title: template.title,
          time: template.time,
        });
      }
    }
  }
  
  return instances;
};