import { Activity, MockData } from '@/lib/types';

const activities: Activity[] = [
  {
    id: 'os-identifier',
    challengeNum: 'CH-01',
    week: 1,
    name: 'OS Identifier',
    shortDescription: 'Identify operating systems from forensic traces and interface clues.',
    fullDescription:
      'Mission Control recovered mixed screenshots and system artifacts from multiple devices. Your objective is to classify each operating system and justify the call using kernel clues, file paths, and interface signatures. Work fast, log your evidence, and avoid false positives.',
    type: 'knowledge',
    status: 'completed',
    points: 100,
    isBoss: false,
    completedAt: '2026-04-03T14:12:00+01:00',
    flag: 'FLAG{OS_FINGERPRINT_CONFIRMED}',
    hints: [
      'Look at default file path patterns before checking desktop visuals.',
      'Kernel version format can reveal Linux vs Unix-like systems quickly.',
      'Confirm your final answer against at least two independent clues.'
    ]
  },
  {
    id: 'timeline-scramble',
    challengeNum: 'CH-02',
    week: 1,
    name: 'Timeline Scramble',
    shortDescription: 'Reassemble a security incident timeline from shuffled evidence.',
    fullDescription:
      'A breach report was shredded into timestamped fragments. Reconstruct the full sequence of events from login logs, browser history, and message alerts. Your response must place every event in precise chronological order to unlock the final artifact.',
    type: 'puzzle',
    status: 'completed',
    points: 100,
    isBoss: false,
    completedAt: '2026-04-03T15:20:00+01:00',
    flag: 'FLAG{TIMELINE_RESTORED}',
    hints: [
      'Start with the earliest immutable timestamp from server logs.',
      'Watch for timezone differences between mobile and server events.',
      'One event was intentionally mislabeled to bait rushed analysts.'
    ]
  },
  {
    id: 'torvalds-first-message',
    challengeNum: 'CH-03',
    week: 1,
    name: "Torvalds's First Message",
    shortDescription: 'Decode and authenticate a historic Linux community message.',
    fullDescription:
      'You intercepted an archived forum post attributed to a core open-source contributor. Validate the authenticity of the message by extracting metadata, verifying text signatures, and decoding the embedded clue string hidden in plain sight.',
    type: 'decode',
    status: 'completed',
    points: 100,
    isBoss: false,
    completedAt: '2026-04-03T16:04:00+01:00',
    flag: 'FLAG{FIRST_POST_VERIFIED}',
    hints: [
      'Message headers contain more than sender and date.',
      'Check whether the encoded segment uses substitution or transposition.',
      'Authenticity depends on both content and origin metadata.'
    ]
  },
  {
    id: 'open-source-or-closed',
    challengeNum: 'CH-04',
    week: 1,
    name: 'Open Source or Closed?',
    shortDescription: 'Classify software licenses and deployment rights under pressure.',
    fullDescription:
      'A startup wants to ship tooling fast but mixed incompatible code licenses. Analyze package terms, classify each component as open or proprietary, and map what can legally be modified or redistributed in the final build.',
    type: 'game',
    status: 'completed',
    points: 100,
    isBoss: false,
    completedAt: '2026-04-04T10:21:00+01:00',
    flag: 'FLAG{LICENSE_MATRIX_CLEAN}',
    hints: [
      'Focus on redistribution and modification clauses first.',
      'A permissive license can still require attribution in shipped products.',
      'One package includes a dual-license option hidden in docs.'
    ]
  },
  {
    id: 'the-first-terminal',
    challengeNum: 'CH-05',
    week: 1,
    name: 'The First Terminal',
    shortDescription: 'Navigate a beginner Linux shell and recover mission files.',
    fullDescription:
      'Boot into your first terminal mission and recover a compromised training file system. You must chain navigation, listing, and file-read commands correctly while avoiding dead-end directories and decoy files planted by Mission Control.',
    type: 'linux',
    status: 'completed',
    points: 100,
    isBoss: false,
    completedAt: '2026-04-04T11:03:00+01:00',
    flag: 'FLAG{TERMINAL_INIT_SUCCESS}',
    hints: [
      'Use hidden-file listing when expected files disappear.',
      'Relative paths can save time inside nested directories.',
      'One directory name differs by a single character from the decoy.'
    ]
  },
  {
    id: 'distro-detective',
    challengeNum: 'CH-06',
    week: 1,
    name: 'Distro Detective',
    shortDescription: 'Identify Linux distributions from package and kernel evidence.',
    fullDescription:
      'Three cloned environments claim to be the same distro. They are not. Inspect package managers, release files, and kernel markers to correctly identify each distribution and flag the environment used for an attempted intrusion.',
    type: 'linux',
    status: 'completed',
    points: 100,
    isBoss: false,
    completedAt: '2026-04-04T12:09:00+01:00',
    flag: 'FLAG{DISTRO_TRACE_COMPLETE}',
    hints: [
      'Check `/etc/*release` equivalents before guessing.',
      'Package manager syntax can reveal distro family instantly.',
      'Kernel flavor tags can separate lookalike environments.'
    ]
  },
  {
    id: 'kernel-quiz-gauntlet',
    challengeNum: 'CH-07',
    week: 1,
    name: 'The Kernel Quiz Gauntlet',
    shortDescription: 'Boss round combining Week 1 Linux and cyber fundamentals.',
    fullDescription:
      'Final gauntlet for Week 1. Answer rapid-fire kernel, terminal, and digital safety prompts while solving two chained mini-puzzles. Precision matters: each wrong answer locks one route and forces you into a harder branch.',
    type: 'boss',
    status: 'completed',
    points: 200,
    isBoss: true,
    completedAt: '2026-04-04T13:30:00+01:00',
    flag: 'FLAG{W1_GAUNTLET_DOMINATED}',
    hints: [
      'Clear the Linux branch first to unlock bonus context.',
      'Read each prompt carefully; two answers are deliberately similar.',
      'The final branch depends on your score in prior sections.'
    ]
  },
  {
    id: 'footprint-finder',
    challengeNum: 'CH-08',
    week: 2,
    name: 'Footprint Finder',
    shortDescription: 'Piece together an identity leaked across multiple public sources.',
    fullDescription:
      'Students inspect a fictional social profile, a gaming forum post, a school club page, and a photo caption to reconstruct five personal details the character accidentally revealed. Each correct detail helps expose how much identity can leak from ordinary public posts.',
    type: 'web',
    status: 'completed',
    points: 100,
    isBoss: false,
    completedAt: '2026-04-11T16:12:00+01:00',
    flag: 'FLAG{FOOTPRINT_CHAIN_MAPPED}',
    hints: [
      'Read all four sources together instead of treating them as separate clues.',
      'A routine clue can narrow the neighbourhood and school at the same time.',
      'Look for workplace mentions hidden in friendly shout-outs.'
    ]
  },
  {
    id: 'password-vault-break-in',
    challengeNum: 'CH-09',
    week: 2,
    name: 'Password Vault Break-In',
    shortDescription: 'Use profile clues to guess a weak vault password.',
    fullDescription:
      'A locked vault shows a hint built from personal information: first pet name, school start year, lucky number, and an exclamation mark. Students combine the clues into one password to prove why personal data makes password guessing easier.',
    type: 'puzzle',
    status: 'completed',
    points: 100,
    isBoss: false,
    completedAt: '2026-04-12T10:44:00+01:00',
    flag: 'FLAG{VAULT_POLICY_HARDENED}',
    hints: [
      'The password is made from four pieces in a fixed order.',
      'Watch for the exact punctuation at the end.',
      'Personal facts posted online can make a password surprisingly easy to guess.'
    ]
  },
  {
    id: 'spot-the-phish-speed-round',
    challengeNum: 'CH-10',
    week: 2,
    name: 'Spot the Phish Speed Round',
    shortDescription: 'Sort eight messages quickly and spot the phishing attempts.',
    fullDescription:
      'Eight emails and texts appear one at a time with a six-second timer. Students click SAFE or PHISH before time runs out and learn how time pressure can make red flags easier to miss.',
    type: 'game',
    status: 'in_progress',
    points: 100,
    isBoss: false,
    flag: 'FLAG{PHISH_FILTER_ENGAGED}',
    hints: [
      'Urgency and weird sender domains are a dangerous combination.',
      'Ask whether the request makes sense before reacting fast.',
      'One message is meant to look slightly suspicious even though it is safe.'
    ]
  },
  {
    id: '2fa-tower-defence',
    challengeNum: 'CH-11',
    week: 2,
    name: '2FA Tower Defence',
    shortDescription: 'Place the right 2FA defenses to block attack waves.',
    fullDescription:
      'An animated tower-defense mini-game sends brute force, phishing, and credential stuffing waves down a path. Students must place three second-factor defenses at the correct checkpoints to intercept every wave and protect the account.',
    type: 'game',
    status: 'open',
    points: 100,
    isBoss: false,
    flag: 'FLAG{2FA_DEFENSE_STABILIZED}',
    hints: [
      'Each checkpoint needs the correct defense before deployment.',
      'The wave label tells you which defense must stop it.',
      'If the setup is wrong, the account falls quickly.'
    ]
  },
  {
    id: 'privacy-settings-escape-room',
    challengeNum: 'CH-12',
    week: 2,
    name: 'Privacy Settings Escape Room',
    shortDescription: 'Fix 12 privacy settings to escape the phone screen.',
    fullDescription:
      'A simulated smartphone settings screen shows twelve misconfigured privacy controls. Students toggle each one to a secure state and watch the flag build one character at a time as they lock down the device.',
    type: 'web',
    status: 'open',
    points: 100,
    isBoss: false,
    flag: 'FLAG{PRIVACY_LOCKDOWN_COMPLETE}',
    hints: [
      'Look for permissions that should only be granted temporarily.',
      'Sensitive previews should stay hidden on the lock screen.',
      'Every corrected setting should move the progress bar forward.'
    ]
  },
  {
    id: 'social-engineers-trap',
    challengeNum: 'CH-13',
    week: 2,
    name: "The Social Engineer's Trap",
    shortDescription: 'Boss mission: spot five social engineering tactics in a chat.',
    fullDescription:
      'Students read a fictional chat where an attacker uses false trust, urgency, authority, small requests that add up, and isolation from adults. They must name each tactic, explain the attacker’s goal, and write the safe response at the critical moment.',
    type: 'boss',
    status: 'open',
    points: 200,
    isBoss: true,
    flag: 'FLAG{SOCIAL_TRAP_DISARMED}',
    hints: [
      'Look for the moment the attacker tries to build trust first.',
      'Urgency, secrecy, and authority can appear in the same conversation.',
      'A safe response should involve a trusted adult and blocking the account.'
    ]
  },
  {
    id: 'ip-detective',
    challengeNum: 'CH-15',
    week: 3,
    name: 'IP Detective',
    shortDescription: 'Spot the one public IP hidden inside a private 12-device network map.',
    fullDescription:
      'A fictional network diagram shows twelve labeled devices connected across internal VLANs. Eleven use private address space, but one rogue host is using an external public IP where it should not be. Identify the rogue IP and submit it to unlock the flag.',
    type: 'web',
    status: 'open',
    points: 100,
    isBoss: false,
    flag: 'FLAG{IP_CHAIN_IDENTIFIED}',
    hints: [
      'Private network ranges here are expected to begin with 10.x.x.x or 192.168.x.x.',
      'Only one device in the map breaks that private addressing pattern.',
      'Ignore the label and trust the IP range itself.'
    ]
  },
  {
    id: 'view-source-treasure-hunt',
    challengeNum: 'CH-16',
    week: 3,
    name: 'View Source Treasure Hunt',
    shortDescription: 'Use View Source and DevTools to recover six hidden flag fragments.',
    fullDescription:
      'A polished showcase page hides six fragments in different places: an HTML comment, a hidden form input value, a CSS content property, a data-secret attribute, white-on-white paragraph text, and hidden image alt text. Some clues only appear in live DOM inspection, so you must use DevTools Elements view in addition to View Source.',
    type: 'web',
    status: 'open',
    points: 100,
    isBoss: false,
    flag: 'FLAG{SOURCE_CACHE_CRACKED}',
    hints: [
      'Start with the source comment and hidden input before switching to Elements.',
      'A CSS pseudo-element contains one fragment in a content property.',
      'White-on-white text is invisible in preview but visible in the DOM tree.'
    ]
  },
  {
    id: 'multi-cipher-gauntlet',
    challengeNum: 'CH-17',
    week: 3,
    name: 'The Multi-Cipher Gauntlet',
    shortDescription: 'Reverse a three-layer text transform in the correct decode order.',
    fullDescription:
      'A garbled passage comes with the clue: "First I was flipped, then I was rotated, then I was shifted." The message was encoded using Caesar (shift 5), then ROT13, then reversed. You must decode it in reverse order to recover the sentence containing the flag.',
    type: 'decode',
    status: 'open',
    points: 100,
    isBoss: false,
    flag: 'FLAG{CIPHER_STACK_BROKEN}',
    hints: [
      'Apply reverse first so the text orientation is restored.',
      'After reversing, run ROT13 before touching Caesar shift.',
      'The final step is a Caesar shift of -5 to get readable English.'
    ]
  },
  {
    id: 'pixel-spy',
    challengeNum: 'CH-18',
    week: 3,
    name: 'Pixel Spy',
    shortDescription: 'Download an ordinary photo and extract hidden text with the stego tool.',
    fullDescription:
      'An apparently normal photo on the hackathon page contains hidden text. Use the browser steganography decoder terminal to process the downloaded image and extract the concealed clue plus flag payload.',
    type: 'puzzle',
    status: 'open',
    points: 100,
    isBoss: false,
    flag: 'FLAG{PIXEL_LAYER_EXTRACTED}',
    hints: [
      'The visible image is a decoy; the payload is in hidden pixel data.',
      'Download the file first before running decode commands.',
      'Use the stego decode command on the exact image filename.'
    ]
  },
  {
    id: 'hash-cracker-showdown',
    challengeNum: 'CH-19',
    week: 3,
    name: 'Hash Cracker Showdown',
    shortDescription: 'Crack four MD5 hashes using a fixed 40-word list and convert matches to digits.',
    fullDescription:
      'Four MD5 hash strings are provided with a 40-word candidate list and a hash generator terminal. Hash each candidate word until you find the four matches. The matching words are number words; convert each to its digit and concatenate in order to solve the challenge.',
    type: 'linux',
    status: 'open',
    points: 100,
    isBoss: false,
    flag: 'FLAG{HASH_MATCH_CONFIRMED}',
    hints: [
      'Use the provided list only; every valid answer is inside it.',
      'The same word order as the hash list must be preserved.',
      'Once matched, convert number words like "seven" into digits.'
    ]
  },
  {
    id: 'dns-race',
    challengeNum: 'CH-20',
    week: 3,
    name: 'DNS Race',
    shortDescription: 'Query DNS records and answer five precise infrastructure questions.',
    fullDescription:
      'Use a simulated DNS lookup terminal for `ctflab-academy.fake` and collect exact outputs. You must answer five questions correctly: A record IP, MX hostname, CNAME count, A record TTL, and TXT record content.',
    type: 'knowledge',
    status: 'open',
    points: 100,
    isBoss: false,
    flag: 'FLAG{DNS_PATH_COMPLETE}',
    hints: [
      'Use separate lookups for A, MX, CNAME, and TXT records.',
      'Count CNAME answers carefully; each alias line matters.',
      'TXT answers are case-sensitive when copied exactly.'
    ]
  },
  {
    id: 'encrypted-transmission',
    challengeNum: 'CH-21',
    week: 3,
    name: 'The Encrypted Transmission',
    shortDescription: 'Boss chain: hex to ASCII to Base64, then QR scan for the second flag half.',
    fullDescription:
      'An intercepted network log provides a stream of hexadecimal bytes. Convert hex to ASCII to reveal a Base64 string, decode it for the first flag half, then scan a QR code elsewhere on the page to recover the second half. Combine both halves in the correct order to complete the boss challenge.',
    type: 'boss',
    status: 'open',
    points: 200,
    isBoss: true,
    flag: 'FLAG{TRANSMISSION_DECRYPTED}',
    hints: [
      'Hex decoding should produce readable Base64 text, not plain English yet.',
      'Decode the Base64 output to get the first flag segment.',
      'The QR payload is the second segment and must be appended in the right order.'
    ]
  },
  {
    id: 'hidden-file-heist',
    challengeNum: 'CH-22',
    week: 4,
    name: 'The Hidden File Heist',
    shortDescription: 'Find a hidden dotfile with "classified" in its name and read the flag.',
    fullDescription:
      "Students log into their shell lab. The prompt says: 'An operative hid a file somewhere inside /home/agent/. It begins with a dot and contains the word classified in its name. Find it and read its contents.' Students combine 'ls -la' navigation with `find /home/agent -name '.*classified*' -type f` to locate the file, then `cat` it to reveal the flag.",
    type: 'linux',
    status: 'open',
    points: 100,
    isBoss: false,
    scheduledOpenAt: '2026-05-04T09:00:00+01:00',
    flag: 'FLAG{HIDDEN_HEIST_STOPPED}',
    hints: [
      "Use `ls -la` to reveal hidden files and folders while navigating.",
      "Use `find /home/agent -name '.*classified*' -type f` to search recursively.",
      'Read the matching file with `cat` to recover the flag.'
    ]
  },
  {
    id: 'permission-impossible',
    challengeNum: 'CH-23',
    week: 4,
    name: 'Permission Impossible',
    shortDescription: 'Repair file permissions so your user can read a protected flag file.',
    fullDescription:
      "A file exists at `/mission/vault/eyes-only.txt`. Running `cat` first returns `Permission denied`. Students inspect permissions with `ls -la /mission/vault/`, determine the correct `chmod` command to grant their user read access, apply it, then read the flag. A deliberately wrong chmod attempt should produce a different error so they learn to read permission strings carefully.",
    type: 'linux',
    status: 'open',
    points: 100,
    isBoss: false,
    scheduledOpenAt: '2026-05-04T11:30:00+01:00',
    flag: 'FLAG{PERMISSIONS_LOCKED_DOWN}',
    hints: [
      'Start by checking current mode bits using `ls -la /mission/vault/`.',
      'Grant only the read bit required for your user.',
      'If output changes but still fails, re-check which bit you modified.'
    ]
  },
  {
    id: 'log-hound',
    challengeNum: 'CH-24',
    week: 4,
    name: 'Log Hound',
    shortDescription: 'Use grep, pipes, and wc to extract four forensic answers from a 600-line log.',
    fullDescription:
      "A 600-line access log is located at `/var/log/academy/server.log`. Students must answer four questions with grep, piping, and wc: (1) how many requests returned 404, (2) which IP made the most requests, (3) what time the first `CRITICAL` event occurred, and (4) how many unique usernames appear. The four answers concatenated in order form the flag.",
    type: 'linux',
    status: 'open',
    points: 100,
    isBoss: false,
    scheduledOpenAt: '2026-05-05T09:00:00+01:00',
    flag: 'FLAG{LOG_TRAIL_RECONSTRUCTED}',
    hints: [
      'Use `wc -l` first to confirm the log length and file path.',
      'Use `grep` with pipes to narrow each question one at a time.',
      'Keep answer order exact before concatenating.'
    ]
  },
  {
    id: 'encoded-script',
    challengeNum: 'CH-25',
    week: 4,
    name: 'The Encoded Script',
    shortDescription: 'Extract a Base64 payload from a script comment and decode it in shell.',
    fullDescription:
      "A bash script at `/scripts/launcher.sh` includes one comment line with a long Base64 string. Students `cat` the script, copy the encoded value, then run `echo [string] | base64 -d` to decode it. The decoded sentence contains the challenge flag.",
    type: 'decode',
    status: 'open',
    points: 100,
    isBoss: false,
    scheduledOpenAt: '2026-05-05T14:00:00+01:00',
    flag: 'FLAG{SCRIPT_PAYLOAD_NEUTRALIZED}',
    hints: [
      'Read the script carefully and extract only the Base64 payload.',
      'Use exact shell piping syntax: `echo [string] | base64 -d`.',
      'Decoded output should be a readable sentence that includes the flag.'
    ]
  },
  {
    id: 'network-recon-mission',
    challengeNum: 'CH-26',
    week: 4,
    name: 'Network Recon Mission',
    shortDescription: 'Follow a five-hop curl endpoint chain until the final flag response.',
    fullDescription:
      "A challenge server runs on the lab network. Students begin with `curl http://[lab-ip]/start` and receive a clue to the next endpoint. They must follow the chain across five endpoints, carefully reading each response to construct the next curl command, until the final endpoint returns the flag.",
    type: 'linux',
    status: 'open',
    points: 100,
    isBoss: false,
    scheduledOpenAt: '2026-05-06T09:00:00+01:00',
    flag: 'FLAG{RECON_REPORT_FILED}',
    hints: [
      'Start at `/start`; every response tells you where to go next.',
      'Copy endpoint paths exactly when building the next curl command.',
      'One wrong path will return an error, so inspect each response body closely.'
    ]
  },
  {
    id: 'user-hunter',
    challengeNum: 'CH-27',
    week: 4,
    name: 'User Hunter',
    shortDescription: 'Identify a rogue account, trace activity, and recover its hidden flag file.',
    fullDescription:
      "The lab includes a pre-configured rogue user account. Students read `/etc/passwd` to spot the out-of-place username, run `last [username]` to find when and where that user logged in, run `find / -user [username] -type f 2>/dev/null` to locate files they created, then `cat` those files to recover the flag. Findings are documented like a short incident report.",
    type: 'linux',
    status: 'open',
    points: 100,
    isBoss: false,
    scheduledOpenAt: '2026-05-07T10:00:00+01:00',
    flag: 'FLAG{ROGUE_USER_CONTAINED}',
    hints: [
      'Start with `/etc/passwd` and look for the account that visually does not fit.',
      'Use `last` output to capture both time and source details.',
      'The final flag is hidden in files owned by the rogue account.'
    ]
  },
  {
    id: 'operation-root-access',
    challengeNum: 'CH-28',
    week: 4,
    name: 'Operation Root Access (Grand Final Boss)',
    shortDescription: 'Three-stage capstone: decode browser credentials, SSH in, investigate, and assemble the final flag.',
    fullDescription:
      "Stage 1 (Browser): a Base64 string on the site decodes to SSH username and password. Stage 2 (Terminal): students run `ssh [username]@[challenge-server]` to enter a separate remote machine. Stage 3 (Linux investigation): students navigate to find a hidden config file, use `grep` on a 1,000-line log to extract a specific line, fix permissions to read a classified document, and combine all clues into the final flag. Successful submission triggers the capstone trophy ceremony.",
    type: 'boss',
    status: 'open',
    points: 200,
    isBoss: true,
    scheduledOpenAt: '2026-05-08T18:00:00+01:00',
    flag: 'FLAG{ROOT_ACCESS_DEFENDED}',
    hints: [
      'Decode Stage 1 credentials first before attempting SSH.',
      'Treat config, log extraction, and permission repair as one linked chain.',
      'You need every clue fragment to assemble the final flag correctly.'
    ]
  }
];

export const mockData: MockData = {
  operativeName: 'ALPHA-7',
  accessCode: 'DEFEND-2026',
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
