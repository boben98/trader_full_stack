import React, { Component } from "react";
import { Form , Button, Card, Row } from "react-bootstrap";
import { withRouter  } from "react-router-dom";

class Settings extends Component {
  constructor() {
    super();
    this.state = {
      name: String,
      email: String,
      phone: String,
      oanda_api_key: String,
      accountId: String,
      password: String,
    };

    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.handlePhoneChange = this.handlePhoneChange.bind(this);
    this.handleKeyChange = this.handleKeyChange.bind(this);
    this.handleAccountChange = this.handleAccountChange.bind(this);
    this.handlePwChange = this.handlePwChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  };

  handleNameChange(event) {
    event.preventDefault();
    this.setState({name: event.target.value});
  }

  handleEmailChange(event) {
    event.preventDefault();
    this.setState({email: event.target.value});
  }

  handlePhoneChange(event) {
    event.preventDefault();
    this.setState({phone: event.target.value});
  }

  handleKeyChange(event) {
    event.preventDefault();
    this.setState({oanda_api_key: event.target.value});
  }

  handleAccountChange(event) {
    event.preventDefault();
    this.setState({accountId: event.target.value});
  }

  handlePwChange(event) {
    event.preventDefault();
    this.setState({password: event.target.value});
  }

  handleSubmit(event) {
    event.preventDefault();
    fetch("http://localhost:3001/user/save", 
      { method: 'POST', body: 
            new URLSearchParams({
              name: this.state.name,
              email: this.state.email, 
              phone: this.state.phone, 
              oanda_api_key: this.state.oanda_api_key, 
              accountId: this.state.accountId, 
              password: this.state.password
            }),
          headers: new Headers({Authorization: "Bearer " + this.props.token})})
      .then(() => this.props.history.push('/dashboard'))
      .catch(console.log); 
  }

  componentDidMount() {
    if (!this.props.token) this.props.history.push('/');
    fetch("http://localhost:3001/user", { headers: new Headers({Authorization: "Bearer " + this.props.token})})
      .then((res) => res.json())
      .then((user) => {
        this.setState({
          name: user.name,
          email: user.email,
          phone: user.phone,   
          oanda_api_key: user.oanda_api_key, 
          accountId: user._account.accountId, 
        });
      });
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
          <Form.Group controlId="name">
            <Form.Label>Your name</Form.Label>
            <Form.Control type="text" placeholder="Enter your name" value={this.state.name} onChange={this.handleNameChange} required/>
          </Form.Group>
          <Form.Group controlId="email">
            <Form.Label>Email address</Form.Label>
            <Form.Control type="email" placeholder="Enter email" value={this.state.email} onChange={this.handleEmailChange} required readOnly/>
            <Form.Text className="text-muted">
              You cannot change your email
            </Form.Text>
          </Form.Group>
          <Form.Group controlId="phone">
            <Form.Label>Phone number</Form.Label>
            <Form.Control type="text" placeholder="Enter phone number" value={this.state.phone} onChange={this.handlePhoneChange} required/>
          </Form.Group>
          <Form.Group controlId="key">
            <Form.Label>Oanda API key</Form.Label>
            <Form.Control type="password" placeholder="Enter API key" value={this.state.oanda_api_key} onChange={this.handleKeyChange} required/>
          </Form.Group>
          <Form.Group controlId="account">
            <Form.Label>Account ID</Form.Label>
            <Form.Control type="text" placeholder="Enter account ID" value={this.state.accountId} onChange={this.handleAccountChange} required/>
          </Form.Group>
          <Form.Group controlId="password">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" placeholder="Password" value={this.state.password} onChange={this.handlePwChange}/>
          </Form.Group>
          <Button variant="primary" type="submit">
            Save
          </Button>
        </Form>
      </Card>
    )
  }
}

export default withRouter(Settings);
