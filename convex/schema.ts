import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  tasks: defineTable({
    name: v.string(),
    text: v.string(),
    isCompleted: v.boolean(),
    userId: v.string(), // 存储 Clerk 用户 ID
    createdAt: v.number(),
  })
    .index("by_user", ["userId"]),
});
