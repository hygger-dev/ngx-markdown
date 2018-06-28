import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output } from '@angular/core';
import { Renderer } from 'marked';
import { MarkdownService } from './markdown.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'markdown, [markdown]',
  template: '<ng-content></ng-content>',
  styleUrls: ['./markdown.component.scss'],
  preserveWhitespaces: true,
})
export class MarkdownComponent implements AfterViewInit {
  private _data: string;
  private _src: string;

  @Input()
  get data(): string {
    return this._data;
  }

  set data(value: string) {
    this._data = value;
    this.render(value);
  }

  @Input()
  get src(): string {
    return this._src;
  }

  set src(value: string) {
    this._src = value;
    this.markdownService
      .getSource(value)
      .subscribe(
        markdown => {
          this.render(markdown);
          this.load.emit(markdown);
        },
        error => this.error.emit(error),
      );
  }

  @Input() isTargetBlankLinks = false;

  @Output() error = new EventEmitter<string>();
  @Output() load = new EventEmitter<string>();

  get isTranscluded(): boolean {
    return !this.data && !this.src;
  }

  static addTargetBlank(href: string, title: string, text: string) {
    let out;
    out = '<a href="' + href + '"';
    out += ' target="_blank"';
    if (title) {
      out += ' title="' + title + '"';
    }
    return out + '>' + text + '</a>';
  }

  constructor(
    public element: ElementRef,
    public markdownService: MarkdownService,
  ) {
  }

  ngAfterViewInit() {
    if (this.isTargetBlankLinks) {
      const customRenderer = new Renderer();
      customRenderer.link = MarkdownComponent.addTargetBlank;
      this.markdownService.renderer = customRenderer;
    }
    if (this.isTranscluded) {
      this.render(this.element.nativeElement.innerHTML);
    }
  }

  render(markdown: string) {
    this.element.nativeElement.innerHTML = this.markdownService.compile(markdown);
    this.markdownService.highlight();
  }
}