import React from 'react';
import { render } from '@testing-library/react';
import ScrollTracker from './ScrollTracker';

describe('ScrollTracker', () => {
    let mockObserve;
    let mockUnobserve;
    let mockIntersectionObserver;
    let observerCallback;

    beforeEach(() => {
        mockObserve = jest.fn();
        mockUnobserve = jest.fn();

        mockIntersectionObserver = jest.fn(function (callback, options) {
            observerCallback = callback;
            this.observe = mockObserve;
            this.unobserve = mockUnobserve;
            this.disconnect = jest.fn();
        });

        global.IntersectionObserver = mockIntersectionObserver;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should observe target element and call onComplete when intersecting', () => {
        const onComplete = jest.fn();
        render(
            <ScrollTracker onComplete={onComplete} disabled={false}>
                <div>Content</div>
            </ScrollTracker>
        );

        expect(mockIntersectionObserver).toHaveBeenCalled();
        expect(mockObserve).toHaveBeenCalled();

        // Simulate intersection
        observerCallback([{ isIntersecting: true }]);

        expect(onComplete).toHaveBeenCalledTimes(1);
    });

    test('should not observe or call onComplete if disabled', () => {
        const onComplete = jest.fn();
        render(
            <ScrollTracker onComplete={onComplete} disabled={true}>
                <div>Content</div>
            </ScrollTracker>
        );

        expect(mockObserve).not.toHaveBeenCalled();
    });
});
