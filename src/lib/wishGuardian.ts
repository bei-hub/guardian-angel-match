// 心愿守护 - 核心逻辑

export interface WishGuardianData {
  members: string[];
  matches: Record<string, string>;
  isMatchingComplete: boolean;
  createdAt: string;
}

const STORAGE_KEY = 'wish-guardian-data';

export function getStoredData(): WishGuardianData | null {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function saveData(data: WishGuardianData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function clearData(): void {
  localStorage.removeItem(STORAGE_KEY);
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
