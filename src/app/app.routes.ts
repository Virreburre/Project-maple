import { Routes } from '@angular/router';
import { HomeComponent } from './home/home';
import { CharactersComponent } from './characters/characters';
import { BossingComponent } from './bossing/bossing';
import { DashboardComponent } from './dashboard/dashboard';
import { CharacterStatsComponent } from './character-stats/character-stats';
import { ProgressTrackerComponent } from './progress-tracker/progress-tracker';
import { EquipmentTrackerComponent } from './equipment-tracker/equipment-tracker';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'characters', component: CharactersComponent },
  { path: 'bossing', component: BossingComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'character-stats', component: CharacterStatsComponent },
  { path: 'progress-tracker', component: ProgressTrackerComponent },
  { path: 'equipment-tracker', component: EquipmentTrackerComponent },
  { path: '**', redirectTo: '' }
];
