import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const BASE_URL = `${API_BASE_URL}/api/v1/payment`;

/**
 * Returns Clerk token authorization headers.
 */
const getStudentHeaders = async () => {
    try {
        if (window.Clerk?.session) {
            const token = await window.Clerk.session.getToken();
            if (token) return { headers: { Authorization: `Bearer ${token}` } };
        }
    } catch (err) {
        console.warn('paymentService: Could not get Clerk token', err);
    }
    return {};
};

/**
 * Helper to construct headers with a Clerk token.
 */
const getAuthHeaders = (token) => {
    if (token) {
        return { headers: { Authorization: `Bearer ${token}` } };
    }
    return {};
};

/**
 * Request backend to create a Razorpay order with a specific plan type.
 */
export const createOrder = async (planType, token) => {
    const authHeaders = token ? getAuthHeaders(token) : await getStudentHeaders();
    const response = await axios.post(`${BASE_URL}/create-order`, { plan_type: planType }, authHeaders);
    return response.data;
};

/**
 * Verify Razorpay payment signature on the backend for a specific plan type.
 */
export const verifySignature = async (paymentDetails, planType, token) => {
    const authHeaders = token ? getAuthHeaders(token) : await getStudentHeaders();
    const payload = { ...paymentDetails, plan_type: planType };
    const response = await axios.post(`${BASE_URL}/verify-signature`, payload, authHeaders);
    return response.data;
};

/**
 * Get current user's subscription status.
 */
export const getSubscriptionStatus = async (token) => {
    const authHeaders = token ? getAuthHeaders(token) : await getStudentHeaders();
    const response = await axios.get(`${BASE_URL}/subscription-status`, authHeaders);
    return response.data;
};

