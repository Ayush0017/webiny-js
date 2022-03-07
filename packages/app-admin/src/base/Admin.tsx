import React from "react";
import { Admin as BaseAdmin, Provider } from "@webiny/app-admin-core";
import { ApolloClientFactory, createApolloProvider } from "./providers/ApolloProvider";
import { Base } from "./Base";
import { createTelemetryProvider } from "./providers/TelemetryProvider";
import { createUiStateProvider } from "./providers/UiStateProvider";
import { SearchProvider } from "./ui/Search";
import { UserMenuProvider } from "./ui/UserMenu";
import { NavigationProvider } from "./ui/Navigation";

export interface AdminProps {
    createApolloClient: ApolloClientFactory;
    children?: React.ReactNode;
}

export const Admin: React.FC<AdminProps> = ({ children, createApolloClient }) => {
    const ApolloProvider = createApolloProvider(createApolloClient);
    const TelemetryProvider = createTelemetryProvider();
    const UiStateProvider = createUiStateProvider();
    /**
     * TODO @ts-refactor
     */
    return (
        <BaseAdmin>
            <Provider hoc={ApolloProvider} />
            <Provider hoc={TelemetryProvider} />
            <Provider hoc={UiStateProvider} />
            <Provider hoc={SearchProvider} />
            <Provider hoc={UserMenuProvider} />
            <Provider hoc={NavigationProvider} />
            <Base />
            {children}
        </BaseAdmin>
    );
};
