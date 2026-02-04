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
    setData(getStoredData());
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
            <CardContent className="py-4">
              <div className="flex items-center justify-center gap-2 text-sm">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">
                  已有 <span className="font-semibold text-foreground">{data.members.length}</span> 位成员
                  {data.isMatchingComplete && (
                    <span className="text-primary ml-1">· 配对已完成</span>
                  )}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 入口按钮 */}
        <div className="space-y-4">
          <Button
            onClick={() => setViewMode("participant")}
            size="lg"
            className="w-full h-14 text-lg gradient-warm border-0 shadow-warm hover:shadow-warm-lg transition-all duration-300"
          >
            <Users className="w-5 h-5 mr-2" />
            我是参会人员
          </Button>

          <Button
            onClick={handleAdminAccess}
            variant="outline"
            size="lg"
            className="w-full h-14 text-lg border-border/50 hover:border-primary/30 hover:bg-primary/5"
          >
            <Lock className="w-5 h-5 mr-2" />
            管理员入口
          </Button>
        </div>

        {/* 使用说明 */}
        <div className="mt-10 text-sm text-muted-foreground space-y-2">
          <p>💡 管理员先录入成员名单并开始配对</p>
          <p>🎯 参会人员输入名字即可查看守护对象</p>
        </div>
      </div>

      {/* 管理员口令验证弹窗 */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              管理员验证
            </DialogTitle>
            <DialogDescription>
              请输入管理员口令以继续
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入口令"
              className="text-center h-12"
              onKeyDown={(e) => e.key === "Enter" && handlePasswordSubmit()}
              autoFocus
            />
            <Button
              onClick={handlePasswordSubmit}
              className="w-full h-11 gradient-warm border-0 shadow-warm"
            >
              确认进入
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
