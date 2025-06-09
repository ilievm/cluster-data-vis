// The local env is in .env.local file. Should work but fallback just in case
const API_BASE_URL = process.env.SERVER_API_URL || 'http://localhost:3333';

export interface DataPoint {
  read: number;
  write: number;
  timestamp: string;
}

export interface GraphData {
  id: number;
  name: string;
  totalPoints: number;
  data: DataPoint[];
  latest: {
    read: number;
    write: number;
  } | null;
}

export interface GraphError {
  error: string;
}

export async function fetchGraphData(id: number): Promise<GraphData> {
  try {
    const response = await fetch(`${API_BASE_URL}/graphs/${id}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: GraphData | GraphError = await response.json();
    
    // Check if response contains error
    if ('error' in data) {
      throw new Error(data.error);
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching graph data for ID ${id}:`, error);
    throw error;
  }
}

// Helper function to get only the data points array (useful for charts it only expects just an array)
export async function fetchGraphDataPoints(id: number): Promise<DataPoint[]> {
  try {
    const graphData = await fetchGraphData(id);
    return graphData.data;
  } catch (error) {
    console.error(`Error fetching data points for graph ID ${id}:`, error);
    throw error;
  }
}