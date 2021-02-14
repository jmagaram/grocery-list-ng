import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Animal, ExperimentComponent } from './experiment.component';
import { appConfig } from '../app.module';

describe('ExperimentComponent', () => {
  let component: ExperimentComponent;
  let fixture: ComponentFixture<ExperimentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExperimentComponent],
      providers: [...appConfig.providers],
      imports: [...appConfig.imports],
    }).compileComponents();
    fixture = TestBed.createComponent(ExperimentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('can add data', async () => {
    await component.fs
      .collection<Animal>('animals')
      .doc()
      .set({ type: 'gorillaf', color: 'brown' + Date.now().toString() });
    expect(true).toBeTrue();
  });
});
