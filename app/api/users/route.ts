import { NextResponse } from 'next/server';
import { 
  GithubApi, 
  ApiError, 
  EmptyQueryError,
} from '@/lib/application/adapters/GithubApi';
import { Logger } from '@/lib/application/adapters/Logger';

export async function GET(request: Request) {
  // TODO: Use dependency injection for Logger and GithubApi, possibly with NEXTJS intrumentation
  const logger = new Logger('UserAPI');
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter "q" is required' },
      { status: 400 }
    );
  }

  try {
    const githubApi = new GithubApi();
    const data = await githubApi.searchUsers(query, 5);
    return NextResponse.json(data);
  } catch (error) {
    let errorMessage: string;
    let statusCode: number;

    if (error instanceof ApiError) {
      errorMessage = error.message;
      statusCode = error.statusCode;
    } else if (error instanceof EmptyQueryError) {
      errorMessage = error.message;
      statusCode = 400;
    } else {
      errorMessage = error instanceof Error ? error.message : 'Failed to fetch users from GitHub';
      statusCode = 500;
    }

    logger.error(`${errorMessage} (status: ${statusCode})`);

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}