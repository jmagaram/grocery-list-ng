import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataStore, Predicates } from 'aws-amplify';
import { Todo } from 'src/models';
import 'zen-observable';

@Component({
  selector: 'app-amplify-test',
  template: `
    <div class="app-header">
      <button type="button" (click)="onCreate()">New item</button>
      <button type="button" (click)="onDeleteAll()">Delete all</button>
      <button type="button" (click)="onQuery()">Query manually</button>
      <p>Items</p>
      <ul *ngFor="let i of items">
        <li>{{ i.name }} {{ i.description }}</li>
      </ul>
    </div>
  `,
})
export class AmplifyTestComponent implements OnInit, OnDestroy {
  subscription?: ZenObservable.Subscription;

  items: Todo[] = [];

  ngOnInit() {
    this.onQuery();
    this.subscription = DataStore.observe<Todo>(Todo).subscribe((msg) => {
      this.onQuery();
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  public async onQuery() {
    this.items = await DataStore.query(Todo, (c) => c.name('ne', 'weird'));
  }

  public onCreate() {
    DataStore.save(
      new Todo({
        name: `New name ${Date.now()}`,
        description: 'This is the description',
      })
    );
  }

  public onDeleteAll() {
    DataStore.delete(Todo, Predicates.ALL);
  }
}
