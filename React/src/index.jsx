import React, { Component } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import TraderNavbar from "./Components/TraderNavbar";
import Dashboard from "./Components/Dashboard";
import Login from "./Components/Login";
import Forgotten from "./Components/Forgotten";
import Register from "./Components/Register";
import Settings from "./Components/Settings";
import Profile from "./Components/Profile";
import "bootstrap/dist/css/bootstrap.min.css";
import * as serviceWorker from "./serviceWorker";
import Backtest from "./Components/Backtest";

class Trader extends Component {
  constructor() {
    super();
    const token = JSON.parse(localStorage.getItem('token'));
    if (token === null) this.setState({token: ""});
    else if (typeof token.token === "undefined") this.setState({token: ""});
    else {
      this.setState(token);
    }
  }  
  state = JSON.parse(localStorage.getItem('token')) !== null ? JSON.parse(localStorage.getItem('token')) : {token: ""} ;

  setToken = (token) => {
    localStorage.setItem('token', JSON.stringify({token: token}));
    this.setState({token: token});
  };
  
  logout = () => {
    this.setState({token: ""});
    localStorage.clear();
  }

  componentWillUnmount() {
    this.logout();
  }

  render() {
    return (
      <Router>
        <div className="container">
          <TraderNavbar token={this.state.token} logout={this.logout}/>
          <Switch>
            <Route exact path="/" render={ (props) => <Login {...props} setToken = {this.setToken} /> } />  {/* /login */}
            {/*<Route exact path="/forgotten" component={Forgotten} /> {/* /forgotten */}
            <Route exact path="/register" render={ (props) => <Register {...props} token={this.state.token} /> } /> {/* /register */}
            <Route exact path="/dashboard" render={ (props) => <Dashboard {...props} token={this.state.token} /> } /> {/* /transactions, /account */}
            <Route exact path="/settings" render={ (props) => <Settings {...props} token={this.state.token} /> } /> {/* /user, /algo */}
            <Route exact path="/backtest" render={ (props) => <Backtest {...props} token={this.state.token} /> } /> {/* /backtest */}
            <Route exact path="/profile" render={ (props) => <Profile {...props} token={this.state.token} /> }/> {/* /user, /account */}            
          </Switch>
        </div>
      </Router>
    );
  }
}

ReactDOM.render(
  <React.StrictMode>
    <Trader />
  </React.StrictMode>,
  document.getElementById("root")
);

serviceWorker.register();
