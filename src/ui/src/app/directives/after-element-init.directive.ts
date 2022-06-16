import { AfterViewInit, Directive, Input } from '@angular/core';

@Directive({
	selector: '[appAfterElementInit]',
})
export class AfterElementInitDirective implements AfterViewInit {
	@Input() appAfterElementInit?: (parameter: any | undefined) => any;
	@Input() appAfterElementInitParameter?: any;

	constructor() {}

	ngAfterViewInit(): void {
		this.appAfterElementInit?.(this.appAfterElementInitParameter);
	}
}
