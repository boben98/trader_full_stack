import React, { Component } from "react";
import ReactDOM from "react-dom";
import { MemoryRouter, Switch, Route } from "react-router-dom";
import TraderNavbar from "./Components/TraderNavbar";
import Dashboard from "./Components/Dashboard";
import "bootstrap/dist/css/bootstrap.min.css";

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

ReactDOM.render(<Trader />, document.getElementById("root"));
