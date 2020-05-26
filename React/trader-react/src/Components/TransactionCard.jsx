import React, { Component } from "react";
import { Card, Row, Col } from "react-bootstrap";

const TransactionCard = ({ tran }) => {
  return (
    <Card
      key={tran.id}
      style={{
        backgroundColor: tran.profit >= 0 ? "#90ff90e6" : "#ff3333cc",
      }}
    >
      <Card.Body>
        <Row>
          <Col>
            <b>Instrument</b>
          </Col>
          <Col>
            <b>Time</b>
          </Col>
          <Col>
            <b>Type</b>
          </Col>
          <Col>
            <b>Profit</b>
          </Col>
        </Row>
        <Row>
          <Col>{tran.instrument}</Col>
          <Col>{tran.time}</Col>
          <Col>{tran.tranType}</Col>
          <Col>{tran.profit}</Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default TransactionCard;
