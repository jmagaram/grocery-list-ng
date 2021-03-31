import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { Animal, ExcludeId } from '../firestore/data-types';
import {
  DataQueriesService,
  DataCommandsService,
} from '../firestore/data.service';

@Component({
  selector: 'app-experiment',
  templateUrl: './experiment.component.html',
  styleUrls: ['./experiment.component.scss'],
})
export class ExperimentComponent implements OnInit {
  animalType = new FormControl('');
  animalColor = new FormControl('');
  animals$: Observable<Animal[]>;

  constructor(
    private readonly cmd: DataCommandsService,
    private readonly qry: DataQueriesService
  ) {
    this.animals$ = qry.allAnimals();
  }

  ngOnInit(): void {}

  async onCreateAnimal() {
    if (this.animalType.value !== '' && this.animalColor.value !== '') {
      const type = this.animalType.value as string;
      const color = this.animalColor.value as string;
      const animal: ExcludeId<Animal> = {
        type,
        color,
      };
      try {
        await this.cmd.createAnimal(animal);
      } catch (error: unknown) {
        console.log('Error writing document: ', error);
      }
    }
  }
}
