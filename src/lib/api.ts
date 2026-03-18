import { MockBackend } from './mockApi';

export const api = {
    async get(endpoint: string) {
        return MockBackend.handleGet(endpoint);
    },

    async post(endpoint: string, body: any) {
        return MockBackend.handlePost(endpoint, body);
    },

    async patch(endpoint: string, body: any) {
        return MockBackend.handlePatch(endpoint, body);
    },

    async delete(endpoint: string, body: any) {
        return MockBackend.handleDelete(endpoint, body);
    },

    async uploadImage(file: File): Promise<string> {
        return MockBackend.handleUpload(file);
    }
};
