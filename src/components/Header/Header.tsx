import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { changeDate } from '@/app/todos/slice';
import { getToday, addDays } from '@/utils/dateUtils';

const Header = () => {
  const { selectedDate } = useAppSelector(s => s.todos);
  const dispatch = useAppDispatch();

  const today = getToday();
  const isToday = selectedDate === today;
  const handlePrevDay = () => {
    const prevDate = addDays(selectedDate, -1);
    dispatch(changeDate(prevDate));
  };

  const handleNextDay = () => {
    const nextDate = addDays(selectedDate, 1);
    dispatch(changeDate(nextDate));
  };

  const handleGoToToday = () => {
    dispatch(changeDate(today));
  };

  const formatDate = (date: string) => {
    const dateObj = new Date(date);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    };

    if (date === today) return 'Сегодня';
    if (date === addDays(today, -1)) return 'Вчера';
    if (date === addDays(today, 1)) return 'Завтра';

    return dateObj.toLocaleDateString('ru-RU', options);
  };
  return (
    <div className="flex items-center justify-between mb-4 py-2 px-4 bg-white w-[100%]">
      <div
        onClick={handlePrevDay}
        className="px-3 py-2 text-s font-medium   text-gray-500  hover:bg-gray-100 cursor-pointer rounded-lg transition-colors"
      >
        Назад
      </div>

      <div className="text-center">
        <div className="text-lg font-semibold  text-gray-600">{formatDate(selectedDate)}</div>
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

      <div
        onClick={handleNextDay}
        className="px-3 py-2 text-s font-medium  text-gray-500 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
      >
        Вперед
      </div>
    </div>
  );
};

export default Header;
