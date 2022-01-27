/*
 * verinice.veo web
 * Copyright (C) 2022  Markus Werner
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
declare namespace introJs {
  interface Options {
    /**
     * Next button label in tooltip box
     * @default 'Next'
     */
    nextLabel?: string;
    /**
     * Previous button label in tooltip box
     * @default 'Back'
     */
    prevLabel?: string;
    /**
     * Skip button label in tooltip box
     * @default 'x'
     */
    skipLabel?: string;
    /**
     * Done button label in tooltip box
     * @default 'Done'
     */
    doneLabel?: string;
    /**
     * Hide previous button in the first step? Otherwise, it will be disabled button.
     * @default false
     */
    hidePrev?: boolean;
    /**
     * Hide next button in the last step? Otherwise, it will be disabled button (note: this will also hide the "Done" button)
     * @default false
     */
    hideNext?: boolean;
    /**
     * Change the Next button to Done in the last step of the intro? otherwise, it will render a disabled button
     * @default true
     */
    nextToDone?: boolean;
    /**
     * Default tooltip box position
     * @default bottom
     */
    tooltipPosition?: string;
    /**
     * Next CSS class for tooltip boxes
     * @default ''
     */
    tooltipClass?: string;
    /**
     * Start intro for a group of elements
     * @default ''
     */
    group?: string;
    /**
     * CSS class that is added to the helperLayer
     * @default ''
     */
    highlightClass?: string;
    /**
     * Close introduction when pressing Escape button?
     * @default true
     */
    exitOnEsc?: boolean;
    /**
     * Close introduction when clicking on overlay layer?
     * @default true
     */
    exitOnOverlayClick?: boolean;
    /**
     * Show step numbers in introduction?
     * @default false
     */
    showStepNumbers?: boolean;
    /**
     * Let user use keyboard to navigate the tour?
     * @default true
     */
    keyboardNavigation?: boolean;
    /**
     * Show tour control buttons?
     * @default true
     */
    showButtons?: boolean;
    /**
     * Show tour bullets?
     * @default true
     */
    showBullets?: boolean;
    /**
     * Show tour progress?
     * @default false
     */
    showProgress?: boolean;
    /**
     * Scroll to highlighted element?
     * @default true
     */
    scrollToElement?: boolean;
    /**
     * Should we scroll the tooltip or target element?
     * @default 'element'
     */
    scrollTo?: 'element' | 'tooltip';
    /**
     * Padding to add after scrolling when element is not in the viewport (in pixels)
     * @default 30
     */
    scrollPadding?: number;
    /**
     * Set the overlay opacity
     * @default 0.5
     */
    overlayOpacity?: number;
    /**
     * To determine the tooltip position automatically based on the window.width/height
     * @default true
     */
    autoPosition?: boolean;
    /**
     * Precedence of positions, when auto is enabled
     * @default ['bottom', 'top', 'right', 'left']
     */
    positionPrecedence?: Array<'bottom' | 'top' | 'right' | 'left'>;
    /**
     * Disable an interaction with element?
     * @default false
     */
    disableInteraction?: boolean;
    /**
     * Set how much padding to be used around helper element
     * @default 10
     */
    helperElementPadding?: number;
    /**
     * Default hint position
     * @default 'top-middle'
     */
    hintPosition?: 'top' | 'top-right' | 'top-middle' | 'right' | 'right-bottom' | 'bottom' | 'bottom-right' | 'bottom-middle' | 'left' | 'left-bottom';
    /**
     * Hint button label
     * @default 'Got it''
     */
    hintButtonLabel?: string;
    /**
     * Display the "Got it" button?
     * @default true
     */
    hintShowButton?: boolean;
    /**
     * Hints auto-refresh interval in ms (set to -1 to disable)
     * @default 10
     */
    hintAutoRefreshInterval?: number;
    /**
     * Adding animation to hints?
     * @default true
     */
    hintAnimation?: boolean;
    /**
     * additional classes to put on the buttons
     * @default 'introjs-button'
     */
    buttonClass?: string;
    /**
     * additional classes to put on progress bar
     * @default false
     */
    progressBarAdditionalClass?: boolean;
    steps?: Step[];
    hints?: Hint[];
  }
}
