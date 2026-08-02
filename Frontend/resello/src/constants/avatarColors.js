export const AVATAR_COLORS = [
  "#F97316",
  "#EA580C",
  "#FB923C",
  "#0EA5E9",
  "#14B8A6",
  "#8B5CF6",
];

export const getAvatarColor = (value = "") => {
  const hash = [...String(value)].reduce((total, char) => total + char.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};
