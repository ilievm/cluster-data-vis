interface DataPoint {
  read: number;
  write: number;
  timestamp: number;
}

const fetchGraphDataPoints = async (chartId, dateRange) => {
  try {
    const baseUrl = 'http://localhost:3333';
    const endpoint = `/api/charts/${chartId}/data`;
    
    // Add query parameters for date range
    const params = new URLSearchParams({
      range: dateRange
    });
    
    const url = `${baseUrl}${endpoint}?${params}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Ensure the data has the expected structure
    if (!Array.isArray(data)) {
      throw new Error('Invalid data format: expected array');
    }
    
    return data.map(point => ({
      timestamp: point.timestamp || Date.now(),
      read: point.read || 0,
      write: point.write || 0
    }));
    
  } catch (error) {
    console.error(`Error fetching chart ${chartId} data:`, error);
  }
};

export default fetchGraphDataPoints