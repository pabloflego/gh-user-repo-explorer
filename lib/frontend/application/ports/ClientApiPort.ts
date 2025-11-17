import { GitHubRepository, GitHubUser } from "@/lib/domain/GithubEntities";

export interface ClientApiPort {
  searchUsers(query: string): Promise<GitHubUser[]>;
  fetchUserRepositories(username: string): Promise<GitHubRepository[]>;
}