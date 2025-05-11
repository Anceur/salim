import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PhonePage } from './phone.page';

describe('PhonePage', () => {
  let component: PhonePage;
  let fixture: ComponentFixture<PhonePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PhonePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
