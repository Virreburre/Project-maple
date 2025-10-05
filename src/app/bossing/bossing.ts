import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface Boss {
  id: number;
  name: string;
  difficulty: string;
  minLevel: number;
  location: string;
  cooldown: string;
  rewards: string[];
  completed: boolean;
  completedThisWeek?: boolean;
}

@Component({
  selector: 'app-bossing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './bossing.html',
  styleUrl: './bossing.scss'
})
export class BossingComponent {
  dailyBosses: Boss[] = [
    {
      id: 1,
      name: 'Zakum',
      difficulty: 'Normal',
      minLevel: 100,
      location: 'El Nath',
      cooldown: 'Daily',
      rewards: ['Mesos', 'Equipment', 'Zakum Helmet'],
      completed: false
    },
    {
      id: 2,
      name: 'Horntail',
      difficulty: 'Normal', 
      minLevel: 130,
      location: 'Leafre',
      cooldown: 'Daily',
      rewards: ['Mesos', 'Equipment', 'Horntail Necklace'],
      completed: true
    },
    {
      id: 3,
      name: 'Pink Bean',
      difficulty: 'Normal',
      minLevel: 140,
      location: 'Temple of Time',
      cooldown: 'Daily',
      rewards: ['Mesos', 'Equipment', 'Pink Bean Cup'],
      completed: false
    }
  ];

  weeklyBosses: Boss[] = [
    {
      id: 4,
      name: 'Chaos Root Abyss',
      difficulty: 'Chaos',
      minLevel: 180,
      location: 'Root Abyss',
      cooldown: 'Weekly',
      rewards: ['CRA Equipment', 'Mesos', 'Cubic Blades'],
      completed: false,
      completedThisWeek: true
    },
    {
      id: 5,
      name: 'Lotus',
      difficulty: 'Normal',
      minLevel: 190,
      location: 'Black Heaven',
      cooldown: 'Weekly',
      rewards: ['Lotus Equipment', 'Mesos', 'Pieces'],
      completed: false,
      completedThisWeek: false
    },
    {
      id: 6,
      name: 'Damien',
      difficulty: 'Normal',
      minLevel: 190,
      location: 'Fallen World Tree',
      cooldown: 'Weekly',
      rewards: ['Damien Equipment', 'Mesos', 'Pieces'],
      completed: false,
      completedThisWeek: false
    }
  ];

  toggleBossCompletion(boss: Boss): void {
    if (boss.cooldown === 'Daily') {
      boss.completed = !boss.completed;
    } else {
      boss.completedThisWeek = !boss.completedThisWeek;
    }
  }

  getDifficultyClass(difficulty: string): string {
    return `difficulty-${difficulty.toLowerCase()}`;
  }

  resetDaily(): void {
    this.dailyBosses.forEach(boss => boss.completed = false);
  }

  resetWeekly(): void {
    this.weeklyBosses.forEach(boss => boss.completedThisWeek = false);
  }

  getDailyCompleted(): number {
    return this.dailyBosses.filter(boss => boss.completed).length;
  }

  getWeeklyCompleted(): number {
    return this.weeklyBosses.filter(boss => boss.completedThisWeek).length;
  }
}