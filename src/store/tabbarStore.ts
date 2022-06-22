import { action, observable } from 'mobx';

class TabBarStore {
  @observable
  selected = -1;

  @action
  setSelected(index: number) {
    this.selected = index;
  }
}

export default TabBarStore;
