export interface ActivityCoachContent {
  description: string;
  steps: string[];
  hints: string[];
}

export const activityCoachContent: Record<string, ActivityCoachContent> = {
  'os-identifier': {
    description:
      'You are a digital detective. For each computer screenshot, match the correct operating system, who made it, and one key feature. When all matches are right, the hidden key unlocks the flag.',
    steps: [
      'Read the clue text for Interface A to E before choosing anything.',
      'For each interface, pick one OS name, one creator, and one defining feature.',
      'Click verify and fix only the rows marked wrong until all 5 are correct.'
    ],
    hints: [
      'Windows is made by Microsoft and is known for the Start menu and .exe apps.',
      'macOS is made by Apple and is known for Finder and the Dock.',
      'Ubuntu, Kali Linux, and Raspberry Pi OS are Linux family systems with different goals.'
    ]
  },
  'timeline-scramble': {
    description:
      'A cyber incident story has been shuffled. Put each event in the right time order so the full story makes sense from first action to final impact.',
    steps: [
      'Find the earliest event first, then the latest event last.',
      'Place the middle events in order by timestamp and cause-effect logic.',
      'Recheck that each step naturally leads to the next, then submit.'
    ],
    hints: [
      'Server logs usually give the most reliable timestamps.',
      'If two events are close, ask: which one had to happen first?',
      'Check timezone labels before deciding final order.'
    ]
  },
  'torvalds-first-message': {
    description:
      'You have a historic Linux message with hidden data. Decode the secret text and confirm the message is authentic using clues in its metadata.',
    steps: [
      'Inspect the message text and headers for anything encoded or unusual.',
      'Decode the hidden segment with the correct method from the clues.',
      'Confirm both content and origin details before final submit.'
    ],
    hints: [
      'Do not trust text alone, check sender and header clues too.',
      'Look for patterns like repeated symbols, odd spacing, or coded blocks.',
      'Authentic means both the message and its source line up.'
    ]
  },
  'open-source-or-closed': {
    description:
      'You are helping a team ship software safely. Classify each license correctly so they know what can be used, changed, and shared.',
    steps: [
      'Read each software card and identify whether it is open source or closed source.',
      'Check whether modification and redistribution are allowed.',
      'Submit when every card is classified with confidence.'
    ],
    hints: [
      'Open source usually allows code viewing and changes under rules.',
      'Closed source usually restricts copying and editing source code.',
      'Attribution requirements still matter even in permissive licenses.'
    ]
  },
  'the-first-terminal': {
    description:
      'This is your first shell mission. Use basic terminal commands to move through folders and read the file that contains the flag.',
    steps: [
      'Use `pwd` to know where you are and `ls` to see files and folders.',
      'Use `cd folder_name` to move and `cd ..` to go back.',
      'Use `cat filename` to open files and find the flag.'
    ],
    hints: [
      'If a file seems missing, try listing hidden files too.',
      'Read paths carefully, one wrong character can send you to a decoy.',
      'Slow and careful command typing beats rushing.'
    ]
  },
  'distro-detective': {
    description:
      'Three Linux systems look similar, but they are different distributions. Use package and release clues to identify each one correctly.',
    steps: [
      'Check distro identity files and package-manager clues first.',
      'Match each environment to the distro family it belongs to.',
      'Submit only after each environment has at least two supporting clues.'
    ],
    hints: [
      'Ubuntu-like systems often share apt-style package clues.',
      'Release files are often faster than guessing from desktop theme.',
      'Kernel details can support your final answer, not replace it.'
    ]
  },
  'kernel-quiz-gauntlet': {
    description:
      'Boss round. Answer mixed Linux and cyber questions under pressure. Accuracy matters more than speed because wrong answers create harder branches.',
    steps: [
      'Read every question fully before selecting an answer.',
      'Lock one answer at a time and keep your focus on correctness.',
      'Finish all questions, then review your score feedback.'
    ],
    hints: [
      'Eliminate clearly wrong options first to improve your odds.',
      'Watch for two answers that look similar but differ in one key word.',
      'If unsure, pick the option supported by fundamentals you already learned.'
    ]
  },
  'footprint-finder': {
    description:
      'Follow digital breadcrumbs across public posts. Your goal is to rebuild one person profile from clues spread across different online places.',
    steps: [
      'Read every clue card carefully before typing answers.',
      'Fill the five profile fields using exact details from the clues.',
      'Submit, then fix only incorrect fields until all are confirmed.'
    ],
    hints: [
      'Small details like place names and routines are very important.',
      'One clue can help solve more than one field.',
      'Type names and places clearly to avoid near-miss answers.'
    ]
  },
  'password-vault-break-in': {
    description:
      'You are proving why weak passwords are risky. Build the password from personal clues in the exact pattern and open the vault.',
    steps: [
      'Read all profile clues and identify each password piece.',
      'Combine pieces in the expected order into one password.',
      'Try the password and adjust only the part that seems wrong.'
    ],
    hints: [
      'Look for pet name, year, lucky number, and punctuation hints.',
      'Case and symbols matter in passwords.',
      'Do not add extra spaces at the start or end.'
    ]
  },
  'spot-the-phish-speed-round': {
    description:
      'Messages appear quickly. Decide if each is safe or phishing using warning signs, even when the message sounds urgent.',
    steps: [
      'Read sender, message tone, and request before clicking.',
      'Mark suspicious urgency, weird links, or pressure as phishing.',
      'Complete all rounds and learn from missed signals.'
    ],
    hints: [
      'Real services rarely ask for passwords through random messages.',
      'Urgent fear-based language is a common phishing trick.',
      'A message can look official and still be fake.'
    ]
  },
  '2fa-tower-defence': {
    description:
      'Defend an account by placing the right second-factor security at the right checkpoint. Correct setup blocks attack waves.',
    steps: [
      'Read each wave type and match it to the best defense tower.',
      'Place towers at required checkpoints before running the wave.',
      'Adjust placement if any wave gets through, then retry.'
    ],
    hints: [
      'Each attack type has one strongest matching defense.',
      'Wrong placement can fail even if you chose the right tower.',
      'Check labels twice before starting a wave.'
    ]
  },
  'privacy-settings-escape-room': {
    description:
      'A phone has unsafe privacy settings. Fix each setting to protect personal data and unlock the escape.',
    steps: [
      'Review each setting and decide the safer option.',
      'Apply secure choices one by one and watch progress updates.',
      'Finish all required settings to unlock the final flag.'
    ],
    hints: [
      'Default settings are not always the safest settings.',
      'Only allow apps permissions they truly need.',
      'Lock-screen privacy can stop accidental data leaks.'
    ]
  },
  'social-engineers-trap': {
    description:
      'Boss social-engineering mission. Read a chat conversation and identify manipulation tactics before the attacker gets what they want.',
    steps: [
      'Read the full conversation from start to finish.',
      'Mark each tactic used by the attacker and explain the goal.',
      'Choose the safest response that includes getting help and blocking.'
    ],
    hints: [
      'Attackers often build trust before asking for risky actions.',
      'Secrecy and urgency are major red flags together.',
      'The safest response usually includes a trusted adult.'
    ]
  },
  'ip-detective': {
    description:
      'A network map has one suspicious public IP hiding among private internal addresses. Find the rogue device and report it correctly.',
    steps: [
      'Scan all device IPs and separate private vs non-private ranges.',
      'Identify which device and segment contain the rogue IP.',
      'Submit all required fields: count, device, segment, and IP.'
    ],
    hints: [
      'Private ranges include 10.x.x.x and 192.168.x.x.',
      'Only one IP should break the private-range pattern here.',
      'Use the table labels to match IP to the right device.'
    ]
  },
  'view-source-treasure-hunt': {
    description:
      'The flag is split into hidden webpage fragments. Use preview, source, styles, and elements to collect every piece.',
    steps: [
      'Check Source first for comments and hidden input values.',
      'Check Styles and Elements for content not visible in preview.',
      'Enter all six fragments exactly and validate.'
    ],
    hints: [
      'Some clues are invisible on screen but visible in code.',
      'Pseudo-elements can hide text in CSS `content`.',
      'Copy symbols exactly, including braces and underscores.'
    ]
  },
  'multi-cipher-gauntlet': {
    description:
      'A message was encoded in layers. Decode in the correct order using terminal commands to restore the readable sentence.',
    steps: [
      'Start in the terminal and list files to find the cipher clues.',
      'Run reverse first, then ROT13, then Caesar -5 in that order.',
      'Paste the fully decoded sentence into the answer box.'
    ],
    hints: [
      'Wrong decode order gives text that still looks scrambled.',
      'Save each stage result before moving to the next stage.',
      'The final sentence should read like normal English.'
    ]
  },
  'pixel-spy': {
    description:
      'A normal-looking image hides secret text. Download it to the right folder and run the stego decoder to extract the payload.',
    steps: [
      'Navigate folders and download the image from uploads.',
      'Move to downloads and run the decode command there.',
      'Read the extracted hidden message and capture the flag.'
    ],
    hints: [
      'You must download first before decode can work.',
      'Run decode from the expected directory path.',
      'Filename must match exactly.'
    ]
  },
  'hash-cracker-showdown': {
    description:
      'You are cracking hash clues using a fixed wordlist. Match each MD5 hash to a word, then convert matched number words into digits.',
    steps: [
      'Use the provided wordlist and hash tool to test candidates.',
      'Match each target hash to the correct word in order.',
      'Convert number words to digits and submit final result.'
    ],
    hints: [
      'Do not guess random words, use the provided list only.',
      'Keep answer order the same as the hash order.',
      'Double-check similar words before locking final digits.'
    ]
  },
  'dns-race': {
    description:
      'Query DNS records and answer five precise questions about a domain. Small copying mistakes can fail the challenge.',
    steps: [
      'Run separate lookups for A, MX, CNAME, and TXT data.',
      'Record each answer immediately after each query.',
      'Submit exact values, including case where required.'
    ],
    hints: [
      'A and MX answers are different record types, do not mix them.',
      'Count CNAME answers carefully before entering totals.',
      'TXT values should be copied exactly as shown.'
    ]
  },
  'encrypted-transmission': {
    description:
      'Boss decode chain. Convert hex to ASCII, decode Base64, then combine with the QR clue to build one final flag.',
    steps: [
      'Decode hex first to reveal an intermediate text string.',
      'Decode the revealed Base64 to get the first flag part.',
      'Collect QR part and combine both parts in the correct order.'
    ],
    hints: [
      'If hex output looks unreadable, recheck spacing and byte order.',
      'Base64 stage is not optional, it reveals meaningful text.',
      'Final order matters: part one then part two.'
    ]
  },
  'hidden-file-heist': {
    description:
      'A hidden file with "classified" in its name is somewhere inside `/home/agent`. Use Linux file-search commands to locate it and read the flag.',
    steps: [
      'Use `ls -la` to reveal hidden folders while exploring.',
      "Run `find /home/agent -name '.*classified*' -type f` to locate the file.",
      'Use `cat` on the found path to read the flag.'
    ],
    hints: [
      'Files starting with a dot are hidden by default.',
      'The `find` command is your fastest shortcut for this mission.',
      'Copy the full path exactly before running `cat`.'
    ]
  },
  'permission-impossible': {
    description:
      'You found the right file, but permissions block access. Read permission bits, fix them with chmod, then open the protected file.',
    steps: [
      'Try `cat /mission/vault/eyes-only.txt` and observe the error.',
      'Inspect permissions with `ls -la /mission/vault/`.',
      'Use the correct chmod to add read access, then `cat` again.'
    ],
    hints: [
      'Read bit is different from execute bit.',
      'If your first chmod fails, check which bit actually changed.',
      'Least privilege is best: add only what is needed.'
    ]
  },
  'log-hound': {
    description:
      'This mission is about reading a big log like a real analyst. Use grep, pipes, and wc to answer four questions and assemble the result.',
    steps: [
      'Confirm log location and size with `ls` and `wc -l`.',
      'Use grep pipelines to get 404 count, top IP, first CRITICAL time, and unique usernames.',
      'Enter all four answers in the right fields and verify.'
    ],
    hints: [
      'Break big tasks into one command per question.',
      'Pipes `|` let you chain filters and counters together.',
      'Write answers down as you find them so you do not mix order.'
    ]
  },
  'encoded-script': {
    description:
      'A script comment hides a Base64 payload. Extract the encoded text and decode it in the terminal to reveal the message with the flag.',
    steps: [
      'Open the script with `cat /scripts/launcher.sh`.',
      'Copy the Base64 string from the comment line.',
      'Run `echo [string] | base64 -d` to decode and recover the flag text.'
    ],
    hints: [
      'Copy only the encoded characters, not extra words.',
      'Quotes can help if your string includes special characters.',
      'If decode fails, re-copy the string carefully.'
    ]
  },
  'network-recon-mission': {
    description:
      'You are following a clue trail across web endpoints. Start at `/start` and use each response to discover the next curl command.',
    steps: [
      'Run `curl http://[lab-ip]/start` to begin.',
      'Read each response carefully and call the next endpoint exactly.',
      'Continue through all hops until the final endpoint returns the flag.'
    ],
    hints: [
      'Do not guess endpoint names, follow returned clues exactly.',
      'One typo can break the chain, copy paths carefully.',
      'Treat every response as a map to the next step.'
    ]
  },
  'user-hunter': {
    description:
      'A rogue user account was planted on the system. Find the fake user, track their login trail, and recover files they created.',
    steps: [
      'Use `cat /etc/passwd` to spot the suspicious username.',
      'Run `last [username]` to find login time and source.',
      'Run `find / -user [username] -type f 2>/dev/null`, then `cat` found files for the flag.'
    ],
    hints: [
      'The rogue account usually looks out of place in the list.',
      'Use exact username spelling in `last` and `find` commands.',
      'There may be multiple files, check all of them.'
    ]
  },
  'operation-root-access': {
    description:
      'Grand Final Boss. Decode browser credentials, SSH into a remote machine, collect three clue parts, and assemble the final flag.',
    steps: [
      'Decode the browser Base64 to get SSH username and password.',
      'Use `ssh [username]@[challenge-server]` to enter the remote system.',
      'Collect clues from hidden config, log grep, and permission-fixed document, then combine them into the final flag.'
    ],
    hints: [
      'Stage 1 must be correct before SSH works.',
      'Use `grep` for the log clue instead of reading all lines manually.',
      'If a file says permission denied, fix read permission then retry cat.'
    ]
  }
};
