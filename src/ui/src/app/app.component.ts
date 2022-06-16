import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DarkModeService } from './services/dark-mode.service';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
	title: string;
	appearance$: BehaviorSubject<string>;

	constructor(private darkModeService: DarkModeService) {
		this.title = 'my-page';
		this.appearance$ = new BehaviorSubject<string>('');
	}

	ngOnInit(): void {
		this.darkModeService.bindAppearance(this.appearance$);
	}
}
