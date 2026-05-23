import { Activity, MockData } from '@/lib/types';

const activities: Activity[] = [
  {
    id: 'threat-or-not',
    challengeNum: 'CH-01',
    week: 1,
    name: 'Threat or Not?',
    shortDescription: 'Pick if each online action is safe or a threat.',
    fullDescription:
      'You will see 6 online actions. Pick if each one is a cyber threat or a safe action.',
    type: 'game',
    status: 'open',
    points: 100,
    isBoss: false,
    flag: 'FLAG{THREAT_CLASSIFIER_READY}',
    hints: [
      'Unsafe actions often ask you to rush.',
      'Safe actions protect your account.',
      'When unsure, do not click yet.'
    ]
  },
  {
    id: 'cia-triad-match-up',
    challengeNum: 'CH-02',
    week: 1,
    name: 'CIA Triad Match-Up',
    shortDescription: 'Match 3 cyber words to the right meaning.',
    fullDescription:
      'Match Confidentiality, Integrity, and Availability to the correct meaning cards.',
    type: 'knowledge',
    status: 'open',
    points: 100,
    isBoss: false,
    flag: 'FLAG{CIA_TRIAD_MASTERED}',
    hints: [
      'Confidentiality means private.',
      'Integrity means correct.',
      'Availability means ready to use.'
    ]
  },
  {
    id: 'hackers-dictionary',
    challengeNum: 'CH-03',
    week: 1,
    name: "Hacker's Dictionary",
    shortDescription: 'Match cyber terms with simple definitions.',
    fullDescription:
      'Flip cards and match each term with its meaning. Find all 5 pairs to win.',
    type: 'puzzle',
    status: 'open',
    points: 100,
    isBoss: false,
    flag: 'FLAG{CYBER_VOCAB_UNLOCKED}',
    hints: [
      'Remember where cards are.',
      'Match one term with one meaning.',
      'Take your time and look carefully.'
    ]
  },
  {
    id: 'password-builder',
    challengeNum: 'CH-04',
    week: 1,
    name: 'Password Builder',
    shortDescription: 'Use profile clues to guess a weak password.',
    fullDescription:
      'Read the fake profile clues and guess the weak password the character used.',
    type: 'puzzle',
    status: 'open',
    points: 100,
    isBoss: false,
    flag: 'FLAG{WEAK_PASSWORD_SPOTTED}',
    hints: [
      'Look at pet name and year clues.',
      'Weak passwords use easy personal facts.',
      'Try simple lower-case first.'
    ]
  },
  {
    id: 'footprint-investigator',
    challengeNum: 'CH-05',
    week: 1,
    name: 'Footprint Investigator',
    shortDescription: 'Find all personal data exposed on a fake profile.',
    fullDescription:
      'Tap all profile details that share too much personal information in public.',
    type: 'web',
    status: 'open',
    points: 100,
    isBoss: false,
    flag: 'FLAG{FOOTPRINT_CHECK_COMPLETE}',
    hints: [
      'Full name and school can be sensitive.',
      'Phone numbers should stay private.',
      'Daily routes should not be public.'
    ]
  },
  {
    id: 'build-strongest-password',
    challengeNum: 'CH-06',
    week: 1,
    name: 'Build the Strongest Password',
    shortDescription: 'Build a passphrase until the checker says Very Strong.',
    fullDescription:
      'Type and improve a password until the live strength checker reaches Very Strong.',
    type: 'knowledge',
    status: 'open',
    points: 100,
    isBoss: false,
    flag: 'FLAG{VERY_STRONG_PASS_CREATED}',
    hints: [
      'Use at least 12 characters.',
      'Add upper and lower case letters.',
      'Add numbers and symbols.'
    ]
  },
  {
    id: 'first-letter-cipher',
    challengeNum: 'CH-07',
    week: 1,
    name: 'First Letter Cipher',
    shortDescription: 'Read first letters to find the hidden code.',
    fullDescription:
      'Take the first letter of each word in the sentence to reveal the secret message.',
    type: 'decode',
    status: 'open',
    points: 100,
    isBoss: false,
    flag: 'FLAG{FIRST_LETTER_CODE_CRACKED}',
    hints: [
      'Start from word number 1.',
      'Write letters in order.',
      'Use capital letters for the final code.'
    ]
  },
  {
    id: 'second-letter-cipher',
    challengeNum: 'CH-08',
    week: 1,
    name: 'Second Letter Cipher',
    shortDescription: 'Read second letters to find the hidden code.',
    fullDescription:
      'Take the second letter of each word to reveal the secret message.',
    type: 'decode',
    status: 'open',
    points: 100,
    isBoss: false,
    flag: 'FLAG{SECOND_LETTER_CODE_CRACKED}',
    hints: [
      'Use only the second letter.',
      'Check spelling of each word.',
      'Keep letters in the same order.'
    ]
  },
  {
    id: 'spy-message-relay',
    challengeNum: 'CH-09',
    week: 1,
    name: 'Spy Message Relay',
    shortDescription: 'Use every 4th word to extract a mission code.',
    fullDescription:
      'Read the paragraph and take every 4th word. Then use the pattern to get the code.',
    type: 'decode',
    status: 'open',
    points: 100,
    isBoss: false,
    flag: 'FLAG{WORD_PATTERN_RELAY_DONE}',
    hints: [
      'Count words carefully: 4, 8, 12...',
      'Do not skip numbers.',
      'Use the same rule for all words.'
    ]
  },
  {
    id: 'spot-deepfake-clue',
    challengeNum: 'CH-10',
    week: 1,
    name: 'Spot the Deepfake Clue',
    shortDescription: 'Pick which story is AI-generated and why.',
    fullDescription:
      'Look at 4 news cards. Pick the fake AI-generated one and choose the best clue reason.',
    type: 'knowledge',
    status: 'open',
    points: 100,
    isBoss: false,
    flag: 'FLAG{DEEPFAKE_CLUE_FOUND}',
    hints: [
      'Look for strange image details.',
      'Check if shadows look wrong.',
      'Unnatural faces or hands can be clues.'
    ]
  },
  {
    id: 'ai-defender-or-attacker',
    challengeNum: 'CH-11',
    week: 1,
    name: 'AI Defender or Attacker?',
    shortDescription: 'Sort AI use cases into defending or attacking.',
    fullDescription:
      'Read each AI scenario and choose if it helps defend people or attack people.',
    type: 'game',
    status: 'open',
    points: 100,
    isBoss: false,
    flag: 'FLAG{AI_ROLE_SORTED}',
    hints: [
      'Defender use helps protect users.',
      'Attacker use tries to trick users.',
      'Think about the goal of the action.'
    ]
  },
  {
    id: 'phishing-email-hunt',
    challengeNum: 'CH-12',
    week: 1,
    name: 'The Phishing Email Hunt',
    shortDescription: 'Flag all phishing emails in a fake inbox.',
    fullDescription:
      'Read the inbox and tap all phishing emails. Be careful and check sender + message style.',
    type: 'web',
    status: 'open',
    points: 100,
    isBoss: false,
    flag: 'FLAG{PHISHING_INBOX_CLEARED}',
    hints: [
      'Urgent threats are common phishing signs.',
      'Never share passwords by email.',
      'Strange sender names are red flags.'
    ]
  }
];

export const mockData: MockData = {
  operativeName: 'ALPHA-7',
  accessCode: '111111',
  nextClass: {
    title: 'Week 2 - Code Breaker: Intro to Cryptography',
    datetime: '2026-04-18T18:00:00+01:00',
    zoomUrl: 'https://zoom.us/j/0000000000'
  },
  pastRecordings: [
    {
      id: 'week2-strong-password',
      title: 'Week 2 - Building a Strong Password',
      description:
        'Watch the full walkthrough on creating memorable high-entropy passwords and avoiding predictable patterns.',
      recordedAt: '2026-04-11T18:00:00+01:00',
      durationLabel: '24 MIN',
      videoUrl:
        'https://res.cloudinary.com/dmddjqgfd/video/upload/v1762224903/VIDEO_2_-_BUILDING_A_STRONG_PASSWORD_wqyk0c.mp4'
    }
  ],
  activities
};
