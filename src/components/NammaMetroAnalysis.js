'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  TrendingUp, Users, CreditCard, Ticket, QrCode, Calendar,
  Clock, Activity, Award, ArrowUp, ArrowDown, Minus
} from 'lucide-react';

const NammaMetroAnalysis = () => {
  // State management
  const [metroData, setMetroData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState('overview');
  const [dateRange, setDateRange] = useState('30'); // Last 30 days by default

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

  // Parse date from DD-MM-YYYY format
  const parseDate = (dateStr) => {
    const [day, month, year] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
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
    const filteredData = sortedData.slice(-parseInt(dateRange));

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

    // Daily trends
    const dailyTrends = filteredData.map(record => ({
      date: record['Record Date'],
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
    }));

    // Calculate growth trends
    const recentAvg = dailyTrends.slice(-7).reduce((sum, d) => sum + d.total, 0) / 7;
    const previousAvg = dailyTrends.slice(-14, -7).reduce((sum, d) => sum + d.total, 0) / 7;
    const growthRate = ((recentAvg - previousAvg) / previousAvg) * 100;

    // Peak and lowest ridership days
    const sortedByRidership = [...dailyTrends].sort((a, b) => b.total - a.total);
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
  }, [metroData, dateRange]);

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
        { id: 'insights', label: 'Insights', icon: Award }
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
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

            {/* Daily Ridership Trend */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Daily Ridership Trend</h2>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={analytics.dailyTrends}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
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
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#3B82F6"
                    fillOpacity={1}
                    fill="url(#colorTotal)"
                    name="Total Ridership"
                  />
                </AreaChart>
              </ResponsiveContainer>
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
      </div>
    </div>
  );
};

export default NammaMetroAnalysis;
