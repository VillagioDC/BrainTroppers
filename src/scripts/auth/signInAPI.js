// AUTH SIGN IN API MODULE

// API call to sign in
export async function apiSignIn(email, password) {
    try {
        // Set Parameters
        const headers = { 'Content-Type': 'application/json' };
        const body = { credentials: { email, password } };
        // const url = `${process.env.API_URL}/signIn`;
        const url = 'http://localhost:8888/.netlify/functions/signIn';
        // API call
        const response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
        // Handle response
        if (!response.ok) throw new Error(await response.text());
        return await response.json();
    // Catch error
    } catch (error) {
        throw new Error('Sign-in error:', error);
    }
}