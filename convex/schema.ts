import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  tasks: defineTable({
    name: v.string(),
    text: v.string(),
    isCompleted: v.boolean(),
    createdBy: v.string(),
    createdAt: v.number(),
  }),
});
