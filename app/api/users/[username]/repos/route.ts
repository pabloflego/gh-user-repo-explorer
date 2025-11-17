import { GithubApi, EmptyUsernameError, ApiError } from '@/lib/backend/application/adapters/GithubApi';
import { Logger } from '@/lib/backend/application/adapters/Logger';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  // TODO: Use dependency injection for Logger and GithubApi, possibly with NEXTJS intrumentation
  const logger = new Logger('ReposAPI');
  const { username } = await params;

  if (!username) {
    return NextResponse.json(
      { error: 'Username parameter is required' },
      { status: 400 }
    );
  }

  try {
    const githubApi = new GithubApi();
    const data = await githubApi.getUserRepositories(username);
    return NextResponse.json(data);
  } catch (error) {
    let errorMessage: string;
    let statusCode: number;

    if (error instanceof ApiError) {
      errorMessage = error.message;
      statusCode = error.statusCode;
    } else if (error instanceof EmptyUsernameError) {
      errorMessage = error.message;
      statusCode = 400;
    } else {
      errorMessage = error instanceof Error ? error.message : 'Failed to fetch repositories from GitHub';
      statusCode = 500;
    }

    logger.error(`${errorMessage} (status: ${statusCode})`);

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}
