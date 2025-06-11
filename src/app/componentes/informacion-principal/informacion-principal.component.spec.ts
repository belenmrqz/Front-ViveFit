import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InformacionPrincipalComponent } from './informacion-principal.component';

describe('InformacionPrincipalComponent', () => {
  let component: InformacionPrincipalComponent;
  let fixture: ComponentFixture<InformacionPrincipalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InformacionPrincipalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InformacionPrincipalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
