type Constructor<T = any> = new (...args: any[]) => T;

class DependencyContainer {
  private static instance: DependencyContainer;
  private dependencies: Map<string, any> = new Map();

  private constructor() {}

  static getInstance(): DependencyContainer {
    if (!DependencyContainer.instance) {
      DependencyContainer.instance = new DependencyContainer();
    }
    return DependencyContainer.instance;
  }

  register<T>(token: string, dependency: T): void {
    this.dependencies.set(token, dependency);
  }

  registerType<T>(token: string, type: Constructor<T>): void {
    this.dependencies.set(token, new type());
  }

  resolve<T>(token: string): T {
    const dependency = this.dependencies.get(token);
    if (!dependency) {
      throw new Error(`Dependency ${token} not found`);
    }
    return dependency;
  }
}

export const container = DependencyContainer.getInstance();