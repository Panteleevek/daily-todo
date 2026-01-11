import { Outlet } from 'react-router-dom';
import Menu from './components/Menu/Menu';
import TodoModal from './components/TodoModal/TodoModal';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { getToday } from './utils/dateUtils';
import { useEffect, useMemo } from 'react';
import { setIsToday } from './app/todos/slice';
import ModalInfo from './pages/Dashboard/components/ModalInfo/ModalInfo';

export default function Layout() {
  const selectedDate = useAppSelector(s => s.todos.selectedDate);
  const dispatch = useAppDispatch();
  const today = useMemo(() => getToday(), []);

  useEffect(() => {
    dispatch(setIsToday(selectedDate === today));
  }, []);

  return (
    <div
      className="h-full justify-between items-center min-h-screen"
      style={{
        background: 'linear-gradient(135deg, #f0eee9 0%, white 100%)',
      }}
    >
      <Outlet />
      <TodoModal />
      <ModalInfo />
      <Menu />
    </div>
  );
}
