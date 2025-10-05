import { Injectable, signal } from '@angular/core';
import { NexonApiService } from './nexon-api';

export interface MapleCharacter {
  id: number;
  name: string;
  level: number;
  job: string;
  exp: number;
  rank: number;
  guild?: string;
  world: string;
  imageUrl?: string;
  isLoading?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CharacterStorageService {
  private readonly STORAGE_KEY = 'maple_characters';
  private _characters = signal<MapleCharacter[]>([]);
  private _nextId = 1;

  constructor(private nexonApi: NexonApiService) {
    this.loadCharacters();
  }

  get characters() {
    return this._characters.asReadonly();
  }

  private loadCharacters(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this._characters.set(data.characters || []);
        this._nextId = data.nextId || 1;
      }
    } catch (error) {
      console.error('Error loading characters from localStorage:', error);
      this._characters.set([]);
    }
  }

  private saveCharacters(): void {
    try {
      const data = {
        characters: this._characters(),
        nextId: this._nextId
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving characters to localStorage:', error);
    }
  }

  async addCharacter(name: string): Promise<{ success: boolean; message: string }> {
    try {
      const characterName = name.trim();
      
      // Check if character already exists
      const existingChar = this._characters().find(char => 
        char.name.toLowerCase() === characterName.toLowerCase()
      );
      
      if (existingChar) {
        return { success: false, message: 'Character already exists!' };
      }

      // Create initial character with loading state
      const newCharacter: MapleCharacter = {
        id: this._nextId++,
        name: characterName,
        level: Math.floor(Math.random() * 100) + 200, // Temporary level
        job: this.getRandomJob(),
        exp: Math.floor(Math.random() * 1000000000),
        rank: Math.floor(Math.random() * 10000) + 1,
        guild: this.getRandomGuild(),
        world: 'Reboot',
        isLoading: true,
        imageUrl: undefined
      };

      // Add character to list immediately (with loading state)
      this._characters.update(chars => [...chars, newCharacter]);
      this.saveCharacters();

      // Fetch real character data from Nexon API in background
      this.fetchCharacterImageAsync(newCharacter.id, characterName);

      return { success: true, message: `Character "${characterName}" added successfully! Fetching real image...` };
      
    } catch (error) {
      console.error('Error adding character:', error);
      return { success: false, message: 'Failed to add character. Please try again.' };
    }
  }

  private async fetchCharacterImageAsync(characterId: number, characterName: string): Promise<void> {
    try {
      console.log(`🔍 Fetching Nexon data for character: ${characterName}`);
      
      // Try to get character level and image from Nexon API
      const nexonData = await this.nexonApi.getCharacterLevelAndImage(characterName);
      
      if (nexonData) {
        console.log(`✅ Found real character data for ${characterName}:`, nexonData);
        
        // Update character with real data
        this._characters.update(chars => 
          chars.map(char => 
            char.id === characterId 
              ? { 
                  ...char, 
                  level: nexonData.level,
                  imageUrl: nexonData.imageUrl,
                  isLoading: false
                }
              : char
          )
        );
        this.saveCharacters();
        
      } else {
        console.log(`❌ No Nexon data found for ${characterName}, using placeholder`);
        
        // Update character to remove loading state (keep mock data)
        this._characters.update(chars => 
          chars.map(char => 
            char.id === characterId 
              ? { 
                  ...char, 
                  isLoading: false,
                  imageUrl: this.getPlaceholderImage(characterName)
                }
              : char
          )
        );
        this.saveCharacters();
      }
      
    } catch (error) {
      console.error(`❌ Error fetching Nexon data for ${characterName}:`, error);
      
      // Update character to remove loading state on error
      this._characters.update(chars => 
        chars.map(char => 
          char.id === characterId 
            ? { 
                ...char, 
                isLoading: false,
                imageUrl: this.getPlaceholderImage(characterName)
              }
            : char
        )
      );
      this.saveCharacters();
    }
  }

  private getPlaceholderImage(characterName: string): string {
    // Generate a consistent placeholder based on character name
    const firstChar = characterName.charAt(0).toUpperCase();
    return `https://via.placeholder.com/100x100/4A90E2/FFFFFF?text=${encodeURIComponent(firstChar)}`;
  }

  private getRandomJob(): string {
    const jobs = [
      'Hero', 'Paladin', 'Dark Knight', 'Fire/Poison Mage', 'Ice/Lightning Mage',
      'Bishop', 'Bowmaster', 'Marksman', 'Night Lord', 'Shadower',
      'Dual Blade', 'Cannoneer', 'Dawn Warrior', 'Blaze Wizard', 'Wind Archer',
      'Night Walker', 'Thunder Breaker', 'Mihile', 'Aran', 'Evan',
      'Mercedes', 'Phantom', 'Luminous', 'Shade', 'Blaster',
      'Battle Mage', 'Wild Hunter', 'Mechanic', 'Xenon', 'Demon Slayer',
      'Demon Avenger', 'Kaiser', 'Angelic Buster', 'Hayato', 'Kanna',
      'Zero', 'Kinesis', 'Cadena', 'Illium', 'Ark', 'Adele', 'Kain', 'Lara'
    ];
    return jobs[Math.floor(Math.random() * jobs.length)];
  }

  private getRandomGuild(): string {
    const guilds = [
      'MapleLeaves', 'DragonSlayers', 'MysticForce', 'ShadowHunters', 'CrystalGuardians',
      'FireStorm', 'IceBreakers', 'ThunderStrike', 'WindWalkers', 'EarthShakers',
      'LightBringers', 'DarkRealm', 'StarChasers', 'MoonRiders', 'SunBlazers',
      'OceanDepths'
    ];
    return Math.random() > 0.3 ? guilds[Math.floor(Math.random() * guilds.length)] : '';
  }

  removeCharacter(id: number): void {
    this._characters.update(chars => chars.filter(char => char.id !== id));
    this.saveCharacters();
  }

  updateCharacter(id: number, updates: Partial<MapleCharacter>): void {
    this._characters.update(chars => 
      chars.map(char => 
        char.id === id ? { ...char, ...updates } : char
      )
    );
    this.saveCharacters();
  }

  clearAllCharacters(): void {
    this._characters.set([]);
    this._nextId = 1;
    this.saveCharacters();
  }
}