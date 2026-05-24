"use client";

import { useEffect, useState } from "react";
import { statsApi } from "@/lib/supabase-queries";

interface Stats {
  totalPrompts: number;
  totalLists: number;
  totalViews: number;
  totalLikes: number;
}

interface LiveStatsProps {
  initialStats: Stats;
}

export default function LiveStats({ initialStats }: LiveStatsProps) {
  const [stats, setStats] = useState<Stats>(initialStats);

  useEffect(() => {
    // Fetch live stats on component mount
    const fetchLiveStats = async () => {
      try {
        const liveData = await statsApi.getHomepageStats();
        if (liveData) {
          setStats(liveData);
        }
      } catch (err) {
        console.error("Error fetching live stats:", err);
      }
    };

    fetchLiveStats();
  }, []);

  return (
    <section className="py-6 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {/* Total Prompts */}
          <div className="bg-gray-50 rounded-xl p-6 text-center border border-gray-200 hover:border-gray-300 transition-colors">
            <div className="text-3xl md:text-4xl font-bold text-black mb-2">
              {stats.totalPrompts.toLocaleString()}+
            </div>
            <div className="text-sm text-gray-600">
              ready to use free prompts
            </div>
          </div>
          {/* Total Lists */}
          <div className="bg-gray-50 rounded-xl p-6 text-center border border-gray-200 hover:border-gray-300 transition-colors">
            <div className="text-3xl md:text-4xl font-bold text-black mb-2">
              {stats.totalLists.toLocaleString()}+
            </div>
            <div className="text-sm text-gray-600">
              groupped prompt lists
            </div>
          </div>
          {/* Total Views */}
          <div className="bg-gray-50 rounded-xl p-6 text-center border border-gray-200 hover:border-gray-300 transition-colors">
            <div className="text-3xl md:text-4xl font-bold text-black mb-2">
              {stats.totalViews.toLocaleString()}+
            </div>
            <div className="text-sm text-gray-600">
              viewed prompt contents
            </div>
          </div>
          {/* Total Likes */}
          <div className="bg-gray-50 rounded-xl p-6 text-center border border-gray-200 hover:border-gray-300 transition-colors">
            <div className="text-3xl md:text-4xl font-bold text-black mb-2">
              {stats.totalLikes.toLocaleString()}+
            </div>
            <div className="text-sm text-gray-600">
              liked prompts
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
