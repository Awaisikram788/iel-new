import React from "react";
import { Routes, Route } from "react-router-dom";
import { Dashboard } from "./components/Dashboard";
import { StockDifferenceTable } from "./components/DifferenceView";

function App() {
  // return <Dashboard />;
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/difference" element={<StockDifferenceTable />} />
    </Routes>
  );
}

export default App;
