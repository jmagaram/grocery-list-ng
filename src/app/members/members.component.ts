import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  DataQueriesService,
  DataCommandsService,
} from '../firestore/data.service';
import { ShareUiComponent } from '../share-ui/share-ui.component';

@Component({
  selector: 'app-members',
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.scss'],
})
export class MembersComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('shareUi') shareUi?: ShareUiComponent;
  destroyed: Subject<unknown>;

  constructor(
    private readonly qry: DataQueriesService,
    private readonly cmd: DataCommandsService
  ) {
    this.destroyed = new Subject<unknown>();
  }

  ngAfterViewInit(): void {
    this.qry
      .ownedInvitations()
      .pipe(takeUntil(this.destroyed))
      .subscribe((i) => {
        if (this.shareUi === undefined) {
          throw new Error('Expected the sharing UI.');
        }
        switch (i.auth) {
          case 'anonymous':
          case 'notAuthenticated':
            this.shareUi.send({ action: 'guestOrNotSignedIn' });
            break;
          case 'registered':
            const password = i.invitations.reduce<
              { password: string; createdOn: Date } | undefined
            >(
              (total, i) =>
                total === undefined
                  ? i
                  : i.createdOn > total.createdOn
                  ? i
                  : total,
              undefined
            )?.password;
            this.shareUi.send({
              action: 'authorized',
              invite:
                password === undefined
                  ? { invite: 'none' }
                  : {
                      invite: 'exists',
                      uri: `http://ourgrocerylist.app/share/${password}`,
                    },
              userName: i.name,
            });
        }
      });
  }

  ngOnDestroy(): void {
    this.destroyed.next(true);
  }

  ngOnInit(): void {}

  async createInvitation(displayName?: string) {
    await this.cmd.createInvitation(displayName);
  }
}
