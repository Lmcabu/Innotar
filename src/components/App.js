import React, { Component } from 'react';
import Home from './Home';
import Navbar from './Navbar';
import Certify from './Certify';
import Vertify from './Vertify';
import Fetch from './Fetch';
import './index.css';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';

function App() {
  const title='Welcome to the new blog';
  return (
    <Router>
      <div className="App">
       <Navbar />
        <nav className="content">
          <Switch>
           <Route exact path="/">
             <Home />
            </Route>
            <Route exact path="/home">
             <Home />
            </Route>
             <Route exact path="/certify">
             <Certify />
            </Route>
            <Route exact path="/vertify">
             <Vertify />
            </Route>
            <Route exact path="/fetch">
             <Fetch />
            </Route>

          </Switch>
        </nav>
      </div>
    </Router>
  );
}

export default App;