import {auth, genkit} from 'genkit';
import {NextRequest, NextResponse} from 'next/server';

export const GET = auth.GET;

export const POST = async (req: NextRequest) => {
  const result = await genkit.handleNextJsRequest(req);
  if (result.error) {
    return NextResponse.json(
      {error: result.error.message},
      {status: result.error.status ?? 500}
    );
  }
  return result.response!;
};
