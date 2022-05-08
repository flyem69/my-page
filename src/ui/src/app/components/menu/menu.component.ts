import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DarkModeService } from '../../services/dark-mode/dark-mode.service';

@Component({
    selector: 'app-menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {
    appearance$: BehaviorSubject<string>;

    constructor(private darkModeService: DarkModeService) {
        this.appearance$ = new BehaviorSubject<string>('');
    }

    ngOnInit(): void {
        this.darkModeService.bindAppearance(this.appearance$);
    }
}
