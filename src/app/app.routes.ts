import { Routes } from '@angular/router';
import { HomeComponent } from './home/home';
import { CharacterComponent } from './character/character';
import { BossingComponent } from './bossing/bossing';
import { AnalysisComponent } from './analysis/analysis';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'character', component: CharacterComponent },
  { path: 'bossing', component: BossingComponent },
  { path: 'analysis', component: AnalysisComponent },
  { path: '**', redirectTo: '' }
];
