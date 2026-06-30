"use strict";

const SCORE_LIMIT = 10;
const MINIMUM_CORRECT_ANSWERS = 25;
const MAXIMUM_CORRECT_ANSWERS = 100;
const MAXIMUM_SCORE = 50000000;
const SUBMISSION_WINDOW_MS = 8000;
const VALID_DIFFICULTIES = new Set(["easy", "medium", "hard", "veryHard"]);
const recentSubmissions = new Map();

function sendJson(response, status, payload) {
  response.status(status);
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.end(JSON.stringify(payload));
}

function getSupabaseConfig() {
  return {
    url: (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/+$/, ""),
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  };
}

function getRequestOriginHost(request) {
  return request.headers["x-forwarded-host"] || request.headers.host || "";
}

function isSameOriginRequest(request) {
  const origin = request.headers.origin;
  if (!origin) {
    return true;
  }

  try {
    return new URL(origin).host === getRequestOriginHost(request);
  } catch {
    return false;
  }
}

function isCapabilityRequest(request) {
  try {
    const host = getRequestOriginHost(request) || "localhost";
    const url = new URL(request.url || "/api/champions", `https://${host}`);
    return request.method === "GET" && url.searchParams.get("capability") === "1";
  } catch {
    return false;
  }
}

function parseBody(request) {
  if (request.body && typeof request.body === "object") {
    return request.body;
  }

  if (typeof request.body === "string" && request.body.length > 0) {
    return JSON.parse(request.body);
  }

  return {};
}

function normalizeName(value) {
  return String(value || "")
    .normalize("NFKC")
    .replace(/[\u0000-\u001f\u007f<>]/g, "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 18);
}

function validateSubmission(rawBody) {
  const playerId = String(rawBody.playerId || "").trim();
  const playerName = normalizeName(rawBody.playerName);
  const score = Number(rawBody.score);
  const correctAnswers = Number(rawBody.correctAnswers);
  const levelReached = Number(rawBody.levelReached);
  const difficulty = String(rawBody.difficulty || "");
  const timeLimitEnabled = rawBody.timeLimitEnabled === true;
  const expectedLevel = Math.min(4, Math.floor(correctAnswers / 25) + 1);

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(playerId)) {
    return { error: "מזהה השחקן אינו תקין." };
  }
  if (!playerName) {
    return { error: "שם השחקן חסר." };
  }
  if (!Number.isInteger(score) || score < 0 || score > MAXIMUM_SCORE) {
    return { error: "הניקוד אינו תקין." };
  }
  if (
    !Number.isInteger(correctAnswers)
    || correctAnswers < MINIMUM_CORRECT_ANSWERS
    || correctAnswers > MAXIMUM_CORRECT_ANSWERS
  ) {
    return { error: "אפשר לפרסם שיא רק לאחר מעבר השלב הראשון." };
  }
  if (!Number.isInteger(levelReached) || levelReached !== expectedLevel) {
    return { error: "השלב שדווח אינו תואם להתקדמות במשחק." };
  }
  if (!VALID_DIFFICULTIES.has(difficulty)) {
    return { error: "רמת הקושי אינה תקינה." };
  }

  return {
    value: {
      playerId,
      playerName,
      score,
      correctAnswers,
      levelReached,
      difficulty,
      timeLimitEnabled
    }
  };
}

function getRateLimitKey(request, playerId) {
  const forwardedFor = String(request.headers["x-forwarded-for"] || "");
  const clientIp = forwardedFor.split(",")[0].trim() || request.socket?.remoteAddress || "unknown";
  return `${clientIp}:${playerId}`;
}

function isRateLimited(request, playerId) {
  const key = getRateLimitKey(request, playerId);
  const now = Date.now();
  const previous = recentSubmissions.get(key) || 0;

  if (now - previous < SUBMISSION_WINDOW_MS) {
    return true;
  }

  recentSubmissions.set(key, now);
  if (recentSubmissions.size > 500) {
    for (const [entryKey, timestamp] of recentSubmissions) {
      if (now - timestamp > SUBMISSION_WINDOW_MS * 4) {
        recentSubmissions.delete(entryKey);
      }
    }
  }
  return false;
}

