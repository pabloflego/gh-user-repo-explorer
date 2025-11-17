import type { BrowserHttpClientPort } from "../ports/BrowserHttpClientPort";
import type { ClientApiPort } from "../ports/ClientApiPort";

const BASE_URL = '/api';

export class ClientApi implements ClientApiPort {
  constructor(private httpClient: BrowserHttpClientPort) {}

  async searchUsers(query: string) {
    const response = await this.httpClient(`${BASE_URL}/users?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch users');
    }
    return response.json();
  } 

  async fetchUserRepositories(username: string, page: number = 1) {
    const url = `${BASE_URL}/users/${username}/repos?page=${page}`;
    const response = await this.httpClient(url);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch user repositories');
    }
    return response.json();
  }
} 