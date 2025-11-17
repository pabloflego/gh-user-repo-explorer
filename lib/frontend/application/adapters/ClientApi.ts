import { BrowserHttpClientPort } from "../ports/BrowserHttpClientPort";
import { ClientApiPort } from "../ports/ClientApiPort";

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

  async fetchUserRepositories(username: string) {
    const response = await this.httpClient(`${BASE_URL}/users/${username}/repos`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch user repositories');
    }
    return response.json();
  }
} 