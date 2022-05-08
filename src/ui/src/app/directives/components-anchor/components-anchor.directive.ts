import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
    selector: '[appComponentsAnchor]',
})
export class ComponentsAnchorDirective {
    constructor(public viewContainerRef: ViewContainerRef) {}
}
