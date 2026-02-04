import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import {
  WishGuardianData,
  isMemberValid,
  getGuardianTarget,
} from "@/lib/wishGuardian";
import { Heart, Sparkles, ArrowLeft, Search } from "lucide-react";

interface ParticipantPanelProps {
  data: WishGuardianData | null;
  onBack: () => void;
}

export function ParticipantPanel({ data, onBack }: ParticipantPanelProps) {
  const [name, setName] = useState("");
  const [guardianTarget, setGuardianTarget] = useState<string | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [hasRevealed, setHasRevealed] = useState(false);

  const handleReveal = () => {
    if (!name.trim()) {
      toast.error("请输入你的名字");
      return;
    }

    if (!data || !data.isMatchingComplete) {
      toast.error("配对尚未开始，请联系管理员");
      return;
    }

    if (!isMemberValid(name, data.members)) {
      toast.error("名字不在成员列表中，请检查输入");
      return;
    }

    const target = getGuardianTarget(name, data.members, data.matches);
    if (!target) {
      toast.error("未找到配对结果，请联系管理员");
      return;
    }

    setIsRevealing(true);
    setTimeout(() => {
      setGuardianTarget(target);
      setHasRevealed(true);
      setIsRevealing(false);
    }, 1500);
  };

  const handleReset = () => {
    setName("");
    setGuardianTarget(null);
    setHasRevealed(false);
  };

  if (!data || !data.isMatchingComplete) {
    return (
      <div className="w-full max-w-md mx-auto">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回
        </Button>

        <Card className="shadow-warm border-0 bg-card/80 backdrop-blur-sm">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full gradient-warm-subtle flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">配对尚未开始</h3>
            <p className="text-muted-foreground">
              请等待管理员完成配对后再来查看
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Button
        variant="ghost"
        onClick={onBack}
        className="mb-6 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        返回
      </Button>

      {!hasRevealed ? (
        <Card className="shadow-warm border-0 bg-card/80 backdrop-blur-sm overflow-hidden">
          <CardContent className="pt-8 pb-8">
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full gradient-warm flex items-center justify-center shadow-warm animate-float">
                <Heart className="w-10 h-10 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">查看你的守护对象</h3>
              <p className="text-muted-foreground text-sm">
                输入你的名字，揭晓你要守护的小伙伴
              </p>
            </div>

            <div className="space-y-4">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="请输入你的名字"
                className="text-center text-lg h-12 bg-background/50 border-border/50 focus:border-primary/50"
                onKeyDown={(e) => e.key === "Enter" && handleReveal()}
              />

              <Button
                onClick={handleReveal}
                disabled={isRevealing || !name.trim()}
                className="w-full h-12 text-lg gradient-warm border-0 shadow-warm hover:shadow-warm-lg transition-all duration-300"
              >
                {isRevealing ? (
                  <span className="flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 animate-sparkle" />
                    揭晓中...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Search className="w-5 h-5 mr-2" />
                    揭晓守护对象
                  </span>
                )}
              </Button>
            </div>
          </CardContent>

          {isRevealing && (
            <div className="absolute inset-0 gradient-warm-subtle flex items-center justify-center backdrop-blur-sm">
              <div className="text-center">
                <Sparkles className="w-12 h-12 text-primary mx-auto animate-sparkle" />
                <p className="mt-4 text-lg font-medium text-primary">
                  正在揭晓...
                </p>
              </div>
            </div>
          )}
        </Card>
      ) : (
        <Card className="shadow-warm-lg border-0 bg-card/80 backdrop-blur-sm overflow-hidden animate-reveal">
          <div className="gradient-warm py-6">
            <div className="text-center">
              <Sparkles className="w-8 h-8 text-primary-foreground mx-auto mb-2 animate-sparkle" />
              <p className="text-primary-foreground/90 text-sm">你的守护对象是</p>
            </div>
          </div>

          <CardContent className="pt-8 pb-8 text-center">
            <div className="relative">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full gradient-warm flex items-center justify-center shadow-warm-lg glow-warm">
                <Heart className="w-12 h-12 text-primary-foreground" />
              </div>

              <h2 className="text-3xl font-bold text-gradient-warm mb-2">
                {guardianTarget}
              </h2>

              <p className="text-muted-foreground mb-6">
                请默默守护 Ta，用心感受这份美好 💝
              </p>

              <div className="p-4 rounded-xl gradient-warm-subtle mb-6">
                <p className="text-sm text-foreground/80">
                  🤫 这是属于你们之间的小秘密
                  <br />
                  请勿告诉其他人哦
                </p>
              </div>

              <Button
                variant="outline"
                onClick={handleReset}
                className="border-primary/30 text-primary hover:bg-primary/10"
              >
                查看其他人
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
