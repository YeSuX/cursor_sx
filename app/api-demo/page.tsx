"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function ApiDemoPage() {
  // 普通文本生成
  const [prompt, setPrompt] = useState("写一个关于人工智能的简短介绍");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [usage, setUsage] = useState<{ promptTokens: number; completionTokens: number; totalTokens: number } | null>(null);

  // 流式文本生成
  const [streamPrompt, setStreamPrompt] = useState("讲一个关于勇气的短故事");
  const [streamResult, setStreamResult] = useState("");
  const [streamLoading, setStreamLoading] = useState(false);

  // 对象生成
  type RecipeResult = {
    recipe: {
      name: string;
      ingredients: Array<{
        name: string;
        amount: string;
      }>;
      steps: string[];
    };
  };

  const [objectPrompt, setObjectPrompt] = useState("生成一个番茄炒蛋的食谱");
  const [objectResult, setObjectResult] = useState<RecipeResult | null>(null);
  const [objectLoading, setObjectLoading] = useState(false);

  // 处理普通文本生成
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("请输入提示词");
      return;
    }

    setLoading(true);
    setResult("");
    setUsage(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt, stream: false }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "请求失败");
      }

      const data = await response.json();
      setResult(data.text);
      setUsage(data.usage);
      toast.success("生成成功");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "生成失败");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 处理流式文本生成
  const handleStreamGenerate = async () => {
    if (!streamPrompt.trim()) {
      toast.error("请输入提示词");
      return;
    }

    setStreamLoading(true);
    setStreamResult("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: streamPrompt, stream: true }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "请求失败");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("无法读取响应流");
      }

      // 使用 toTextStreamResponse() 返回的是简单文本流
      // 直接解码即可，不需要复杂的 JSON 解析
      let accumulatedText = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        // 直接解码文本内容
        const textChunk = decoder.decode(value, { stream: true });
        accumulatedText += textChunk;
        setStreamResult(accumulatedText);
      }

      toast.success("生成完成");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "生成失败");
      console.error(error);
    } finally {
      setStreamLoading(false);
    }
  };

  // 处理对象生成
  const handleObjectGenerate = async () => {
    if (!objectPrompt.trim()) {
      toast.error("请输入提示词");
      return;
    }

    setObjectLoading(true);
    setObjectResult(null);

    try {
      const response = await fetch("/api/generate-object", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: objectPrompt }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "请求失败");
      }

      const data = await response.json();
      setObjectResult(data.object);
      toast.success("生成成功");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "生成失败");
      console.error(error);
    } finally {
      setObjectLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold flex items-center gap-2">
          <Sparkles className="h-8 w-8" />
          Google Generative AI Demo
        </h1>
        <p className="text-muted-foreground mt-2">
          测试 Google Generative AI API 的各种功能
        </p>
      </div>

      <Tabs defaultValue="text" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="text">文本生成</TabsTrigger>
          <TabsTrigger value="stream">流式生成</TabsTrigger>
          <TabsTrigger value="object">结构化对象</TabsTrigger>
        </TabsList>

        {/* 文本生成 */}
        <TabsContent value="text">
          <Card>
            <CardHeader>
              <CardTitle>文本生成</CardTitle>
              <CardDescription>
                使用 generateText 方法生成文本内容
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="prompt">提示词</Label>
                <Textarea
                  id="prompt"
                  placeholder="输入你的提示词..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={3}
                />
              </div>
              <Button onClick={handleGenerate} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    生成中...
                  </>
                ) : (
                  "生成"
                )}
              </Button>
              {result && (
                <div className="mt-4 space-y-2">
                  <Label>生成结果</Label>
                  <div className="p-4 bg-muted rounded-lg whitespace-pre-wrap">
                    {result}
                  </div>
                  {usage && (
                    <div className="text-xs text-muted-foreground mt-2">
                      Token 用量: {usage.promptTokens} (prompt) + {usage.completionTokens} (completion) = {usage.totalTokens} (total)
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 流式生成 */}
        <TabsContent value="stream">
          <Card>
            <CardHeader>
              <CardTitle>流式文本生成</CardTitle>
              <CardDescription>
                使用 streamText 方法实时生成文本内容
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="stream-prompt">提示词</Label>
                <Textarea
                  id="stream-prompt"
                  placeholder="输入你的提示词..."
                  value={streamPrompt}
                  onChange={(e) => setStreamPrompt(e.target.value)}
                  rows={3}
                />
              </div>
              <Button onClick={handleStreamGenerate} disabled={streamLoading}>
                {streamLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    生成中...
                  </>
                ) : (
                  "开始流式生成"
                )}
              </Button>
              {streamResult && (
                <div className="mt-4 space-y-2">
                  <Label>生成结果（实时）</Label>
                  <div className="p-4 bg-muted rounded-lg whitespace-pre-wrap min-h-[200px]">
                    {streamResult}
                    {streamLoading && (
                      <span className="inline-block w-2 h-4 ml-1 bg-foreground animate-pulse" />
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 对象生成 */}
        <TabsContent value="object">
          <Card>
            <CardHeader>
              <CardTitle>结构化对象生成</CardTitle>
              <CardDescription>
                使用 generateObject 方法生成符合 schema 的结构化数据
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="object-prompt">提示词（食谱）</Label>
                <Textarea
                  id="object-prompt"
                  placeholder="例如：生成一个番茄炒蛋的食谱"
                  value={objectPrompt}
                  onChange={(e) => setObjectPrompt(e.target.value)}
                  rows={3}
                />
              </div>
              <Button onClick={handleObjectGenerate} disabled={objectLoading}>
                {objectLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    生成中...
                  </>
                ) : (
                  "生成食谱"
                )}
              </Button>
              {objectResult && (
                <div className="mt-4 space-y-4">
                  <Label>生成结果</Label>
                  <div className="p-4 bg-muted rounded-lg">
                    <h3 className="text-lg font-semibold mb-3">
                      {objectResult.recipe.name}
                    </h3>
                    
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">食材：</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {objectResult.recipe.ingredients.map((ingredient, index) => (
                          <li key={index}>
                            {ingredient.name} - {ingredient.amount}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">步骤：</h4>
                      <ol className="list-decimal list-inside space-y-2">
                        {objectResult.recipe.steps.map((step: string, index: number) => (
                          <li key={index}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Label>JSON 格式</Label>
                    <pre className="p-4 bg-muted rounded-lg text-xs overflow-auto">
                      {JSON.stringify(objectResult, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
