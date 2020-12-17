import React, { Component } from "react";
import { Form , Button, Card, Row } from "react-bootstrap";
import { withRouter  } from "react-router-dom";

class Login extends Component {
  constructor() {
    super();
    this.state = {email: '', password: ''};

    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.handlePwChange = this.handlePwChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleEmailChange(event) {
    event.preventDefault();
    this.setState({email: event.target.value});
  }

  handlePwChange(event) {
    event.preventDefault();
    this.setState({password: event.target.value});
  }

  handleSubmit(event) {
    event.preventDefault();
    fetch("http://localhost:3001/login", {method: 'POST', body: new URLSearchParams({email: this.state.email, password: this.state.password})})
      .then((res) => res.json())
      .then((res) => {
        if(res.token){
          this.setToken(res.token);  
          this.props.history.push('/dashboard');        
        } else alert(res.message.message);        
      });    
  }

  setToken = (token) => {
    this.props.setToken(token);
  }

  render() {
    return (
        <Card md = "auto"
        style={{
          marginTop: "1em",
          marginBottom: "1em",
          padding: "1em",
        }}
      >
        <Form onSubmit={this.handleSubmit}>
        <Form.Group controlId="email">
          <Form.Label>Email address</Form.Label>
          <Form.Control type="email" placeholder="Enter email" value={this.state.email} onChange={this.handleEmailChange} required/>
          <Form.Text className="text-muted">
            Please enter a valid email address!
          </Form.Text>
        </Form.Group>
        <Form.Group controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control type="password" placeholder="Password" value={this.state.password} onChange={this.handlePwChange} required/>
        </Form.Group>
        <Button variant="primary" type="submit">
          Submit
        </Button>
      </Form>
      </Card>
    )
  }
}

export default withRouter(Login);
