import { useAppDispatch } from '@/app/hooks';
import { setModal } from '@/app/todos/slice';
import type { TodoInstance } from '@/types/todo';

const Result = ({ instances }: { instances: TodoInstance[] }) => {
  const dispatch = useAppDispatch();
  if (Array.isArray(instances) && instances.length > 0) {
    return (
      <div className="flex flex-row fixed bottom-[80px] justify-between h-[66px] items-center w-[100%] mt-auto px-4 ">
        <div className="flex justify-between w-[100%] text-sm text-gray-600 bg-white border-1  p-3 rounded-lg">
          <div>
            Всего: <span className="font-semibold">{instances.length}</span>
          </div>
          <div>
            Выполнено:{' '}
            <span className="font-semibold text-green-800">
              {instances.filter(i => i.completed).length}
            </span>
          </div>
          <div>
            Осталось:{' '}
            <span className="font-semibold text-blue-800">
              {instances.filter(i => !i.completed).length}
            </span>
          </div>
        </div>

        <div
          className="flex items-center font-medium text-gray-500 border-1 bg-white h-[100%] ml-4 px-4 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
          onClick={() => dispatch(setModal('create'))}
        >
          Добавить
        </div>
      </div>
    );
  }

  return null;
};

export default Result;
