import { Directive, Output, EventEmitter, HostListener, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[appScrollTracker]'
})
export class ScrollTrackerDirective {
  @Output() scrolled  = new EventEmitter<'top' | 'bottom'>();
  @Input() scrollDirection: 'top' | 'bottom' = 'bottom';

  constructor(private el: ElementRef) { }

  @HostListener('scroll', [])
  onScroll(): void {
    if (this.scrollDirection === 'bottom' && this.isAtBottom()) {
      this.scrolled.emit('bottom');
    } else if (this.scrollDirection === 'top' && this.isAtTop()) {
      this.scrolled.emit('top');
    }
  }

  private isAtTop(): boolean {
    const nativeElement = this.el.nativeElement;
    const scrollTop = nativeElement.scrollTop || window.pageYOffset || document.documentElement.scrollTop;
    const threshold = 5; // Adjust this value as needed

    return scrollTop <= threshold;
  }

  private isAtBottom(): boolean {
    const nativeElement = this.el.nativeElement;
    const scrollTop = nativeElement.scrollTop || window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = nativeElement.scrollHeight || document.documentElement.scrollHeight;
    const clientHeight = nativeElement.clientHeight || window.innerHeight;
    const threshold = 1; // Adjust this value as needed

    return scrollTop + clientHeight >= scrollHeight - threshold;
  }
}
