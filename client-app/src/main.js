import React from 'react';
import ReactDOM from 'react-dom';

import InputForm from './components/InputForm';

import { Grid, Well, Row, Col } from 'react-bootstrap';

window.onload = () => {
  ReactDOM.render(
      (
           <div>
               <InputForm />
           </div>
      ), document.getElementById('main'));
};
