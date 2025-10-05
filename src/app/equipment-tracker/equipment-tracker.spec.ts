import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EquipmentTracker } from './equipment-tracker';

describe('EquipmentTracker', () => {
  let component: EquipmentTracker;
  let fixture: ComponentFixture<EquipmentTracker>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EquipmentTracker]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EquipmentTracker);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
