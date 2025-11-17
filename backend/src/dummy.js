// dummy.js
import fetch from "node-fetch";
import "dotenv/config";

const JUDGE0_URL = process.env.JUDGE0_URL || "https://ce.judge0.com";

// 🔹 Use Python 3 (71) – change if you want another language
const LANGUAGE_ID = 71;

// 🔹 Optimized N-Queens using bitmasks (very fast, works up to N=14 easily)
// For each test case, input is N, output is count of solutions.
const SOURCE_CODE = `
import sys

def solve_n_queens(n):
    # Bitmask-based backtracking:
    # cols:   columns that are already occupied
    # diag1:  main diagonals (r - c)
    # diag2:  anti-diagonals (r + 
    # Represented with bits relative to row.
    full = (1 << n) - 1
    count = 0

    def backtrack(cols, diag1, diag2):
        nonlocal count
        if cols == full:
            count +=
            return
        # Positions where we can place a queen this row
        available = full & ~(cols | diag1 | diag2)
        while available:
            bit = available & -available  # take lowest set bit
            available -= bit
            backtrack(
                cols | bit,
                (diag1 | bit) << 1 & full,  # shift and mask to n bits
                (diag2 | bit) >> 1
            )

    backtrack(0, 0, 0)
    return count

data = sys.stdin.read().strip().split()
t = int(data[0])
idx = 1
for _ in range(t):
    n = int(data[idx]); idx += 1
    print(solve_n_queens(n))
`.trim()

// 🔹 Known number of solutions for N-Queens (N = 1..14)
// (classic sequence: 1,0,0,2,10,4,40,92,352,724,2680,14200,73712,365596)
const knownSolutions = {
  1: 1,
  2: 0,
  3: 0,
  4: 2,
  5: 10,
  6: 4,
  7: 40,
  8: 92,
  9: 352,
  10: 724,
  11: 2680,
  12: 14200,
  13: 73712,
  14: 365596,
};

// 🔹 Build 50 "heavy-ish" testcases with N between 8 and 14
const baseNs = [8, 9, 10, 11, 12, 13, 14];
const testNs = [];
const NUM_TESTS = 50;

while (testNs.length < NUM_TESTS) {
  for (const n of baseNs) {
    if (testNs.length < NUM_TESTS) testNs.push(n);
    else break;
  }
}

// Build stdin:
// First line: t (number of testcases)
// Next t lines: each "N"
let stdin = `${testNs.length}\n`;
const expectedLines = [];

for (const n of testNs) {
  stdin += `${n}\n`;
  expectedLines.push(knownSolutions[n]);
}

const EXPECTED_OUTPUT = expectedLines.join("\n") + "\n";

async function runLongProblem() {
  console.log("🔁 Sending optimized N-Queens to Judge0...");
  console.log("👉 Using:", JUDGE0_URL);
  console.log("📦 Testcases:", testNs.length, "Ns between 8 and 14");

  const res = await fetch(`${JUDGE0_URL}/submissions?wait=true`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      source_code: SOURCE_CODE,
      language_id: LANGUAGE_ID,
      stdin,
      expected_output: EXPECTED_OUTPUT,
      cpu_time_limit: 3,     // should pass with bitmask, adjust if needed
      memory_limit: 512000,  // 512 MB
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(res.status);
  }

  const result = await res.json();

  console.log("\\n✅ Judge0 response:");
  console.log("Status:", result.status?.description);
  console.log("Time:", result.time, "sec");
  console.log("Memory:", result.memory, "KB");

  console.log("\\n🔍 Your stdout (first 200 chars):");
  console.log((result.stdout || "").slice(0, 200));

  console.log("\\n📌 Expected output (first 200 chars):");
  console.log(EXPECTED_OUTPUT.slice(0, 200));
  console.log(result.stderr);

  if (result.stdout === EXPECTED_OUTPUT && result.status?.id === 3) {
    console.log("\\n🎉 All", testNs.length, "N-Queens testcases PASSED!");
  } else {
    console.log("\\n❌ Some testcases FAILED.");
  }
}


runLongProblem().catch((err) => {
  console.error("❌ Error running long problem:", err.message);
});
