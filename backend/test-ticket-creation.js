/**
 * Test ticket creation with the new case number system
 */
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5001/api';

async function testTicketCreation() {
    console.log("🧪 Testing Ticket Creation API\n");

    try {
        // First, we need to authenticate to get a token
        console.log("📋 Step 1: Authenticating...");
        
        // Try to login with existing user or create a test user
        const loginResponse = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'password123'
            })
        });

        let token;
        if (loginResponse.ok) {
            const loginData = await loginResponse.json();
            token = loginData.token;
            console.log("✅ Login successful");
        } else {
            console.log("❌ Login failed, trying to register...");
            
            // Register a new user
            const registerResponse = await fetch(`${API_BASE}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'password123',
                    role: 'patient',
                    hospitalId: '507f1f77bcf86cd799439011' // Example hospital ID
                })
            });

            if (registerResponse.ok) {
                const registerData = await registerResponse.json();
                token = registerData.token;
                console.log("✅ Registration successful");
            } else {
                console.log("❌ Registration failed");
                return false;
            }
        }

        // Test ticket creation
        console.log("\n📋 Step 2: Creating tickets...");
        
        for (let i = 1; i <= 3; i++) {
            const ticketResponse = await fetch(`${API_BASE}/tickets`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    issueTitle: `Test Ticket ${i}`,
                    description: `This is test ticket number ${i} for testing the case number generation system.`,
                    priority: i === 1 ? 'high' : 'medium'
                })
            });

            if (ticketResponse.ok) {
                const ticketData = await ticketResponse.json();
                console.log(`✅ Ticket ${i} created successfully`);
                console.log(`   Case Number: ${ticketData.data.caseNumber}`);
                console.log(`   ID: ${ticketData.data._id}`);
            } else {
                const errorData = await ticketResponse.text();
                console.log(`❌ Ticket ${i} creation failed:`, errorData);
                return false;
            }
        }

        // Test getting tickets to verify they exist
        console.log("\n📋 Step 3: Retrieving tickets...");
        const getResponse = await fetch(`${API_BASE}/tickets`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (getResponse.ok) {
            const tickets = await getResponse.json();
            console.log(`✅ Retrieved ${tickets.length} tickets`);
            
            // Verify all tickets have case numbers
            const allHaveCaseNumbers = tickets.every(t => t.caseNumber);
            const caseNumbers = tickets.map(t => t.caseNumber);
            const uniqueCaseNumbers = [...new Set(caseNumbers)];
            
            console.log(`   All have case numbers: ${allHaveCaseNumbers}`);
            console.log(`   Unique case numbers: ${uniqueCaseNumbers.length}/${caseNumbers.length}`);
            
            if (allHaveCaseNumbers && uniqueCaseNumbers.length === caseNumbers.length) {
                console.log("✅ All case numbers are unique and present");
            } else {
                console.log("❌ Case number validation failed");
                return false;
            }
        } else {
            console.log("❌ Failed to retrieve tickets");
            return false;
        }

        console.log("\n🎉 All ticket creation tests passed!");
        return true;

    } catch (error) {
        console.error("❌ Test failed with error:", error);
        return false;
    }
}

// Run the test
testTicketCreation()
    .then(success => {
        process.exit(success ? 0 : 1);
    })
    .catch(error => {
        console.error("Test runner error:", error);
        process.exit(1);
    });
