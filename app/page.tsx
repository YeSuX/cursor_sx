"use client";

import { ModeToggle } from "@/components/mode-toggle";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Trash2, Pencil, Plus } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";

export default function Home() {
    const { user } = useUser();
    const tasks = useQuery(api.tasks.get);
    const createTask = useMutation(api.tasks.create);
    const updateTask = useMutation(api.tasks.update);
    const removeTask = useMutation(api.tasks.remove);

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<{
        id: Id<"tasks">;
        name: string;
        text: string;
    } | null>(null);

    // 创建表单状态
    const [newTaskName, setNewTaskName] = useState("");
    const [newTaskText, setNewTaskText] = useState("");

    // 处理创建 task
    const handleCreate = async () => {
        if (!newTaskName.trim() || !newTaskText.trim()) {
            toast.error("请填写任务名称和描述");
            return;
        }

        if (!user) {
            toast.error("请先登录");
            return;
        }

        try {
            await createTask({
                name: newTaskName,
                text: newTaskText,
            });
            toast.success("任务创建成功");
            setNewTaskName("");
            setNewTaskText("");
            setIsCreateOpen(false);
        } catch (error) {
            toast.error("创建失败");
            console.error(error);
        }
    };

    // 处理更新 task
    const handleUpdate = async () => {
        if (!editingTask) return;

        if (!editingTask.name.trim() || !editingTask.text.trim()) {
            toast.error("请填写任务名称和描述");
            return;
        }

        try {
            await updateTask({
                id: editingTask.id,
                name: editingTask.name,
                text: editingTask.text,
            });
            toast.success("任务更新成功");
            setIsEditOpen(false);
            setEditingTask(null);
        } catch (error) {
            toast.error("更新失败");
            console.error(error);
        }
    };

    // 处理删除 task
    const handleDelete = async (id: Id<"tasks">) => {
        try {
            await removeTask({ id });
            toast.success("任务删除成功");
        } catch (error) {
            toast.error("删除失败");
            console.error(error);
        }
    };

    // 切换完成状态
    const handleToggleComplete = async (id: Id<"tasks">, currentStatus: boolean) => {
        try {
            await updateTask({
                id,
                isCompleted: !currentStatus,
            });
        } catch (error) {
            toast.error("更新状态失败");
            console.error(error);
        }
    };

    return (
        <div className="container mx-auto py-8 px-4">
            {/* 主题切换按钮 */}
            <div className="absolute right-4 top-4">
                <ModeToggle />
            </div>

            {/* 页面标题和创建按钮 */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-4xl font-bold">任务管理</h1>
                    <p className="text-muted-foreground mt-2">
                        管理你的任务列表
                    </p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            新建任务
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>创建新任务</DialogTitle>
                            <DialogDescription>
                                填写任务信息以创建新任务
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">任务名称</Label>
                                <Input
                                    id="name"
                                    placeholder="输入任务名称"
                                    value={newTaskName}
                                    onChange={(e) => setNewTaskName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="text">任务描述</Label>
                                <Textarea
                                    id="text"
                                    placeholder="输入任务描述"
                                    value={newTaskText}
                                    onChange={(e) => setNewTaskText(e.target.value)}
                                    rows={4}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                                取消
                            </Button>
                            <Button onClick={handleCreate}>创建</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* 任务列表 */}
            {tasks === undefined ? (
                <div className="text-center py-12 text-muted-foreground">
                    加载中...
                </div>
            ) : tasks.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">暂无任务</p>
                    <p className="text-sm text-muted-foreground mt-2">
                        点击&ldquo;新建任务&rdquo;按钮创建你的第一个任务
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {tasks.map((task) => (
                        <Card key={task._id} className={task.isCompleted ? "opacity-60" : ""}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3 flex-1">
                                        <Checkbox
                                            checked={task.isCompleted}
                                            onCheckedChange={() =>
                                                handleToggleComplete(task._id, task.isCompleted)
                                            }
                                            className="mt-1"
                                        />
                                        <div className="flex-1">
                                            <CardTitle className={task.isCompleted ? "line-through" : ""}>
                                                {task.name}
                                            </CardTitle>
                                            <CardDescription className="text-xs">
                                                {new Date(task.createdAt).toLocaleString("zh-CN")}
                                            </CardDescription>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm mb-4 whitespace-pre-wrap">{task.text}</p>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setEditingTask({
                                                id: task._id,
                                                name: task.name,
                                                text: task.text,
                                            });
                                            setIsEditOpen(true);
                                        }}
                                    >
                                        <Pencil className="h-4 w-4 mr-1" />
                                        编辑
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleDelete(task._id)}
                                    >
                                        <Trash2 className="h-4 w-4 mr-1" />
                                        删除
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* 编辑对话框 */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>编辑任务</DialogTitle>
                        <DialogDescription>
                            修改任务信息
                        </DialogDescription>
                    </DialogHeader>
                    {editingTask && (
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-name">任务名称</Label>
                                <Input
                                    id="edit-name"
                                    value={editingTask.name}
                                    onChange={(e) =>
                                        setEditingTask({
                                            ...editingTask,
                                            name: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-text">任务描述</Label>
                                <Textarea
                                    id="edit-text"
                                    value={editingTask.text}
                                    onChange={(e) =>
                                        setEditingTask({
                                            ...editingTask,
                                            text: e.target.value,
                                        })
                                    }
                                    rows={4}
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsEditOpen(false);
                                setEditingTask(null);
                            }}
                        >
                            取消
                        </Button>
                        <Button onClick={handleUpdate}>保存</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
