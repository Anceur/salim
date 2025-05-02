import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HistoricPage } from './historic.page';

describe('HistoricPage', () => {
  let component: HistoricPage;
  let fixture: ComponentFixture<HistoricPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(HistoricPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
