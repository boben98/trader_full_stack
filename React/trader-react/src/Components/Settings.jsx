import React, { Component } from "react";
import { Form , Button, Card, Row } from "react-bootstrap";
import { Link, withRouter  } from "react-router-dom";

class Settings extends Component {
  constructor() {
    super();
    this.state = {
      balance: Number,
      instrument: String,
      granularity: String,
      units: Number,
      MAperiod1: Number,
      MAperiod2: Number,
      marginRatio: Number,
      trailValue: Number,
      trailWait: Number,
    };   

    this.handleInstrumentChange = this.handleInstrumentChange.bind(this);
    this.handleGranularityChange = this.handleGranularityChange.bind(this);
    this.handleUnitsChange = this.handleUnitsChange.bind(this);
    this.handleMA1Change = this.handleMA1Change.bind(this);
    this.handleMA2Change = this.handleMA2Change.bind(this);
    this.handleMarginRatioChange = this.handleMarginRatioChange.bind(this);
    this.handleTrailValueChange = this.handleTrailValueChange.bind(this);
    this.handleTrailWaitChange = this.handleTrailWaitChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  };   

  handleInstrumentChange(event) {
    event.preventDefault();
    this.setState({instrument: event.target.value});
  }

  handleGranularityChange(event) {
    event.preventDefault();
    this.setState({granularity: event.target.value});
  }

  handleUnitsChange(event) {
    event.preventDefault();
    this.setState({units: event.target.value});
  }

  handleMA1Change(event) {
    event.preventDefault();
    this.setState({MAperiod1: event.target.value});
  }

  handleMA2Change(event) {
    event.preventDefault();
    this.setState({MAperiod2: event.target.value});
  }

  handleMarginRatioChange(event) {
    event.preventDefault();
    this.setState({marginRatio: event.target.value});
  }

  handleTrailValueChange(event) {
    event.preventDefault();
    this.setState({trailValue: event.target.value});
  }

  handleTrailWaitChange(event) {
    event.preventDefault();
    this.setState({trailWait: event.target.value});
  }

  handleSubmit(event) {
    event.preventDefault();
    fetch("http://localhost:3001/algo/save", 
      { method: "POST", body: 
            new URLSearchParams({
              balance: this.state.balance,
              instrument: this.state.instrument, 
              granularity: this.state.granularity, 
              units: this.state.units, 
              MAperiod1: this.state.MAperiod1, 
              MAperiod2: this.state.MAperiod2,
              marginRatio: this.state.marginRatio,
              trailValue: this.state.trailValue,
              trailWait: this.state.trailWait,
            }),
          headers: new Headers({Authorization: "Bearer " + this.props.token})        
        })
      .then((res) => res.json())
      .then((res) => {
          this.props.history.push('/dashboard');                
      });    
  } 

  componentDidMount() {
    fetch("http://localhost:3001/algo", { headers: new Headers({Authorization: "Bearer " + this.props.token})})
      .then((res) => res.json())
      .then((algo) => {
        this.setState(algo);
      });
    fetch("http://localhost:3001/account", { headers: new Headers({Authorization: "Bearer " + this.props.token})})
      .then((res) => res.json())
      .then((account) => {
        this.setState({
          balance: account.balance,          
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
          <Form.Group controlId="balance">
            <Form.Label>Balance</Form.Label>
            <Form.Control type="number" placeholder="Balance in EUR" value={this.state.balance} readonly/>
          </Form.Group>
          <Form.Group controlId="instrument">
            <Form.Label>Instrument </Form.Label>
            <Form.Control type="text" placeholder="e.g. EUR_USD" value={this.state.instrument} onChange={this.handleInstrumentChange} required/>
          </Form.Group>
          <Form.Group controlId="granularity">
            <Form.Label>Granularity</Form.Label>
            <Form.Control type="text" placeholder="e.g. H1" value={this.state.granularity} onChange={this.handleGranularityChange} required/>
          </Form.Group>
          <Form.Group controlId="units">
            <Form.Label>Transaction units</Form.Label>
            <Form.Control type="number" placeholder="" value={this.state.units} onChange={this.handleUnitsChange} required/>
          </Form.Group>
          <Form.Group controlId="MA1">
            <Form.Label>Shorter moving average</Form.Label>
            <Form.Control type="number" placeholder="" value={this.state.MAperiod1} onChange={this.handleMA1Change} required/>
          </Form.Group>
          <Form.Group controlId="MAperiod2">
            <Form.Label>Longer moving average</Form.Label>
            <Form.Control type="number" placeholder="" value={this.state.MAperiod2} onChange={this.handleMA2Change} required/>
          </Form.Group>
          <Form.Group controlId="marginRatio">
            <Form.Label>Margin ratio</Form.Label>
            <Form.Control type="number" placeholder="" value={this.state.marginRatio} onChange={this.handleMarginRatioChange} required/>
          </Form.Group>
          <Form.Group controlId="trailValue">
            <Form.Label>Trailing stop distance</Form.Label>
            <Form.Control type="number" placeholder="Distance in points" value={this.state.trailValue} onChange={this.handleTrailValueChange} required/>
          </Form.Group>
          <Form.Group controlId="trailWait">
            <Form.Label>Trailwait time in candles</Form.Label>
            <Form.Control type="number" placeholder="" value={this.state.trailWait} onChange={this.handleTrailWaitChange} required/>
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
