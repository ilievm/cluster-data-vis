/**
 |--------------------------------------------------------------------------
 | Routes file
 |--------------------------------------------------------------------------
 |
 | The routes file is used for defining the HTTP routes.
 |
 */
import router from '@adonisjs/core/services/router'

router.get('/api/charts/:id/data', async ({ params, request }) => {
  const { getGraphData, getAllGraphs } = await import('../app/Services/NumberGneratorService.js')
 
  const graphId = parseInt(params.id)
  const range = request.input('range', '7days') // Get the date range parameter
  
  const data = getGraphData(graphId)
  const graph = getAllGraphs().find(g => g.id === graphId)
 
  if (!graph) {
    return { error: 'Graph not found' }
  }

  // Filter data based on range if needed
  const filteredData = filterDataByRange(data, range)
 
  // Return data in the format expected by frontend
  return filteredData.map(point => ({
    read: point.read,
    write: point.write,
    timestamp: point.timestamp,
  }))
})

// Helper function to filter data by date range
function filterDataByRange(data, range) {
  const now = Date.now()
  let cutoffTime
  
  switch (range) {
    case '1hour':
      cutoffTime = now - (60 * 60 * 1000) // 1 hour ago
      break
    case '1day':
      cutoffTime = now - (24 * 60 * 60 * 1000) // 1 day ago
      break
    case '7days':
    default:
      cutoffTime = now - (7 * 24 * 60 * 60 * 1000) // 7 days ago
      break
  }
  
  return data.filter(point => point.timestamp >= cutoffTime)
}

// test route, can be used for integration tests later
router.get('/check', async () => {
  const { getAllGraphs, getGraphData } = await import('../app/Services/NumberGneratorService.js')
 
  return getAllGraphs().map(graph => {
    const data = getGraphData(graph.id)
    const latest = data[data.length - 1]
   
    return {
      id: graph.id,
      name: graph.name || "not getting name",
      points: data.length,
      latest: latest ? {
        read: latest.read,
        write: latest.write,
      } : 'no data',
    }
  })
})

router.post('/api/snapshot-policy', async ({ request, response }) => {
  try {
    const formData = request.body()
    console.log('Received Snapshot Policy:', formData)
    
    // Add any validation here if needed
    if (!formData.policyName || !formData.applyToDirectory) {
      return response.status(400).json({
        success: false,
        message: 'Policy name and directory are required'
      })
    }
    
    // Process and save policy data here
    // For now, just return success
    return response.json({
      success: true,
      message: 'Policy saved successfully',
      data: formData,
    })
  } catch (error) {
    console.error('Error saving snapshot policy:', error)
    return response.status(500).json({
      success: false,
      message: 'Failed to save policy',
      error: error.message
    })
  }
})