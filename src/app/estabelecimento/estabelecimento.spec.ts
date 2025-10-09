import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Estabelecimento } from './estabelecimento';

describe('Estabelecimento', () => {
  let component: Estabelecimento;
  let fixture: ComponentFixture<Estabelecimento>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Estabelecimento]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Estabelecimento);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
