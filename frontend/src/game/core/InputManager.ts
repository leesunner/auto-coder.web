



export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  shoot: boolean;
}

export class InputManager {
  private keys: { [key: string]: boolean } = {};
  private inputState: InputState = {
    up: false,
    down: false,
    left: false,
    right: false,
    shoot: false
  };

  constructor() {
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
  }

  public enable(): void {
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);
  }

  public disable(): void {
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
  }

  private handleKeyDown(event: KeyboardEvent): void {
    this.keys[event.code] = true;
    this.updateInputState();
    
    // 阻止默认行为，避免页面滚动等
    if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space'].includes(event.code)) {
      event.preventDefault();
    }
  }

  private handleKeyUp(event: KeyboardEvent): void {
    this.keys[event.code] = false;
    this.updateInputState();
  }

  private updateInputState(): void {
    this.inputState.up = this.keys['KeyW'] || false;
    this.inputState.down = this.keys['KeyS'] || false;
    this.inputState.left = this.keys['KeyA'] || false;
    this.inputState.right = this.keys['KeyD'] || false;
    this.inputState.shoot = this.keys['Space'] || false;
  }

  public getInput(): InputState {
    return { ...this.inputState };
  }

  public isKeyPressed(keyCode: string): boolean {
    return this.keys[keyCode] || false;
  }
}




