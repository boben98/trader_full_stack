import React, { Component } from "react";
import { Card, Row, Col } from "react-bootstrap";
import TransactionCard from "./TransactionCard";

class Dashboard extends Component {
  constructor() {
    super();
    this.state = {
      currency: String,
      balance: Number,
      profit: Number,
      openPositionCount: Number,
      transactionsLastWeek: Number,
      transactions: [
        {
          id: Number,
          instrument: String,
          time: String,
          tranType: "BUY" | "SELL",
          profit: Number,
        },
      ],
    };
  }

  componentDidMount() {
    fetch("http://localhost:3001/account")
      .then((res) => res.json())
      .then((account) => {
        this.setState({
          currency: account.currency,
          balance: account.balance,
          profit: account.pl,
          openPositionCount: account.openPositionCount,
        });
        console.log("Acc ", this.state);
      });
    fetch("http://localhost:3001/transactions/100")
      .then((res) => res.json())
      .then((transactions) => {
        let count = transactions.filter((t) =>
          this.compareTimes(t.time, new Date().toISOString(), 7)
        ).length;
        let trans = transactions.map((tran) => {
          let date = new Date(tran.time);
          return {
            id: tran.id,
            instrument: tran.instrument,
            time: `${date.toLocaleDateString()} ${date.getHours()}:${date.getMinutes()}`,
            tranType: tran.units > 0 ? "BUY" : "SELL",
            profit: tran.pl,
          };
        });
        this.setState({
          transactionsLastWeek: count,
          transactions: trans,
        });
        console.log("Tran ", this.state);
      });
  }

  compareTimes = (timeEarly, timeLater, dayDifference) => {
    if (typeof timeEarly === "undefined") return true;
    return this.dateDiffInDays(timeEarly, timeLater) < dayDifference - 1;
  };

  //source: w3resource
  dateDiffInDays = (date1, date2) => {
    let dt1 = new Date(date1);
    let dt2 = new Date(date2);
    return Math.floor(
      (Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) -
        Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate())) /
        (1000 * 60 * 60 * 24)
    );
  };

  render() {
    const {
      currency,
      balance,
      profit,
      openPositionCount,
      transactionsLastWeek,
      transactions,
    } = this.state;
    return (
      <Card
        style={{
          marginTop: "1em",
          marginBottom: "1em",
          padding: "1em",
        }}
      >
        <Row className="d-flex justify-content-around">
          <Col lg="3" md="6" sm="6">
            <Card
              style={{
                marginTop: "1em",
                marginBottom: "1em",
              }}
            >
              <Card.Body>
                <Row>
                  <Col>
                    <div className="numbers">
                      <p className="card-category">Balance</p>
                      <Card.Title tag="p">{`${currency} ${balance}`}</Card.Title>
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
            <Card
              style={{
                marginTop: "1em",
                marginBottom: "1em",
              }}
            >
              <Card.Body>
                <Row>
                  <Col>
                    <div className="numbers">
                      <p className="card-category">Profit</p>
                      <Card.Title tag="p">{`${currency} ${profit}`}</Card.Title>
                      <p />
                    </div>
                  </Col>
                </Row>
              </Card.Body>
              <Card.Footer>
                <div className="stats">
                  <i className="far fa-calendar" /> All time
                </div>
              </Card.Footer>
            </Card>
          </Col>
          <Col lg="3" md="6" sm="6">
            <Card
              style={{
                marginTop: "1em",
                marginBottom: "1em",
              }}
            >
              <Card.Body>
                <Row>
                  <Col>
                    <div className="numbers">
                      <p className="card-category">Transactions</p>
                      <Card.Title tag="p">{transactionsLastWeek}</Card.Title>
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
          <Col lg="3" md="6" sm="6">
            <Card
              style={{
                marginTop: "1em",
                marginBottom: "1em",
              }}
            >
              <Card.Body>
                <Row>
                  <Col>
                    <div className="numbers">
                      <p className="card-category">Open positions</p>
                      <Card.Title tag="p">{openPositionCount}</Card.Title>
                      <p />
                    </div>
                  </Col>
                </Row>
              </Card.Body>
              <Card.Footer>
                <div className="stats">
                  <i className="far fa-clock" /> Current
                </div>
              </Card.Footer>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col>
            <Card
              style={{
                marginTop: "1em",
                marginBottom: "1em",
                padding: "1em",
              }}
            >
              <Card.Title>All transactions</Card.Title>
              <Card.Body>
                {transactions.map((tran) => {
                  return <TransactionCard tran={tran}></TransactionCard>;
                })}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Card>
    );
  }
}

export default Dashboard;
