import { Outlet } from 'react-router-dom';
import Menu from './components/Menu/Menu';
import TodoModal from "./components/TodoModal/TodoModal"

export default function Layout() {
  return (
    <div className=' h-full justify-between items-center min-h-[100vh] bg-gradient-to-br from-[#f0eee9] to-white'>
      <Outlet />  
      <TodoModal/>
      <Menu />
    </div>
  );
}