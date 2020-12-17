import React, { Component } from "react";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Button from "react-bootstrap/Button";
import { Link, withRouter  } from "react-router-dom";

class TraderNavbar extends Component {

  button = () => {
    if (this.props.token === "") return <Button variant="outline-success" onClick={() => this.props.history.push("/register")}>Register</Button>;
    else return <Button variant="outline-success" onClick={() => {this.props.logout(); this.props.history.push("/");}}>Logout</Button>
  }

  render() {
    return (
      <Navbar bg="light" expand="md">
        <Navbar.Brand>Auto Trading</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
            <Nav.Link as={Link} to="/dashboard">
              Dashboard
            </Nav.Link>
            <Nav.Link as={Link} to="/settings">
              Settings
            </Nav.Link>
            <Nav.Link as={Link} to="/backtest">
              Backtest
            </Nav.Link>
            <Nav.Link as={Link} to="/profile">
              Profile
            </Nav.Link>
          </Nav>
          {this.button()}
        </Navbar.Collapse>
      </Navbar>
    );
  }
}

export default withRouter(TraderNavbar);
