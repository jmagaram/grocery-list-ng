import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { AnimalsService } from 'src/app/experiment/animals.service';
import { Animal } from '../firestore/data-types';

@Component({
  selector: 'app-experiment',
  templateUrl: './experiment.component.html',
  styleUrls: ['./experiment.component.scss'],
  providers: [AnimalsService],
})
export class ExperimentComponent implements OnInit {
  animalType = new FormControl('');
  animalColor = new FormControl('');
  animals$: Observable<Animal[]>;

  constructor(private readonly as: AnimalsService) {
    this.animals$ = as.animals$;
  }

  ngOnInit(): void {}

  async onCreateAnimal() {
    if (this.animalType.value !== '' && this.animalColor.value !== '') {
      const type = this.animalType.value as string;
      const color = this.animalColor.value as string;
      const animal: Animal = {
        type,
        color,
      };
      try {
        await this.as.createAnimal(animal);
      } catch (error: unknown) {
        console.log('Error writing document: ', error);
      }
    }
  }
}
