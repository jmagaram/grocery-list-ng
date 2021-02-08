import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormControl } from '@angular/forms';

interface Animal {
  type: string;
  color: string;
}

@Component({
  selector: 'app-experiment',
  templateUrl: './experiment.component.html',
  styleUrls: ['./experiment.component.scss'],
})
export class ExperimentComponent implements OnInit {
  constructor(fs: AngularFirestore) {
    this.fs = fs;
  }

  fs: AngularFirestore;
  animalType = new FormControl('');
  animalColor = new FormControl('');

  ngOnInit(): void {}

  onCreateAnimal(): void {
    let collection = this.fs.collection<Animal>('animals');
    let type = this.animalType.value as string;
    let color = this.animalColor.value as string;
    let animal: Animal = {
      type: type,
      color: color,
    };
    collection
      .add(animal)
      .then(() => console.log('Wrote it!'))
      .catch((error) => {
        console.log('Error writing document: ', error);
      });
  }
}
