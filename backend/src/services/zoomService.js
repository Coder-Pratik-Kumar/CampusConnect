import { config } from '../config/env.js';

// ─── Token Cache ──────────────────────────────────────────────────────────────
// In-memory cache; clears on process restart (re-authenticates automatically).
let _cachedToken = null;
let _tokenExpiresAt = 0; // Unix ms

/**
 * Obtain a Zoom Server-to-Server OAuth access token.
 * Uses Basic Auth: base64(clientId:clientSecret).
 * Caches the token and reuses it until it's within 60 seconds of expiry.
 *
 * @returns {Promise<string>} The bearer access token.
 * @throws  {Error} If Zoom authentication fails.
 */
export const getAccessToken = async () => {
  const now = Date.now();

  // Return cached token if still valid (60 s buffer)
  if (_cachedToken && now < _tokenExpiresAt - 60_000) {
    return _cachedToken;
  }

  const { zoomAccountId, zoomClientId, zoomClientSecret } = config;

  if (!zoomAccountId || !zoomClientId || !zoomClientSecret) {
    throw new Error(
      '[ZoomService] Zoom credentials are not configured. ' +
      'Set ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, and ZOOM_CLIENT_SECRET in backend/.env.'
    );
  }

  // Basic Auth: base64(clientId:clientSecret)
  const credentials = Buffer.from(`${zoomClientId}:${zoomClientSecret}`).toString('base64');

  const url = `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${encodeURIComponent(zoomAccountId)}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  if (!response.ok) {
    // Log only the status — never the credentials or raw response body which may contain tokens
    const statusText = response.statusText || 'Unknown error';
    console.error(`[ZoomService] Token request failed: HTTP ${response.status} ${statusText}`);
    throw new Error(
      `Zoom authentication failed (HTTP ${response.status}). Check ZOOM credentials in backend/.env.`
    );
  }

  const data = await response.json();

  // expires_in is in seconds
  const expiresInMs = (data.expires_in || 3600) * 1000;
  _cachedToken = data.access_token;
  _tokenExpiresAt = now + expiresInMs;

  // Never log the token value itself
  console.log(`[ZoomService] Access token obtained. Expires in ${data.expires_in || 3600}s.`);

  return _cachedToken;
};

/**
 * Create a scheduled Zoom meeting under the CampusConnect account.
 *
 * @param {Object} params
 * @param {string} params.topic           - Meeting topic (e.g. "CampusConnect Learning Session - Java")
 * @param {string} params.startTime       - ISO 8601 datetime string in UTC (e.g. "2026-09-04T13:30:00Z")
 * @param {number} params.durationMinutes - Duration in minutes (e.g. 60)
 * @returns {Promise<{ meetingId: string, joinUrl: string, password: string }>}
 * @throws  {Error} If Zoom API returns an error or an incomplete response.
 */
export const createZoomMeeting = async ({ topic, startTime, durationMinutes }) => {
  const token = await getAccessToken();

  const meetingPayload = {
    topic,
    type: 2, // Scheduled meeting
    start_time: startTime,
    duration: durationMinutes,
    timezone: 'UTC',
    settings: {
      join_before_host: true, // Participants can join without waiting for host
      waiting_room: false,
      host_video: true,
      participant_video: true,
      auto_recording: 'none',
    },
  };

  const response = await fetch('https://api.zoom.us/v2/users/me/meetings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(meetingPayload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    // Log status and sanitised body; the bearer token is never included in the log
    console.error(`[ZoomService] Meeting creation failed: HTTP ${response.status}`, errorBody);
    throw new Error(
      `Zoom meeting creation failed (HTTP ${response.status}). Please try accepting the session again.`
    );
  }

  const meeting = await response.json();

  // Validate critical fields before returning
  if (!meeting.join_url || !meeting.id) {
    console.error(
      '[ZoomService] Zoom response missing join_url or id:',
      JSON.stringify({ id: meeting.id, hasJoinUrl: !!meeting.join_url })
    );
    throw new Error('Zoom returned an incomplete meeting response. Please try again.');
  }

  // Return only what CampusConnect needs — NEVER return start_url
  return {
    meetingId: String(meeting.id),
    joinUrl: meeting.join_url,
    password: meeting.password || '',
  };
};

/**
 * Clear the in-memory token cache.
 * Exported for use in tests to force re-authentication.
 */
export const _clearTokenCache = () => {
  _cachedToken = null;
  _tokenExpiresAt = 0;
};
