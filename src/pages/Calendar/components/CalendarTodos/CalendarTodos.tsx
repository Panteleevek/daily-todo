import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { changeDate, loadTodosForDate, setCurrentInstances } from '@/app/todos/slice';
import {
  formatDate,
  getToday,
  getDayOfWeek,
  compareDay,
  findEarliestCreatedTodo,
} from '@/utils/dateUtils';
import { shouldTemplateShowOnDate } from '@/utils/todoUtils';

const CalendarTodos: React.FC = () => {
  const dispatch = useAppDispatch();
  const { selectedDate, templates, instances } = useAppSelector(s => s.todos);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (Array.isArray(instances) && instances.length === 0) {
      dispatch(loadTodosForDate(selectedDate));
    }
  }, [instances.length === 0]);
  console.log('templates', templates);
  const getDayStats = (date: string) => {
    const dayOfWeek = getDayOfWeek(new Date(date));
    const dayTemplates = templates
      .filter(template => compareDay(template.createdAt, date))
      .filter(template => shouldTemplateShowOnDate(template, dayOfWeek));

    const completedTemplates = dayTemplates.filter(template => {
      const completedDates = template.completedDates || [];
      return completedDates.includes(date);
    });
    return {
      total: dayTemplates.length,
      completed: completedTemplates.length,
      hasTasks: dayTemplates.length > 0,
    };
  };

  // Генерация дней месяца
  const generateMonthDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    const days = [];

    const firstDayOfWeek = firstDay.getDay();
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const dateStr = formatDate(date);
      const stats = getDayStats(dateStr);
      const dayOfWeekIndex = date.getDay();
      const adjustedDayIndex = dayOfWeekIndex === 0 ? 6 : dayOfWeekIndex - 1;
      const dayName = dayNames[adjustedDayIndex];

      days.push({
        date: dateStr,
        day: i,
        dayName,
        isToday: dateStr === getToday(),
        isSelected: dateStr === selectedDate,
        stats,
      });
    }

    return days;
  };

  const handleDateSelect = useCallback(
    (date: string) => {
      dispatch(changeDate(date));
      dispatch(setCurrentInstances(date));
    },
    [dispatch]
  );
  const showPrevMonth = useMemo(() => {
    const earlyCreatedTemplate = findEarliestCreatedTodo(templates);
    const date = new Date(currentMonth);
    if (isNaN(date.getTime())) {
      return false;
    }
    let dateMonth = date.getMonth() + 1;
    let dateYear = date.getFullYear();

    if (dateMonth === 0) {
      dateMonth = 12;
      dateYear = dateYear - 1;
    }
    if (earlyCreatedTemplate?.month && earlyCreatedTemplate?.year) {
      const objMonthNumber = earlyCreatedTemplate.year * 12 + earlyCreatedTemplate.month;
      const dateMonthNumber = dateYear * 12 + dateMonth;

      return dateMonthNumber > objMonthNumber;
    }

    return false;
  }, [templates, currentMonth]);

  console.log('showPrevMonth', showPrevMonth);
  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleToday = () => {
    const today = getToday();
    setCurrentMonth(new Date(today));
    dispatch(changeDate(today));
  };
  const monthNames = [
    'Январь',
    'Февраль',
    'Март',
    'Апрель',
    'Май',
    'Июнь',
    'Июль',
    'Август',
    'Сентябрь',
    'Октябрь',
    'Ноябрь',
    'Декабрь',
  ];

  const dayNames = [
    'Понедельник',
    'Вторник',
    'Среда',
    'Четверг',
    'Пятница',
    'Суббота',
    'Воскресенье',
  ];

  return (
    <div className="relative bg-white rounded-xl shadow-sm mb-[64px]">
      <div className="fixed grid grid-cols-3 items-center mb-4 py-2 px-4 bg-white w-[100%]">
        <div className="flex justify-start">
          {showPrevMonth && (
            <div
              onClick={handlePrevMonth}
              className="px-3 py-2 font-medium text-gray-500 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              Назад
            </div>
          )}
        </div>

        <div className="flex-1 min-w-[150px] text-center">
          <h3 className="text-xl font-bold">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
          <div
            onClick={handleToday}
            className="mt-1 text-s text-blue-600 hover:text-blue-800 cursor-pointer"
          >
            Сегодня
          </div>
        </div>

        <div className="flex justify-end">
          <div
            onClick={handleNextMonth}
            className="px-3 py-2 text-s font-medium text-gray-500 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            Вперед
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-1  p-4 pt-[72px]   bg-gradient-to-br from-[#f0eee9]">
        {generateMonthDays().map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`}></div>;
          }
          const haveTodos = !!day.stats.total;
          return (
            <div
              key={day.date}
              onClick={() => haveTodos && handleDateSelect(day.date)}
              className={`
                h-[100px]
                p-3 flex flex-col items-start justify-start rounded-lg transition-all border-1 
                bg-white
                ${day.isToday && ' bg-[blue] text-[white]'}
                ${day.isSelected && 'border-2 border-blue-400 '}
                ${!day.isSelected && haveTodos && !day.isToday ? 'hover:bg-gray-100' : ''}
                ${day.stats.hasTasks ? 'font-semibold' : ''}
                ${haveTodos && 'cursor-pointer'} 
              `}
            >
              <div className={`flex justify-between w-[100%]`}>
                <div className=" text-[18px] font-semibold">{day.dayName}</div>
                <div className=" text-[18px] font-semibold">{day.day}</div>
              </div>
              {haveTodos && (
                <>
                  <div className="flex justify-between w-[100%] text-[14px] font-medium">
                    <div className="">Всего</div>
                    <div className="">{day.stats.total}</div>
                  </div>
                  <div className="flex justify-between w-[100%] text-[14px] font-medium">
                    <div className="">Завершено</div>
                    <div className="">{day.stats.completed}</div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarTodos;
