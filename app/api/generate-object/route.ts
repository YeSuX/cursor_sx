import { generateObject } from 'ai';
import { z } from 'zod';
import { deepseek } from '../generate/route';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return Response.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const model = deepseek('deepseek-chat');

    // 生成结构化对象
    const { object } = await generateObject({
      model,
      schema: z.object({
        recipe: z.object({
          name: z.string(),
          ingredients: z.array(
            z.object({
              name: z.string(),
              amount: z.string(),
            })
          ),
          steps: z.array(z.string()),
        }),
      }),
      prompt,
    });

    return Response.json({ object });
  } catch (error) {
    console.error('API Error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
