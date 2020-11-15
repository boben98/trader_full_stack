import React, { Component } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import TraderNavbar from "./Components/TraderNavbar";
import Dashboard from "./Components/Dashboard";
import Settings from "./Components/Settings";
import "bootstrap/dist/css/bootstrap.min.css";
import * as serviceWorker from "./serviceWorker";

class Trader extends Component {
  render() {
    return (
      <Router>
        <div className="container">
          <TraderNavbar />
          <Switch>
            <Route exact path="/index" component={Dashboard} />
            <Route exact path="/settings" component={Settings} />
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
