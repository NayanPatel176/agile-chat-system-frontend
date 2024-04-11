import { Directive, Output, EventEmitter, HostListener, ElementRef } from '@angular/core';

@Directive({
  selector: '[appScrollTracker]'
})
export class ScrollTrackerDirective {
  @Output() scrolledToBottom = new EventEmitter<void>();

  constructor(private el: ElementRef) { }

  @HostListener('scroll', [])
  onScroll(): void {
    if (this.isAtBottom()) {
      this.scrolledToBottom.emit();
    }
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
