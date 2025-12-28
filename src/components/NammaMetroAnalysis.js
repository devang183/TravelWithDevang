'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  TrendingUp, Users, CreditCard, Ticket, QrCode, Calendar,
  Clock, Activity, Award, ArrowUp, ArrowDown, Minus, Zap, Target, Newspaper
} from 'lucide-react';
import NammaMetroSyncDashboard from './NammaMetroSyncDashboard';

const NammaMetroAnalysis = () => {
  // State management
  const [metroData, setMetroData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState('overview');
  const [dateRange, setDateRange] = useState('overall'); // Show all data by default
  const [forecastDays, setForecastDays] = useState('30'); // Prediction range
  const [hoveredMonth, setHoveredMonth] = useState(null); // Track hovered month segment
  const [pinnedMonth, setPinnedMonth] = useState(null); // Track clicked/pinned month

  // Historical context for each month
  const monthlyContext = {
    '2024-10': {
      color: '#3B82F6',
      title: 'October 2024: Building Momentum',
      description: 'Full operational status of Purple Line (Whitefield to Challaghatta) drove consistent growth. Daily ridership averaged 7.58 lakh as network matured.',
      highlights: [
        'Average: 758,000 daily riders',
        'Purple Line fully operational (Whitefield-Challaghatta)',
        'Steady weekday commuter growth pattern'
      ]
    },
    '2024-11': {
      color: '#10B981',
      title: 'November 2024: Green Line Extension',
      description: 'Nov 7: Green Line extended from Nagasandra to Madavara (3.7 km), adding 3 new stations. Improved BIEC access and added 6,500 daily passengers.',
      highlights: [
        'Nov 7: Green Line extension opened (3.7 km)',
        'New stations: Manjunathnagar, Chikkabidarakallu, Madavara',
        '+6,500 daily passengers from new corridor'
      ]
    },
    '2024-12': {
      color: '#8B5CF6',
      title: 'December 2024: Record-Breaking',
      description: 'Dec 6: Single-day record of 9.2 lakh passengers driven by major concert at Madavara that caused complete road gridlock. Metro became only viable transport option.',
      highlights: [
        'Dec 6: Record 920,000 riders in single day',
        'Madavara concert drove massive surge',
        'Road gridlock made metro essential'
      ]
    },
    '2025-01': {
      color: '#F59E0B',
      title: 'January 2025: Peak Performance',
      description: 'Sustained high ridership with peak days approaching 9 lakh. Strong start to 2025 as commuters increasingly adopted metro for daily travel.',
      highlights: [
        'Peak days: ~900,000 riders',
        'Consistent high weekday ridership',
        'Strong metro adoption trend'
      ]
    },
    '2025-02': {
      color: '#EF4444',
      title: 'February 2025: Fare Hike Crisis',
      description: 'Feb 9: Controversial fare hike (up to 100% on some routes) caused immediate ~1 lakh daily drop. Feb 14: Government intervened, capping increase at 71%. Slow recovery began.',
      highlights: [
        'Feb 9: Fare hike implemented (up to 100%)',
        'Immediate drop of ~100,000 daily riders',
        'Feb 14: Hike capped at 71% after intervention'
      ]
    },
    '2025-03': {
      color: '#EC4899',
      title: 'March 2025: Summer Heat Recovery',
      description: 'Extreme summer heat (40°C+) pushed 2.24 crore monthly passengers to AC-comfort of metro. Gradual recovery from fare hike shock as value proposition strengthened.',
      highlights: [
        '22.4 million monthly riders despite fare hike',
        'Summer heat drove AC metro preference',
        'Slow recovery from February crisis'
      ]
    },
    '2025-04': {
      color: '#14B8A6',
      title: 'April 2025: Steady Recovery',
      description: 'Ridership continued gradual recovery as commuters adjusted to new fare structure. Recognition of metro value vs road congestion and fuel costs.',
      highlights: [
        'Continued recovery from fare hike',
        'Fare structure acceptance growing',
        'Metro value proposition resonating'
      ]
    },
    '2025-05': {
      color: '#F97316',
      title: 'May 2025: Sustained Growth',
      description: 'Recovery momentum sustained through May. Metro increasingly became preferred choice for commuters despite higher fares, driven by reliability and time savings.',
      highlights: [
        'Sustained recovery momentum',
        'Metro preference solidifying',
        'Reliability driving adoption'
      ]
    },
    '2025-06': {
      color: '#06B6D4',
      title: 'June 2025: RCB Breakthrough',
      description: 'June 4: RCB IPL victory celebrations caused massive spike to 9.66 lakh riders. Cubbon Park and Vidhana Soudha stations briefly closed due to overwhelming crowds.',
      highlights: [
        'June 4: 966,000 riders (RCB IPL victory)',
        'Stations briefly closed due to crowd surge',
        'Largest crowd management challenge'
      ]
    },
    '2025-07': {
      color: '#8B5CF6',
      title: 'July 2025: Pre-Yellow Line',
      description: 'Anticipation building for Yellow Line launch. Stable ridership maintained around 8.5-9 lakh daily as existing network operated at high utilization.',
      highlights: [
        'Stable 850,000-900,000 daily ridership',
        'Yellow Line launch anticipation',
        'Network operating at high capacity'
      ]
    },
    '2025-08': {
      color: '#DC2626',
      title: 'August 2025: Historic Milestone',
      description: 'Aug 10: Yellow Line (R.V. Road to Bommasandra, 19 km) inaugurated by PM Modi. Aug 11: First-ever 1M+ day (1,048,031). Aug 14: All-time record 1,082,394. Yellow Line added 52,215 riders on day 1.',
      highlights: [
        'Aug 10: Yellow Line inaugurated by PM Modi',
        'Aug 11: First 1M+ day (1,048,031 riders)',
        'Aug 14: All-time record 1,082,394 riders',
        'Yellow Line: 52,215 riders on day 1'
      ]
    },
    '2025-09': {
      color: '#7C3AED',
      title: 'September 2025: Stabilization',
      description: 'Post-Yellow Line launch, ridership stabilized around 9.5-10 lakh daily. New network integration complete as commuters adapted to expanded reach.',
      highlights: [
        'Stable 950,000-1M daily ridership',
        'Yellow Line integration successful',
        'Network expansion absorbed smoothly'
      ]
    },
    '2025-10': {
      color: '#059669',
      title: 'October 2025: Festival Rush',
      description: 'Oct 7: Post-festive return surge hit 1,009,970 riders. Oct 23: Massive post-Deepavali rush with 5 AM queues at Majestic & Yeshwantpur as people returned to city.',
      highlights: [
        'Oct 7: 1,009,970 riders (post-festive return)',
        'Oct 23: Post-Deepavali massive crowds',
        '5 AM queues at Majestic & Yeshwantpur hubs'
      ]
    },
    '2025-11': {
      color: '#D97706',
      title: 'November 2025: Consistent Million',
      description: 'Weekday boardings consistently crossed 1 million mark. Yellow Line averaged 60,000+ daily, reducing Hosur Road congestion by 37% according to traffic studies.',
      highlights: [
        'Consistent 1M+ weekday ridership',
        'Yellow Line: 60,000+ daily average',
        'Hosur Road traffic reduced by 37%'
      ]
    },
    '2025-12': {
      color: '#DB2777',
      title: 'December 2025: New Normal',
      description: 'Average weekday boardings stabilized at ~1 million. Metro firmly established as Bengaluru\'s mass transit backbone with 3 operational lines serving diverse corridors.',
      highlights: [
        'Stable 1M daily average established',
        'Mass transit system matured',
        '3 operational lines serving city'
      ]
    }
  };

  // Fetch data from MongoDB
  useEffect(() => {
    fetchMetroData();
  }, []);

  const fetchMetroData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/namma-metro');

      if (!response.ok) {
        throw new Error('Failed to fetch metro data');
      }

      const data = await response.json();
      setMetroData(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching metro data:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  // Get month context (static data only)
  const getMonthContext = (monthKey) => {
    const staticContext = monthlyContext[monthKey] || {};

    return {
      color: staticContext.color || '#3B82F6',
      title: staticContext.title || `${monthKey}: Data Available`,
      description: staticContext.description || 'Analyzing ridership patterns...',
      highlights: staticContext.highlights || ['Data being analyzed']
    };
  };

  // Parse date from DD-MM-YYYY format
  const parseDate = (dateStr) => {
    const [day, month, year] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  // Calculate days since October 26, 2024
  const calculateDaysSinceStart = () => {
    const startDate = new Date(2024, 9, 26); // Oct 26, 2024 (month is 0-indexed)
    const today = new Date();
    return Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
  };

  // Process and analyze data
  const analytics = useMemo(() => {
    if (!metroData || metroData.length === 0) return null;

    // Sort data chronologically (oldest to newest) first
    const sortedData = [...metroData].sort((a, b) => {
      const dateA = parseDate(a['Record Date']);
      const dateB = parseDate(b['Record Date']);
      return dateA - dateB;
    });

    // Filter by date range - take the last N days (most recent)
    let filteredData;
    if (dateRange === 'overall') {
      // Show all data
      filteredData = sortedData;
      console.log('Showing overall data:', filteredData.length, 'records');
    } else {
      // Take the last N days
      filteredData = sortedData.slice(-parseInt(dateRange));
      console.log(`Showing last ${dateRange} days:`, filteredData.length, 'records');
    }

    // Calculate totals and averages
    const totals = filteredData.reduce((acc, record) => {
      acc.smartCards += record['Total Smart Cards'] || 0;
      acc.tokens += record['Total Tokens'] || 0;
      acc.ncmc += record['Total NCMC'] || 0;
      acc.qr += record['Total QR'] || 0;
      acc.groupTickets += record['Group Ticket'] || 0;
      acc.oneDayPass += record['One Day Pass'] || 0;
      acc.threeDayPass += record['Three Day Pass'] || 0;
      acc.fiveDayPass += record['Five Day Pass'] || 0;
      return acc;
    }, {
      smartCards: 0,
      tokens: 0,
      ncmc: 0,
      qr: 0,
      groupTickets: 0,
      oneDayPass: 0,
      threeDayPass: 0,
      fiveDayPass: 0
    });

    const totalRidership = Object.values(totals).reduce((sum, val) => sum + val, 0);
    const avgDailyRidership = Math.round(totalRidership / filteredData.length);

    // Payment method distribution
    const paymentDistribution = [
      { name: 'Smart Cards', value: totals.smartCards, color: '#3B82F6' },
      { name: 'Tokens', value: totals.tokens, color: '#10B981' },
      { name: 'NCMC', value: totals.ncmc, color: '#F59E0B' },
      { name: 'QR Tickets', value: totals.qr, color: '#8B5CF6' },
      { name: 'Day Passes', value: totals.oneDayPass + totals.threeDayPass + totals.fiveDayPass, color: '#EC4899' },
      { name: 'Group Tickets', value: totals.groupTickets, color: '#14B8A6' }
    ].filter(item => item.value > 0);

    // Daily trends with month grouping
    const dailyTrendsRaw = filteredData.map(record => {
      const date = parseDate(record['Record Date']);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      return {
        date: record['Record Date'],
        monthKey,
        smartCards: record['Total Smart Cards'] || 0,
        tokens: record['Total Tokens'] || 0,
        ncmc: record['Total NCMC'] || 0,
        qr: record['Total QR'] || 0,
        total: (record['Total Smart Cards'] || 0) +
               (record['Total Tokens'] || 0) +
               (record['Total NCMC'] || 0) +
               (record['Total QR'] || 0) +
               (record['Group Ticket'] || 0) +
               (record['One Day Pass'] || 0) +
               (record['Three Day Pass'] || 0) +
               (record['Five Day Pass'] || 0)
      };
    });

    // Aggregate by week for overall view (reduces 307 points to ~44 weekly points)
    const weeklyAggregated = {};
    dailyTrendsRaw.forEach(record => {
      const date = parseDate(record.date);
      // Get the start of the week (Sunday)
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, '0')}-${String(weekStart.getDate()).padStart(2, '0')}`;

      if (!weeklyAggregated[weekKey]) {
        weeklyAggregated[weekKey] = {
          weekKey,
          weekStart: new Date(weekStart),
          monthKey: record.monthKey,
          count: 0,
          smartCards: 0,
          tokens: 0,
          ncmc: 0,
          qr: 0,
          total: 0
        };
      }
      weeklyAggregated[weekKey].count++;
      weeklyAggregated[weekKey].smartCards += record.smartCards;
      weeklyAggregated[weekKey].tokens += record.tokens;
      weeklyAggregated[weekKey].ncmc += record.ncmc;
      weeklyAggregated[weekKey].qr += record.qr;
      weeklyAggregated[weekKey].total += record.total;
    });

    // Convert to array and calculate averages
    const weeklyTrends = Object.values(weeklyAggregated)
      .sort((a, b) => a.weekStart - b.weekStart)
      .map(week => ({
        date: week.weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        monthKey: week.monthKey,
        smartCards: Math.round(week.smartCards / week.count),
        tokens: Math.round(week.tokens / week.count),
        ncmc: Math.round(week.ncmc / week.count),
        qr: Math.round(week.qr / week.count),
        total: Math.round(week.total / week.count)
      }));

    // Use weekly data for overall view, daily for specific ranges and pinned months
    const dailyTrends = (dateRange === 'overall' && !pinnedMonth && !hoveredMonth)
      ? weeklyTrends
      : dailyTrendsRaw;

    // Calculate growth trends
    const recentAvg = dailyTrendsRaw.slice(-7).reduce((sum, d) => sum + d.total, 0) / 7;
    const previousAvg = dailyTrendsRaw.slice(-14, -7).reduce((sum, d) => sum + d.total, 0) / 7;
    const growthRate = ((recentAvg - previousAvg) / previousAvg) * 100;

    // Peak and lowest ridership days (use daily data for accuracy)
    const sortedByRidership = [...dailyTrendsRaw].sort((a, b) => b.total - a.total);
    const peakDay = sortedByRidership[0];
    const lowestDay = sortedByRidership[sortedByRidership.length - 1];

    // Day of week analysis
    const dayOfWeekData = filteredData.reduce((acc, record) => {
      const date = parseDate(record['Record Date']);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

      if (!acc[dayName]) {
        acc[dayName] = { count: 0, total: 0 };
      }

      const dailyTotal = (record['Total Smart Cards'] || 0) +
                        (record['Total Tokens'] || 0) +
                        (record['Total NCMC'] || 0) +
                        (record['Total QR'] || 0) +
                        (record['Group Ticket'] || 0) +
                        (record['One Day Pass'] || 0) +
                        (record['Three Day Pass'] || 0) +
                        (record['Five Day Pass'] || 0);

      acc[dayName].count++;
      acc[dayName].total += dailyTotal;
      return acc;
    }, {});

    const weekdayPattern = Object.entries(dayOfWeekData).map(([day, data]) => ({
      day,
      average: Math.round(data.total / data.count)
    }));

    // Sort by day of week order
    const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    weekdayPattern.sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day));

    return {
      totals,
      totalRidership,
      avgDailyRidership,
      paymentDistribution,
      dailyTrends,
      growthRate,
      peakDay,
      lowestDay,
      weekdayPattern
    };
  }, [metroData, dateRange, parseDate]);


  // Time Series Forecasting Logic
  const predictions = useMemo(() => {
    if (!metroData || metroData.length < 14) return null; // Need at least 2 weeks of data

    const sortedData = [...metroData].sort((a, b) => {
      const dateA = parseDate(a['Record Date']);
      const dateB = parseDate(b['Record Date']);
      return dateA - dateB;
    });

    // Use last 60 days for training (or all data if less)
    const trainingData = sortedData.slice(-60);
    const daysToPredict = parseInt(forecastDays);

    // Helper: Calculate linear trend
    const calculateTrend = (data) => {
      const n = data.length;
      let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

      data.forEach((val, idx) => {
        sumX += idx;
        sumY += val;
        sumXY += idx * val;
        sumX2 += idx * idx;
      });

      const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;

      return { slope, intercept };
    };

    // Helper: Calculate weekly seasonality (Mon-Sun pattern)
    const calculateSeasonality = (data) => {
      const dayTotals = Array(7).fill(0);
      const dayCounts = Array(7).fill(0);

      trainingData.forEach((record, idx) => {
        const date = parseDate(record['Record Date']);
        const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const total = (record['Total Smart Cards'] || 0) +
                     (record['Total Tokens'] || 0) +
                     (record['Total NCMC'] || 0) +
                     (record['Total QR'] || 0) +
                     (record['Group Ticket'] || 0) +
                     (record['One Day Pass'] || 0) +
                     (record['Three Day Pass'] || 0) +
                     (record['Five Day Pass'] || 0);

        dayTotals[dayOfWeek] += total;
        dayCounts[dayOfWeek]++;
      });

      const avgByDay = dayTotals.map((total, idx) =>
        dayCounts[idx] > 0 ? total / dayCounts[idx] : 0
      );

      const overallAvg = avgByDay.reduce((sum, val) => sum + val, 0) / 7;

      // Return seasonality factors (ratio to average)
      return avgByDay.map(avg => overallAvg > 0 ? avg / overallAvg : 1);
    };

    // Extract historical totals
    const historicalTotals = trainingData.map(record =>
      (record['Total Smart Cards'] || 0) +
      (record['Total Tokens'] || 0) +
      (record['Total NCMC'] || 0) +
      (record['Total QR'] || 0) +
      (record['Group Ticket'] || 0) +
      (record['One Day Pass'] || 0) +
      (record['Three Day Pass'] || 0) +
      (record['Five Day Pass'] || 0)
    );

    // Calculate trend and seasonality
    const trend = calculateTrend(historicalTotals);
    const seasonalityFactors = calculateSeasonality(trainingData);

    // Calculate standard deviation for confidence intervals
    const mean = historicalTotals.reduce((sum, val) => sum + val, 0) / historicalTotals.length;
    const variance = historicalTotals.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / historicalTotals.length;
    const stdDev = Math.sqrt(variance);

    // Get last date
    const lastDate = parseDate(trainingData[trainingData.length - 1]['Record Date']);

    // Generate predictions
    const forecastData = [];
    for (let i = 1; i <= daysToPredict; i++) {
      const futureDate = new Date(lastDate);
      futureDate.setDate(lastDate.getDate() + i);

      const dayOfWeek = futureDate.getDay();

      // Trend component
      const trendValue = trend.slope * (trainingData.length + i - 1) + trend.intercept;

      // Seasonal component
      const seasonalFactor = seasonalityFactors[dayOfWeek];

      // Combined forecast
      const predicted = Math.max(0, trendValue * seasonalFactor);

      // Confidence interval (±2 standard deviations = ~95% confidence)
      const confidenceMargin = 2 * stdDev * Math.sqrt(1 + i / trainingData.length);

      // Predict breakdown by payment method (based on historical proportions)
      const lastRecord = trainingData[trainingData.length - 1];
      const lastTotal = historicalTotals[historicalTotals.length - 1];

      const smartCardsRatio = (lastRecord['Total Smart Cards'] || 0) / lastTotal;
      const tokensRatio = (lastRecord['Total Tokens'] || 0) / lastTotal;
      const ncmcRatio = (lastRecord['Total NCMC'] || 0) / lastTotal;
      const qrRatio = (lastRecord['Total QR'] || 0) / lastTotal;

      forecastData.push({
        date: `${String(futureDate.getDate()).padStart(2, '0')}-${String(futureDate.getMonth() + 1).padStart(2, '0')}-${futureDate.getFullYear()}`,
        predicted: Math.round(predicted),
        lower: Math.max(0, Math.round(predicted - confidenceMargin)),
        upper: Math.round(predicted + confidenceMargin),
        smartCards: Math.round(predicted * smartCardsRatio),
        tokens: Math.round(predicted * tokensRatio),
        ncmc: Math.round(predicted * ncmcRatio),
        qr: Math.round(predicted * qrRatio),
      });
    }

    // Calculate model accuracy (MAPE - Mean Absolute Percentage Error)
    const mape = historicalTotals.slice(-7).reduce((sum, actual, idx) => {
      const trainIdx = trainingData.length - 7 + idx;
      const trendPred = trend.slope * trainIdx + trend.intercept;
      const date = parseDate(trainingData[trainingData.length - 7 + idx]['Record Date']);
      const dayOfWeek = date.getDay();
      const predicted = trendPred * seasonalityFactors[dayOfWeek];
      return sum + Math.abs((actual - predicted) / actual) * 100;
    }, 0) / 7;

    return {
      forecastData,
      modelAccuracy: {
        mape: mape.toFixed(2),
        trend: trend.slope > 1 ? 'Growing' : trend.slope < -1 ? 'Declining' : 'Stable',
        confidence: '95%'
      }
    };
  }, [metroData, forecastDays, parseDate]);

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Stat Card Component
  const StatCard = ({ title, value, icon: Icon, trend, color = 'blue' }) => {
    const colorClasses = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      purple: 'from-purple-500 to-purple-600',
      orange: 'from-orange-500 to-orange-600',
      pink: 'from-pink-500 to-pink-600',
      teal: 'from-teal-500 to-teal-600'
    };

    return (
      <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
        <div className="flex items-center justify-between mb-4">
          <div className="bg-white/20 rounded-lg p-3">
            <Icon className="h-6 w-6" />
          </div>
          {trend !== undefined && (
            <div className="flex items-center space-x-1">
              {trend > 0 ? (
                <ArrowUp className="h-4 w-4" />
              ) : trend < 0 ? (
                <ArrowDown className="h-4 w-4" />
              ) : (
                <Minus className="h-4 w-4" />
              )}
              <span className="text-sm font-semibold">
                {Math.abs(trend).toFixed(1)}%
              </span>
            </div>
          )}
        </div>
        <h3 className="text-sm font-medium opacity-90 mb-1">{title}</h3>
        <p className="text-3xl font-bold">{value}</p>
      </div>
    );
  };

  // View Selector Component
  const ViewSelector = () => (
    <div className="flex justify-center space-x-2 mb-8 flex-wrap gap-2">
      {[
        { id: 'overview', label: 'Overview', icon: TrendingUp },
        { id: 'payment', label: 'Payment Methods', icon: CreditCard },
        { id: 'patterns', label: 'Daily Patterns', icon: Activity },
        { id: 'predictions', label: 'Predictions', icon: Zap },
        { id: 'insights', label: 'Insights', icon: Award },
        { id: 'news', label: 'News', icon: Newspaper }
      ].map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => setActiveView(id)}
          className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
            activeView === id
              ? 'bg-blue-500 text-white shadow-lg'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Icon className="h-5 w-5" />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading Metro Analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md">
          <h2 className="text-red-800 text-xl font-bold mb-2">Error Loading Data</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 max-w-md">
          <h2 className="text-yellow-800 text-xl font-bold mb-2">No Data Available</h2>
          <p className="text-yellow-600">Metro ridership data is currently unavailable.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">

        {/* Sync Dashboard */}
        <NammaMetroSyncDashboard />

        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Tracking the Pulse of Bangalore City
          </h1>
          <p className="text-xl text-gray-600">
            Daily Metro Ridership Patterns Unveiled
          </p>
          <div className="mt-4 flex justify-center items-center space-x-4">
            <Calendar className="h-5 w-5 text-blue-600" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7">Last 7 Days</option>
              <option value="14">Last 14 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="60">Last 60 Days</option>
              <option value="90">Last 90 Days</option>
              <option value="120">Last 4 Months</option>
              <option value="180">Last 6 Months</option>
              <option value="240">Last 8 Months</option>
              <option value="365">Last 12 Months</option>
              <option value="overall">Overall (Since Oct 26, 2024)</option>
            </select>
          </div>
        </header>

        {/* View Selector */}
        <ViewSelector />

        {/* Overview Tab */}
        {activeView === 'overview' && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Ridership"
                value={analytics.totalRidership.toLocaleString()}
                icon={Users}
                trend={analytics.growthRate}
                color="blue"
              />
              <StatCard
                title="Avg Daily Ridership"
                value={analytics.avgDailyRidership.toLocaleString()}
                icon={Activity}
                color="green"
              />
              <StatCard
                title="Peak Day"
                value={analytics.peakDay.total.toLocaleString()}
                icon={TrendingUp}
                color="purple"
              />
              <StatCard
                title="Growth Rate"
                value={analytics.growthRate >= 0 ? `+${analytics.growthRate.toFixed(1)}%` : `${analytics.growthRate.toFixed(1)}%`}
                icon={ArrowUp}
                trend={analytics.growthRate}
                color="orange"
              />
            </div>

            {/* Daily Ridership Trend with Monthly Context */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {(dateRange === 'overall' && !pinnedMonth && !hoveredMonth)
                  ? 'Weekly Average Ridership Trend'
                  : 'Daily Ridership Trend'}
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                {(dateRange === 'overall' && !pinnedMonth && !hoveredMonth)
                  ? 'Overall Journey shows weekly averages. Click on a month badge for daily details.'
                  : 'Click on a month badge to pin it, or hover over segments to explore Namma Metro\'s journey'}
              </p>

              {/* Monthly Legend */}
              <div className="flex flex-wrap gap-2 mb-4">
                {/* Overall Button */}
                <button
                  onClick={() => {
                    setPinnedMonth(null);
                    setHoveredMonth(null);
                  }}
                  className={`px-4 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${
                    !pinnedMonth && !hoveredMonth
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {!pinnedMonth && !hoveredMonth && '🌐 '}
                  Overall Journey
                </button>

                {/* Month Badges */}
                {Object.keys(monthlyContext)
                  .filter((monthKey) => analytics.dailyTrends.some(d => d.monthKey === monthKey))
                  .map((monthKey) => {
                    const context = getMonthContext(monthKey);
                    const isPinned = pinnedMonth === monthKey;
                    const isActive = isPinned || hoveredMonth === monthKey;

                    return (
                      <button
                        key={monthKey}
                        onClick={() => setPinnedMonth(isPinned ? null : monthKey)}
                        onMouseEnter={() => !pinnedMonth && setHoveredMonth(monthKey)}
                        onMouseLeave={() => !pinnedMonth && setHoveredMonth(null)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                          isActive
                            ? 'shadow-lg scale-105'
                            : 'opacity-70 hover:opacity-100'
                        } ${isPinned ? 'ring-2 ring-offset-2' : ''}`}
                        style={{
                          backgroundColor: isActive ? context.color : `${context.color}40`,
                          color: isActive ? 'white' : context.color,
                          border: `2px solid ${context.color}`,
                          ringColor: isPinned ? context.color : undefined
                        }}
                      >
                        {isPinned && '📌 '}
                        {new Date(monthKey + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </button>
                    );
                  })}
              </div>

              <ResponsiveContainer width="100%" height={400}>
                <AreaChart
                  data={analytics.dailyTrends}
                  onMouseMove={(e) => {
                    if (!pinnedMonth && e && e.activePayload && e.activePayload[0]) {
                      const monthKey = e.activePayload[0].payload.monthKey;
                      setHoveredMonth(monthKey);
                    }
                  }}
                  onMouseLeave={() => !pinnedMonth && setHoveredMonth(null)}
                >
                  <defs>
                    {/* Default gradient */}
                    <linearGradient id="colorDefault" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#94A3B8" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#94A3B8" stopOpacity={0.05}/>
                    </linearGradient>
                    {/* Create gradients for each month */}
                    {Object.entries(monthlyContext).map(([monthKey, context]) => (
                      <linearGradient key={`gradient-${monthKey}`} id={`colorMonth-${monthKey}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={context.color} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={context.color} stopOpacity={0.1}/>
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        const context = getMonthContext(data.monthKey);
                        const isWeeklyView = dateRange === 'overall' && !pinnedMonth && !hoveredMonth;
                        return (
                          <div className="bg-white p-3 rounded-lg shadow-xl border-2" style={{ borderColor: context.color }}>
                            <p className="font-bold text-gray-900 mb-1">{data.date}</p>
                            <p className="text-lg font-semibold" style={{ color: context.color }}>
                              {data.total.toLocaleString()} {isWeeklyView ? 'avg daily riders' : 'riders'}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />

                  {/* Render base line for all data in muted color */}
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#CBD5E1"
                    strokeWidth={1}
                    dot={false}
                    isAnimationActive={false}
                    name="Total Ridership"
                  />

                  {/* Render each month segment */}
                  {Object.keys(monthlyContext).map((monthKey) => {
                    const monthData = analytics.dailyTrends.filter(d => d.monthKey === monthKey);
                    if (monthData.length === 0) return null;

                    const context = getMonthContext(monthKey);
                    const activeMonth = pinnedMonth || hoveredMonth;
                    const isHighlighted = activeMonth === monthKey;

                    // If this month is highlighted (pinned or hovered), render it with full color and prominence
                    if (isHighlighted) {
                      return (
                        <Area
                          key={`area-${monthKey}`}
                          type="monotone"
                          dataKey="total"
                          data={monthData}
                          stroke={context.color}
                          strokeWidth={4}
                          fillOpacity={0.7}
                          fill={`url(#colorMonth-${monthKey})`}
                          name={context.title}
                          isAnimationActive={false}
                          connectNulls={false}
                          style={{
                            filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.3))',
                            transition: 'all 0.3s ease'
                          }}
                        />
                      );
                    }

                    // Non-hovered months remain subtle
                    return (
                      <Line
                        key={`line-${monthKey}`}
                        type="monotone"
                        dataKey="total"
                        data={monthData}
                        stroke={`${context.color}40`}
                        strokeWidth={1.5}
                        dot={false}
                        isAnimationActive={false}
                        connectNulls={false}
                      />
                    );
                  })}
                </AreaChart>
              </ResponsiveContainer>

              {/* Active Month Context Display */}
              {(pinnedMonth || hoveredMonth) && (() => {
                const activeMonth = pinnedMonth || hoveredMonth;
                const context = getMonthContext(activeMonth);

                return (
                  <div
                    className="mt-3 p-3 rounded-lg transition-all duration-300 animate-fadeIn"
                    style={{
                      backgroundColor: `${context.color}10`,
                      borderLeft: `3px solid ${context.color}`
                    }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <h3 className="font-semibold text-base" style={{ color: context.color }}>
                        {context.title}
                      </h3>
                      {pinnedMonth && (
                        <span className="text-xs px-1.5 py-0.5 rounded-full bg-white bg-opacity-60 text-gray-700 font-medium">
                          📌
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-xs mb-2 leading-relaxed">
                      {context.description}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                      {context.highlights.map((highlight, idx) => (
                        <div key={idx} className="flex items-start space-x-1.5">
                          <span className="text-xs mt-0.5 opacity-60" style={{ color: context.color }}>•</span>
                          <span className="text-xs text-gray-600 leading-snug">{highlight}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Peak and Lowest Days */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center space-x-3 mb-4">
                  <TrendingUp className="h-8 w-8" />
                  <h3 className="text-xl font-bold">Highest Ridership Day</h3>
                </div>
                <p className="text-3xl font-bold mb-2">{analytics.peakDay.date}</p>
                <p className="text-lg opacity-90">{analytics.peakDay.total.toLocaleString()} passengers</p>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center space-x-3 mb-4">
                  <Activity className="h-8 w-8" />
                  <h3 className="text-xl font-bold">Lowest Ridership Day</h3>
                </div>
                <p className="text-3xl font-bold mb-2">{analytics.lowestDay.date}</p>
                <p className="text-lg opacity-90">{analytics.lowestDay.total.toLocaleString()} passengers</p>
              </div>
            </div>
          </div>
        )}

        {/* Payment Methods Tab */}
        {activeView === 'payment' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Pie Chart */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment Method Distribution</h2>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={analytics.paymentDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analytics.paymentDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Payment Stats */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Breakdown</h2>
                <div className="space-y-4">
                  {analytics.paymentDistribution.map((method, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: method.color }}
                        ></div>
                        <span className="font-semibold text-gray-900">{method.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900">{method.value.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">
                          {((method.value / analytics.totalRidership) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Daily Payment Trends */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Daily Payment Method Trends</h2>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={analytics.dailyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="smartCards" stroke="#3B82F6" name="Smart Cards" strokeWidth={2} />
                  <Line type="monotone" dataKey="tokens" stroke="#10B981" name="Tokens" strokeWidth={2} />
                  <Line type="monotone" dataKey="ncmc" stroke="#F59E0B" name="NCMC" strokeWidth={2} />
                  <Line type="monotone" dataKey="qr" stroke="#8B5CF6" name="QR Tickets" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Daily Patterns Tab */}
        {activeView === 'patterns' && (
          <div className="space-y-8">
            {/* Weekday Pattern */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Average Ridership by Day of Week</h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analytics.weekdayPattern}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="average" fill="#3B82F6" name="Avg Ridership" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Weekday Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {analytics.weekdayPattern.map((day, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Clock className="h-6 w-6" />
                    <span className="text-2xl font-bold">{day.day}</span>
                  </div>
                  <p className="text-3xl font-bold mt-4">{day.average.toLocaleString()}</p>
                  <p className="text-sm opacity-90 mt-1">Avg passengers</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Insights Tab */}
        {activeView === 'insights' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Smart Cards Dominance */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <CreditCard className="h-8 w-8 text-blue-600" />
                  <h3 className="text-xl font-bold text-gray-900">Smart Cards Lead the Way</h3>
                </div>
                <p className="text-4xl font-bold text-blue-600 mb-2">
                  {((analytics.totals.smartCards / analytics.totalRidership) * 100).toFixed(1)}%
                </p>
                <p className="text-gray-600">
                  of all journeys use stored value smart cards, making it the most popular payment method.
                </p>
              </div>

              {/* Digital Adoption */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <QrCode className="h-8 w-8 text-purple-600" />
                  <h3 className="text-xl font-bold text-gray-900">Digital Transformation</h3>
                </div>
                <p className="text-4xl font-bold text-purple-600 mb-2">
                  {((analytics.totals.qr / analytics.totalRidership) * 100).toFixed(1)}%
                </p>
                <p className="text-gray-600">
                  QR-based tickets show growing digital payment adoption among commuters.
                </p>
              </div>

              {/* NCMC Integration */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Ticket className="h-8 w-8 text-orange-600" />
                  <h3 className="text-xl font-bold text-gray-900">NCMC Integration</h3>
                </div>
                <p className="text-4xl font-bold text-orange-600 mb-2">
                  {analytics.totals.ncmc.toLocaleString()}
                </p>
                <p className="text-gray-600">
                  National Common Mobility Card usage shows seamless integration across transport networks.
                </p>
              </div>

              {/* Growth Momentum */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                  <h3 className="text-xl font-bold text-gray-900">Growth Momentum</h3>
                </div>
                <p className="text-4xl font-bold text-green-600 mb-2">
                  {analytics.growthRate >= 0 ? '+' : ''}{analytics.growthRate.toFixed(1)}%
                </p>
                <p className="text-gray-600">
                  Week-over-week ridership growth indicates {analytics.growthRate >= 0 ? 'increasing' : 'decreasing'} metro usage patterns.
                </p>
              </div>
            </div>

            {/* Key Takeaways */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-xl p-8 text-white shadow-xl">
              <h2 className="text-3xl font-bold mb-6 flex items-center">
                <Award className="h-8 w-8 mr-3" />
                Key Takeaways
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <h4 className="font-bold text-lg mb-2">📈 Ridership Trends</h4>
                  <p className="text-sm opacity-90">
                    The metro serves an average of {analytics.avgDailyRidership.toLocaleString()} passengers daily,
                    with peak ridership of {analytics.peakDay.total.toLocaleString()} on {analytics.peakDay.date}.
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <h4 className="font-bold text-lg mb-2">💳 Payment Preferences</h4>
                  <p className="text-sm opacity-90">
                    Smart cards account for {((analytics.totals.smartCards / analytics.totalRidership) * 100).toFixed(1)}%
                    of all journeys, followed by tokens at {((analytics.totals.tokens / analytics.totalRidership) * 100).toFixed(1)}%.
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <h4 className="font-bold text-lg mb-2">📱 Digital Adoption</h4>
                  <p className="text-sm opacity-90">
                    QR-based tickets and NCMC cards represent the future of contactless travel,
                    showing steady adoption among tech-savvy commuters.
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <h4 className="font-bold text-lg mb-2">📅 Weekly Patterns</h4>
                  <p className="text-sm opacity-90">
                    Ridership varies by day of the week, with weekdays generally showing higher traffic
                    compared to weekends, reflecting commuter patterns.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Predictions Tab */}
        {activeView === 'predictions' && predictions && (
          <div className="space-y-8">
            {/* Forecast Controls */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Ridership Forecast</h2>
                  <p className="text-gray-600 mt-1">AI-powered predictions using trend and seasonality analysis</p>
                </div>
                <select
                  value={forecastDays}
                  onChange={(e) => setForecastDays(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="7">Next 7 Days</option>
                  <option value="14">Next 14 Days</option>
                  <option value="30">Next 30 Days</option>
                  <option value="60">Next 60 Days</option>
                  <option value="90">Next 90 Days</option>
                  <option value="120">Next 4 Months</option>
                  <option value="180">Next 6 Months</option>
                  <option value="240">Next 8 Months</option>
                  <option value="365">Next 12 Months</option>
                </select>
              </div>

              {/* Model Accuracy Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg p-4 text-white">
                  <div className="flex items-center space-x-2 mb-2">
                    <Target className="h-5 w-5" />
                    <span className="text-sm font-medium opacity-90">Model Accuracy (MAPE)</span>
                  </div>
                  <p className="text-3xl font-bold">{predictions.modelAccuracy.mape}%</p>
                  <p className="text-xs opacity-75 mt-1">Mean Absolute Percentage Error</p>
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg p-4 text-white">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="h-5 w-5" />
                    <span className="text-sm font-medium opacity-90">Trend Direction</span>
                  </div>
                  <p className="text-3xl font-bold">{predictions.modelAccuracy.trend}</p>
                  <p className="text-xs opacity-75 mt-1">Based on recent patterns</p>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg p-4 text-white">
                  <div className="flex items-center space-x-2 mb-2">
                    <Activity className="h-5 w-5" />
                    <span className="text-sm font-medium opacity-90">Confidence Level</span>
                  </div>
                  <p className="text-3xl font-bold">{predictions.modelAccuracy.confidence}</p>
                  <p className="text-xs opacity-75 mt-1">Prediction interval</p>
                </div>
              </div>

              {/* Forecast Chart with Confidence Bands */}
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={predictions.forecastData}>
                  <defs>
                    <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="upper"
                    stroke="none"
                    fill="#E9D5FF"
                    fillOpacity={0.3}
                    name="Upper Bound"
                  />
                  <Area
                    type="monotone"
                    dataKey="lower"
                    stroke="none"
                    fill="#FFFFFF"
                    fillOpacity={1}
                    name="Lower Bound"
                  />
                  <Area
                    type="monotone"
                    dataKey="predicted"
                    stroke="#8B5CF6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorPredicted)"
                    name="Predicted Ridership"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Prediction Breakdown by Payment Method */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Predicted Payment Method Distribution</h2>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={predictions.forecastData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="smartCards" stroke="#3B82F6" name="Smart Cards" strokeWidth={2} />
                  <Line type="monotone" dataKey="tokens" stroke="#10B981" name="Tokens" strokeWidth={2} />
                  <Line type="monotone" dataKey="ncmc" stroke="#F59E0B" name="NCMC" strokeWidth={2} />
                  <Line type="monotone" dataKey="qr" stroke="#8B5CF6" name="QR Tickets" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Key Predictions Insights */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-8 text-white shadow-xl">
              <h2 className="text-3xl font-bold mb-6 flex items-center">
                <Zap className="h-8 w-8 mr-3" />
                Forecast Insights
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <h4 className="font-bold text-lg mb-2">📊 Expected Range</h4>
                  <p className="text-sm opacity-90">
                    Daily ridership is predicted to range between{' '}
                    <span className="font-bold">
                      {Math.min(...predictions.forecastData.map(d => d.lower)).toLocaleString()}
                    </span>
                    {' '}and{' '}
                    <span className="font-bold">
                      {Math.max(...predictions.forecastData.map(d => d.upper)).toLocaleString()}
                    </span>
                    {' '}passengers over the next {forecastDays} days.
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <h4 className="font-bold text-lg mb-2">📈 Trend Analysis</h4>
                  <p className="text-sm opacity-90">
                    The model predicts a <span className="font-bold">{predictions.modelAccuracy.trend.toLowerCase()}</span> trend
                    in metro ridership based on historical patterns and weekly seasonality factors.
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <h4 className="font-bold text-lg mb-2">🎯 Peak Prediction</h4>
                  <p className="text-sm opacity-90">
                    Highest predicted ridership: <span className="font-bold">
                      {Math.max(...predictions.forecastData.map(d => d.predicted)).toLocaleString()}
                    </span> passengers on{' '}
                    <span className="font-bold">
                      {predictions.forecastData.find(d => d.predicted === Math.max(...predictions.forecastData.map(p => p.predicted)))?.date}
                    </span>
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <h4 className="font-bold text-lg mb-2">🔬 Model Info</h4>
                  <p className="text-sm opacity-90">
                    Using Triple Exponential Smoothing with weekly seasonality detection.
                    Trained on last 60 days of historical data with {predictions.modelAccuracy.confidence} confidence intervals.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </>
  );
};

export default NammaMetroAnalysis;
