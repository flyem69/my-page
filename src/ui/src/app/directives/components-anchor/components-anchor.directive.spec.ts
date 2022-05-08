import { ComponentsAnchorDirective } from './components-anchor.directive';
import { ViewContainerRef } from '@angular/core';

describe('ComponentsAnchorDirective', () => {
    it('should create an instance', () => {
        const directive = new ComponentsAnchorDirective(ViewContainerRef.prototype);
        expect(directive).toBeTruthy();
    });
});
