import React, { Component } from "react";
import { Card, Row, Col } from "react-bootstrap";

class Dashboard extends Component {
  render() {
    return (
      <Card
        style={{
          marginTop: "1em",
          padding: "1em",
        }}
      >
        <Row
          style={{
            display: "flex",
            justifyContent: "space-around",
          }}
        >
          <Col lg="3" md="6" sm="6">
            <Card>
              <Card.Body>
                <Row>
                  <Col md="4" xs="5">
                    <div className="icon-big text-center icon-warning">
                      <i className="nc-icon nc-money-coins text-success" />
                    </div>
                  </Col>
                  <Col md="8" xs="7">
                    <div className="numbers">
                      <p className="card-category">Balance</p>
                      <Card.Title tag="p">$ 123,345</Card.Title>
                      <p />
                    </div>
                  </Col>
                </Row>
              </Card.Body>
              <Card.Footer>
                <div className="stats">
                  <i className="far fa-calendar" /> Current
                </div>
              </Card.Footer>
            </Card>
          </Col>
          <Col lg="3" md="6" sm="6">
            <Card>
              <Card.Body>
                <Row>
                  <Col md="4" xs="5">
                    <div className="icon-big text-center icon-warning">
                      <i className="nc-icon nc-money-coins text-success" />
                    </div>
                  </Col>
                  <Col md="8" xs="7">
                    <div className="numbers">
                      <p className="card-category">Profit</p>
                      <Card.Title tag="p">$ 1,345</Card.Title>
                      <p />
                    </div>
                  </Col>
                </Row>
              </Card.Body>
              <Card.Footer>
                <div className="stats">
                  <i className="far fa-calendar" /> Last week
                </div>
              </Card.Footer>
            </Card>
          </Col>
          <Col lg="3" md="6" sm="6">
            <Card className="card-stats">
              <Card.Body>
                <Row>
                  <Col md="4" xs="5">
                    <div className="icon-big text-center icon-warning">
                      <i className="nc-icon nc-vector text-danger" />
                    </div>
                  </Col>
                  <Col md="8" xs="7">
                    <div className="numbers">
                      <p className="card-category">Orders</p>
                      <Card.Title tag="p">13</Card.Title>
                      <p />
                    </div>
                  </Col>
                </Row>
              </Card.Body>
              <Card.Footer>
                <div className="stats">
                  <i className="far fa-clock" /> Last week
                </div>
              </Card.Footer>
            </Card>
          </Col>
        </Row>
      </Card>
    );
  }
}

export default Dashboard;
