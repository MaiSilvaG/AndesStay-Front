import React from "react";
import { BarList, Card, Title } from "@tremor/react";

const data = [
  { name: "habitacion", value: 25, color: "amber" },
  { name: "cabaña", value: 15, color: "indigo" }
];

const BarListDash = () => {
  return (
    <Card className="pt-10">
      <Title>Tipos de Hospedaje</Title>
      <div className="w-full mt-4">
        <BarList data={data} sortOrder="ascending" className="mt-4" />
      </div>
    </Card>
  );
};

export default BarListDash;