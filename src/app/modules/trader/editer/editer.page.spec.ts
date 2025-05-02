import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditerPage } from './editer.page';

describe('EditerPage', () => {
  let component: EditerPage;
  let fixture: ComponentFixture<EditerPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EditerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
