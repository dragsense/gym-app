const { parentPort, workerData } = require('worker_threads');

// This runs in a separate thread
async function executeTask() {
  try {
    const { taskId, data, taskCode } = workerData;
    
    // Create the task function from the code string
    const taskFunction = new Function('data', `return (${taskCode})(data)`);
    
    // Execute the task
    const result = await taskFunction(data);
    
    // Send result back to main thread
    parentPort.postMessage({ data: result });
  } catch (error) {
    // Send error back to main thread
    parentPort.postMessage({ error: error.message });
  }
}

// Start execution
executeTask();
