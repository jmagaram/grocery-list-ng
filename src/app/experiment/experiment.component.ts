import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { Animal, animalCollection } from '../firestore/data-types';

@Component({
  selector: 'app-experiment',
  templateUrl: './experiment.component.html',
  styleUrls: ['./experiment.component.scss'],
})
export class ExperimentComponent implements OnInit {
  fs: AngularFirestore;
  animalType = new FormControl('');
  animalColor = new FormControl('');
  animals$: Observable<Animal[]>;

  constructor(fs: AngularFirestore) {
    this.fs = fs;
    this.animals$ = fs.collection<Animal>(animalCollection).valueChanges();
  }

  ngOnInit(): void {}

  onCreateAnimal(): void {
    if (this.animalType.value !== '' && this.animalColor.value !== '') {
      const collection = this.fs.collection<Animal>(animalCollection);
      const type = this.animalType.value as string;
      const color = this.animalColor.value as string;
      const animal: Animal = {
        type,
        color,
      };
      collection
        .add(animal)
        .then(() => {
          this.animalType.setValue('');
          this.animalColor.setValue('');
        })
        .catch((error) => {
          console.log('Error writing document: ', error);
        });
    }
  }
}
