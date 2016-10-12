import React from 'react';
import ReactDOM from 'react-dom';

import NameInputField from './components/NameInputField';

import { Grid, Well, Row, Col } from 'react-bootstrap';

window.onload = () => {
  ReactDOM.render(
      (
           <div>
               <InputForm />
           </div>
      ), document.getElementById('main'));
};