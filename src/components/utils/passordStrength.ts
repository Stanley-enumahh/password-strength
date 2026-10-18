export type StrengthResult = {
  score: number; // 0 - 100
  level: number; // 0 - 5
  label: string;
};

const COMMON = [
  "password",
  "12345678",
  "123456789",
  "qwerty",
  "qwerty123",
  "letmein",
  "iloveyou",
  "admin",
  "welcome",
  "abc123",
];

const LEVELS = [
  { label: "make me hard, baby 😩" },
  { label: "come on baby, don't be shy 🥺" },
  { label: "oh yeah, that's it" },
  { label: "fuck, just like that 🥵" },
  { label: "harder, baby, HARDER! 😩" },
  { label: "OH MY GOD, BABYYYY!! 🫦" },
];

export function getPasswordStrength(password: string): StrengthResult {
  if (!password) {
    return { score: 0, level: 0, ...LEVELS[0] };
  }

  const lengthScore = (Math.min(password.length, 16) / 16) * 55;

  const classes = [
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  const varietyScore = classes * 11.25;

  let score = lengthScore + varietyScore;

  // Penalties
  if (/(.)\1{2,}/.test(password)) score *= 0.8; // aaa, 111
  if (COMMON.some((word) => password.toLowerCase().includes(word))) {
    score = Math.min(score, 15);
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  let level = 1;
  if (score >= 90) level = 5;
  else if (score >= 70) level = 4;
  else if (score >= 45) level = 3;
  else if (score >= 20) level = 2;

  return { score, level, ...LEVELS[level] };
}
