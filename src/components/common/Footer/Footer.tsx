import React from 'react';
import './Footer.scss';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__content">
          <div className="footer__social">
            <a href="https://vk.com" target="_blank" rel="noopener noreferrer" className="footer__social-link">
              <img src="/assets/icons/vk.svg" alt="VK" />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="footer__social-link">
              <img src="/assets/icons/youtube.svg" alt="YouTube" />
            </a>
            <a href="https://ok.ru" target="_blank" rel="noopener noreferrer" className="footer__social-link">
              <img src="/assets/icons/ok.svg" alt="OK" />
            </a>
            <a href="https://telegram.org" target="_blank" rel="noopener noreferrer" className="footer__social-link">
              <img src="/assets/icons/telegram.svg" alt="Telegram" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;