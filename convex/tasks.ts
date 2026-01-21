import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// 查询当前用户的所有 tasks
export const get = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("未认证");
        }
        return await ctx.db
            .query("tasks")
            .withIndex("by_user", (q) => q.eq("userId", identity.subject))
            .collect();
    },
});

// 根据 ID 查询单个 task（权限检查）
export const getById = query({
    args: { id: v.id("tasks") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("未认证");
        }
        const task = await ctx.db.get(args.id);
        if (!task) {
            return null;
        }
        // 确保只能查询自己的 task
        if (task.userId !== identity.subject) {
            throw new Error("无权限访问此任务");
        }
        return task;
    },
});

// 创建新 task（自动使用当前用户 ID）
export const create = mutation({
    args: {
        name: v.string(),
        text: v.string(),
        isCompleted: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("未认证");
        }
        const taskId = await ctx.db.insert("tasks", {
            name: args.name,
            text: args.text,
            isCompleted: args.isCompleted ?? false,
            userId: identity.subject,
            createdAt: Date.now(),
        });
        return taskId;
    },
});

// 更新 task（权限检查）
export const update = mutation({
    args: {
        id: v.id("tasks"),
        name: v.optional(v.string()),
        text: v.optional(v.string()),
        isCompleted: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("未认证");
        }
        const task = await ctx.db.get(args.id);
        if (!task) {
            throw new Error("任务不存在");
        }
        // 确保只能修改自己的 task
        if (task.userId !== identity.subject) {
            throw new Error("无权限修改此任务");
        }
        const { id, ...updates } = args;
        await ctx.db.patch(id, updates);
    },
});

// 删除 task（权限检查）
export const remove = mutation({
    args: { id: v.id("tasks") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("未认证");
        }
        const task = await ctx.db.get(args.id);
        if (!task) {
            throw new Error("任务不存在");
        }
        // 确保只能删除自己的 task
        if (task.userId !== identity.subject) {
            throw new Error("无权限删除此任务");
        }
        await ctx.db.delete(args.id);
    },
});