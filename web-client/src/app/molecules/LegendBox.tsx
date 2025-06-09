import React from 'react';

function LegendBox({ label, timestamp, read, write, measure }) {
  const date = new Date(timestamp);

  return (
    <div className="w-48 rounded-lg p-4 ml-4">
      <div>
        <div className="text-xl text-gray-400 mb-3">
          {label}
        </div>
        <div className="text-xs text-gray-400 mb-2">
          {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })},{' '}
          {date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          })}
        </div>
        <div
          className="space-y-2 p-4"
          style={{
            border: '1px solid #333B4480',
            backgroundColor: '#222C364D',
          }}
        >
          <div className="flex flex-col">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-0.5 bg-blue-400"></div>
              <span className="text-sm text-gray-300">Read</span>
            </div>
            <div className="text-left">
              <div className="text-lg font-semibold text-blue-400">
                {read.toLocaleString()} {measure}
              </div>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-0.5 bg-cyan-400"></div>
              <span className="text-sm text-gray-300">Write</span>
            </div>
            <div className="text-left">
              <div className="text-lg font-semibold text-cyan-400">
                {write.toLocaleString()} {measure}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LegendBox;