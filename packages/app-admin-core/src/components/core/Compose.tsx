import React, { useEffect } from "react";
import { HigherOrderComponent, useAdmin } from "~/admin";

export interface ComposeProps {
    component: React.FC<unknown> & {
        original: React.FC<unknown>;
        originalName?: string;
    };
    with: HigherOrderComponent | HigherOrderComponent[];
}

export const Compose: React.FC<ComposeProps> = props => {
    const { addComponentWrappers } = useAdmin();

    useEffect(() => {
        if (typeof props.component.original === "undefined") {
            console.warn(
                `You must make your component "<${props.component.displayName}>" composable, by using the makeComposable() function!`
            );

            return;
        }

        const hocs = Array.isArray(props.with) ? props.with : [props.with];
        return addComponentWrappers(props.component.original, hocs);
    }, [props.with]);

    return null;
};
