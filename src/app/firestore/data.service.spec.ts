import { TestBed } from '@angular/core/testing';

import { DataCommandsService, DataQueriesService } from './data.service';

describe('DataQueriesService', () => {
  let service: DataQueriesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataQueriesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

describe('DataCommandsService', () => {
  let service: DataCommandsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataCommandsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
