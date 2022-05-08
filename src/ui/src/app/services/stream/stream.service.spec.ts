import { StreamService } from './stream.service';
import { TestBed } from '@angular/core/testing';

describe('StreamService', () => {
	let service: StreamService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(StreamService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
