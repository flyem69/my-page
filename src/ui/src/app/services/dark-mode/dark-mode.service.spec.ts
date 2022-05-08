import { DarkModeService } from './dark-mode.service';
import { TestBed } from '@angular/core/testing';

describe('DarkModeService', () => {
	let service: DarkModeService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(DarkModeService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
