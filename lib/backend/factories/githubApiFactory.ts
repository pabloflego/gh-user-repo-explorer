import type { GithubApiPort } from '../application/ports/GithubApiPort';
import { GithubApi } from '../application/adapters/GithubApi';
import { InMemoryGithubApi } from '../application/adapters/InMemoryGithubApi';
import { HttpClientPort } from '../application/ports/HttpClientPort';

export function createGithubApi(httpClient: HttpClientPort): GithubApiPort {
  if (process.env.NODE_ENV === 'test') {
    return new InMemoryGithubApi();
  }
  
  return new GithubApi(httpClient);
}
