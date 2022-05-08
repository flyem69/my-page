import { BehaviorSubject, combineLatest } from 'rxjs';
import { Component, Input, OnInit } from '@angular/core';
import { DarkModeService } from 'src/app/services/dark-mode/dark-mode.service';

@Component({
    selector: 'app-input',
    templateUrl: './input.component.html',
    styleUrls: ['./input.component.scss'],
})
export class InputComponent implements OnInit {
    @Input() value$!: BehaviorSubject<string>;
    @Input() placeholder: string;
    @Input() width$?: BehaviorSubject<string>;
    @Input() valueRegex?: RegExp;
    @Input() localValidity$?: BehaviorSubject<boolean>;
    @Input() externalValidity$?: BehaviorSubject<boolean>;
    appearance$: BehaviorSubject<string>;
    validity: string;
    width: string;

    constructor(private darkModeService: DarkModeService) {
        this.width = '40px';
        this.placeholder = '';
        this.appearance$ = new BehaviorSubject<string>('');
        this.validity = 'valid';
    }

    ngOnInit(): void {
        if (this.valueRegex && !this.localValidity$) {
            throw Error(
                'Missing localValidity$ value on input component when valueRegex is present'
            );
        }
        this.darkModeService.bindAppearance(this.appearance$);
        if (this.width$) {
            this.width$.subscribe((width) => (this.width = width));
        }
        this.initValidity();
    }

    change(value: string): void {
        if (this.valueRegex) {
            this.localValidity$?.next(this.valueRegex.test(value));
        } else if (this.localValidity$ && !this.localValidity$.getValue()) {
            this.localValidity$.next(true);
        }
        this.value$.next(value);
    }

    focus(): void {
        if (this.externalValidity$ && !this.externalValidity$.getValue()) {
            this.externalValidity$.next(true);
        }
    }

    private initValidity(): void {
        if (this.localValidity$ && this.externalValidity$) {
            combineLatest([this.localValidity$, this.externalValidity$]).subscribe((validities) => {
                this.setValidity(validities[0] && validities[1]);
            });
        } else if (this.externalValidity$) {
            this.externalValidity$.subscribe(this.setValidity);
        } else if (this.localValidity$) {
            this.localValidity$.subscribe(this.setValidity);
        }
    }

    private setValidity(condition: boolean) {
        this.validity = condition ? 'valid' : 'invalid';
    }
}
