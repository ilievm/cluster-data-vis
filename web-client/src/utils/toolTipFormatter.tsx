 // Custom tooltip formatter
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload;
    const fullDate = new Date(dataPoint.fullDate);
    
    return (
      <div className="bg-gray-800 text-white p-3 rounded shadow-lg border border-gray-600">
        <p className="text-xs text-gray-300 mb-1">
          {fullDate.toLocaleDateString('en-US', { 
            weekday: 'short',
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
          })} at {fullDate.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
          })}
        </p>
        <p className="text-sm text-blue-400">
          Read: {payload[0]?.value || 'N/A'} IOPS
        </p>
        <p className="text-sm text-cyan-400">
          Write: {payload[1]?.value || 'N/A'} IOPS
        </p>
      </div>
    );
  }
  return null;
};

export default CustomTooltip