async function supabaseRequest(config, path, options = {}) {
  const response = await fetch(`${config.url}${path}`, {
    ...options,
    headers: {
      apikey: config.serviceRoleKey,
      Authorization: `Bearer ${config.serviceRoleKey}`,
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error("Supabase request failed");
    error.status = response.status;
    error.details = payload;
    throw error;
  }

  return payload;
}

function mapScore(row) {
  return {
    playerName: row.player_name,
    score: row.score,
    correctAnswers: row.correct_answers,
    levelReached: row.level_reached,
    difficulty: row.difficulty,
    timeLimitEnabled: row.time_limit_enabled,
    updatedAt: row.updated_at
  };
}

async function getScores(config) {
  const query = new URLSearchParams({
    select: "player_name,score,correct_answers,level_reached,difficulty,time_limit_enabled,updated_at",
    order: "score.desc,correct_answers.desc,updated_at.asc",
    limit: String(SCORE_LIMIT)
  });
  const rows = await supabaseRequest(config, `/rest/v1/champion_scores?${query.toString()}`, {
    method: "GET"
  });
  return Array.isArray(rows) ? rows.map(mapScore) : [];
}

async function submitScore(config, submission) {
  const result = await supabaseRequest(config, "/rest/v1/rpc/submit_champion_score", {
    method: "POST",
    body: JSON.stringify({
      p_player_id: submission.playerId,
      p_player_name: submission.playerName,
      p_score: submission.score,
      p_correct_answers: submission.correctAnswers,
      p_level_reached: submission.levelReached,
      p_difficulty: submission.difficulty,
      p_time_limit_enabled: submission.timeLimitEnabled
    })
  });

  return Array.isArray(result) ? result[0] : result;
}

module.exports = async function championsHandler(request, response) {
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("Referrer-Policy", "same-origin");

  if (!isSameOriginRequest(request)) {
    sendJson(response, 403, {
      code: "origin_not_allowed",
      message: "הבקשה חייבת להגיע מאתר המשחק."
    });
    return;
  }

  const config = getSupabaseConfig();
  if (isCapabilityRequest(request)) {
    response.setHeader("Cache-Control", "no-store");
    if (!config.url || !config.serviceRoleKey) {
      sendJson(response, 200, {
        publicAvailable: false,
        code: "leaderboard_not_configured",
        message: "טבלת השיאים עדיין לא הוגדרה."
      });
      return;
    }

    try {
      await getScores(config);
      sendJson(response, 200, {
        publicAvailable: true
      });
    } catch {
      sendJson(response, 200, {
        publicAvailable: false,
        code: "leaderboard_unavailable",
        message: "טבלת השיאים הציבורית לא זמינה כרגע."
      });
    }
    return;
  }

  if (!config.url || !config.serviceRoleKey) {
    sendJson(response, 503, {
      code: "leaderboard_not_configured",
      message: "טבלת השיאים עדיין לא הוגדרה."
    });
    return;
  }

  try {
    if (request.method === "GET") {
      response.setHeader("Cache-Control", "public, s-maxage=30, stale-while-revalidate=60");
      const scores = await getScores(config);
      sendJson(response, 200, { scores });
      return;
    }

    if (request.method === "POST") {
      response.setHeader("Cache-Control", "no-store");
      let body;
      try {
        body = parseBody(request);
      } catch {
        sendJson(response, 400, {
          code: "invalid_json",
          message: "מבנה הבקשה אינו תקין."
        });
        return;
      }

      const validation = validateSubmission(body);
      if (validation.error) {
        sendJson(response, 400, {
          code: "invalid_score",
          message: validation.error
        });
        return;
      }

      if (isRateLimited(request, validation.value.playerId)) {
        sendJson(response, 429, {
          code: "rate_limited",
          message: "יש להמתין כמה שניות לפני פרסום נוסף."
        });
        return;
      }

      const savedScore = await submitScore(config, validation.value);
      sendJson(response, 200, {
        ok: true,
        improved: savedScore?.improved !== false,
        score: Number(savedScore?.score) || validation.value.score
      });
      return;
    }

    response.setHeader("Allow", "GET, POST");
    sendJson(response, 405, {
      code: "method_not_allowed",
      message: "שיטת הבקשה אינה נתמכת."
    });
  } catch (error) {
    console.error("Champion leaderboard error", {
      status: error?.status,
      details: error?.details
    });
    sendJson(response, 502, {
      code: "leaderboard_unavailable",
      message: "טבלת השיאים אינה זמינה כרגע."
    });
  }
};
