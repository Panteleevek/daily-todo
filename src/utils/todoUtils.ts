import type { DayOfWeek, TodoInstance, TodoTemplate } from '../types/todo';
import { getDayOfWeek } from './dateUtils';

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

export const generateInstancesForDate = (
  date: string,
  templates: TodoTemplate[],
  existingInstances: Map<string, TodoInstance> 
): TodoInstance[] => {
  const dateObj = new Date(date);
  const instances: TodoInstance[] = [];
  
  for (const template of templates) {
    if (shouldShowTemplateOnDate(template, dateObj)) {
      const existingInstance = existingInstances.get(template.id);
      
      if (existingInstance) {
        instances.push(existingInstance);
      } else {
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

export const shouldTemplateShowOnDate = (template: TodoTemplate, dayOfWeek: string): boolean => {
  switch (template.repeatType) {
    case 'daily':
      return true;
    
    case 'weekly':
    case 'specific_days':
      const includes = template.repeatDays?.includes(dayOfWeek || '') ?? false;
      return includes;
    
    default:
      return false;
  }
};