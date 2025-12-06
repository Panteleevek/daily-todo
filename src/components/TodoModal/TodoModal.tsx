import { useAppSelector } from '@/app/hooks';
import Modal from '../Modal/Modal';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { createTemplate, setModal, updateTemplate } from '@/app/todos/slice';
import Input from '../Input/Input';
import Checkbox from '../Checkbox/Checkbox';
import Dropdown from '../Dropdown/Dropdown';

import { days, times, counts } from '../../config/data';

interface TodoForm {
  title: string;
  time?: string;
  period?: string | string[];
  always: boolean;
  count: string;
}

const TodoModal = () => {
  const [form, setForm] = useState<TodoInstance>({
    title: '',
    time: undefined,
    period: undefined,
    always: true,
    count: '1',
  });

  const [validate, setValidate] = useState<boolean>(false);
  const { modalType, currentInstance } = useAppSelector(s => s.todos);
  const isOpen = useMemo(() => !!modalType, [modalType]);
  const isEdit = useMemo(() => modalType === 'edit', [modalType]);
  const dispatch = useDispatch();
  useEffect(() => {
    if(isEdit){
      setForm({...currentInstance})
    }
  },[isEdit])
  const title = useMemo(() => {
    if (isEdit) return 'Редактировать';
    return 'Создать';
  }, [modalType]);

  const handleChange = (val: string | string[] | boolean, name: string) => {
    let values: TodoForm = {
      ...form,
      [name]: val,
    };

    if (!!val && name === 'title') setValidate(false);

    if (name === 'always') {
      values = {
        ...values,
        period: undefined,
      };
    }

    if (name === 'period') {
      values = {
        ...values,
        always: false,
      };
    }

    setForm(values);
  };

  const disabledPeriod = useMemo(() => form.always, [form.always]);
  const disabledAlwaysCheckbox = useMemo(
    () => Array.isArray(form.period) && form.period.length > 0,
    [form.period]
  );

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      setValidate(true);
      return;
    }

    const repeatType = form.always
      ? 'daily'
      : Array.isArray(form.period) && form.period.length === 7
        ? 'weekly'
        : 'specific_days';

    const repeatDays = Array.isArray(form.period) ? (form.period as string[]) : undefined;

    try {
      if (isEdit) {
        dispatch(
          updateTemplate({
            ...currentInstance,
            title: form.title,
            time: form.time,
            repeatType,
            repeatDays,
            always: form.always,
            count: form.count,
          })
        );
      } else {
        dispatch(
          createTemplate({
            title: form.title,
            time: form.time,
            repeatType,
            repeatDays,
            always: form.always,
            count: form.count,
          })
        );
      }

      setForm({
        title: '',
        time: undefined,
        period: undefined,
        always: true,
        count: '1',
      });

      dispatch(setModal(undefined));
    } catch (error) {
      console.error('Failed to create todo:', error);
    }
  };

  const handleClose = () => {
    dispatch(setModal(undefined));
    // Сброс формы при закрытии
    setForm({
      title: '',
      time: undefined,
      period: undefined,
      always: true,
      count: '1',
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      buttonText="Готово"
      onClick={handleSubmit}
    >
      <div className="w-[100%] flex flex-col">
        <div className="mb-2">
          <Input
            onChange={val => handleChange(val, 'title')}
            placeholder="Что нужно сделать?"
            error={validate}
            value={form.title}
          />
        </div>
        <div className="flex mb-2">
          <div className="w-[70%] mr-[8px]">
            <Dropdown
              onChange={val => handleChange(val, 'time')}
              options={times}
              value={form.time}
              placeholder="Время"
            />
          </div>
          <div className="w-[30%]">
            <Dropdown
              onChange={val => handleChange(val, 'count')}
              options={counts}
              placeholder="Повторений"
              value={form.count}
            />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex-1 mr-4">
            <Dropdown
              onChange={val => handleChange(val, 'period')}
              options={days}
              multiple
              placeholder="В какой день"
              disabled={disabledPeriod}
              value={form.period}
            />
          </div>
          <Checkbox
            onChange={val => handleChange(val, 'always')}
            label="Всегда"
            disabled={disabledAlwaysCheckbox}
            checked={form.always}
          />
        </div>

        <div className="mt-4 p-2 bg-blue-50 rounded text-sm text-blue-700">
          {form.always && <p>✅ Задача будет повторяться каждый день</p>}
          {Array.isArray(form.period) && form.period.length > 0 && (
            <p>✅ Задача будет повторяться в выбранные дни: {form.period.join(', ')}</p>
          )}
          {!form.always &&
            (!form.period || (Array.isArray(form.period) && form.period.length === 0)) && (
              <p>⚠️ Выберите дни повторения или поставьте "Всегда"</p>
            )}
        </div>
      </div>
    </Modal>
  );
};

export default TodoModal;
