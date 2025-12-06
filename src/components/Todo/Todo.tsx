import type { TodoInstance } from '@/types/todo';
import { days } from '../../config/data';
import { useAppDispatch } from '@/app/hooks';
import { deleteTemplate, setCurrentInstance, setModal } from '@/app/todos/slice';
const daysMap = new Map(days.map(day => [day.value, day.label]));
const weekOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

type Todo = {
  instance: TodoInstance;
  onClick: (val: string) => void;
  disabled: boolean;
  isProfile?: boolean;
};
const Todo = ({ instance, onClick, disabled, isProfile }: Todo) => {
  const { title, time, id, completed, completedCount, count, period, templateId } = instance;
  const dispatch = useAppDispatch();
  const renderCounts = () => {
    if (count === '0' || isProfile) {
      return null;
    }
    const countText = isProfile ? count : `${completedCount}/${count}`;
    return <div className="text-sm text-[gray]">{countText}</div>;
  };

  const renderDays = () => {
    if (Array.isArray(period) && period.length > 0) {
      const result = period
        .filter(day => daysMap.has(day))
        .sort((a, b) => weekOrder.indexOf(a) - weekOrder.indexOf(b))
        .map(day => daysMap.get(day));

      return result.join(', ');
    }
  };
  const renderDetailInfo = () => {
    if (isProfile) {
      const textDays = renderDays();
      return (
        <div className="flex flex-col mt-5 pt-4 border-t border-gray-300">
          <div className="flex justify-between">
            <div>Кол-во повторений: {count} раза</div>
            <div>Время: {time} мин</div>
          </div>
          <div className="flex justify-between mt-2">
            <div>Дни воспроизведения: </div>
            <div>{textDays}</div>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderButtons = () => {
    if (isProfile) {
      return (
        <div className="flex items-center">
          <div
            className="flex items-center font-medium text-gray-500 border-1 bg-white h-[44px] mr-2 px-4 rounded-lg hover:bg-gray-100 cursor-pointer"
            onClick={() => {
              dispatch(setCurrentInstance(instance))
              dispatch(setModal('edit'))
            }}
          >
            Редактировать
          </div>
          <div
            className="flex items-center cursor-pointer font-medium text-gray-500 border-1 bg-white h-[44px] px-4 rounded-lg hover:bg-gray-100"
            onClick={() => dispatch(deleteTemplate(templateId))}
          >
            Удалить
          </div>
        </div>
      );
    }

    return null;
  };
  return (
    <div
      className={`flex flex-col py-[16px] px-[12px] mb-[16px] bg-white rounded-2xl shadow-sm ${disabled || (completed && !isProfile) ? 'opacity-[0.6]' : !isProfile ? 'hover:shadow-md transition-shadow cursor-pointer' : ''}`}
      onClick={() => !isProfile && onClick(id)}
    >
      <div className="flex justify-between   items-center">
        <div
          className={`text-lg ${completed && !isProfile ? 'text-gray-500 line-through' : 'text-[#ddd1b3]'}`}
          dangerouslySetInnerHTML={{ __html: title }}
        ></div>
        <div className="flex items-center space-x-4">
          {renderCounts()}
          {!isProfile && time && <div className="text-sm text-gray-500">{time} мин</div>}
          {renderButtons()}
        </div>
      </div>
      {renderDetailInfo()}
    </div>
  );
};

export default Todo;
