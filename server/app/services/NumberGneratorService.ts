//upd: to have something on the graph on start up, look better and to be able to play with "time range selector" menu in th UI, i'm adding this function that will add data to begin with
function generateRealisticHistoricalData(daysBack = 7, baseValue = 50) {
  const data = [];
  let currentValue = baseValue;
  const now = new Date();
  
  for (let i = daysBack; i >= 0; i--) {
    // Add some trend and noise
    const trend = (Math.random() - 0.5) * 2; // -1 to 1
    const noise = (Math.random() - 0.5) * 10; // -5 to 5
    
    currentValue += trend + noise;
    currentValue = Math.max(0, currentValue); // Keep non-negative
    
    const timestamp = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
    
    data.push({
      timestamp: timestamp,
      value: currentValue
    });
  }
  
  return data;
}

// Simple in-memory storage
// these are arrays we will put our data to, so 3 graphs
const graphsData = [
  { id: 1, data: generateRealisticHistoricalData() },
  { id: 2, data: generateRealisticHistoricalData() },
  // we can add more graphs to display on the page if we want, need to just uncomment below 
  // { id: 3, data: [] }
]

// Start generating numbers for each graph
// we simulate the process of constant new datappints stream by calling it every sec to create a data point
function startGenerating() {
  graphsData.forEach(graph => {
    setInterval(() => {
      // we use random numbers for our data point, 0-100 and 0-30
      const value1 = Math.floor(Math.random() * 101)
      const value2 = Math.floor(Math.random() * 30)
      const dataPoint = { 
        read: value1, 
        write: value2,
        timestamp: Date.now() 
      }
      
      graph.data.push(dataPoint)
      
      // Keep only last 500 points
      if (graph.data.length > 500) {
        graph.data.shift()
      }
      
    }, 1000)
  })
}

// Public functions
export function getGraphData(graphId: number) {
  const graph = graphsData.find(g => g.id === graphId)
  return graph ? graph.data : []
}

export function getAllGraphs() {
  return graphsData.map(g => ({ id: g.id}))
}

// Start generating when service is imported
startGenerating()