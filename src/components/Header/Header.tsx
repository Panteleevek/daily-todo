import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { changeDate } from '@/app/todos/slice';
import { getToday, addDays, findEarliestCreatedTodo } from '@/utils/dateUtils';
import { useMemo, memo, useCallback } from 'react';

const Header = () => {
  const selectedDate = useAppSelector(s => s.todos.selectedDate);
  const emptyList = useAppSelector(s => s.todos.emptyList);
  const templates = useAppSelector(s => s.todos.templates);
  const isToday = useAppSelector(s => s.todos.isToday);

  const dispatch = useAppDispatch();
  const today = useMemo(() => getToday(), []);

  const earliestTodoDate = useMemo(() => {
    const earlyTodo = findEarliestCreatedTodo(templates);
    if (!earlyTodo) return null;
    return new Date(`${earlyTodo.year}-${earlyTodo.month}-${earlyTodo.day}`).getTime();
  }, [templates]);

  const handlePrevDay = useCallback(() => {
    const prevDate = addDays(selectedDate, -1);
    dispatch(changeDate(prevDate));
  }, [selectedDate, dispatch]);

  const handleNextDay = useCallback(() => {
    const nextDate = addDays(selectedDate, 1);
    dispatch(changeDate(nextDate));
  }, [selectedDate, dispatch]);

  const handleGoToToday = useCallback(() => {
    dispatch(changeDate(today));
  }, [today, dispatch]);

  const showPrevDay = useMemo(() => {
    if (!earliestTodoDate) return false;
    const prevDate = addDays(selectedDate, -1);
    return new Date(prevDate).getTime() >= earliestTodoDate;
  }, [selectedDate, earliestTodoDate]);

  const formatDate = useCallback(
    (date: string) => {
      if (date === today) return 'Сегодня';
      if (date === addDays(today, -1)) return 'Вчера';
      if (date === addDays(today, 1)) return 'Завтра';

      const dateObj = new Date(date);
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
      };
      return dateObj.toLocaleDateString('ru-RU', options);
    },
    [today]
  );

  const showPrevMonth = useMemo(() => !emptyList && showPrevDay, [emptyList, showPrevDay]);
  const showNextMonth = useMemo(() => !emptyList, [emptyList]);

  return (
    <div className="fixed z-10 grid grid-cols-3 items-center mb-4 py-2 px-4 bg-white w-[100%] ">
      <div className="flex w-[60px] mr-auto ">
        {showPrevMonth && (
          <div
            onClick={handlePrevDay}
            className=" py-2 text-s font-medium text-gray-500 hover:bg-gray-100 rounded-lg cursor-pointer"
          >
            Назад
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 text-center">
        <div className="text-lg font-semibold ">{formatDate(selectedDate)}</div>
        <div className="text-sm text-gray-500">
          {new Date(selectedDate).toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </div>
        {!isToday && (
          <div
            onClick={handleGoToToday}
            className="mt-1 text-s text-blue-600 hover:text-blue-800 cursor-pointer"
          >
            Вернуться
          </div>
        )}
      </div>
      <div className="flex w-[60px] ml-auto">
        {showNextMonth && (
          <div
            onClick={handleNextDay}
            className=" py-2 text-s font-medium text-gray-500 hover:bg-gray-100 rounded-lg cursor-pointer"
          >
            Вперед
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(Header);
