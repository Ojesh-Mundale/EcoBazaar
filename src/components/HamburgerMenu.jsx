import React from 'react';

const HamburgerMenu = ({ isOpen, toggle }) => {
  return (
    <div 
      className="hamburger-menu" 
      onClick={toggle}
    >
      <div className={`hamburger-line ${isOpen ? 'open' : ''}`}></div>
      <div className={`hamburger-line ${isOpen ? 'open' : ''}`}></div>
      <div className={`hamburger-line ${isOpen ? 'open' : ''}`}></div>
    </div>
  );
};

export default HamburgerMenu;
