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
export const generateDateRange = (startDate: string, days: number): string[] => {
  const dates: string[] = [];
  for (let i = 0; i < days; i++) {
    dates.push(addDays(startDate, i));
  }
  return dates;
};