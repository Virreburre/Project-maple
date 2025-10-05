import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { RequestQueueService } from './request-queue.service';

export interface NexonRankingResponse {
  totalCount: number;
  ranks: Array<{
    characterID: number;
    characterName: string;
    exp: number;
    gap: number;
    jobDetail: number;
    jobID: number;
    level: number;
    rank: number;
    startRank: number;
    worldID: number;
    characterImgURL: string;
    isSearchTarget: boolean;
  }>;
}

@Injectable({
  providedIn: 'root',
})
export class NexonApiService {
  private http = inject(HttpClient);
  private requestQueue = inject(RequestQueueService);

  // Use CORS proxy to avoid CORS errors in browser
  private corsProxy = 'https://corsproxy.io/?';
  private baseUrl = 'https://www.nexon.com/api/maplestory/no-auth/ranking/v2/eu';

  /**
   * Build full URL with query parameters, then encode for CORS proxy
   */
  private buildProxiedUrl(params: Record<string, string>): string {
    const queryString = new URLSearchParams(params).toString();
    const fullUrl = `${this.baseUrl}?${queryString}`;
    return this.corsProxy + encodeURIComponent(fullUrl);
  }

  /**
   * Fetch character image URL from Nexon API (queued)
   * @param characterName The name of the character to search for
   * @returns The character's image URL or null if not found
   */
  async getCharacterImageUrl(characterName: string): Promise<string | null> {
    console.log('[NexonAPI] getCharacterImageUrl called for:', characterName);

    return this.requestQueue.enqueue(async () => {
      try {
        const params = {
          type: 'overall',
          id: 'weekly',
          reboot_index: '0',
          page_index: '1',
        };

        const url = this.buildProxiedUrl(params);
        console.log('[NexonAPI] Fetching from URL:', url);

        const response = await firstValueFrom(this.http.get<NexonRankingResponse>(url));

        console.log('[NexonAPI] Response received. Total count:', response.totalCount);
        console.log('[NexonAPI] Number of ranks:', response.ranks.length);

        if (response.ranks.length > 0) {
          console.log(
            '[NexonAPI] First 3 character names:',
            response.ranks.slice(0, 3).map((r) => r.characterName)
          );
        }

        // Check if we found the character in top rankings
        if (response.totalCount > 0 && response.ranks.length > 0) {
          const character = response.ranks.find(
            (rank) => rank.characterName.toLowerCase() === characterName.toLowerCase()
          );

          if (character) {
            console.log('[NexonAPI] Character FOUND:', character.characterName);
            console.log('[NexonAPI] Image URL:', character.characterImgURL);
            console.log('[NexonAPI] Level:', character.level);
            return character.characterImgURL;
          } else {
            console.log('[NexonAPI] Character NOT found in top rankings');
          }
        }

        return null;
      } catch (error) {
        console.error('[NexonAPI] Error fetching character image:', error);
        return null;
      }
    });
  }

  /**
   * Fetch character level and image URL from Nexon API
   * Searches through weekly rankings for the character (max 50 pages = top 10,000)
   * @param characterName The name of the character to search for
   * @returns Object with level and imageUrl, or null if not found
   */
  async getCharacterLevelAndImage(
    characterName: string
  ): Promise<{ level: number; imageUrl: string } | null> {
    console.log('[NexonAPI] getCharacterLevelAndImage called for:', characterName);

    return this.requestQueue.enqueue(async () => {
      try {
        const maxPages = 50; // Search top 10,000 players (200 per page × 50)

        for (let page = 21; page <= maxPages; page++) {
          const params = {
            type: 'overall',
            id: 'weekly',
            reboot_index: '0',
            page_index: page.toString(),
            character_name: characterName,
          };

          const url = this.buildProxiedUrl(params);
          console.log(`[NexonAPI] Searching page ${page}...`);
          console.log(`[NexonAPI] URL: ${url}`);

          const response = await firstValueFrom(this.http.get<NexonRankingResponse>(url));

          console.log(
            `[NexonAPI] Page ${page} - Total count: ${response.totalCount}, Ranks: ${response.ranks.length}`
          );

          if (response.totalCount > 0 && response.ranks.length > 0) {
            const character = response.ranks.find(
              (rank) => rank.characterName.toLowerCase() === characterName.toLowerCase()
            );

            if (character) {
              return {
                level: character.level,
                imageUrl: character.characterImgURL,
              };
            }
          } else {
            // No results on this page, stop searching
            console.log(`[NexonAPI] ❌ No results on page ${page}, stopping search`);
            break;
          }

          // Small delay between pages to be nice to the API
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        console.log('[NexonAPI] ❌ Character not found in top', maxPages * 200, 'players');
        return null;
      } catch (error) {
        console.error('[NexonAPI] ❌ Error fetching character data:', error);
        return null;
      }
    });
  }
}
