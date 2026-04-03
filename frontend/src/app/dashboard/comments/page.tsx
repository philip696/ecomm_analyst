"use client";
/**
 * Comments & Reviews analytics page – sentiment, word frequency, themes.
 */
import { useEffect, useState } from "react";
import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { ThumbsUp, ThumbsDown, Minus, Star } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import KpiCard from "@/components/KpiCard";
import { commentsApi } from "@/lib/api";

const SENTIMENT_COLORS: Record<string, string> = {
  positive: "#10b981",
  neutral: "#f59e0b",
  negative: "#ef4444",
};

export default function CommentsPage() {
  const [positive, setPositive] = useState<{ author: string; text: string; rating: number; product_id: number }[]>([]);
  const [negative, setNegative] = useState<{ author: string; text: string; rating: number; product_id: number }[]>([]);
  const [sentiment, setSentiment] = useState<{ sentiment: string; count: number; avg_rating: number }[]>([]);
  const [words, setWords] = useState<{ word: string; count: number }[]>([]);
  const [themes, setThemes] = useState<{ praise_themes: { theme: string; count: number }[]; complaint_themes: { theme: string; count: number }[] }>({
    praise_themes: [],
    complaint_themes: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      commentsApi.topPositive(5),
      commentsApi.topNegative(5),
      commentsApi.sentimentSummary(),
      commentsApi.wordFrequency(undefined, 15),
      commentsApi.themes(),
    ]).then(([p, n, s, w, t]) => {
      console.log("Comments API raw responses:", { p, n, s, w, t });
      
      try {
        // Helper function to safely extract array data
        const extractArray = (response: any): any[] => {
          if (!response) return [];
          if (Array.isArray(response)) return response;
          if (response.data && Array.isArray(response.data)) return response.data;
          return [];
        };

        // Helper function to safely extract object data
        const extractObject = (response: any, defaultObj: any): any => {
          if (!response) return defaultObj;
          if (response.data && typeof response.data === 'object') return response.data;
          if (typeof response === 'object') return response;
          return defaultObj;
        };

        const posData = extractArray(p);
        const negData = extractArray(n);
        const sentData = extractArray(s);
        const wordData = extractArray(w);
        const themeData = extractObject(t, { praise_themes: [], complaint_themes: [] });

        console.log("Comments extracted data:", { posData, negData, sentData, wordData, themeData });

        // Validate extracted data
        setPositive(Array.isArray(posData) ? posData : []);
        setNegative(Array.isArray(negData) ? negData : []);
        setSentiment(Array.isArray(sentData) ? sentData : []);
        setWords(Array.isArray(wordData) ? wordData : []);
        
        // Ensure theme data has the right structure
        const validThemes = {
          praise_themes: Array.isArray(themeData?.praise_themes) ? themeData.praise_themes : [],
          complaint_themes: Array.isArray(themeData?.complaint_themes) ? themeData.complaint_themes : [],
        };
        setThemes(validThemes);
        setLoading(false);
      } catch (parseErr) {
        console.error("Error parsing comments data:", parseErr);
        setLoading(false);
      }
    }).catch((err) => {
      console.error("Comments data fetch error:", err);
      setLoading(false);
    });
  }, []);

  const totalReviews = sentiment.reduce((s, d) => s + (d.count || 0), 0);
  const posCount = sentiment.find((s) => s.sentiment === "positive")?.count ?? 0;

  return (
    <div>
      <PageHeader title="Comments & Reviews" description="Customer feedback and sentiment analysis" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard title="Total Reviews" value={totalReviews} icon={Star} iconColor="bg-amber-500" />
        <KpiCard title="Positive Reviews" value={posCount} icon={ThumbsUp} iconColor="bg-emerald-500" />
        <KpiCard title="Negative Reviews" value={sentiment.find((s) => s.sentiment === "negative")?.count ?? 0} icon={ThumbsDown} iconColor="bg-red-500" />
        <KpiCard title="Neutral Reviews" value={sentiment.find((s) => s.sentiment === "neutral")?.count ?? 0} icon={Minus} iconColor="bg-slate-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Sentiment Pie */}
        <div className="card">
          <h2 className="text-base font-semibold text-slate-700 mb-4">Sentiment Distribution</h2>
          {Array.isArray(sentiment) && sentiment.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={sentiment} dataKey="count" nameKey="sentiment" cx="50%" cy="50%" outerRadius={80}>
                    {sentiment.map((entry, i) => (
                      <Cell key={i} fill={SENTIMENT_COLORS[entry.sentiment] || "#94a3b8"} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-2">
                {sentiment.map((s) => (
                  <div key={s.sentiment} className="flex items-center gap-1.5 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: SENTIMENT_COLORS[s.sentiment] || "#94a3b8" }} />
                    <span className="capitalize text-slate-600">{s.sentiment} ({s.count})</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-500 py-12 text-center">No sentiment data available</p>
          )}
        </div>

        {/* Word Frequency */}
        <div className="card lg:col-span-2">
          <h2 className="text-base font-semibold text-slate-700 mb-4">Most Frequent Words</h2>
          {Array.isArray(words) && words.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={words.slice(0, 12)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="word" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" name="Frequency" fill="#4f6ef7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-500 py-12 text-center">No word frequency data available</p>
          )}
        </div>
      </div>

      {/* Top Comments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card">
          <h2 className="text-base font-semibold text-emerald-600 mb-4">Top 5 Positive Reviews</h2>
          <div className="space-y-3">
            {Array.isArray(positive) && positive.length > 0 ? (
              positive.map((c, i) => (
                <div key={i} className="bg-emerald-50 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-600">{c.author || 'Anonymous'}</span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: c.rating || 0 }).map((_, j) => (
                        <Star key={j} className="w-3 h-3 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-slate-700">{c.text}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 py-6 text-center">No positive reviews</p>
            )}
          </div>
        </div>

        <div className="card">
          <h2 className="text-base font-semibold text-red-500 mb-4">Top 5 Negative Reviews</h2>
          <div className="space-y-3">
            {Array.isArray(negative) && negative.length > 0 ? (
              negative.map((c, i) => (
                <div key={i} className="bg-red-50 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-600">{c.author || 'Anonymous'}</span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: c.rating || 0 }).map((_, j) => (
                        <Star key={j} className="w-3 h-3 fill-red-400 text-red-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-slate-700">{c.text}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 py-6 text-center">No negative reviews</p>
            )}
          </div>
        </div>
      </div>

      {/* Themes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-base font-semibold text-slate-700 mb-4">Praise Themes</h2>
          <div className="space-y-2">
            {Array.isArray(themes?.praise_themes) && themes.praise_themes.length > 0 ? (
              themes.praise_themes.map((t, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700 capitalize">{t.theme}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-slate-100 rounded-full h-2">
                      <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${Math.min(t.count * 8, 100)}%` }} />
                    </div>
                    <span className="text-xs text-slate-400 w-6 text-right">{t.count}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 py-4 text-center">No praise themes</p>
            )}
          </div>
        </div>
        <div className="card">
          <h2 className="text-base font-semibold text-slate-700 mb-4">Complaint Themes</h2>
          <div className="space-y-2">
            {Array.isArray(themes?.complaint_themes) && themes.complaint_themes.length > 0 ? (
              themes.complaint_themes.map((t, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700 capitalize">{t.theme}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-slate-100 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{ width: `${Math.min(t.count * 8, 100)}%` }} />
                    </div>
                    <span className="text-xs text-slate-400 w-6 text-right">{t.count}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 py-4 text-center">No complaint themes</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
