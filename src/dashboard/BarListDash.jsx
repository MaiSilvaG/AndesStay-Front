import React from "react";
import { BarList, Card, Title } from "@tremor/react";
import './dashboard.css'
const data = [
  { name: "habitacion", value: 25, color: "amber" },
  { name: "cabaña", value: 15, color: "indigo" }
];

const BarListDash = () => {
  return (
    <Card className="borde">
      <Title>Tipos de Hospedaje</Title>
      <div>
        <BarList data={data} sortOrder="ascending" className="barra" />
      </div>
    </Card>
  );
};

export default BarListDash;