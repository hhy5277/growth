// GitHub: https://github.com/valor-software/ng2-bootstrap
//
// The MIT License (MIT)
//
// Copyright (c) 2015 Valor Software
// Copyright (c) 2015 Dmitriy Shekhovtsov<valorkin@gmail.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
//   The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
//   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//   FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//   OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
//

import {
  Component, OnInit, Input, Output, HostListener, Self, EventEmitter
} from "@angular/core";
import {NgFor} from "@angular/common";
import {ControlValueAccessor, NgModel} from "@angular/forms";

import {global} from "@angular/core/src/facade/lang";
/* tslint:disable */
const KeyboardEvent = (global as any).KeyboardEvent as KeyboardEvent;
/* tslint:enable */

@Component({
  /* tslint:disable */
  selector: 'rating[ngModel]',
  /* tslint:enable */
  directives: [NgFor],
  template: `
    <span (mouseleave)="reset()" (keydown)="onKeydown($event)" tabindex="0" role="slider" aria-valuemin="0" [attr.aria-valuemax]="range.length" [attr.aria-valuenow]="value">
      <template ngFor let-r [ngForOf]="range" let-index="index">
        <ion-icon [name]="index < value ? 'star': 'star-outline'" (mouseenter)="enter(index + 1)" (click)="rate(index + 1)" [title]="r.title" ></ion-icon>
      </template>
    </span>
  `
})

export class RatingComponent implements ControlValueAccessor, OnInit {
  @Input() public max:number;
  @Input() public stateOn:string;
  @Input() public stateOff:string;
  @Input() public readonly:boolean;
  @Input() public titles:Array<string>;
  @Input() public ratingStates:{stateOn:string, stateOff:string}[];

  @Output() public onHover:EventEmitter<number> = new EventEmitter<number>(false);
  @Output() public onLeave:EventEmitter<number> = new EventEmitter<number>(false);

  public onChange:any = Function.prototype;
  public onTouched:any = Function.prototype;

  public cd:NgModel;
  private range:Array<any>;
  private value:number;
  private preValue:number;

  @HostListener("keydown", ["$event"])
  protected onKeydown(event:KeyboardEvent):void {
    if ([37, 38, 39, 40].indexOf(event.which) === -1) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    let sign = event.which === 38 || event.which === 39 ? 1 : -1;
    this.rate(this.value + sign);
  }

  public constructor(@Self() cd:NgModel) {
    this.cd = cd;
    cd.valueAccessor = this;
  }

  public ngOnInit():void {
    this.max = typeof this.max !== "undefined" ? this.max : 5;
    this.readonly = this.readonly === true;
    this.stateOn = typeof this.stateOn !== "undefined"
      ? this.stateOn
      : "glyphicon-star";
    this.stateOff = typeof this.stateOff !== "undefined"
      ? this.stateOff
      : "glyphicon-star-empty";
    this.titles = typeof this.titles !== "undefined" && this.titles.length > 0
      ? this.titles
      : ["one", "two", "three", "four", "five"];
    this.range = this.buildTemplateObjects(this.ratingStates, this.max);
  }

  // model -> view
  public writeValue(value:number):void {
    if (value % 1 !== value) {
      this.value = Math.round(value);
      this.preValue = value;
      return;
    }

    this.preValue = value;
    this.value = value;
  }

  protected enter(value:number):void {
    if (!this.readonly) {
      this.value = value;
      this.onHover.emit(value);
    }
  }

  protected reset():void {
    this.value = this.preValue;
    this.onLeave.emit(this.value);
  }

  public registerOnChange(fn:(_:any) => {}):void {this.onChange = fn;}

  public registerOnTouched(fn:() => {}):void {this.onTouched = fn;}

  private buildTemplateObjects(ratingStates:Array<any>, max:number):Array<any> {
    ratingStates = ratingStates || [];
    let count = ratingStates.length || max;
    let result:any[] = [];
    for (let i = 0; i < count; i++) {
      result.push(Object.assign({
        index: i,
        stateOn: this.stateOn,
        stateOff: this.stateOff,
        title: this.titles[i] || i + 1
      }, ratingStates[i] || {}));
    }
    return result;
  }

  private rate(value:number):void {
    if (!this.readonly && value >= 0 && value <= this.range.length) {
      this.writeValue(value);
      this.cd.viewToModelUpdate(value);
    }
  }
}
