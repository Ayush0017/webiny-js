import React from "react";
import { activeElementAtom, elementByIdSelector } from "../recoil/modules";
import { useRecoilValue } from "recoil";

export function withActiveElement() {
    return function decorator(Component: React.ComponentType<any>): React.FC {
        return function ActiveElementComponent(props) {
            const activeElementId = useRecoilValue(activeElementAtom);
            if (!activeElementId) {
                return null;
            }
            const element = useRecoilValue(elementByIdSelector(activeElementId));
            return <Component {...props} element={element} />;
        };
    };
}
