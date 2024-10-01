import React, { useEffect } from 'react';

const TelegramLogin = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?7';
    script.setAttribute('data-telegram-login', 'TestBot');
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-auth-url', 'https://'); 
    script.setAttribute('data-request-access', 'write');
    script.async = true;
    document.getElementById('telegram-login').appendChild(script);
  }, []);

  return (
    <div style={{display: "none" }}>
      <h1></h1>
      <div id="telegram-login"></div>
    </div>
  );
};

export default TelegramLogin;
