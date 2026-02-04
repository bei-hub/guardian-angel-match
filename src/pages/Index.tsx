import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { AdminPanel } from "@/components/AdminPanel";
import { ParticipantPanel } from "@/components/ParticipantPanel";
import { WishGuardianData, getStoredData } from "@/lib/wishGuardian";
import { Heart, Settings, Users, Sparkles, Lock } from "lucide-react";
import { toast } from "sonner";

type ViewMode = "home" | "admin" | "participant";

const ADMIN_PASSWORD = "admin888"; // 管理员口令

const Index = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("home");
  const [data, setData] = useState<WishGuardianData | null>(null);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [password, setPassword] = useState("");

  useEffect(() => {
    const loadData = async () => {
      const stored = await getStoredData();
      setData(stored);
    };
    loadData();
  }, []);

  const handleDataChange = (newData: WishGuardianData | null) => {
    setData(newData);
  };

  const handleAdminAccess = () => {
    setShowPasswordDialog(true);
  };

  const handlePasswordSubmit = () => {
    if (password === ADMIN_PASSWORD) {
      setShowPasswordDialog(false);
      setPassword("");
      setViewMode("admin");
    } else {
      toast.error("口令错误，请重试");
    }
  };

  if (viewMode === "admin") {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6">
        <AdminPanel
          data={data}
          onDataChange={handleDataChange}
          onBack={() => setViewMode("home")}
        />
      </div>
    );
  }

  if (viewMode === "participant") {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6">
        <ParticipantPanel data={data} onBack={() => setViewMode("home")} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6">
      {/* 装饰元素 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full gradient-warm-subtle blur-3xl opacity-60" />
        <div className="absolute bottom-20 right-10 w-40 h-40 rounded-full gradient-warm-subtle blur-3xl opacity-40" />
        <div className="absolute top-1/3 right-1/4 w-24 h-24 rounded-full gradient-warm-subtle blur-2xl opacity-30" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto text-center">
        {/* Logo 和标题 */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto mb-6 rounded-3xl gradient-warm flex items-center justify-center shadow-warm-lg animate-float">
            <Heart className="w-12 h-12 text-primary-foreground" />
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold mb-3">
            <span className="text-gradient-warm">心愿守护</span>
          </h1>

          <p className="text-muted-foreground text-lg">
            每个人都有一位神秘守护者 ✨
          </p>
        </div>

        {/* 状态提示 */}
        {data && (
          <Card className="mb-6 border-0 shadow-warm bg-card/80 backdrop-blur-sm">
            <CardContent className="py-2">
              <div className="flex items-center justify-center gap-2 text-xs">
                <Sparkles className="w-3 h-3 text-primary" />
                <span className="font-medium text-foreground">
                  当前已加入 {data.members.length} 位成员
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          <Button
            onClick={() => setViewMode("participant")}
            className="w-full h-14 text-lg gradient-warm border-0 shadow-warm hover:shadow-warm-lg transition-all duration-300"
          >
            <Users className="w-5 h-5 mr-2" />
            我是参与者
          </Button>

          <Button
            variant="ghost"
            onClick={handleAdminAccess}
            className="w-full h-12 text-muted-foreground hover:text-foreground hover:bg-muted/50"
          >
            <Settings className="w-4 h-4 mr-2" />
            管理员入口
          </Button>
        </div>
      </div>

      {/* 管理员密码对话框 */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>管理员验证</DialogTitle>
            <DialogDescription>
              请输入管理员口令以进入后台管理
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2 py-4">
            <div className="relative w-full">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="请输入口令"
                className="pl-9"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handlePasswordSubmit()}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => {
                setShowPasswordDialog(false);
                setPassword("");
              }}
            >
              取消
            </Button>
            <Button onClick={handlePasswordSubmit} className="gradient-warm border-0">
              确认
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
