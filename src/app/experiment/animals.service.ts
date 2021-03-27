import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Animal, animalCollection } from 'src/app/firestore/data-types';

@Injectable({
  providedIn: 'root',
})
export class AnimalsService {
  animals$: Observable<Animal[]>;

  constructor(private readonly fs: AngularFirestore) {
    this.animals$ = fs.collection<Animal>(animalCollection).valueChanges();
  }

  createAnimal = async (animal: Animal) =>
    await this.fs.collection<Animal>(animalCollection).add(animal);
}
