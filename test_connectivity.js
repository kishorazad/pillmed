// Test if the application is responsive
const testAppConnectivity = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/session-check');
    const data = await response.json();
    console.log('Session check response:', data);
  } catch (error) {
    console.error('Error:', error);
  }
};

testAppConnectivity();