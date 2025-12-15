import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { loadTodosForDate, setCurrentInstances } from '@/app/todos/slice';
import Popup from '@/components/Popup/Popup';
import type { TodoInstance } from '@/types/todo';
import { useEffect, useMemo } from 'react';

const PopupTodo = () => {
  const dispatch = useAppDispatch();

  const { currentDateInstances, instances: currentInstances } = useAppSelector(s => s.todos);
    useEffect(() => {
      if (currentDateInstances) {
        dispatch(loadTodosForDate(currentDateInstances));
      }
    }, [currentDateInstances]);
  const isOpen = useMemo(
    () => Array.isArray(currentInstances) && currentInstances.length > 0 && !!currentDateInstances,
    [currentInstances, currentDateInstances]
  );

  const title = useMemo(
    () =>
      currentDateInstances &&
      new Date(currentDateInstances).toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    [currentDateInstances]
  );

  const renderTodos = () => {
    if (Array.isArray(currentInstances) && currentInstances.length > 0) {
      return currentInstances.map(renderTodo);
    }
    return null;
  };

  const renderTodo = (todo: TodoInstance) => {
    const { id, title, time, count, completedCount } = todo;
    return (
      <div key={id} className="flex justify-between mb-1 pb-2 border-b border-gray-200">
        <div dangerouslySetInnerHTML={{ __html: title }} className="text-l font-medium"></div>
        <div className="flex items-center">
          {time && <div className="mr-2 text-xs font-medium text-gray-500 ">({time} мин)</div>}
          <div>
            {completedCount}/{count}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Popup isOpen={isOpen} onClose={() => dispatch(setCurrentInstances(''))} title={title}>
      <div>{renderTodos()}</div>
    </Popup>
  );
};

export default PopupTodo;
