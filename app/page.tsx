"use client";

import { ModeToggle } from "@/components/mode-toggle";

export default function Home() {
  
  return (
    <div>
      {/* 主题切换按钮 */}
      <div className="absolute right-4 top-4">
        <ModeToggle />
      </div>
        
    </div>
  );
}
