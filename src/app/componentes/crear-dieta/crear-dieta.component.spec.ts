import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearDietaComponent } from './crear-dieta.component';

describe('CrearDietaComponent', () => {
  let component: CrearDietaComponent;
  let fixture: ComponentFixture<CrearDietaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CrearDietaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearDietaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
