// AUTH FORGOT PASSWORD API MODULE

// API call to forgot password
export async function apiForgotPassword(email) {
    try {
        // Set Parameters
        const headers = { 'Content-Type': 'application/json' };
        const body = { credentials: { email } };
        // const url = `${process.env.API_URL}/forgotPassword`;
        const url = 'http://localhost:8888/.netlify/functions/forgotPassword';
        // API call
        const response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
        // Handle response
        if (!response.ok) throw new Error(await response.text());
        return await response.json();
    // Catch error
    } catch (error) {
        throw new Error('Password reset error:', error);
    }
}