import { Component, inject } from '@angular/core';
import { Profile } from '../../../../services/profile';


@Component({
  selector: 'app-edit-profile',
  imports: [],
  templateUrl: './edit-profile.html',
  styleUrl: './edit-profile.css'
})
export class EditProfile {
  profileService=inject(Profile)

  ngOnInit(){
    
  }
  
}
