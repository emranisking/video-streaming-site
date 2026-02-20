export class PlaybackResponseDto {
  manifestUrl?: string;
  locked: boolean;
  reason?: string;
  freeRemaining?: number; // how many free plays left (for guest)
}
