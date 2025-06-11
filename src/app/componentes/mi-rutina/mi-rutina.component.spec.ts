import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiRutinaComponent } from './mi-rutina.component';

describe('MiRutinaComponent', () => {
  let component: MiRutinaComponent;
  let fixture: ComponentFixture<MiRutinaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MiRutinaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MiRutinaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
