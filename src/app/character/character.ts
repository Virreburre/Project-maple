import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { NexonApiService } from '../services/nexon-api';
import { ExperienceService } from '../services/experience.service';

interface Character {
  name: string;
  class: string;
  level?: number;
  imageUrl?: string;
  exp?: number;
  expPercentage?: string;
  isLoading?: boolean;
  isExpanded?: boolean;
}

@Component({
  selector: 'app-character',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './character.html',
  styleUrl: './character.scss'
})
export class CharacterComponent implements OnInit {
  private nexonApi = inject(NexonApiService);
  private experienceService = inject(ExperienceService);
  
  showAddCharacterForm = false;
  characters: Character[] = [];
  newCharacter: Character = {
    name: '',
    class: ''
  };
  classSearchTerm = '';
  showClassDropdown = false;
  showDeleteConfirmation = false;
  characterToDelete: number | null = null;

  mapleClasses: string[] = [
    'Night Walker',
    'Ark',
    'Night Lord',
    'Kain',
    'Buccaneer',
    'Mercedes',
    'Xenon',
    'Wind Archer',
    'Adele',
    'Demon Slayer',
    'Pathfinder',
    'Hero',
    'Cadena',
    'Cannoneer',
    'Evan',
    'Hoyoung',
    'Shadower',
    'Dawn Warrior',
    'Wild Hunter',
    'Aran',
    'Blaster',
    'Kinesis',
    'Dark Knight',
    'Thunder Breaker',
    'Dual Blade',
    'Paladin',
    'Marksman',
    'Phantom',
    'Kanna',
    'Angelic Buster',
    'Bishop',
    'Demon Avenger',
    'Hayato',
    'Shade',
    'Kaiser',
    'Mechanic',
    'Battle Mage',
    'Illium',
    'Corsair',
    'Blaze Wizard',
    'Ice Lightning',
    'Fire Poison',
    'Bow Master',
    'Zero',
    'Luminous',
    'Mihile',
    'Lara',
    'Beast Tamer',
    'Khali',
    'Sia',
    'Mu Xuan'
  ];

  ngOnInit() {
    this.loadCharacters();
  }

  get filteredClasses() {
    if (!this.classSearchTerm) {
      return this.mapleClasses;
    }
    return this.mapleClasses.filter(className => 
      className.toLowerCase().includes(this.classSearchTerm.toLowerCase())
    );
  }

  onClassSearchInput() {
    this.showClassDropdown = true;
  }

  selectClass(className: string) {
    this.newCharacter.class = className;
    this.classSearchTerm = className;
    this.showClassDropdown = false;
  }

  onClassInputFocus() {
    this.showClassDropdown = true;
    this.classSearchTerm = '';
  }

  onClassInputBlur() {
    // Delay hiding to allow click on dropdown items
    setTimeout(() => {
      this.showClassDropdown = false;
    }, 200);
  }

  loadCharacters() {
    const savedCharacters = localStorage.getItem('mapleCharacters');
    if (savedCharacters) {
      this.characters = JSON.parse(savedCharacters);
      // Update existing characters that don't have experience data
      this.updateMissingExperienceData();
    }
  }

  async updateMissingExperienceData() {
    // Find characters that have level but no experience percentage
    const charactersNeedingUpdate = this.characters
      .map((char, index) => ({ char, index }))
      .filter(({ char }) => char.level && !char.expPercentage && !char.isLoading);

    if (charactersNeedingUpdate.length === 0) {
      return;
    }

    console.log(`[CharacterComponent] Updating experience data for ${charactersNeedingUpdate.length} existing characters...`);

    // Update each character with missing experience data
    for (const { char, index } of charactersNeedingUpdate) {
      try {
        // Set loading state
        this.characters[index] = { ...char, isLoading: true };
        
        console.log(`[CharacterComponent] Fetching experience data for ${char.name}...`);
        const apiData = await this.nexonApi.getCharacterLevelAndImage(char.name);
        
        if (apiData && apiData.exp !== undefined) {
          const expPercentage = this.experienceService.formatExpPercentage(apiData.exp, apiData.level);
          this.characters[index] = {
            ...char,
            level: apiData.level,
            imageUrl: apiData.imageUrl,
            exp: apiData.exp,
            expPercentage: expPercentage || undefined,
            isLoading: false
          };
          console.log(`[CharacterComponent] Updated ${char.name} with ${expPercentage} experience`);
        } else {
          // Remove loading state if no data found
          this.characters[index] = { ...char, isLoading: false };
        }
        
        // Small delay between API calls to be nice to the server
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`[CharacterComponent] Error updating experience for ${char.name}:`, error);
        this.characters[index] = { ...char, isLoading: false };
      }
    }

