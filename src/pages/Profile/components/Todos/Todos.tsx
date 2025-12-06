import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { toggleTodoInstance, loadTodosForDate, incrementTodoCount } from '@/app/todos/slice';
import { useCallback, useEffect, useMemo } from 'react';
import { getToday } from '@/utils/dateUtils';
import Todo from '@/components/Todo/Todo';

const Todos = () => {
  const dispatch = useAppDispatch();
  const { instances, loading, selectedDate } = useAppSelector(s => s.todos);

  const today = getToday();
  const isNotToday = useMemo(() => selectedDate !== today,[selectedDate, today]) ;
  useEffect(() => {
    dispatch(loadTodosForDate(selectedDate, true));
  }, [dispatch, selectedDate]);

  const handleToggle = useCallback(
    (instanceId: string) => {
      if(!isNotToday){
      dispatch(incrementTodoCount(instanceId));
      dispatch(toggleTodoInstance(instanceId));
      }
    
      return null
    },
    [dispatch, isNotToday]
  );

  if (loading) {
    return (
      <div className="flex flex-col w-[100%] items-center justify-center py-8">
        <div className="text-lg text-gray-500">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col relative w-[100%] h-[100%] justify-between">
      <div className="px-2 mt-[12px]">
        {instances.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-white rounded-xl shadow-sm">
           Список пустой
          </div>
        ) : (
          instances.map(instance => <Todo key={instance.id} instance={instance} onClick={handleToggle} isProfile disabled={isNotToday} />)
        )}
      </div>
    </div>
  );
};

export default Todos;
