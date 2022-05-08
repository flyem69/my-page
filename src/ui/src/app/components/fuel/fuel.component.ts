import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DarkModeService } from 'src/app/services/dark-mode/dark-mode.service';
import { FuelInputData } from 'src/app/models/fuel-input-data';
import { InputRegex } from 'src/app/enumeration/input-regex';
import { distinctUntilChanged } from 'rxjs/operators';

@Component({
	selector: 'app-fuel',
	templateUrl: './fuel.component.html',
	styleUrls: ['./fuel.component.scss'],
})
export class FuelComponent implements OnInit {
	private lapTimeValidity$: BehaviorSubject<boolean>;
	appearance$: BehaviorSubject<string>;
	inputsData: { [name: string]: FuelInputData };
	inputRegex: typeof InputRegex;
	calcLock: boolean;
	resultValue: BehaviorSubject<number>;
	result: string;

	constructor(private darkModeService: DarkModeService) {
		this.lapTimeValidity$ = new BehaviorSubject<boolean>(true);
		this.appearance$ = new BehaviorSubject<string>('');
		this.inputsData = {
			lapTimeMin: this.getInputData(this.lapTimeValidity$),
			lapTimeS: this.getInputData(this.lapTimeValidity$),
			lapTimeMS: this.getInputData(this.lapTimeValidity$),
			fuelPerLap: this.getInputData(),
			raceLength: this.getInputData(),
			fuelPer100: this.getInputData(),
			distance: this.getInputData(),
		};
		this.inputRegex = InputRegex;
		this.calcLock = false;
		this.resultValue = new BehaviorSubject<number>(0);
		this.result = '';
	}

	ngOnInit(): void {
		this.darkModeService.bindAppearance(this.appearance$);
		this.resultValue.pipe(distinctUntilChanged()).subscribe((value) => {
			this.result = value + ' l';
		});
	}

	calcRaceFuel(): void {
		const raceInputsData = {
			lapTimeMin: this.inputsData['lapTimeMin'],
			lapTimeS: this.inputsData['lapTimeS'],
			lapTimeMS: this.inputsData['lapTimeMS'],
			fuelPerLap: this.inputsData['fuelPerLap'],
			raceLength: this.inputsData['raceLength'],
		};
		if (!this.initialCalcValidation(raceInputsData)) {
			return;
		}
		const lapTimeValue =
			+raceInputsData['lapTimeMin'].value$.getValue() * 60000 +
			+raceInputsData['lapTimeMS'].value$.getValue() * 1000 +
			+raceInputsData['lapTimeMS'].value$.getValue();
		const fuelPerLapValue = +raceInputsData['fuelPerLap'].value$.getValue();
		const raceLengthValue = +raceInputsData['raceLength'].value$.getValue() * 60000;
		const raceInputs = {
			lapTime: {
				value: lapTimeValue,
				validity: this.lapTimeValidity$,
			},
			fuelPerLap: {
				value: fuelPerLapValue,
				validity: raceInputsData['fuelPerLap'].externalValidity$,
			},
			raceLength: {
				value: raceLengthValue,
				validity: raceInputsData['raceLength'].externalValidity$,
			},
		};
		if (this.finalCalcValidation(raceInputs)) {
			const laps = raceInputs.raceLength.value / raceInputs.lapTime.value;
			const result = raceInputs.fuelPerLap.value * laps;
			this.setResult(result);
		}
	}

	calcRoadFuel(): void {
		const roadInputsData = {
			fuelPer100: this.inputsData['fuelPer100'],
			distance: this.inputsData['distance'],
		};
		if (!this.initialCalcValidation(roadInputsData)) {
			return;
		}
		const fuelPer100Value = +roadInputsData['fuelPer100'].value$.getValue();
		const distanceValue = +roadInputsData['distance'].value$.getValue();
		const roadInputs = {
			fuelPer100: {
				value: fuelPer100Value,
				validity: roadInputsData['fuelPer100'].externalValidity$,
			},
			distance: {
				value: distanceValue,
				validity: roadInputsData['distance'].externalValidity$,
			},
		};
		if (this.finalCalcValidation(roadInputs)) {
			const distancePer100 = roadInputs.distance.value / 100;
			const result: number = roadInputs.fuelPer100.value * distancePer100;
			this.setResult(result);
		}
	}

	private initialCalcValidation(inputsData: { [key: string]: FuelInputData }): boolean {
		if (this.calcLock) {
			return false;
		}
		for (const inputData of Object.values(inputsData)) {
			if (!inputData.localValidity$.getValue() || !inputData.externalValidity$.getValue()) {
				return false;
			}
		}
		return true;
	}

	private finalCalcValidation(inputs: {
		[group: string]: { value: number; validity: BehaviorSubject<boolean> };
	}): boolean {
		const invalidInputs = Object.values(inputs).filter((input) => input.value === 0);
		if (invalidInputs.length > 0) {
			this.highlightInputs(invalidInputs.map((invalidInput) => invalidInput.validity));
			return false;
		}
		return true;
	}

	private highlightInputs(inputValidities: BehaviorSubject<boolean>[]): void {
		inputValidities.forEach((inputValidity) => {
			inputValidity.next(false);
		});
	}

	private getInputData(externalValidity$ = new BehaviorSubject<boolean>(true)): FuelInputData {
		return {
			value$: new BehaviorSubject<string>(''),
			localValidity$: new BehaviorSubject<boolean>(true),
			externalValidity$: externalValidity$,
		};
	}

	private setResult(value: number): void {
		this.calcLock = true;
		const setResultTime = 500;
		const numberOfChanges = 50;
		const valueGap = (value - this.resultValue.getValue()) / numberOfChanges;
		const timeGap = setResultTime / numberOfChanges;
		const loopData = {
			iteration: 0,
			limit: numberOfChanges,
			valueGap: valueGap,
			timeGap: timeGap,
			currentValue: this.resultValue.getValue(),
		};
		this.setResultLoop(loopData);
	}

	private setResultLoop(data: {
		iteration: number;
		limit: number;
		valueGap: number;
		timeGap: number;
		currentValue: number;
	}) {
		if (data.iteration >= data.limit) {
			const finalResult = this.fixFloatingPointPrecision(data.currentValue);
			this.resultValue.next(finalResult);
			this.calcLock = false;
			return;
		}
		setTimeout(() => {
			data.currentValue += data.valueGap;
			this.resultValue.next(Math.ceil(data.currentValue));
			data.iteration++;
			this.setResultLoop(data);
		}, data.timeGap);
	}

	private fixFloatingPointPrecision(value: number) {
		let fixedValue = Math.round((value + Number.EPSILON) * 100) / 100;
		return Math.ceil(fixedValue);
	}
}
