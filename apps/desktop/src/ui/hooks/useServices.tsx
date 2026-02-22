import { createContext, useContext, ReactNode } from "react";
import { ServiceContainer } from "../../application/ServiceContainer";

/**
 * Service Container Context
 *
 * Provides access to application services throughout the React tree.
 */
const ServiceContext = createContext<ServiceContainer | null>(null);

/**
 * Service Provider Props
 */
interface ServiceProviderProps {
  container: ServiceContainer;
  children: ReactNode;
}

/**
 * Service Provider Component
 *
 * Wraps the app and provides ServiceContainer via context.
 *
 * Usage in main.tsx:
 *   const container = await ServiceContainer.initialize();
 *   <ServiceProvider container={container}>
 *     <App />
 *   </ServiceProvider>
 */
export function ServiceProvider({
  container,
  children,
}: ServiceProviderProps) {
  return (
    <ServiceContext.Provider value={container}>
      {children}
    </ServiceContext.Provider>
  );
}

/**
 * Hook: Access ServiceContainer
 *
 * Provides type-safe access to all application services.
 *
 * Usage:
 *   const services = useServices();
 *   await services.sessionService.startSession(...)();
 *
 * @throws Error if used outside ServiceProvider
 */
export function useServices(): ServiceContainer {
  const container = useContext(ServiceContext);

  if (!container) {
    throw new Error("useServices must be used within ServiceProvider");
  }

  return container;
}
