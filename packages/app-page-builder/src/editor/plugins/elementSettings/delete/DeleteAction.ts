import React, { useCallback } from "react";
import { useEventActionHandler } from "../../../hooks/useEventActionHandler";
import { DeleteElementActionEvent } from "../../../recoil/actions";
import { activeElementAtom, elementByIdSelector } from "../../../recoil/modules";
import { plugins } from "@webiny/plugins";
import { PbEditorPageElementPlugin } from "~/types";
import { useRecoilValue } from "recoil";

interface DeleteActionPropsType {
    children: React.ReactElement;
}
const DeleteAction: React.FC<DeleteActionPropsType> = ({ children }) => {
    const eventActionHandler = useEventActionHandler();
    const activeElementId = useRecoilValue(activeElementAtom);
    const element = useRecoilValue(elementByIdSelector(activeElementId as string));

    if (!element) {
        return null;
    }

    const onClick = useCallback((): void => {
        eventActionHandler.trigger(
            new DeleteElementActionEvent({
                element
            })
        );
    }, [activeElementId]);

    const plugin = plugins
        .byType<PbEditorPageElementPlugin>("pb-editor-page-element")
        .find(pl => pl.elementType === element.type);

    if (!plugin) {
        return null;
    }

    if (typeof plugin.canDelete === "function") {
        if (!plugin.canDelete({ element })) {
            return null;
        }
    }

    return React.cloneElement(children, { onClick });
};

export default React.memo(DeleteAction);
