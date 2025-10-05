import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface MapleCharacter {
  id: number;
  name: string;
  level: number;
  job: string;
  server: string;
  lastPlayed: string;
  experience: number;
  avatar?: string;
}

@Component({
  selector: 'app-characters',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './characters.html',
  styleUrl: './characters.scss'
})
export class CharactersComponent {
  // Sample character data - you can replace this with real data later
  characters = signal<MapleCharacter[]>([
    {
      id: 1,
      name: 'MyMainChar',
      level: 245,
      job: 'Adele',
      server: 'Luna',
      lastPlayed: '2 hours ago',
      experience: 85.6
    },
    {
      id: 2,
      name: 'MySecondChar',
      level: 220,
      job: 'Kain',
      server: 'Luna', 
      lastPlayed: '1 day ago',
      experience: 42.3
    },
    {
      id: 3,
      name: 'MyBossChar',
      level: 235,
      job: 'Luminous',
      server: 'Luna',
      lastPlayed: '3 hours ago',
      experience: 67.8
    },
    {
      id: 4,
      name: 'MyAltChar',
      level: 200,
      job: 'Aran',
      server: 'Luna',
      lastPlayed: '5 days ago',
      experience: 23.1
    }
  ]);

  getJobIcon(job: string): string {
    const jobIcons: { [key: string]: string } = {
      'Adele': '🗡️',
      'Kain': '🏹', 
      'Luminous': '✨',
      'Aran': '🪓',
      'Evan': '🐲',
      'Mercedes': '🏹',
      'Phantom': '🎭'
    };
    return jobIcons[job] || '⚔️';
  }

  getExperienceColor(exp: number): string {
    if (exp >= 80) return '#22c55e';
    if (exp >= 50) return '#f97316'; 
    return '#ef4444';
  }

  getLevelColor(level: number): string {
    if (level >= 240) return '#8b5cf6';
    if (level >= 200) return '#3b82f6';
    if (level >= 140) return '#22c55e';
    return '#f97316';
  }
}