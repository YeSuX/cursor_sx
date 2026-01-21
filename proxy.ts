import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// 定义公开路由（不需要登录的路由）
const isPublicRoute = createRouteMatcher([
    "/sign-in(.*)",
    "/sign-up(.*)",
]);

export default clerkMiddleware(
    async (auth, request) => {
        // 如果不是公开路由，则要求用户登录
        if (!isPublicRoute(request)) {
            await auth.protect();
        }
    },
    {
        // 配置认证相关的路径
        signInUrl: "/sign-in",
        signUpUrl: "/sign-up",
    }
);

export const config = {
    matcher: [
        // 跳过 Next.js 内部路由和静态文件
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        // 总是运行在 API 路由上
        "/(api|trpc)(.*)",
    ],
};