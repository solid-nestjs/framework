export interface RelationAdapterHelper {
  getRelationAdapterOptions(type: string, targetFn: () => Function, inverseSide: any, options: any): any;
}

export class RelationAdapterRegistry {
  private static adapters = new Map<string, RelationAdapterHelper>();
  
  static registerAdapter(name: string, adapter: RelationAdapterHelper): void {
    this.adapters.set(name, adapter);
  }
  
  static getAdapterOptions(name: string, type: string, targetFn: () => Function, inverseSide: any, options: any): any {
    const adapter = this.adapters.get(name);
    if (!adapter) {
      return {};
    }
    
    try {
      return adapter.getRelationAdapterOptions(type, targetFn, inverseSide, options);
    } catch (error) {
      console.warn(`[SolidNestJS] Failed to get adapter options for ${name}:`, error);
      return {};
    }
  }
  
  static getRegisteredAdapters(): string[] {
    return Array.from(this.adapters.keys());
  }
  
  static hasAdapter(name: string): boolean {
    return this.adapters.has(name);
  }
}