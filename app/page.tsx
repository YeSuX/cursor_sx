"use client";

import { ModeToggle } from "@/components/mode-toggle";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";

export default function Home() {
  const tasks = useQuery(api.tasks.get);
  console.log('---sx.tasks---',tasks);
  
  return (
    <div>
      {/* 主题切换按钮 */}
      <div className="absolute right-4 top-4">
        <ModeToggle />
      </div>
        {tasks?.map(({ _id, text }) => <div key={_id}>{text}-{text.isCompleted ? 'completed' : 'not completed'}</div>)}
    </div>
  );
}
