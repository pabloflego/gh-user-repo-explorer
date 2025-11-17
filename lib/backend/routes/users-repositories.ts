import { EmptyUsernameError, ApiError } from '@/lib/backend/application/adapters/GithubApi';
import { Logger } from '@/lib/backend/application/adapters/Logger';
import { createGithubApi } from '@/lib/backend/factories/githubApiFactory';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const logger = new Logger('ReposAPI');
  const { username } = await params;
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);


  if (!username) {
    return NextResponse.json(
      { error: 'Username parameter is required' },
      { status: 400 }
    );
  }

  try {
    const githubApi = createGithubApi(fetch);
    const data = await githubApi.getUserRepositories(username, page);
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
