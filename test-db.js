
// import fetch from 'node-fetch';

const API_URL = 'http://localhost:3001/api/data';

async function test() {
  console.log('Testing POST to', API_URL);
  try {
    const testData = {
      members: ['Test User'],
      matches: {},
      isMatchingComplete: false,
      createdAt: new Date().toISOString()
    };
    
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });
    
    console.log('Response status:', res.status);
    const json = await res.json();
    console.log('Response body:', json);
    
    const checkRes = await fetch(API_URL);
    const checkJson = await checkRes.json();
    console.log('DB content after save:', checkJson);
    
  } catch (e) {
    console.error('Test failed:', e);
  }
}

test();
