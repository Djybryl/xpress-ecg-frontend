type Plugin = {
  name: string;
  setup: () => Promise<void>;
  teardown: () => Promise<void>;
};

class PluginManager {
  private plugins: Map<string, Plugin> = new Map();

  async register(plugin: Plugin): Promise<void> {
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin ${plugin.name} already registered`);
    }
    await plugin.setup();
    this.plugins.set(plugin.name, plugin);
  }

  async unregister(pluginName: string): Promise<void> {
    const plugin = this.plugins.get(pluginName);
    if (plugin) {
      await plugin.teardown();
      this.plugins.delete(pluginName);
    }
  }

  getPlugin(name: string): Plugin | undefined {
    return this.plugins.get(name);
  }
}

export const pluginManager = new PluginManager();