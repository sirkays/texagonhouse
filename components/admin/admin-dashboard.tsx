"use client";

import {useState, useEffect} from "react";
import {AdminOverview} from "./admin-overview";

export function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard");
  return <AdminOverview />;
}
