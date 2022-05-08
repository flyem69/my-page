import { BehaviorSubject } from 'rxjs';

export interface FuelInputData {
	value$: BehaviorSubject<string>;
	localValidity$: BehaviorSubject<boolean>;
	externalValidity$: BehaviorSubject<boolean>;
}
