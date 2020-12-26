import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import Publisher from './Publisher';
import './index.css';

class Index extends React.Component {
  render() {
    return (
      <div>
        <App />
        <Publisher />
      </div>
    )
  }
}

ReactDOM.render(
  <Index />,
  document.getElementById('root')
);
