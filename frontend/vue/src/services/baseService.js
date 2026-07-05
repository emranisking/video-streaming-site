import httpClient from './api';

/**
 * Base service with common CRUD operations
 * Extend this for specific services
 */
export class BaseService {
  constructor(endpoint) {
    this.endpoint = endpoint;
  }

  /**
   * Get all resources with pagination
   */
  async getAll(page = 1, limit = 20, filters = {}) {
    const params = new URLSearchParams({
      page,
      limit,
      ...filters,
    });
    return httpClient.get(`${this.endpoint}?${params.toString()}`);
  }

  /**
   * Get a single resource by ID
   */
  async getById(id) {
    if (!id) throw new Error('ID is required');
    return httpClient.get(`${this.endpoint}/${id}`);
  }

  /**
   * Create a new resource
   */
  async create(data) {
    return httpClient.post(this.endpoint, data);
  }

  /**
   * Update a resource
   */
  async update(id, data) {
    if (!id) throw new Error('ID is required');
    return httpClient.patch(`${this.endpoint}/${id}`, data);
  }

  /**
   * Delete a resource
   */
  async delete(id) {
    if (!id) throw new Error('ID is required');
    return httpClient.delete(`${this.endpoint}/${id}`);
  }

  /**
   * Bulk operations
   */
  async bulkCreate(items) {
    return httpClient.post(`${this.endpoint}/bulk`, items);
  }

  async bulkDelete(ids) {
    return httpClient.delete(`${this.endpoint}/bulk`, { ids });
  }
}