    // Save updated characters
    this.saveCharacters();
    console.log(`[CharacterComponent] Finished updating experience data for existing characters`);
  }

  saveCharacters() {
    localStorage.setItem('mapleCharacters', JSON.stringify(this.characters));
  }

  async addCharacter() {
    if (this.newCharacter.name && this.newCharacter.class) {
      // Create character with loading state
      const newChar: Character = {
        ...this.newCharacter,
        isLoading: true
      };
      
      this.characters.push(newChar);
      this.saveCharacters();
      this.resetForm();
      
      // Fetch API data in the background
      try {
        console.log(`[CharacterComponent] Fetching data for ${newChar.name}...`);
        const apiData = await this.nexonApi.getCharacterLevelAndImage(newChar.name);
        
        // Update the character with API data
        const charIndex = this.characters.length - 1;
        if (apiData) {
          console.log(`[CharacterComponent] API data found:`, apiData);
          const expPercentage = this.experienceService.formatExpPercentage(apiData.exp, apiData.level);
          this.characters[charIndex] = {
            ...this.characters[charIndex],
            level: apiData.level,
            imageUrl: apiData.imageUrl,
            exp: apiData.exp,
            expPercentage: expPercentage || undefined,
            isLoading: false
          };
        } else {
          console.log(`[CharacterComponent] No API data found for ${newChar.name}`);
          this.characters[charIndex] = {
            ...this.characters[charIndex],
            isLoading: false
          };
        }
        
        this.saveCharacters();
      } catch (error) {
        console.error('[CharacterComponent] Error fetching API data:', error);
        // Update character to remove loading state
        const charIndex = this.characters.length - 1;
        this.characters[charIndex] = {
          ...this.characters[charIndex],
          isLoading: false
        };
        this.saveCharacters();
      }
    }
  }

  async refreshCharacterData(index: number) {
    const character = this.characters[index];
    if (!character) return;
    
    // Set loading state
    this.characters[index] = { ...character, isLoading: true };
    
    try {
      console.log(`[CharacterComponent] Refreshing data for ${character.name}...`);
      const apiData = await this.nexonApi.getCharacterLevelAndImage(character.name);
      
      if (apiData) {
        console.log(`[CharacterComponent] Updated API data:`, apiData);
        const expPercentage = this.experienceService.formatExpPercentage(apiData.exp, apiData.level);
        this.characters[index] = {
          ...character,
          level: apiData.level,
          imageUrl: apiData.imageUrl,
          exp: apiData.exp,
          expPercentage: expPercentage || undefined,
          isLoading: false
        };
      } else {
        console.log(`[CharacterComponent] No API data found for ${character.name}`);
        this.characters[index] = { ...character, isLoading: false };
      }
      
      this.saveCharacters();
    } catch (error) {
      console.error('[CharacterComponent] Error refreshing API data:', error);
      this.characters[index] = { ...character, isLoading: false };
      this.saveCharacters();
    }
  }

  drop(event: CdkDragDrop<Character[]>) {
    moveItemInArray(this.characters, event.previousIndex, event.currentIndex);
    this.saveCharacters();
  }

  confirmDeleteCharacter(index: number) {
    this.characterToDelete = index;
    this.showDeleteConfirmation = true;
  }

  deleteCharacter() {
    if (this.characterToDelete !== null) {
      this.characters.splice(this.characterToDelete, 1);
      this.saveCharacters();
    }
    this.cancelDelete();
  }

  cancelDelete() {
    this.showDeleteConfirmation = false;
    this.characterToDelete = null;
  }

  toggleExpand(index: number) {
    this.characters[index].isExpanded = !this.characters[index].isExpanded;
    this.saveCharacters();
  }

  cancelAdd() {
    this.showAddCharacterForm = false;
    this.resetForm();
  }

  private resetForm() {
    this.newCharacter = {
      name: '',
      class: ''
    };
    this.classSearchTerm = '';
    this.showClassDropdown = false;
    this.showAddCharacterForm = false;
  }
}
