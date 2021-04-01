import { Component, OnInit } from '@angular/core';
import { EmulatorUtilityService } from '../firestore/emulator-utility.service';

@Component({
  selector: 'app-emulator-utility',
  templateUrl: './emulator-utility.component.html',
  styleUrls: ['./emulator-utility.component.scss'],
})
export class EmulatorUtilityComponent implements OnInit {
  projectId = 'grocery-list-ng-223b6';
  justin = { name: 'Justin', email: 'justin@email.com' };

  constructor(readonly em: EmulatorUtilityService) {}

  ngOnInit(): void {}

  async createJustin() {
    await this.em.createEmailPasswordUser(this.justin.email, this.justin.name);
  }

  async signInAsJustin() {
    await this.em.signIn(this.justin.email);
  }
}
