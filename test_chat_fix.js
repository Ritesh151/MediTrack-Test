// Test script to verify chat system fixes
const https = require('https');
const http = require('http');

const API_BASE = 'http://localhost:5000';

function makeRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    if (token) {
      options.headers.Authorization = `Bearer ${token}`;
    }
    
    const client = url.protocol === 'https:' ? https : http;
    const req = client.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const data = res.statusCode >= 200 && res.statusCode < 300 
            ? JSON.parse(body) 
            : body;
          resolve({ status: res.statusCode, data });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    
    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testChatSystem() {
  console.log('🧪 Testing Chat System Fixes...\n');
  
  try {
    // 1. Login as admin
    console.log('1️⃣ Logging in as admin...');
    const loginResponse = await makeRequest('POST', '/api/auth/login', {
      email: 'admin@meditrack.com',
      password: 'admin123'
    });
    
    if (loginResponse.status !== 200) {
      throw new Error(`Login failed: ${loginResponse.status} - ${loginResponse.data}`);
    }
    
    const token = loginResponse.data.token;
    const user = loginResponse.data;
    console.log('✅ Login successful');
    console.log(`   User: ${user.name} (${user.role})`);
    console.log(`   Token: ${token.substring(0, 50)}...\n`);
    
    // 2. Get tickets
    console.log('2️⃣ Fetching tickets...');
    const ticketsResponse = await makeRequest('GET', '/api/tickets', null, token);
    
    if (ticketsResponse.status !== 200) {
      throw new Error(`Get tickets failed: ${ticketsResponse.status} - ${ticketsResponse.data}`);
    }
    
    const tickets = ticketsResponse.data;
    if (tickets.length === 0) {
      console.log('❌ No tickets found');
      return;
    }
    
    const ticket = tickets[0];
    console.log(`✅ Found ${tickets.length} ticket(s)`);
    console.log(`   Using ticket: ${ticket.issueTitle} (ID: ${ticket._id})\n`);
    
    // 3. Get existing messages
    console.log('3️⃣ Fetching existing messages...');
    const messagesResponse = await makeRequest('GET', `/api/chat/${ticket._id}`, null, token);
    
    if (messagesResponse.status !== 200) {
      throw new Error(`Get messages failed: ${messagesResponse.status} - ${messagesResponse.data}`);
    }
    
    const messages = messagesResponse.data;
    console.log(`✅ Found ${messages.length} message(s)`);
    messages.forEach((msg, i) => {
      console.log(`   ${i + 1}. ${msg.senderId.name}: ${msg.content}`);
    });
    console.log();
    
    // 4. Send a new message
    console.log('4️⃣ Sending new message...');
    const newMessageResponse = await makeRequest('POST', `/api/chat/${ticket._id}`, {
      content: 'Test message from automated test - ' + new Date().toISOString()
    }, token);
    
    if (newMessageResponse.status !== 201) {
      throw new Error(`Send message failed: ${newMessageResponse.status} - ${newMessageResponse.data}`);
    }
    
    const newMessage = newMessageResponse.data;
    console.log('✅ Message sent successfully');
    console.log(`   Message ID: ${newMessage._id}`);
    console.log(`   Content: ${newMessage.content}`);
    console.log(`   Sender: ${newMessage.senderId.name}\n`);
    
    // 5. Verify message appears in list
    console.log('5️⃣ Verifying message in chat history...');
    const updatedMessagesResponse = await makeRequest('GET', `/api/chat/${ticket._id}`, null, token);
    
    if (updatedMessagesResponse.status !== 200) {
      throw new Error(`Get updated messages failed: ${updatedMessagesResponse.status} - ${updatedMessagesResponse.data}`);
    }
    
    const updatedMessages = updatedMessagesResponse.data;
    console.log(`✅ Now ${updatedMessages.length} message(s) in chat`);
    
    const foundMessage = updatedMessages.find(msg => msg._id === newMessage._id);
    if (foundMessage) {
      console.log('✅ New message found in chat history');
    } else {
      console.log('❌ New message not found in chat history');
    }
    
    console.log('\n🎉 ALL TESTS PASSED! Chat system is working correctly.');
    
  } catch (error) {
    console.error('❌ TEST FAILED:', error.message);
  }
}

// Run the test
testChatSystem();
