import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

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

  ngOnInit(): void {}

  onCreate(): void {
    this.fs.firestore
      .collection('animals')
      .doc('dog')
      .set({ type: 'Dog', color: 'Brown' })
      .then(() => console.log('Wrote it!'))
      .catch((error) => console.log('Error writing document: ', error));
  }
}
