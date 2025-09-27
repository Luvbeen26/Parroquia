import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-user',
  imports: [],
  templateUrl: './user.html',
  styleUrl: './user.css'
})
export class User implements OnInit{
  private useractivated: boolean =false;

  constructor(){}
  ngOnInit(): void {  }

  Activar():void{
    this.useractivated=true;
  }
}
