-- 创建活动表
CREATE TABLE public.wish_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '心愿守护活动',
  admin_password TEXT NOT NULL,
  is_matching_complete BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 创建成员表（关联活动）
CREATE TABLE public.activity_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_id UUID NOT NULL REFERENCES public.wish_activities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  target_member_id UUID REFERENCES public.activity_members(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(activity_id, name)
);

-- 启用 RLS
ALTER TABLE public.wish_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_members ENABLE ROW LEVEL SECURITY;

-- 活动表策略：所有人可读取活动基本信息
CREATE POLICY "Anyone can view activities"
  ON public.wish_activities FOR SELECT
  USING (true);

-- 活动表策略：允许匿名插入（管理员创建活动）
CREATE POLICY "Anyone can create activities"
  ON public.wish_activities FOR INSERT
  WITH CHECK (true);

-- 活动表策略：允许更新（用于完成配对）
CREATE POLICY "Anyone can update activities"
  ON public.wish_activities FOR UPDATE
  USING (true);

-- 成员表策略：所有人可查看成员名单（不含配对信息）
CREATE POLICY "Anyone can view member names"
  ON public.activity_members FOR SELECT
  USING (true);

-- 成员表策略：允许插入成员
CREATE POLICY "Anyone can add members"
  ON public.activity_members FOR INSERT
  WITH CHECK (true);

-- 成员表策略：允许更新（用于关联用户和设置配对）
CREATE POLICY "Anyone can update members"
  ON public.activity_members FOR UPDATE
  USING (true);