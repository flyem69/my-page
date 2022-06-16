import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DarkModeService } from 'src/app/services/dark-mode.service';

@Component({
    selector: 'app-loader',
    templateUrl: './loader.component.html',
    styleUrls: ['./loader.component.scss'],
})
export class LoaderComponent implements OnInit {
    appearance$: BehaviorSubject<string>;

    constructor(private darkModeService: DarkModeService) {
        this.appearance$ = new BehaviorSubject<string>('');
    }

    ngOnInit(): void {
        this.darkModeService.bindAppearance(this.appearance$);
    }
}
