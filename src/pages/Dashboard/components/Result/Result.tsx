import { useAppDispatch } from '@/app/hooks';
import { setModal } from '@/app/todos/slice';
import type { TodoInstance } from '@/types/todo';

const Result = ({ instances }: { instances: TodoInstance[] }) => {
  const dispatch = useAppDispatch();
  if (Array.isArray(instances) && instances.length > 0) {
    return (
      <div className="flex flex-row fixed bottom-[100px] justify-between max-h-[32px]  items-center w-[100%] mt-auto px-4 ">
        <div className="flex justify-between w-[100%] text-sm text-gray-600 bg-white border-1  p-3 rounded-lg">
          <div>
            Всего: <span className="font-semibold">{instances.length}</span>
          </div>
          <div>
            Выполнено:{' '}
            <span className="font-semibold text-green-600">
              {instances.filter(i => i.completed).length}
            </span>
          </div>
          <div>
            Осталось:{' '}
            <span className="font-semibold text-blue-600">
              {instances.filter(i => !i.completed).length}
            </span>
          </div>
        </div>

        <div
          className="flex items-center font-medium text-gray-500 border-1 bg-white h-[44px] ml-4 px-4 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
          onClick={() => dispatch(setModal('create'))}
        >
          <div>Добавить</div>
        </div>
      </div>
    );
  }

  return null;
};

export default Result;
