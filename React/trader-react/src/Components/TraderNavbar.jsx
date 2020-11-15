import React, { Component } from "react";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import NavDropdown from "react-bootstrap/NavDropdown";
import Button from "react-bootstrap/Button";
import { Link } from "react-router-dom";

class TraderNavbar extends Component {
  render() {
    return (
      <Navbar bg="light" expand="md">
        <Navbar.Brand>Auto Trading</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
            <Nav.Link as={Link} to="/index">
              Dashboard
            </Nav.Link>
            <Nav.Link as={Link} to="/settings">
              Settings
            </Nav.Link>
          </Nav>
          <Button variant="outline-success">Login</Button>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}

export default TraderNavbar;
