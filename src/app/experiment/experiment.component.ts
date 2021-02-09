import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';

interface Animal {
  type: string;
  color: string;
}

const animalCollection = 'animals';

@Component({
  selector: 'app-experiment',
  templateUrl: './experiment.component.html',
  styleUrls: ['./experiment.component.scss'],
})
export class ExperimentComponent implements OnInit {
  constructor(fs: AngularFirestore) {
    this.fs = fs;
    this.animals$ = fs.collection<Animal>(animalCollection).valueChanges();
    // this.animals$ = fs
    //   .collection<Animal>(animalCollection, (ref) =>
    //     ref.where('color', '==', 'white')
    //   )
    //   .valueChanges();
  }

  fs: AngularFirestore;
  animalType = new FormControl('');
  animalColor = new FormControl('');
  animals$: Observable<Animal[]>;

  ngOnInit(): void {}

  onCreateAnimal(): void {
    if (this.animalType.value != '' && this.animalColor.value != '') {
      let collection = this.fs.collection<Animal>(animalCollection);
      let type = this.animalType.value as string;
      let color = this.animalColor.value as string;
      let animal: Animal = {
        type: type,
        color: color,
      };
      collection
        .add(animal)
        .then(() => {
          console.log('Wrote it!');
          this.animalType.setValue('');
          this.animalColor.setValue('');
        })
        .catch((error) => {
          console.log('Error writing document: ', error);
        });
    }
  }
}
