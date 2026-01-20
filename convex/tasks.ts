import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// 查询所有 tasks
export const get = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("tasks").collect();
    },
});

// 根据 ID 查询单个 task
export const getById = query({
    args: { id: v.id("tasks") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

// 创建新 task
export const create = mutation({
    args: {
        name: v.string(),
        text: v.string(),
        createdBy: v.string(),
        isCompleted: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const taskId = await ctx.db.insert("tasks", {
            name: args.name,
            text: args.text,
            isCompleted: args.isCompleted ?? false,
            createdBy: args.createdBy,
            createdAt: Date.now(),
        });
        return taskId;
    },
});

// 更新 task
export const update = mutation({
    args: {
        id: v.id("tasks"),
        name: v.optional(v.string()),
        text: v.optional(v.string()),
        isCompleted: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        await ctx.db.patch(id, updates);
    },
});

// 删除 task
export const remove = mutation({
    args: { id: v.id("tasks") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});