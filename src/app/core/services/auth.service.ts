import { Injectable } from '@angular/core';

import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private auth :Auth) { }

  login(email:string ,password:string){
    return signInWithEmailAndPassword(this.auth,email,password);
  }
  register(email:string,password:string){
    return createUserWithEmailAndPassword(this.auth,email,password);
  }

  async registerBusiness(data: any) {
  
    console.log('Registering business with data:', data);
  
    return { success: true, data };
  }
  logout(){
    return this.auth.signOut();
  }

  getUser() {
    return this.auth.currentUser;
  }
}
