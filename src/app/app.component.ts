import { Component } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';

import { map, buffer, debounceTime, filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'clock';
  timerSubscription: Subscription = new Subscription;
  time: number = 0;
  displayTime: string = ''
  running: boolean = false;
  toggleText: string = 'start';
  obs = new Subject();

  constructor() {}
  
  ngOnInit() {
    const clickStream = this.obs.asObservable();
    const multiClickStream = clickStream.pipe(
        buffer(clickStream.pipe(debounceTime(250))),
        map(list => list.length),
        filter(x => x === 2)
    );
    multiClickStream.subscribe(() => 
      this.wait()
    );       
  }

  formatTime(num: number){
    let mm = Math.floor((num % 3600)/60).toString();
    let ss = Math.floor(num % 60).toString();
    mm = +mm < 10 ? "0" + mm : mm;
    ss = +ss < 10 ? "0" + ss : ss;
    return mm + ':' + ss;
  }

  start(){
    this.running = true;
    this.toggleText = 'stop'
    const timer = new Observable(observer => {
      observer.next(this.time);
      const interval = setInterval(() => {
        this.time += 1;
        observer.next(this.time);
      }, 1000);
      return () => clearInterval(interval);
    });
    this.timerSubscription = timer.subscribe();
  }

  stop(){
    this.running = false;
    this.toggleText = 'start'
    this.timerSubscription.unsubscribe();
    this.time = 0;
  }

  toggle(){
    switch(this.running) {
      case false:
        this.start();
        break;
      case true:
        this.stop();
        break;
      default:
        break
    }
  }

  wait(){
    this.running = false;
    this.toggleText = 'start'
    this.timerSubscription.unsubscribe();
    
  }

  reset(){
    this.stop();
    this.time = 0;
    this.start();
  }

  ngOnDestroy() {
    this.timerSubscription.unsubscribe();
  }
}