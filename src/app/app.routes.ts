import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard';
import { CharacterStatsComponent } from './character-stats/character-stats';
import { ProgressTrackerComponent } from './progress-tracker/progress-tracker';
import { EquipmentTrackerComponent } from './equipment-tracker/equipment-tracker';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'character-stats', component: CharacterStatsComponent },
  { path: 'progress-tracker', component: ProgressTrackerComponent },
  { path: 'equipment-tracker', component: EquipmentTrackerComponent }
];
