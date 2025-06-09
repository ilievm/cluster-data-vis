'use client';

//The page is a monolith ATM, mostly due to time constraints. Also I kind of like monoliths 
import { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

import fetchGraphDataPoints from '../utils/fetchGraphData'
import formatTimeForRange from '../utils/formatTimeForRange'
import CustomTooltip from '../utils/toolTipFormatter'
import initialPolicy from '../utils/emptyPolicy'

import LegendBox from './molecules/LegendBox'

export default function Home() {
  // Separate state for each chart
  const [chart1DataPoints, setChart1DataPoints] = useState([]);
  const [chart2DataPoints, setChart2DataPoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('Performance Metrics');
  const [dateRange, setDateRange] = useState('7days');

  // Snapshot Policy Form State
  const [policyForm, setPolicyForm] = useState(initialPolicy);

  const [autoRefresh, setAutoRefresh] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  // Load data for both charts
  const loadAllChartsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [chart1Data, chart2Data] = await Promise.all([
        fetchGraphDataPoints(1, dateRange), 
        fetchGraphDataPoints(2, dateRange) 
      ]);
      
      setChart1DataPoints(chart1Data);
      setChart2DataPoints(chart2Data);
    } catch (err) {
      console.log("graph load error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeSection === 'Performance Metrics') {
      loadAllChartsData();
    }
  }, [dateRange, activeSection]);

    // Auto-refresh interval
  useEffect(() => {
    if (activeSection === 'Performance Metrics' && autoRefresh) {
      const interval = setInterval(() => {
        loadAllChartsData();
      }, 1000); // Refresh every 1 second

      return () => clearInterval(interval);
    }
  }, [activeSection, autoRefresh, dateRange]);

  // Format data charts
  const chart1Data = chart1DataPoints.map(point => ({
    ...point,
    time: formatTimeForRange(point.timestamp, dateRange),
    fullDate: new Date(point.timestamp).toISOString()
  }));

  const chart2Data = chart2DataPoints.map(point => ({
    ...point,
    time: formatTimeForRange(point.timestamp, dateRange),
    fullDate: new Date(point.timestamp).toISOString()
  }));

  const handleDateRangeChange = (e) => {
    setDateRange(e.target.value);
  };

  // Y-axis formatters
  const formatIOPS = (value) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value.toString();
  };
  const formatThroughput = (value) => {
    return `${(value / 10).toFixed(1)}`;
  };

  // X-axis formatters 
  const getXAxisConfig = (range, chartData) => {
    const baseConfig = {
      dataKey: "time",
      axisLine: false,
      tickLine: false,
      tick: { fontSize: 11, fill: '#9CA3AF' }
    };

    switch (range) {
      case '1hour':
        return {
          ...baseConfig,
          interval: Math.ceil(chartData.length / 6),
          tick: { fontSize: 10, fill: '#9CA3AF' }
        };
      
      case '1day':
        return {
          ...baseConfig,
          interval: Math.ceil(chartData.length / 8),
          angle: -45,
          textAnchor: 'end',
          height: 60
        };
      
      case '7days':
      default:
        return {
          ...baseConfig,
          interval: 'preserveStartEnd',
          angle: -45,
          textAnchor: 'end',
          height: 60
        };
    }
  };

  const menuItems = [
    'Performance Metrics',
    'Edit Snapshot Policy'
  ];

  // Get latest values for each chart
  const latestChart1Read = chart1DataPoints.length > 0 ? chart1DataPoints[chart1DataPoints.length - 1]?.read : 0;
  const latestChart1Write = chart1DataPoints.length > 0 ? chart1DataPoints[chart1DataPoints.length - 1]?.write : 0;
  const latestChart1Timestamp = chart1DataPoints.length > 0 ? chart1DataPoints[chart1DataPoints.length - 1]?.timestamp : Date.now();

  const latestChart2Read = chart2DataPoints.length > 0 ? chart2DataPoints[chart2DataPoints.length - 1]?.read : 0;
  const latestChart2Write = chart2DataPoints.length > 0 ? chart2DataPoints[chart2DataPoints.length - 1]?.write : 0;
  const latestChart2Timestamp = chart2DataPoints.length > 0 ? chart2DataPoints[chart2DataPoints.length - 1]?.timestamp : Date.now();

  // Handle form input changes
  const handleFormChange = (field, value) => {
    setPolicyForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTimeChange = (timeType, value) => {
    setPolicyForm(prev => ({
      ...prev,
      snapshotTime: {
        ...prev.snapshotTime,
        [timeType]: value
      }
    }));
  };

  const handleDayChange = (day) => {
    setPolicyForm(prev => ({
      ...prev,
      selectedDays: {
        ...prev.selectedDays,
        [day]: !prev.selectedDays[day]
      }
    }));
  };

  const handleEveryDayChange = () => {
    const newEveryDay = !policyForm.selectedDays.everyDay;
    setPolicyForm(prev => ({
      ...prev,
      selectedDays: {
        everyDay: newEveryDay,
        mon: newEveryDay,
        tue: newEveryDay,
        wed: newEveryDay,
        thur: newEveryDay,
        fri: newEveryDay,
        sat: newEveryDay,
        sun: newEveryDay
      }
    }));
  };

  // Submit form
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitMessage('');
    
    try {
      const response = await fetch('http://localhost:3333/api/snapshot-policy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(policyForm)
      });

      if (response.ok) {
        setSubmitMessage('Policy saved successfully!');
      } else {
        setSubmitMessage('Failed to save policy');
      }
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Reset form to initial state
    setPolicyForm(initialPolicy);
    setSubmitMessage('');
  };

  return (
    <div className="min-h-screen text-white flex" style={{ backgroundColor: '#1B222B' }}>
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 border-r border-gray-700">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-blue-500 rounded"></div>
            <span className="text-lg font-semibold">[Cluster Name]</span>
          </div>
        </div>
        
        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item}>
                <button
                  onClick={() => setActiveSection(item)}
                  className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                    activeSection === item 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  • {item}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold">{activeSection}</h1>
            {activeSection === 'Performance Metrics' && (
              <div className="flex items-center space-x-4">
                <select 
                  value={dateRange}
                  onChange={handleDateRangeChange}
                  className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm"
                >
                  <option value="1hour">Last 1 hour</option>
                  <option value="1day">Last 1 day</option>
                  <option value="7days">Last 7 days</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 space-y-6">
          {activeSection === 'Performance Metrics' && (
            <>
              {error && (
                <div className="bg-red-900 border border-red-700 rounded p-4">
                  <div className="text-red-200 font-semibold">Error:</div>
                  <div className="text-red-300">{error}</div>
                </div>
              )}

              {/* Graph 1 */}
              <div>
                <h2 className="text-lg mb-4">IOPS</h2>
                
                <div className="flex">
                  {/* Chart Container */}
                  <div className="flex-1 pr-4">
                    {loading && chart1Data.length === 0 ? (
                      <div className="h-64 flex items-center justify-center">
                        <div className="text-gray-400">Loading chart data...</div>
                      </div>
                    ) : chart1Data.length === 0 ? (
                      <div className="h-64 flex items-center justify-center">
                        <div className="text-gray-400">No data available</div>
                      </div>
                    ) : (
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={chart1Data}
                            margin={{ top: 5, right: 0, left: 20, bottom: 5 }}
                            isAnimationActive={false}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis {...getXAxisConfig(dateRange, chart1Data)} />
                            <YAxis 
                              axisLine={false}
                              tickLine={false}
                              tick={{ fontSize: 11, fill: '#9CA3AF' }}
                              tickFormatter={formatIOPS}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Line 
                              type="monotone" 
                              dataKey="read" 
                              stroke="#60A5FA" 
                              strokeWidth={1.5}
                              dot={false}
                              activeDot={{ r: 3, stroke: '#60A5FA', strokeWidth: 2 }}
                              isAnimationActive={false}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="write" 
                              stroke="#22D3EE" 
                              strokeWidth={1.5}
                              dot={false}
                              activeDot={{ r: 3, stroke: '#22D3EE', strokeWidth: 2 }}
                              isAnimationActive={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>

                  {/* Legend Box */}
                    <LegendBox
                    label="IOPS"
                    timestamp={latestChart1Timestamp}
                    read={latestChart1Read}
                    write={latestChart1Write}
                    measure={"IOPS"}
                  />

                </div>
              </div>

              {/* Throughput Chart */}
              <div>
                <h2 className="text-lg mb-4">Throughput</h2>
                
                <div className="flex">
                  {/* Chart Container */}
                  <div className="flex-1 pr-4">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={chart2Data}
                          margin={{ top: 5, right: 0, left: 20, bottom: 5 }}
                          isAnimationActive={false}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis {...getXAxisConfig(dateRange, chart2Data)} />
                          <YAxis 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: '#9CA3AF' }}
                            tickFormatter={formatThroughput}
                            label={{ value: 'MB/s', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: '11px', fill: '#9CA3AF' } }}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Line 
                            type="monotone" 
                            dataKey="read" 
                            stroke="#60A5FA" 
                            strokeWidth={1.5}
                            dot={false}
                            activeDot={{ r: 3, stroke: '#60A5FA', strokeWidth: 2 }}
                            isAnimationActive={false}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="write" 
                            stroke="#22D3EE" 
                            strokeWidth={1.5}
                            dot={false}
                            activeDot={{ r: 3, stroke: '#22D3EE', strokeWidth: 2 }}
                            isAnimationActive={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Legend Box */}
                    <LegendBox
                    label="Troughput"
                    timestamp={latestChart2Timestamp}
                    read={latestChart2Read}
                    write={latestChart2Write}
                    measure={"KB/S"}
                  />

                </div>
              </div>
            </>
          )}

          {/* Edit Snapshot Policy Form */}
          {activeSection === 'Edit Snapshot Policy' && (
            <div className="max-w-4xl">
              {submitMessage && (
                <div className={`mb-4 p-4 rounded ${
                  submitMessage.includes('successfully') 
                    ? 'bg-green-900 border border-green-700 text-green-200' 
                    : 'bg-red-900 border border-red-700 text-red-200'
                }`}>
                  {submitMessage}
                </div>
              )}

              <div className="space-y-6">
                {/* Policy Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Policy Name
                  </label>
                  <input
                    type="text"
                    value={policyForm.policyName}
                    onChange={(e) => handleFormChange('policyName', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  />
                </div>

                {/* Apply to Directory */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Apply to Directory
                  </label>
                  <input
                    type="text"
                    value={policyForm.applyToDirectory}
                    onChange={(e) => handleFormChange('applyToDirectory', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  />
                </div>

                {/* Schedule */}
                <div>
                  <h3 className="text-lg font-medium text-gray-300 mb-4">Run Policy on the Following Schedule</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Select Schedule Type
                      </label>
                      <select
                        value={policyForm.scheduleType}
                        onChange={(e) => handleFormChange('scheduleType', e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                      >
                        <option value="Daily or Weekly">Daily or Weekly</option>
                        <option value="Monthly">Monthly</option>
                        <option value="Yearly">Yearly</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Set to Time Zone
                        <span className="ml-2 text-blue-400 cursor-help" title="Time zone information">ⓘ</span>
                      </label>
                      <select
                        value={policyForm.timezone}
                        onChange={(e) => handleFormChange('timezone', e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                      >
                        <option value="N.America/Toronto">N.America/Toronto</option>
                        <option value="N.America/Los_Angeles">N.America/Los Angeles</option>
                        <option value="Europe/London">Europe/London</option>
                        <option value="Asia/Tokyo">Asia/Tokyo</option>
                      </select>
                    </div>
                  </div>

                  {/* Time */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Take a Snapshot at
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="0"
                        max="23"
                        value={policyForm.snapshotTime.hour}
                        onChange={(e) => handleTimeChange('hour', e.target.value.padStart(2, '0'))}
                        className="w-16 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-center"
                      />
                      <span className="text-gray-300">:</span>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={policyForm.snapshotTime.minute}
                        onChange={(e) => handleTimeChange('minute', e.target.value.padStart(2, '0'))}
                        className="w-16 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-center"
                      />
                    </div>
                  </div>

                  {/* Days */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      On the Following Day(s)
                    </label>
                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={policyForm.selectedDays.everyDay}
                          onChange={handleEveryDayChange}
                          className="rounded bg-gray-700 border-gray-600"
                        />
                        <span className="text-gray-300">Every day</span>
                      </label>
                      
                      {['mon', 'tue', 'wed', 'thur', 'fri', 'sat', 'sun'].map((day) => (
                        <label key={day} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={policyForm.selectedDays[day]}
                            onChange={() => handleDayChange(day)}
                            className="rounded bg-gray-700 border-gray-600"
                          />
                          <span className="text-gray-300 capitalize">{
                            day === 'thur' ? 'Thu' : day.slice(0, 3)
                          }</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Delete Options */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Delete Each Snapshot
                    </label>
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="deleteOption"
                          value="Never"
                          checked={policyForm.deleteOption === 'Never'}
                          onChange={(e) => handleFormChange('deleteOption', e.target.value)}
                          className="text-blue-600"
                        />
                        <span className="text-gray-300">Never</span>
                      </label>
                      
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="deleteOption"
                          value="Automatically after"
                          checked={policyForm.deleteOption === 'Automatically after'}
                          onChange={(e) => handleFormChange('deleteOption', e.target.value)}
                          className="text-blue-600"
                        />
                        <span className="text-gray-300">Automatically after</span>
                      </label>
                      
                      {policyForm.deleteOption === 'Automatically after' && (
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            value={policyForm.deleteAfterDays}
                            onChange={(e) => handleFormChange('deleteAfterDays', e.target.value)}
                            className="w-20 bg-gray-700 border border-gray-600 rounded px-3 py-1 text-white"
                          />
                          <select
                            value={policyForm.deleteTimeUnit}
                            onChange={(e) => handleFormChange('deleteTimeUnit', e.target.value)}
                            className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-white"
                          >
                            <option value="day(s)">day(s)</option>
                            <option value="week(s)">week(s)</option>
                            <option value="month(s)">month(s)</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Snapshot Locking */}
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-300 mb-2">Snapshot Locking</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Locked snapshots cannot be deleted before the deletion schedule expires. For this feature to be available, snapshots must be set to automatically delete.
                  </p>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={policyForm.enableLockedSnapshots}
                      onChange={(e) => handleFormChange('enableLockedSnapshots', e.target.checked)}
                      disabled={policyForm.deleteOption === 'Never'}
                      className="rounded bg-gray-700 border-gray-600 disabled:opacity-50"
                    />
                    <span className={`text-gray-300 ${policyForm.deleteOption === 'Never' ? 'opacity-50' : ''}`}>
                      Enable locked snapshots
                    </span>
                  </label>
                </div>

                {/* Enable Policy */}
                <div className="mt-6">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={policyForm.enablePolicy}
                      onChange={(e) => handleFormChange('enablePolicy', e.target.checked)}
                      className="rounded bg-gray-700 border-gray-600"
                    />
                    <span className="text-gray-300">Enable policy</span>
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 pt-6 border-t border-gray-700">
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className={`px-6 py-2 rounded font-medium ${
                      isSubmitting
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    } transition-colors`}
                  >
                    {isSubmitting ? 'Saving...' : 'Save Policy'}
                  </button>
                  
                  <button
                    onClick={handleCancel}
                    disabled={isSubmitting}
                    className="px-6 py-2 rounded font-medium text-gray-300 hover:text-white border border-gray-600 hover:border-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}