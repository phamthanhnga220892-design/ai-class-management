// Centralized API client for backend communication

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export class ApiError extends Error {
    constructor(
        public status: number,
        public message: string,
        public data?: any
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

/**
 * Get JWT token from localStorage
 */
function getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
}

/**
 * Generic fetch wrapper with error handling
 */
async function fetchApi<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = getAuthToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }


    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new ApiError(
                response.status,
                errorData.message || `HTTP ${response.status}: ${response.statusText}`,
                errorData
            );
        }

        return response.json();
    } catch (error) {
        // Enhanced error logging for debugging
        if (error instanceof ApiError) {
            throw error;
        }

        // Network errors (CORS, timeout, connection refused, etc.)
        console.error('Network Error:', {
            endpoint,
            apiBaseUrl: API_BASE_URL,
            error: error instanceof Error ? error.message : 'Unknown error',
        });

        throw new ApiError(
            0,
            `Network error: ${error instanceof Error ? error.message : 'Failed to connect'}. Check internet connection.`,
            { originalError: error }
        );
    }
}

/**
 * API methods
 */
export const api = {
    // Auth
    login: (email: string, password: string) =>
        fetchApi('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),

    register: (fullName: string, email: string, password: string) =>
        fetchApi('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ fullName, email, password }),
        }),

    getProfile: () => fetchApi('/auth/profile'),

    updateProfile: (data: { fullName?: string; phone?: string }) =>
        fetchApi('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    // Courses
    getCourses: () => fetchApi('/courses'),
    getCourse: (id: string) => fetchApi(`/courses/${id}`),

    // Classes
    getClasses: (courseId?: string) => {
        const query = courseId ? `?courseId=${courseId}` : '';
        return fetchApi(`/classes${query}`);
    },
    getClass: (id: string) => fetchApi(`/classes/${id}`),

    // Registrations (Student)
    createRegistration: (data: {
        classId: string;
        studentName: string;
        studentPhone: string;
        parentName: string;
        parentPhone: string;
    }) =>
        fetchApi('/registrations', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    getMyRegistrations: () => fetchApi('/registrations/my'),

    // Products (Student)
    getMyProducts: () => fetchApi('/products/my'),
    getPublicPortfolio: (userId: string) => fetchApi(`/products/portfolio/${userId}`),
    createProduct: (data: { title: string; description: string; link: string }) =>
        fetchApi('/products', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    updateProduct: (id: string, data: { title?: string; description?: string; link?: string }) =>
        fetchApi(`/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
    deleteProduct: (id: string) =>
        fetchApi(`/products/${id}`, {
            method: 'DELETE',
        }),

    // Admin - Registrations
    getAllRegistrations: (params?: {
        status?: string;
        courseId?: string;
        classId?: string;
    }) => {
        const query = new URLSearchParams(
            Object.entries(params || {}).filter(([_, v]) => v)
        ).toString();
        return fetchApi(`/admin/registrations${query ? `?${query}` : ''}`);
    },

    approveRegistration: (id: string) =>
        fetchApi(`/admin/registrations/${id}/approve`, {
            method: 'PATCH',
        }),

    rejectRegistration: (id: string, adminNote?: string) =>
        fetchApi(`/admin/registrations/${id}/reject`, {
            method: 'PATCH',
            body: JSON.stringify({ adminNote }),
        }),

    // Admin - Classes
    createClass: (data: {
        courseId: string;
        name: string;
        mentorName: string;
        startDate: string;
        endDate?: string;
        schedule?: string;
        maxStudents: number;
        status?: string;
    }) =>
        fetchApi('/admin/classes', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    updateClass: (id: string, data: Partial<{
        name: string;
        mentorName: string;
        startDate: string;
        endDate: string;
        schedule: string;
        maxStudents: number;
        status: string;
    }>) =>
        fetchApi(`/admin/classes/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    deleteClass: (id: string) =>
        fetchApi(`/admin/classes/${id}`, {
            method: 'DELETE',
        }),

    getClassDetails: (id: string) => fetchApi(`/admin/classes/${id}/details`),

    // Sessions
    getSessions: (classId?: string) => {
        const query = classId ? `?classId=${classId}` : '';
        return fetchApi(`/sessions${query}`);
    },

    // Admin - Sessions
    createSession: (data: {
        classId: string;
        title: string;
        content: string;
        videoUrl?: string;
        orderIndex: number;
    }) =>
        fetchApi('/admin/sessions', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    updateSession: (id: string, data: Partial<{
        title: string;
        content: string;
        videoUrl: string;
        orderIndex: number;
    }>) =>
        fetchApi(`/admin/sessions/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    deleteSession: (id: string) =>
        fetchApi(`/admin/sessions/${id}`, {
            method: 'DELETE',
        }),

    getSessionComments: (id: string) => fetchApi(`/admin/sessions/${id}/comments`),

    // Comments
    getComments: (sessionId: string) => {
        const query = `?sessionId=${sessionId}`;
        return fetchApi(`/comments${query}`);
    },

    createComment: (sessionId: string, content: string, parentId?: string) =>
        fetchApi('/comments', {
            method: 'POST',
            body: JSON.stringify({ sessionId, content, parentId }),
        }),

    deleteComment: (id: string) =>
        fetchApi(`/comments/${id}`, {
            method: 'DELETE',
        }),
};

/**
 * Helper to check if user is authenticated
 */
export function isAuthenticated(): boolean {
    return !!getAuthToken();
}

/**
 * Helper to get user info from localStorage
 */
export function getUserInfo(): any {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user_info');
    return userStr ? JSON.parse(userStr) : null;
}

/**
 * Helper to logout
 */
export function logout(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_info');
    window.dispatchEvent(new Event('auth-change'));
}
