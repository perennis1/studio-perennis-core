"use client";
import { useEffect, useState } from "react";
import { fetchFromAPI } from "@/lib/api";

export default function TestAPI() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function getData() {
      try {
        const result = await fetchFromAPI("/api/test"); // assuming your backend has /api/test
        setData(result);
      } catch (err) {
        console.error(err);
      }
    }
    getData();
  }, []);

  return (
    <div className="p-10 text-white">
      <h1 className="text-2xl font-bold">Backend Test</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
