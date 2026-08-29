"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import AdminShell from "@/components/AdminShell";

export default function DashboardPage() {
  const [stats, setStats] = useState({ total: 0, publish: 0, draft: 0 });

  useEffect(() => {
    async function fetchStats() {
      const { data } = await supabase.from("kegiatan").select("status");
      if (data) {
        setStats({
          total: data.length,
          publish: data.filter((d) => d.status === "publish").length,
          draft: data.filter((d) => d.status === "draft").length,
        });
      }
    }
    fetchStats();
  }, []);

  const cards = [
    { label: "Total Kegiatan", value: stats.total },
    { label: "Sudah Publish", value: stats.publish },
    { label: "Draft", value: stats.draft },
  ];

  return (
    <AdminShell>
      <h1 className="text-xl font-bold text-gray-800 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-2xl shadow p-5">
            <p className="text-sm text-gray-500">{c.label}</p>
            <p className="text-3xl font-bold text-dprd-red mt-1">{c.value}</p>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
