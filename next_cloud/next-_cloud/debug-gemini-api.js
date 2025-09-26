// GEMINI API DEBUG SCRIPT - COPY AND PASTE THIS IN BROWSER CONSOLE

console.log('🔍 Starting Gemini API Debug Test...');

// API Configuration
const GEMINI_API_KEY = 'AIzaSyCK1OPSmlb3rxBd_d7a0B3WK43RaksoxUE';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

console.log('📋 API Key:', GEMINI_API_KEY);
console.log('🌐 API URL:', GEMINI_API_URL);

// Test function
async function debugGeminiAPI() {
    console.log('🚀 Testing Gemini API connection...');
    
    try {
        console.log('📤 Sending request to Gemini API...');
        
        const requestBody = {
            contents: [{
                parts: [{
                    text: 'Hello! Please respond with "API connection successful and working!" to confirm the connection.'
                }]
            }],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 100,
                candidateCount: 1
            }
        };
        
        console.log('📋 Request body:', JSON.stringify(requestBody, null, 2));
        
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        console.log('📥 Response status:', response.status);
        console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ API Error Response:', errorText);
            throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
        }
        
        const data = await response.json();
        console.log('📋 Full API Response:', JSON.stringify(data, null, 2));
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            const aiResponse = data.candidates[0].content.parts[0].text;
            console.log('✅ SUCCESS! Gemini AI Response:', aiResponse);
            
            // Show success notification
            const notification = document.createElement('div');
            notification.innerHTML = `
                <div style="position: fixed; top: 20px; right: 20px; background: #22c55e; color: white; 
                           padding: 15px 20px; border-radius: 8px; z-index: 10000; font-weight: bold;
                           box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);">
                    ✅ API KEY WORKING! Response: ${aiResponse.substring(0, 50)}...
                </div>
            `;
            document.body.appendChild(notification);
            setTimeout(() => notification.remove(), 5000);
            
        } else {
            console.error('❌ No valid response content found');
            throw new Error('No response content generated');
        }
        
    } catch (error) {
        console.error('❌ GEMINI API ERROR:', error);
        console.error('Error details:', error.message);
        
        // Show error notification
        const notification = document.createElement('div');
        notification.innerHTML = `
            <div style="position: fixed; top: 20px; right: 20px; background: #ef4444; color: white; 
                       padding: 15px 20px; border-radius: 8px; z-index: 10000; font-weight: bold;
                       box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);">
                ❌ API ERROR: ${error.message.substring(0, 100)}...
            </div>
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 8000);
        
        return { success: false, error: error.message };
    }
}

// Additional debugging checks
console.log('🔍 Running additional checks...');

// Check if API key format is correct
if (GEMINI_API_KEY.startsWith('AIza') && GEMINI_API_KEY.length === 39) {
    console.log('✅ API Key format looks correct');
} else {
    console.log('⚠️ API Key format might be incorrect');
}

// Check network connectivity
console.log('🌐 Testing network connectivity...');
fetch('https://www.google.com', { mode: 'no-cors' })
    .then(() => console.log('✅ Network connectivity OK'))
    .catch(() => console.log('❌ Network connectivity issues'));

// Run the main test
console.log('🚀 Starting main API test...');
debugGeminiAPI();

console.log('📋 Debug script loaded. Check console for results and network tab for request details.');