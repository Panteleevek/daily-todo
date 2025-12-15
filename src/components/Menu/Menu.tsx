import Calendar from '@assets/calendar';
import Dashboard from '@assets/dashboard';
import Settings from '@assets/profile';
import { Link, useLocation } from 'react-router-dom';

const MENU_ITEMS = [
  { id: 'calendar' as const, icon: Calendar, label: 'Календарь', link: '/calendar' },
  { id: 'dashboard' as const, icon: Dashboard, label: 'Дашборд', link: '/' },
  { id: 'profile' as const, icon: Settings, label: 'Профиль', link: '/profile' },
];

const Menu = () => {
  const location = useLocation();

  return (
    <div className="flex fixed bottom-0 w-[100%] bg-[white] ">
      <div className="flex w-[100%] pr-[10px] m-[8px] pl-[10px] justify-between">
        {MENU_ITEMS.map(item => (
          <Link
            to={item.link}
            key={item.id}
            className={`${location?.pathname === item.link ? 'text-gray-700' : 'text-gray-400'} hover:text-gray-700`}
          >
            <div className="flex flex-col items-center">
              <div dangerouslySetInnerHTML={{ __html: item.icon }}></div>
              <div>{item.label}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Menu;
