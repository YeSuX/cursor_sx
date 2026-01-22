import { createDeepSeek } from '@ai-sdk/deepseek';
import { generateText, streamText } from 'ai';

export const runtime = 'edge';

export const deepseek = createDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { prompt, stream = false, system } = await req.json();

    if (!prompt) {
      return Response.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const model = deepseek('deepseek-chat');

    if (stream) {
      // 流式输出
      const result = streamText({
        model,
        prompt,
        ...(system && { system }),
        onError({ error }) {
          // 记录流式错误，防止服务器崩溃
          console.error('Stream error:', error);
        },
        onChunk({ chunk }) {
          // 可选：记录每个 chunk 用于调试
          if (process.env.NODE_ENV === 'development' && chunk.type === 'text') {
            console.log('Text chunk:', chunk.text);
          }
        },
        onFinish({ text, finishReason, usage, response, totalUsage }) {
          // 记录完成信息，用于监控和分析
          console.log('Stream finished:', {
            finishReason,
            textLength: text.length,
            usage,
            totalUsage,
            responseId: response.id,
          });
        },
      });

      return result.toTextStreamResponse();
    } else {
      // 普通文本生成
      const result = await generateText({
        model,
        prompt,
        ...(system && { system }),
        onFinish({ text, finishReason, usage, response }) {
          // 记录生成完成信息
          console.log('Generation finished:', {
            finishReason,
            textLength: text.length,
            usage,
            responseId: response.id,
          });
        },
      });

      return Response.json({
        text: result.text,
        usage: result.usage,
        finishReason: result.finishReason,
      });
    }
  } catch (error) {
    console.error('API Error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
