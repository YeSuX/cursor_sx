import { createDeepSeek } from '@ai-sdk/deepseek';
import { generateText, streamText } from 'ai';

export const runtime = 'edge';

export const deepseek = createDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { prompt, stream = false } = await req.json();

    if (!prompt) {
      return Response.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const model = deepseek('deepseek-chat');

    if (stream) {
      // 流式输出
      const result = streamText({
        model,
        prompt,
      });

      return result.toTextStreamResponse();
    } else {
      // 普通文本生成
      const { text } = await generateText({
        model,
        prompt,
      });

      return Response.json({ text });
    }
  } catch (error) {
    console.error('API Error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
