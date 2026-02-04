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
import { Users, Shuffle, Trash2, Check, ArrowLeft } from "lucide-react";

interface AdminPanelProps {
  data: WishGuardianData | null;
  onDataChange: (data: WishGuardianData | null) => void;
  onBack: () => void;
}

export function AdminPanel({ data, onDataChange, onBack }: AdminPanelProps) {
  const [memberInput, setMemberInput] = useState(
    data?.members.join("\n") || ""
  );

  const parseMemberList = (input: string): string[] => {
    return input
      .split(/[\n,，]/)
      .map((name) => name.trim())
      .filter((name) => name.length > 0);
  };

  const handleSaveMembers = () => {
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

    const newData: WishGuardianData = {
      members: uniqueMembers,
      matches: {},
      isMatchingComplete: false,
      createdAt: new Date().toISOString(),
    };

    saveData(newData);
    onDataChange(newData);
    toast.success(`已保存 ${uniqueMembers.length} 位成员`);
  };

  const handleStartMatching = () => {
    if (!data || data.members.length < 2) {
      toast.error("请先保存成员名单");
      return;
    }

    try {
      const matches = generateMatches(data.members);
      const newData: WishGuardianData = {
        ...data,
        matches,
        isMatchingComplete: true,
      };
      saveData(newData);
      onDataChange(newData);
      toast.success("配对成功！成员现在可以查看自己的守护对象了");
    } catch (error) {
      toast.error("配对失败，请重试");
    }
  };

  const handleReset = () => {
    clearData();
    setMemberInput("");
    onDataChange(null);
    toast.success("已重置所有数据");
  };

  const members = parseMemberList(memberInput);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <Button
        variant="ghost"
        onClick={onBack}
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
              className="flex-1 gradient-warm border-0 shadow-warm hover:shadow-warm-lg transition-all duration-300"
            >
              <Check className="w-4 h-4 mr-2" />
              保存名单
            </Button>

            <Button
              onClick={handleStartMatching}
              disabled={!data || data.members.length < 2}
              className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground shadow-warm"
            >
              <Shuffle className="w-4 h-4 mr-2" />
              {data?.isMatchingComplete ? "重新配对" : "开始配对"}
            </Button>

            <Button
              variant="outline"
              onClick={handleReset}
              className="border-destructive/30 text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              重置
            </Button>
          </div>
        </CardContent>
      </Card>

      {data?.members && data.members.length > 0 && (
        <Card className="shadow-warm border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-muted-foreground">
              当前成员列表
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {data.members.map((member, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-sm py-1.5 px-3"
                >
                  {member}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
