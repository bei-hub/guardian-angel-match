// 心愿守护 - 核心逻辑

export interface WishGuardianData {
  members: string[];
  // credentials?: Record<string, string>; // 已移除密码功能
  matches: Record<string, string>;
  isMatchingComplete: boolean;
  createdAt: string;
}

const STORAGE_KEY = 'wish-guardian-data';
const USER_IDENTITY_KEY = 'wish-guardian-user-identity';
const API_URL = '/api/data';
const STATIC_DATA_URL = 'data.json'; // 静态数据文件路径 (相对于 base path)
const RESET_API_URL = '/api/reset';

export async function getStoredData(): Promise<WishGuardianData | null> {
  // 1. 优先尝试从 API 服务器获取数据 (本地开发/部署模式)
  try {
    const res = await fetch(API_URL);
    if (res.ok) {
      const data = await res.json();
      if (data) return data;
    }
  } catch (e) {
    // API 不可用，忽略
  }

  // 2. 尝试获取静态 JSON 数据 (GitHub Pages 模式)
  try {
    // 使用 import.meta.env.BASE_URL 确保路径正确
    const baseUrl = import.meta.env.BASE_URL;
    const url = baseUrl.endsWith('/') ? `${baseUrl}${STATIC_DATA_URL}` : `${baseUrl}/${STATIC_DATA_URL}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data) return data;
    }
  } catch (e) {
    console.warn("无法加载静态数据");
  }

  // 3. 降级方案：使用 localStorage
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export async function saveData(data: WishGuardianData): Promise<'server' | 'local' | 'static-error'> {
  let saveStatus: 'server' | 'local' | 'static-error' = 'local';
  
  // 优先尝试保存到服务器
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
        saveStatus = 'server';
    } else {
        // 如果是 404/405 等错误，说明可能是静态环境
        if (res.status === 404 || res.status === 405) {
            saveStatus = 'static-error';
        }
    }
  } catch (e) {
    console.warn("API不可用，保存到本地存储");
  }
  
  // 同时保存到本地作为备份
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return saveStatus;
}

export async function clearData(): Promise<void> {
  try {
    await fetch(RESET_API_URL, { method: 'POST' });
  } catch (e) {
    console.warn("API不可用，仅清除本地存储");
  }
  localStorage.removeItem(STORAGE_KEY);
  // 注意：我们不自动清除用户本地身份
}

// 获取本地存储的用户身份
export function getLocalUserIdentity(): string | null {
  return localStorage.getItem(USER_IDENTITY_KEY);
}

// 设置本地存储的用户身份
export function setLocalUserIdentity(name: string): void {
  localStorage.setItem(USER_IDENTITY_KEY, name.trim());
}

// Fisher-Yates shuffle algorithm
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// 生成配对 - 确保每个人都有一个守护对象，且不会守护自己
export function generateMatches(members: string[]): Record<string, string> {
  if (members.length < 2) {
    throw new Error('至少需要2个成员才能进行配对');
  }

  // 使用出圈算法确保没有人守护自己
  let shuffled: string[];
  let isValid = false;
  let attempts = 0;
  const maxAttempts = 100;

  while (!isValid && attempts < maxAttempts) {
    shuffled = shuffle(members);
    // 检查是否有人被分配到自己
    isValid = members.every((member, index) => member !== shuffled[index]);
    attempts++;
  }

  // 如果随机失败，使用偏移法确保正确
  if (!isValid) {
    shuffled = [...members];
    // 简单地将列表向后偏移一位
    const first = shuffled.shift()!;
    shuffled.push(first);
    // 再次打乱但保持不匹配自己
    shuffled = shuffle(shuffled);
    // 如果还是有问题，用简单偏移
    if (members.some((member, index) => member === shuffled[index])) {
      shuffled = [...members.slice(1), members[0]];
    }
  }

  const matches: Record<string, string> = {};
  members.forEach((member, index) => {
    matches[member] = shuffled![index];
  });

  return matches;
}

// 验证名字是否在成员列表中
export function isMemberValid(name: string, members: string[]): boolean {
  return members.some(
    (member) => member.trim().toLowerCase() === name.trim().toLowerCase()
  );
}

// 获取守护对象（精确匹配成员名字）
export function getGuardianTarget(
  inputName: string,
  members: string[],
  matches: Record<string, string>
): string | null {
  const matchedMember = members.find(
    (member) => member.trim().toLowerCase() === inputName.trim().toLowerCase()
  );
  if (!matchedMember) return null;
  return matches[matchedMember] || null;
}
