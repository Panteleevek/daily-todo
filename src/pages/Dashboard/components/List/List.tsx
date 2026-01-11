import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  toggleTodoInstance,
  loadTodosForDate,
  incrementTodoCount,
  setModal,
} from '@/app/todos/slice';
import { useCallback, useEffect, useMemo } from 'react';
import Result from '../Result/Result';
import { getToday } from '@/utils/dateUtils';
import Todo from '@/components/Todo/Todo';

const List = () => {
  const dispatch = useAppDispatch();
  const { instances, loading, selectedDate, emptyList, isToday } = useAppSelector(s => s.todos);
  const sortInstances = useMemo(() => {
    if (Array.isArray(instances)) {
      return [...instances].sort((a, b) => {
        if (a.completed !== b.completed) return -1;
        if (a.completed) return 0;
        return 1;
      });
    }
    return null;
  }, [instances]);
  const today = getToday();
  const isNotToday = useMemo(() => selectedDate !== today, [selectedDate, today]);
  useEffect(() => {
    dispatch(loadTodosForDate(selectedDate));
  }, [dispatch, selectedDate]);
  const handleToggle = useCallback(
    (instanceId: string) => {
      if (!isNotToday) {
        dispatch(incrementTodoCount(instanceId));
        dispatch(toggleTodoInstance(instanceId));
      }

      return null;
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

  const renderInstances = () => {
    if (emptyList) {
      return (
        <div className="text-center py-64 bg-white rounded-xl shadow-sm">
          <div className="text-gray-500 ">Ваш список пуст</div>
          <div
            className="mt-[48px] mx-4 p-4 border-2 rounded-2xl font-semibold text-gray-500  hover:bg-gray-100 cursor-pointer transition-colors"
            onClick={() => dispatch(setModal('create'))}
          >
            Создать
          </div>
        </div>
      );
    }
    return (
      Array.isArray(sortInstances) &&
      sortInstances.map(instance => (
        <Todo key={instance.id} instance={instance} onClick={handleToggle} disabled={isNotToday} />
      ))
    );
  };
  return (
    <div className="flex flex-col relative w-[100%] h-[100%] justify-between pt-[72px]" style={{paddingTop: isToday ? '72px' : '100px'}}>
      <div className="px-2 mt-[12px]">{renderInstances()}</div>
      <Result instances={instances} />
    </div>
  );
};

export default List;
