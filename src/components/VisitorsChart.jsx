"use client";
import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQteU8LxBP5FXPTN1WnnSD7XB4PXDnbaRyvH80NtapccDDIObryU83KBK8B6XLJPGLPw_uMwlW_wWJD/pub?output=csv"; // Replace with your link

export default function VisitorsChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    Papa.parse(CSV_URL, {
      download: true,
      header: true,
      complete: (result) => {
        const parsed = result.data
          .filter((row) => row.Date && row.Minutes) // filter out empty rows
          .map((row) => ({
            date: row.Date,
            minutes: parseInt(row.Minutes),
          }));
        setData(parsed);
      },
    });
  }, []);

  return (
    <div className="min-w-[800px] h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="minutes"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}