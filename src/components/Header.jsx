import React from 'react';

const Header = () => {
  const date = new Date();
  const options = { weekday: 'long', month: 'long', day: 'numeric' };
  const formattedDate = date.toLocaleDateString('en-US', options);

  return (
    <header className="header">
      <h1 className="header__title">
        My Tasks
      </h1>
      <p className="header__date">
        {formattedDate}
      </p>
    </header>
  );
};

export default Header;
