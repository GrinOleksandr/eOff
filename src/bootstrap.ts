import { App } from './app';

// Create and start the app
const appInstance = new App();
appInstance.startServer();

// Export for Vercel (if this is your entry point for Vercel)
export default appInstance.app;
