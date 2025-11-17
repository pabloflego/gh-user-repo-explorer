export interface ClientApiPort {
  searchUsers(query: string): Promise<any>;
  fetchUserRepositories(username: string): Promise<any>;
}