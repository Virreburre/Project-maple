import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CharacterStats } from './character-stats';

describe('CharacterStats', () => {
  let component: CharacterStats;
  let fixture: ComponentFixture<CharacterStats>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CharacterStats]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CharacterStats);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
