import React, { Component } from "react";
import ReactDOM from "react-dom";
import { MemoryRouter, Switch, Route } from "react-router-dom";
import TraderNavbar from "./Components/TraderNavbar";
import Dashboard from "./Components/Dashboard";
import "bootstrap/dist/css/bootstrap.min.css";
import * as serviceWorker from "./serviceWorker";

class Trader extends Component {
  render() {
    return (
      <div className="container">
        <TraderNavbar />
        <Dashboard />
      </div>
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
