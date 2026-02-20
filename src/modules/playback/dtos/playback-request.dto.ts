export interface PlaybackRequestDto {
  authorization?: string | null; // "Bearer <token>"
  sessionId?: string | undefined;
  ip?: string | undefined;
  userAgent?: string;
}
