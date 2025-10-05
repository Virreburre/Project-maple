import { Injectable, signal } from '@angular/core';

export interface Character {
  id: number;
  name: string;
  level: number;
  job: string;
}

@Injectable({
  providedIn: 'root'
})
export class CharacterService {
  private characters = signal<Character[]>([]);

  getCharacters() {
    return this.characters.asReadonly();
  }

  addCharacter(character: Omit<Character, 'id'>) {
    const newId = Math.max(0, ...this.characters().map(c => c.id)) + 1;
    const newCharacter = { ...character, id: newId };
    this.characters.update(chars => [...chars, newCharacter]);
  }

  removeCharacter(id: number) {
    this.characters.update(chars => chars.filter(c => c.id !== id));
  }
}