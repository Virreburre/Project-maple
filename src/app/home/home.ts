import { Component, signal, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterStorageService, MapleCharacter } from '../services/character-storage.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class HomeComponent implements AfterViewInit {
  @ViewChild('nameInput') nameInput!: ElementRef<HTMLInputElement>;

  // Modal state
  private showModal = signal(false);
  private errorMessage = signal('');

  // Form fields
  characterName = '';

  constructor(private characterStorage: CharacterStorageService) {}

  ngAfterViewInit() {
    // Focus management will be handled in the methods
  }

  get characters() {
    return this.characterStorage.characters;
  }

  // Modal controls
  isModalOpen() {
    return this.showModal();
  }

  openModal() {
    this.showModal.set(true);
    this.characterName = '';
    this.errorMessage.set('');
    // Focus the input after the view updates
    setTimeout(() => {
      this.nameInput?.nativeElement?.focus();
    });
  }

  closeModal() {
    this.showModal.set(false);
    this.characterName = '';
    this.errorMessage.set('');
  }

  onModalBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  saveCharacter() {
    if (!this.characterName.trim()) return;

    this.characterStorage.addCharacter(this.characterName.trim());
    this.closeModal();
  }

  removeCharacter(id: number) {
    this.characterStorage.removeCharacter(id);
  }
}