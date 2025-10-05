import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RequestQueueService {
  private queue: Array<() => Promise<any>> = [];
  private isProcessing = false;

  /**
   * Add a request to the queue and process it
   * This ensures requests are processed sequentially to avoid rate limiting
   */
  async enqueue<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await requestFn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const request = this.queue.shift();
      if (request) {
        try {
          await request();
          // Small delay between requests to be nice to the API
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
          console.error('[RequestQueue] Error processing request:', error);
        }
      }
    }

    this.isProcessing = false;
  }
}