import React from 'react';

import CalendarTodos from './components/CalendarTodos/CalendarTodos';
import PopupTodo from './components/PopupTodo/PopupTodo';

const Calendar: React.FC = () => {
  return (
    <>
      <CalendarTodos />
      <PopupTodo  />
    </>
  );
};

export default Calendar;
