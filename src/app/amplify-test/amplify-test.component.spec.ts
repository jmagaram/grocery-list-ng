import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AmplifyTestComponent } from './amplify-test.component';

describe('AmplifyTestComponent', () => {
  let component: AmplifyTestComponent;
  let fixture: ComponentFixture<AmplifyTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AmplifyTestComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AmplifyTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
