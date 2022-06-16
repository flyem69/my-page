import { Component, Input, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DarkModeService } from 'src/app/services/dark-mode.service';

@Component({
    selector: 'app-switch',
    templateUrl: './switch.component.html',
    styleUrls: ['./switch.component.scss'],
})
export class SwitchComponent implements OnInit {
    @Input() subject!: BehaviorSubject<boolean>;
    appearance$: BehaviorSubject<string>;
    mode: string = '';

    constructor(private darkModeService: DarkModeService) {
        this.appearance$ = new BehaviorSubject<string>('');
    }

    ngOnInit(): void {
        this.darkModeService.bindAppearance(this.appearance$);
        this.subject.subscribe((value) => {
            this.mode = value ? 'on' : 'off';
        });
    }

    toggle(): void {
        const toggledValue: boolean = !this.subject.getValue();
        this.subject.next(toggledValue);
    }
}
