import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';


// Add this import:
import { AppContainer } from 'react-hot-loader';

// Wrap the rendering in a function:
const render = () => {
  ReactDOM.render(
    // Wrap App inside AppContainer
    <AppContainer>
      <App />
    </AppContainer>,
    document.getElementById('root')
  );
};


// Render once
render();

if (module.hot) {
  console.log("hot");
  module.hot.accept('./App', () => {
    const NextApp = require('./App').default
    ReactDOM.render(
      <NextApp />,
      document.getElementById('root')
    )
  })
}
else {
  console.log("cold");
}
