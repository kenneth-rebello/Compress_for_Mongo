import React ,{Fragment} from 'react';
import './App.css';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import MainPage from './components/MainPage';
import Login from './components/Login';

function App() {
  return (
    <Router>
      <Fragment>
        <Route exact path="/" component={Login}/>
        <Switch>
          <Route exact path="/mongo" component={MainPage}/>
        </Switch>
      </Fragment>
    </Router>
  );
}

export default App;
