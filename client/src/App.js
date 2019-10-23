import React ,{Fragment} from 'react';
import './App.css';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import MainPage from './components/MainPage';

function App() {
  return (
    <Router>
      <Fragment>
        <Switch>
          <Route exactpath="/" component={MainPage}/>
        </Switch>
      </Fragment>
    </Router>
  );
}

export default App;
