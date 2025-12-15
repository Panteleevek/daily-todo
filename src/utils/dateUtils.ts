import type { TodoTemplate } from "@/types/todo";

export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
const month = String(date.getMonth() + 1).padStart(2, '0');
const day = String(date.getDate()).padStart(2, '0');
return`${year}-${month}-${day}`;
};

export const getToday = (): string => {
  return formatDate(new Date());
};

export const getDayOfWeek = (date: Date): string => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[date.getDay()];
};

export const addDays = (date: string, days: number): string => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return formatDate(d);
};

export const isSameDay = (date1: string, date2: string): boolean => {
  return date1 === date2;
};

export const compareDay = (date1: string, date2: string): boolean => {
   const d1 = new Date(date1);
    const d2 = new Date(date2);
    
    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);
    
    return d1.getTime() <= d2.getTime();
};
export const findEarliestCreatedTodo = (items: TodoTemplate[]) => {
  if (!items || items.length === 0) {
    return null;
  }

  let earliestYear = Infinity;
  let earliestMonth = Infinity;
  let earliestDay = Infinity;
  let earliestDate: string = '';


  for (let i = 0; i < items.length; i++) {
    const dateStr = items[i].createdAt;
    const year = parseInt(dateStr.substring(0, 4), 10);
    const month = parseInt(dateStr.substring(5, 7), 10);
    const day = parseInt(dateStr.substring(8, 10), 10);
    if (
      year < earliestYear ||
      (year === earliestYear && month < earliestMonth) ||
      (year === earliestYear && month === earliestMonth && day < earliestDay)
    ){
      earliestYear = year;
      earliestMonth = month;
      earliestDay = day;
      earliestDate = dateStr
    }
  }

  return {
    year: earliestYear,
    month: earliestMonth,
    day: earliestDay,
    date: earliestDate
  }
}

export const generateDateRange = (startDate: string, days: number): string[] => {
  const dates: string[] = [];
  for (let i = 0; i < days; i++) {
    dates.push(addDays(startDate, i));
  }
  return dates;
};