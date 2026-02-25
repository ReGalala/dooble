const API_URL = 'http://localhost:5001';

export const api = {
    async get(endpoint: string) {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}${endpoint}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    async post(endpoint: string, body: any) {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    async patch(endpoint: string, body: any) {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    async delete(endpoint: string, body: any) {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    async uploadImage(file: File): Promise<string> {
        const formData = new FormData();
        formData.append('image', file);

        const res = await fetch(`${API_URL}/api/uploads`, {
            method: 'POST',
            body: formData,
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Failed to upload image');
        }

        const data = await res.json();
        return data.url;
    }
};
