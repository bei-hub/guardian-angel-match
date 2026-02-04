import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  WishGuardianData,
  generateMatches,
  saveData,
  clearData,
} from "@/lib/wishGuardian";
import { Users, Shuffle, Trash2, Check, ArrowLeft, Eye, Gift, Loader2 } from "lucide-react";

interface AdminPanelProps {
  data: WishGuardianData | null;
  onDataChange: (data: WishGuardianData | null) => void;
  onBack: () => void;
}

export function AdminPanel({ data, onDataChange, onBack }: AdminPanelProps) {
  const [memberInput, setMemberInput] = useState(
    data?.members.join("\n") || ""
  );
  const [showMatches, setShowMatches] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const parseMemberList = (input: string): string[] => {
    return input
      .split(/[\n,，]/)
      .map((name) => name.trim())
      .filter((name) => name.length > 0);
  };

  const handleSaveMembers = async () => {
    const members = parseMemberList(memberInput);
    if (members.length < 2) {
      toast.error("至少需要输入2个成员");
      return;
    }

    // 检查重复
    const uniqueMembers = [...new Set(members)];
    if (uniqueMembers.length !== members.length) {
      toast.error("存在重复的名字，请检查");
      return;
    }

    setIsLoading(true);
    const newData: WishGuardianData = {
      members: uniqueMembers,
      matches: {},
      isMatchingComplete: false,
      createdAt: new Date().toISOString(),
    };

    try {
      const saveStatus = await saveData(newData);
      onDataChange(newData);
      if (saveStatus === 'server') {
        toast.success(`已保存 ${uniqueMembers.length} 位成员 (服务器已同步)`);
      } else if (saveStatus === 'static-error') {
         toast.warning("检测到静态网站模式，无法直接写入服务器。", {
             description: "请下载 data.json 并手动提交到 GitHub 仓库的 public 目录。",
             action: {
                 label: "下载 JSON",
                 onClick: () => downloadJson(newData)
             },
             duration: 10000,
         });
      } else {
        toast.warning("已保存到本地，但同步到服务器失败。请检查服务是否运行。");
      }
    } catch (error) {
      toast.error("保存失败");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartMatching = async () => {
    if (!data || data.members.length < 2) {
      toast.error("请先保存成员名单");
      return;
    }

    setIsLoading(true);
    try {
      const matches = generateMatches(data.members);
      const newData: WishGuardianData = {
        ...data,
        matches,
        isMatchingComplete: true,
      };
      const saveStatus = await saveData(newData);
      onDataChange(newData);
      if (saveStatus === 'server') {
        toast.success("配对成功！成员现在可以查看自己的守护对象了");
      } else if (saveStatus === 'static-error') {
          toast.warning("配对成功 (本地模式)", {
              description: "静态网站无法自动保存。请下载 JSON 文件并更新到 GitHub。",
              action: {
                  label: "下载 JSON",
                  onClick: () => downloadJson(newData)
              },
              duration: 10000,
          });
      } else {
        toast.warning("配对完成但同步服务器失败。请检查服务。");
      }
    } catch (error) {
      toast.error("配对失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadJson = (data: WishGuardianData) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = async () => {
    if (window.confirm("确定要重置所有数据吗？这将清除所有成员和配对信息。")) {
      setIsLoading(true);
      try {
        await clearData();
        setMemberInput("");
        onDataChange(null);
        toast.success("已重置所有数据");
      } catch (error) {
        toast.error("重置失败");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const members = parseMemberList(memberInput);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <Button
        variant="ghost"
        onClick={onBack}
        disabled={isLoading}
        className="mb-4 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        返回
      </Button>

      <Card className="shadow-warm border-0 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 rounded-xl gradient-warm">
              <Users className="w-5 h-5 text-primary-foreground" />
            </div>
            成员名单管理
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              输入参会人员名字（每行一个，或用逗号分隔）
            </label>
            <Textarea
              value={memberInput}
              onChange={(e) => setMemberInput(e.target.value)}
              placeholder="张三&#10;李四&#10;王五&#10;..."
              disabled={isLoading}
              className="min-h-[200px] resize-none bg-background/50 border-border/50 focus:border-primary/50"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-sm">
                {members.length} 位成员
              </Badge>
              {data?.isMatchingComplete && (
                <Badge className="gradient-warm border-0 text-primary-foreground">
                  <Check className="w-3 h-3 mr-1" />
                  已配对
                </Badge>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              onClick={handleSaveMembers}
              disabled={isLoading}
              className="flex-1 gradient-warm border-0 shadow-warm hover:shadow-warm-lg transition-all duration-300"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              保存名单
            </Button>

            <Button
              onClick={handleStartMatching}
              disabled={!data || data.members.length < 2 || isLoading}
              className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground shadow-warm"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Shuffle className="w-4 h-4 mr-2" />
              )}
              {data?.isMatchingComplete ? "重新配对" : "开始配对"}
            </Button>

            <Button
              variant="outline"
              onClick={handleReset}
              disabled={isLoading}
              className="border-destructive/30 text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              重置
            </Button>
          </div>
        </CardContent>
      </Card>

      {data?.isMatchingComplete && (
        <Card className="shadow-warm border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-4 flex flex-row items-center justify-between">
            <CardTitle className="text-lg text-muted-foreground flex items-center gap-2">
              <Gift className="w-4 h-4" />
              配对结果
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMatches(!showMatches)}
            >
              <Eye className="w-4 h-4 mr-2" />
              {showMatches ? "隐藏名单" : "查看名单"}
            </Button>
          </CardHeader>
          {showMatches && (
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
                {data.members.map((member, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 bg-muted/50 rounded-lg border border-border/50"
                  >
                    <span className="font-medium text-muted-foreground">{member}</span>
                    <span className="text-muted-foreground/50">→</span>
                    <span className="font-bold text-primary">{data.matches[member]}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}
