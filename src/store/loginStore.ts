import { action, observable } from 'mobx';

class LoginStore {
  @observable
  userId: string = '';

  @action
  setUserInfo(userId: string) {
    this.userId = userId;
  }
}

export default LoginStore;
