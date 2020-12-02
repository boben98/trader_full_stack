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

class Trader extends Component {
  render() {
    return (
      <Router>
        <div className="container">
          <TraderNavbar />
          <Switch>
            <Route exact path="/" component={Login} />  {/* /login */}
            <Route exact path="/forgotten" component={Forgotten} /> {/* /forgotten */}
            <Route exact path="/register" component={Register} /> {/* /register */}
            <Route exact path="/dashboard" component={Dashboard} /> {/* /transactions, /account */}
            <Route exact path="/settings" component={Settings} /> {/* /user, /algo /backtest*/}
            <Route exact path="/profile" component={Profile}/> {/* /user, /account */}            
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
